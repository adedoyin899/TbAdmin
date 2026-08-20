-- 001_create_analytics_schema.sql
-- Create core analytics database tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'intern' CHECK (role IN ('admin', 'product', 'marketing', 'operations', 'intern')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Table 2: mailgun_events
CREATE TABLE IF NOT EXISTS mailgun_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('opened', 'clicked', 'delivered', 'failed', 'unsubscribed', 'complained')),
  email_address VARCHAR(255) NOT NULL,
  campaign_id VARCHAR(255),
  campaign_name VARCHAR(255),
  message_id VARCHAR(255) UNIQUE NOT NULL,
  link_url VARCHAR(500),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Table 3: dashboard_cache
CREATE TABLE IF NOT EXISTS dashboard_cache (
  id BIGSERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table 4: audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ip_address INET,
  user_agent VARCHAR(500)
);
