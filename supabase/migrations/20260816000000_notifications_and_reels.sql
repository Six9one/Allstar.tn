-- ==============================================================================
-- All-Star Sports Academy — Notifications Schema Migration
-- Tables: push_subscriptions, notifications_log
-- ==============================================================================

-- ── push_subscriptions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  role        TEXT DEFAULT 'all',        -- 'all' | 'coach' | 'parent'
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast role-based queries
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_role
  ON push_subscriptions (role);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions)
CREATE POLICY "Service role can manage push_subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow anon/authenticated to insert their own subscription
CREATE POLICY "Users can insert their own subscription"
  ON push_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ── notifications_log ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  target_role TEXT DEFAULT 'الجميع',    -- 'الجميع' | 'المدربون فقط' | 'الأولياء فقط'
  target_url  TEXT DEFAULT '/',
  image_url   TEXT,
  sent_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for chronological fetch
CREATE INDEX IF NOT EXISTS idx_notifications_log_created_at
  ON notifications_log (created_at DESC);

-- Enable RLS
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

-- Service role can manage log
CREATE POLICY "Service role can manage notifications_log"
  ON notifications_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Admin can read log (anon policy for admin panel reads)
CREATE POLICY "Anyone can read notifications_log"
  ON notifications_log
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── tiktok_sync_state (ensure it exists) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS tiktok_sync_state (
  id                    TEXT PRIMARY KEY DEFAULT 'default',
  access_token          TEXT,
  refresh_token         TEXT,
  token_expires_at      TIMESTAMPTZ,
  tiktok_open_id        TEXT,
  connected_username    TEXT,
  last_sync_at          TIMESTAMPTZ,
  last_sync_status      TEXT DEFAULT 'disconnected',
  auto_sync_enabled     BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tiktok_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage tiktok_sync_state"
  ON tiktok_sync_state
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anon can read tiktok_sync_state"
  ON tiktok_sync_state
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── academy_reels (ensure it exists for TikTok video storage) ────────────────
CREATE TABLE IF NOT EXISTS academy_reels (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tiktok_video_id  TEXT UNIQUE,
  title            TEXT,
  description      TEXT,
  cover_image_url  TEXT,
  video_url        TEXT,
  tiktok_share_url TEXT,
  playback_type    TEXT DEFAULT 'tiktok',   -- 'tiktok' | 'native'
  sport            TEXT DEFAULT 'General',
  duration         INTEGER,
  like_count       INTEGER DEFAULT 0,
  comment_count    INTEGER DEFAULT 0,
  share_count      INTEGER DEFAULT 0,
  view_count       INTEGER DEFAULT 0,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academy_reels_active
  ON academy_reels (is_active, created_at DESC);

ALTER TABLE academy_reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active reels"
  ON academy_reels
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage reels"
  ON academy_reels
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
