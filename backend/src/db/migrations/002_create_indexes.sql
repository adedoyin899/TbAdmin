-- 002_create_indexes.sql
-- Create performance indexes for queries and cache invalidation

-- admin_users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);

-- mailgun_events indexes
CREATE INDEX IF NOT EXISTS idx_mailgun_events_email ON mailgun_events (email_address);
CREATE INDEX IF NOT EXISTS idx_mailgun_events_campaign ON mailgun_events (campaign_id);
CREATE INDEX IF NOT EXISTS idx_mailgun_events_timestamp ON mailgun_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mailgun_events_type ON mailgun_events (event_type);

-- dashboard_cache indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_cache_expires_at ON dashboard_cache (expires_at);

-- audit_log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_user ON audit_log (admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log (timestamp DESC);
