import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY');
    if (!clientKey) {
      return new Response(
        JSON.stringify({ error: 'TikTok client key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { redirect_uri } = await req.json();
    const csrfState = crypto.randomUUID();
    
    const params = new URLSearchParams({
      client_key: clientKey,
      scope: 'user.info.basic,video.list',
      response_type: 'code',
      redirect_uri: redirect_uri || `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-oauth`,
      state: csrfState,
    });

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

    return new Response(
      JSON.stringify({ auth_url: authUrl, state: csrfState }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
