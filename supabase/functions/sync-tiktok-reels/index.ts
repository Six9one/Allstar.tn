import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_PAGES = 10;
const PAGE_SIZE = 20;

interface SyncResult {
  success: boolean;
  videos_fetched: number;
  videos_inserted: number;
  videos_updated: number;
  videos_skipped: number;
  error?: string;
  pages_processed: number;
}

async function refreshToken(
  supabase: any,
  refreshTokenStr: string,
  clientKey: string,
  clientSecret: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number } | null> {
  try {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshTokenStr,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      const expiresAt = new Date(Date.now() + (data.expires_in || 86400) * 1000).toISOString();
      await supabase.from('tiktok_sync_state').update({
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshTokenStr,
        token_expires_at: expiresAt,
      }).eq('id', 'default');
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchVideoPage(
  accessToken: string,
  cursor?: number
): Promise<{ videos: any[]; cursor: number; has_more: boolean } | null> {
  try {
    const body: any = {
      max_count: PAGE_SIZE,
    };
    if (cursor) body.cursor = cursor;

    const response = await fetch(
      'https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,embed_link,create_time,width,height,share_url',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (data.error?.code) {
      console.error('TikTok API error:', data.error);
      return null;
    }

    return {
      videos: data.data?.videos || [],
      cursor: data.data?.cursor || 0,
      has_more: data.data?.has_more || false,
    };
  } catch (error) {
    console.error('Fetch video page error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const result: SyncResult = {
    success: false,
    videos_fetched: 0,
    videos_inserted: 0,
    videos_updated: 0,
    videos_skipped: 0,
    pages_processed: 0,
  };

  try {
    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')!;
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')!;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. Get sync state
    const { data: syncState } = await supabase
      .from('tiktok_sync_state')
      .select('*')
      .eq('id', 'default')
      .single();

    if (!syncState?.access_token) {
      result.error = 'TikTok account not connected. Please connect via OAuth first.';
      await supabase.from('tiktok_sync_state').upsert({
        id: 'default',
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'failed',
        last_sync_error: result.error,
      });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let accessToken = syncState.access_token;

    // 2. Check token expiry and refresh if needed
    if (syncState.token_expires_at) {
      const expiresAt = new Date(syncState.token_expires_at);
      const now = new Date();
      // Refresh if less than 1 hour remaining
      if (expiresAt.getTime() - now.getTime() < 3600000) {
        const refreshed = await refreshToken(
          supabase,
          syncState.refresh_token,
          clientKey,
          clientSecret
        );
        if (refreshed) {
          accessToken = refreshed.access_token;
        } else {
          result.error = 'Token refresh failed. Please reconnect TikTok account.';
          await supabase.from('tiktok_sync_state').update({
            last_sync_at: new Date().toISOString(),
            last_sync_status: 'failed',
            last_sync_error: result.error,
          }).eq('id', 'default');
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // 3. Fetch all videos with pagination
    let cursor: number | undefined;
    let hasMore = true;

    while (hasMore && result.pages_processed < MAX_PAGES) {
      const page = await fetchVideoPage(accessToken, cursor);
      if (!page) {
        result.error = `Failed to fetch page ${result.pages_processed + 1}`;
        break;
      }

      result.pages_processed++;
      result.videos_fetched += page.videos.length;

      // 4. Upsert each video
      for (const video of page.videos) {
        if (!video.id) {
          result.videos_skipped++;
          continue;
        }

        const reelData = {
          tiktok_video_id: String(video.id),
          tiktok_share_url: video.share_url || null,
          tiktok_embed_link: video.embed_link || null,
          playback_type: 'tiktok',
          cover_image_url: video.cover_image_url || null,
          title: video.title || video.video_description || null,
          description: video.video_description || null,
          duration: video.duration || null,
          width: video.width || null,
          height: video.height || null,
          source: 'tiktok_sync',
          synced_at: new Date().toISOString(),
          tiktok_created_at: video.create_time ? new Date(video.create_time * 1000).toISOString() : null,
        };

        const { data: existing } = await supabase
          .from('academy_reels')
          .select('id')
          .eq('tiktok_video_id', String(video.id))
          .single();

        if (existing) {
          // Update existing
          await supabase
            .from('academy_reels')
            .update(reelData)
            .eq('tiktok_video_id', String(video.id));
          result.videos_updated++;
        } else {
          // Insert new
          await supabase
            .from('academy_reels')
            .insert({
              ...reelData,
              is_active: true,
              display_order: 0,
            });
          result.videos_inserted++;
        }
      }

      hasMore = page.has_more;
      cursor = page.cursor;
    }

    // 5. Update sync state
    result.success = !result.error;
    await supabase.from('tiktok_sync_state').update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: result.success ? 'success' : 'partial',
      last_sync_error: result.error || null,
      videos_synced: result.videos_fetched,
    }).eq('id', 'default');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    result.error = error.message;
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
