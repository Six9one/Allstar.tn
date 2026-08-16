import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:contact@allstar.tn';

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

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

    // Set up Web Push VAPID Details if available
    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    }

    // Build the Notification Payload
    const notificationPayload = JSON.stringify({
      title,
      body: messageBody,
      icon: 'https://allstar.tn/icon.png',
      badge: 'https://allstar.tn/icon.png',
      image: imageUrl || undefined,
      vibrate: [200, 100, 200],
      tag: `academy-notification-${Date.now()}`,
      renotify: true,
      data: {
        url: targetUrl || '/',
        dateOfArrival: Date.now(),
      },
    });

    // Query matching subscriptions from Supabase
    let query = supabaseAdmin.from('push_subscriptions').select('*');
    if (role && role !== 'all' && role !== 'الجميع') {
      query = query.or(`role.eq.${role},role.eq.all`);
    }

    const { data: subscriptions, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    const results = {
      total: subscriptions?.length || 0,
      sent_count: 0,
      failed_count: 0,
      pruned_count: 0,
    };

    const expiredEndpoints: string[] = [];

    if (subscriptions && subscriptions.length > 0 && vapidPublicKey && vapidPrivateKey) {
      await Promise.all(
        subscriptions.map(async (sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          try {
            await webpush.sendNotification(pushSubscription, notificationPayload);
            results.sent_count++;
          } catch (err: any) {
            results.failed_count++;
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
      const { error: deleteErr } = await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
      if (!deleteErr) {
        results.pruned_count = expiredEndpoints.length;
      }
    }

    // Also broadcast via Supabase Realtime channel for live foreground tabs/PWAs
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
      console.warn('Realtime channel broadcast notice:', realtimeErr);
    }

    // Insert to notifications_log
    const { data: logEntry } = await supabaseAdmin
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

    return new Response(
      JSON.stringify({
        success: true,
        message: `تم إرسال الإشعار بنجاح إلى ${results.sent_count || results.total} جهاز`,
        results,
        log: logEntry,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
