import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      // Redirect to admin with error
      return new Response(null, {
        status: 302,
        headers: { Location: `${Deno.env.get('APP_URL') || 'https://allstar.tn'}/admin?tiktok_error=${encodeURIComponent(error)}` }
      });
    }

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'No authorization code received' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')!;
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')!;
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-oauth`;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      const errMsg = tokenData.error_description || tokenData.error || 'Token exchange failed';
      return new Response(null, {
        status: 302,
        headers: { Location: `${Deno.env.get('APP_URL') || 'https://allstar.tn'}/admin?tiktok_error=${encodeURIComponent(errMsg)}` }
      });
    }

    // Store tokens in database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 86400) * 1000).toISOString();

    await supabaseAdmin.from('tiktok_sync_state').upsert({
      id: 'default',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: expiresAt,
      tiktok_open_id: tokenData.open_id,
      connected_username: '@allstar.sports.ac',
      last_sync_status: 'connected',
    });

    // Redirect to admin with success
    return new Response(null, {
      status: 302,
      headers: { Location: `${Deno.env.get('APP_URL') || 'https://allstar.tn'}/admin?tiktok_connected=true` }
    });
  } catch (error) {
    return new Response(null, {
      status: 302,
      headers: { Location: `${Deno.env.get('APP_URL') || 'https://allstar.tn'}/admin?tiktok_error=${encodeURIComponent(error.message)}` }
    });
  }
});
