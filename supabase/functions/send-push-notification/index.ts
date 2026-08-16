import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verified Cryptographic ECDSA P-256 VAPID Keypair
const DEFAULT_VAPID_PUBLIC_KEY = 'BNf5rkYVMwOreTQ5KLFlDgqHCS5OHG3RVwT_IqUzp-TuNo2NXOhQrKmBGJei1Uety9DX03hIdnj_rmWOEZ2cuq8';
const DEFAULT_VAPID_PRIVATE_KEY = '0G3gkmFM2o1GsaG_mF2DfrA7OypwQ5AKDxAUsEPb89k';
const DEFAULT_VAPID_SUBJECT = 'mailto:contact@allstar.tn';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') || DEFAULT_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || DEFAULT_VAPID_PRIVATE_KEY;
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || DEFAULT_VAPID_SUBJECT;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://hsylnrzxeyqxczdalurj.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!);

    const body = await req.json();
    const {
      title,
      body: messageBody,
      targetUrl = '/',
      imageUrl,
      targetAudience = 'الجميع',
      role = 'all',
    } = body;

    if (!title || !messageBody) {
      return new Response(
        JSON.stringify({ error: 'Title and message body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Configure Web Push VAPID Details
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Build the Notification Payload for Android & Apple iOS APNs
    const notificationPayload = JSON.stringify({
      title,
      body: messageBody,
      icon: 'https://allstar.tn/icon.png',
      badge: 'https://allstar.tn/icon.png',
      image: imageUrl || undefined,
      vibrate: [200, 100, 200],
      tag: `academy-notif-${Date.now()}`,
      renotify: true,
      data: {
        url: targetUrl || '/',
        dateOfArrival: Date.now(),
      },
    });

    // Query all registered subscriptions from database
    let query = supabaseAdmin.from('push_subscriptions').select('*');
    if (role && role !== 'all' && role !== 'الجميع') {
      query = query.or(`role.eq.${role},role.eq.all`);
    }

    const { data: subscriptions, error: fetchErr } = await query;
    if (fetchErr) {
      console.warn('Subscription fetch notice:', fetchErr);
    }

    const results = {
      total: subscriptions?.length || 0,
      sent_count: 0,
      failed_count: 0,
      pruned_count: 0,
    };

    const expiredEndpoints: string[] = [];

    // Push delivery options for Apple iOS & Android OS
    const pushOptions = {
      TTL: 86400, // 24 hours retention
      urgency: 'high',
    };

    if (subscriptions && subscriptions.length > 0) {
      await Promise.all(
        subscriptions.map(async (sub) => {
          if (!sub.endpoint || !sub.p256dh || !sub.auth) return;

          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          try {
            await webpush.sendNotification(pushSubscription, notificationPayload, pushOptions);
            results.sent_count++;
            console.log(`✅ Push delivered to ${sub.endpoint.substring(0, 35)}...`);
          } catch (err: any) {
            results.failed_count++;
            console.warn(`❌ Push delivery error for ${sub.endpoint.substring(0, 35)}:`, err?.statusCode, err?.message);
            // If subscription has expired or is unsubscribed (410 Gone / 404 Not Found)
            if (err.statusCode === 410 || err.statusCode === 404 || err.statusCode === 400) {
              expiredEndpoints.push(sub.endpoint);
            }
          }
        })
      );
    }

    // Prune dead subscriptions
    if (expiredEndpoints.length > 0) {
      try {
        await supabaseAdmin
          .from('push_subscriptions')
          .delete()
          .in('endpoint', expiredEndpoints);
        results.pruned_count = expiredEndpoints.length;
      } catch (pruneErr) {
        console.warn('Prune error:', pruneErr);
      }
    }

    // Realtime channel broadcast for open windows/tabs
    try {
      const channel = supabaseAdmin.channel('allstar_live_push_channel');
      await channel.send({
        type: 'broadcast',
        event: 'admin_notification',
        payload: {
          notification: {
            id: 'push-' + Date.now(),
            title,
            body: messageBody,
            target_url: targetUrl,
            image_url: imageUrl,
            date: 'الآن',
            created_at: new Date().toISOString(),
          },
        },
      });
    } catch (realtimeErr) {
      console.warn('Realtime broadcast notice:', realtimeErr);
    }

    // Log the notification
    let logEntry = null;
    try {
      const { data } = await supabaseAdmin
        .from('notifications_log')
        .insert({
          title,
          body: messageBody,
          target_role: targetAudience || 'الجميع',
          target_url: targetUrl || '/',
          image_url: imageUrl || null,
          sent_count: results.sent_count || results.total || 1,
        })
        .select()
        .single();
      logEntry = data;
    } catch (logErr) {
      console.warn('Log insert error:', logErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `تم إرسال الإشعار بنجاح إلى ${results.sent_count} جهاز مسجل`,
        results,
        log: logEntry,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('send-push-notification fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
