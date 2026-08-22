-- 004_create_sync_logs.sql
-- Create sync_logs table for tracking automated platform synchronization jobs, counts, and errors

CREATE TABLE IF NOT EXISTS sync_logs (
  id BIGSERIAL PRIMARY KEY,
  service VARCHAR(50) NOT NULL, -- buffer, linkedin, reddit, email, campaign
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'partial', 'retrying')),
  sync_count INT DEFAULT 0,
  error_message TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for querying sync history & latest run status
CREATE INDEX IF NOT EXISTS idx_sync_logs_service ON sync_logs (service);
CREATE INDEX IF NOT EXISTS idx_sync_logs_synced_at ON sync_logs (synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_service_synced ON sync_logs (service, synced_at DESC);
