-- All-Star Academy Reels System
-- Database migration for TikTok integration

-- 1. Academy Reels table (unified storage for native + TikTok reels)
CREATE TABLE IF NOT EXISTS academy_reels (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tiktok_video_id TEXT UNIQUE,
  tiktok_share_url TEXT,
  tiktok_embed_link TEXT,
  playback_type   TEXT NOT NULL DEFAULT 'native' CHECK (playback_type IN ('native', 'tiktok')),
  video_url       TEXT,
  cover_image_url TEXT,
  title           TEXT,
  description     TEXT,
  sport           TEXT DEFAULT 'General',
  duration        INTEGER,
  width           INTEGER,
  height          INTEGER,
  is_active       BOOLEAN DEFAULT TRUE,
  display_order   INTEGER DEFAULT 0,
  source          TEXT DEFAULT 'manual' CHECK (source IN ('tiktok_sync', 'manual', 'upload')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  synced_at       TIMESTAMPTZ,
  tiktok_created_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_academy_reels_active ON academy_reels(is_active, display_order DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_academy_reels_tiktok_id ON academy_reels(tiktok_video_id) WHERE tiktok_video_id IS NOT NULL;

-- 2. TikTok Sync State table
CREATE TABLE IF NOT EXISTS tiktok_sync_state (
  id                  TEXT PRIMARY KEY DEFAULT 'default',
  access_token        TEXT,
  refresh_token       TEXT,
  token_expires_at    TIMESTAMPTZ,
  tiktok_open_id      TEXT,
  connected_username  TEXT,
  last_sync_at        TIMESTAMPTZ,
  last_sync_status    TEXT,
  last_sync_error     TEXT,
  videos_synced       INTEGER DEFAULT 0,
  auto_sync_enabled   BOOLEAN DEFAULT TRUE
);

-- Insert default row
INSERT INTO tiktok_sync_state (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 3. Row Level Security
ALTER TABLE academy_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_sync_state ENABLE ROW LEVEL SECURITY;

-- Public (anon) can read active reels
CREATE POLICY "Public read active reels" ON academy_reels
  FOR SELECT USING (is_active = true);

-- Anon can insert/update/delete reels (admin uses anon key in this app)
CREATE POLICY "Anon manage reels" ON academy_reels
  FOR ALL USING (true);

-- Service role has full access to reels (for sync Edge Functions)
CREATE POLICY "Service role full access reels" ON academy_reels
  FOR ALL USING (auth.role() = 'service_role');

-- Anon can read non-sensitive sync state fields
CREATE POLICY "Anon read sync state" ON tiktok_sync_state
  FOR SELECT USING (true);

-- Service role has full access to sync state (for token storage)
CREATE POLICY "Service role access sync state" ON tiktok_sync_state
  FOR ALL USING (auth.role() = 'service_role');

-- Allow anon to read non-sensitive sync state fields via RPC
-- (We'll create an RPC function for this)
CREATE OR REPLACE FUNCTION get_tiktok_sync_status()
RETURNS TABLE (
  connected_username TEXT,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  last_sync_error TEXT,
  videos_synced INTEGER,
  auto_sync_enabled BOOLEAN
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    connected_username,
    last_sync_at,
    last_sync_status,
    last_sync_error,
    videos_synced,
    auto_sync_enabled
  FROM tiktok_sync_state
  WHERE id = 'default';
$$;
