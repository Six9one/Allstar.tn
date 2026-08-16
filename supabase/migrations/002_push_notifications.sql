-- ==============================================================================
-- ALL-STAR SPORTS ACADEMY — NOTIFICATION CENTER & WEB PUSH MIGRATION
-- ==============================================================================

-- 1. Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT,
  role        TEXT DEFAULT 'all',
  endpoint    TEXT UNIQUE NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_role ON push_subscriptions(role);

-- 2. Notifications Log Table
CREATE TABLE IF NOT EXISTS notifications_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  target_role TEXT DEFAULT 'الجميع',
  target_url  TEXT DEFAULT '/',
  image_url   TEXT,
  sent_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_log_created ON notifications_log(created_at DESC);

-- 3. Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

-- Allow anon to subscribe (insert/upsert by endpoint)
CREATE POLICY "Anon can register push subscription" ON push_subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Allow anon to read notifications log
CREATE POLICY "Anon read notifications log" ON notifications_log
  FOR SELECT USING (true);

-- Allow service role and anon to manage notifications log
CREATE POLICY "Anon manage notifications log" ON notifications_log
  FOR ALL USING (true) WITH CHECK (true);
