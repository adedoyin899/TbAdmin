-- 003_create_social_media_schema.sql
-- Create database tables and indexes for Social Media Marketing & Campaign Analytics

-- 1. Table: campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'planning' NOT NULL CHECK (status IN ('planning', 'active', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  budget_usd DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  goal VARCHAR(255), -- awareness, engagement, signups, traffic, etc.
  channels JSONB DEFAULT '[]'::jsonb NOT NULL, -- ["email", "linkedin", "reddit", "buffer"]
  created_by UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Table: social_media_posts
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('linkedin', 'buffer', 'reddit', 'twitter', 'facebook', 'other')),
  platform_post_id VARCHAR(255) UNIQUE NOT NULL,
  posted_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  content_text TEXT,
  content_image_urls JSONB DEFAULT '[]'::jsonb NOT NULL, -- array of image/video URLs
  link_url VARCHAR(500),
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Buffer-specific fields
  buffer_id VARCHAR(255),
  buffer_status VARCHAR(50) CHECK (buffer_status IS NULL OR buffer_status IN ('scheduled', 'published', 'failed', 'draft')),
  buffer_scheduled_time TIMESTAMP WITH TIME ZONE,
  
  -- LinkedIn-specific fields
  linkedin_post_id VARCHAR(255),
  linkedin_urn VARCHAR(255),
  
  -- Reddit-specific fields
  reddit_post_id VARCHAR(255),
  reddit_subreddit VARCHAR(100),
  
  -- Campaign relation & Meta
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  tags JSONB DEFAULT '{}'::jsonb NOT NULL, -- {topic: "product-launch", category: "update"}
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- platform-specific raw payload metadata
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Table: social_media_engagement
CREATE TABLE IF NOT EXISTS social_media_engagement (
  id BIGSERIAL PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES social_media_posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  
  -- Engagement Metrics (updated hourly / on sync)
  impressions INT DEFAULT 0 NOT NULL,
  views INT DEFAULT 0 NOT NULL,
  reactions INT DEFAULT 0 NOT NULL, -- likes, celebrates, loves, etc.
  comments INT DEFAULT 0 NOT NULL,
  shares INT DEFAULT 0 NOT NULL,
  reposts INT DEFAULT 0 NOT NULL, -- retweets / reposts
  clicks INT DEFAULT 0 NOT NULL, -- clicks on attached link
  
  -- Reddit-specific metrics
  score INT DEFAULT 0 NOT NULL, -- net upvotes (upvotes - downvotes)
  upvote_ratio DECIMAL(4,3) DEFAULT 0.000 NOT NULL, -- 0.000 to 1.000
  awards INT DEFAULT 0 NOT NULL,
  
  -- Calculated metric
  engagement_rate DECIMAL(6,2) DEFAULT 0.00 NOT NULL, -- (reactions + comments + shares) / impressions * 100
  
  -- Timestamps
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL, -- snapshot timestamp
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Table: email_engagement_detailed
CREATE TABLE IF NOT EXISTS email_engagement_detailed (
  id BIGSERIAL PRIMARY KEY,
  mailgun_event_id BIGINT REFERENCES mailgun_events(id) ON DELETE SET NULL,
  campaign_id VARCHAR(255),
  campaign_name VARCHAR(255),
  email_address VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  link_url VARCHAR(500),
  click_link_index INT DEFAULT 0,
  click_link_label VARCHAR(255),
  device_type VARCHAR(50) DEFAULT 'unknown', -- desktop, mobile, tablet, unknown
  email_client VARCHAR(100), -- Gmail, Outlook, Apple Mail, etc.
  geolocation_country VARCHAR(100),
  geolocation_city VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  post_click_action VARCHAR(50), -- signed_up, visited_profile, viewed_room, etc.
  post_click_action_at TIMESTAMP WITH TIME ZONE,
  post_click_user_id VARCHAR(255),
  conversion_time_seconds INT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Safely extend mailgun_events with granular tracking columns
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS clicked_by_user_id VARCHAR(255);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS click_link_index INT;
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS click_link_label VARCHAR(255);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS click_device VARCHAR(50);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS click_client VARCHAR(100);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS click_geolocation_country VARCHAR(100);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS click_geolocation_city VARCHAR(100);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS opened_by_user_id VARCHAR(255);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS opened_device VARCHAR(50);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS opened_client VARCHAR(100);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS opened_geolocation_country VARCHAR(100);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS first_clicked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS post_click_action VARCHAR(50);
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS post_click_action_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE mailgun_events ADD COLUMN IF NOT EXISTS post_click_action_user_id VARCHAR(255);

-- 5. Table: campaign_performance
CREATE TABLE IF NOT EXISTS campaign_performance (
  id BIGSERIAL PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Aggregated metrics across channels
  total_reach INT DEFAULT 0 NOT NULL,
  total_impressions INT DEFAULT 0 NOT NULL,
  total_engagement INT DEFAULT 0 NOT NULL,
  engagement_rate DECIMAL(6,2) DEFAULT 0.00 NOT NULL,
  total_clicks INT DEFAULT 0 NOT NULL,
  total_signups INT DEFAULT 0 NOT NULL,
  signup_conversion_rate DECIMAL(6,2) DEFAULT 0.00 NOT NULL, -- (signups / clicks) * 100
  
  -- Channel-specific breakdown JSON
  channel_data JSONB DEFAULT '{}'::jsonb NOT NULL, -- { email: { reach, clicks, signups }, linkedin: { ... }, reddit: { ... } }
  
  -- Cost and ROI metrics
  spend_usd DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  cost_per_click DECIMAL(8,2) DEFAULT 0.00 NOT NULL,
  cost_per_signup DECIMAL(8,2) DEFAULT 0.00 NOT NULL,
  roi DECIMAL(8,2) DEFAULT 0.00 NOT NULL, -- signups / spend or revenue ratio
  
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==========================================================
-- INDEXES FOR PERFORMANCE & FAST QUERYING
-- ==========================================================

-- campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns (created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns (start_date, end_date);

-- social_media_posts indexes
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts (platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_posted_at ON social_media_posts (posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_campaign_id ON social_media_posts (campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_buffer_id ON social_media_posts (buffer_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_linkedin_id ON social_media_posts (linkedin_post_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_reddit_id ON social_media_posts (reddit_post_id);

-- social_media_engagement indexes
CREATE INDEX IF NOT EXISTS idx_social_media_engagement_post_id ON social_media_engagement (post_id);
CREATE INDEX IF NOT EXISTS idx_social_media_engagement_measured_at ON social_media_engagement (measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_engagement_post_measured ON social_media_engagement (post_id, measured_at DESC);

-- email_engagement_detailed indexes
CREATE INDEX IF NOT EXISTS idx_email_eng_detailed_campaign ON email_engagement_detailed (campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_eng_detailed_email ON email_engagement_detailed (email_address);
CREATE INDEX IF NOT EXISTS idx_email_eng_detailed_device ON email_engagement_detailed (device_type);
CREATE INDEX IF NOT EXISTS idx_email_eng_detailed_clicked_at ON email_engagement_detailed (clicked_at DESC);

-- campaign_performance indexes
CREATE INDEX IF NOT EXISTS idx_campaign_performance_campaign_id ON campaign_performance (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_measured_at ON campaign_performance (measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_camp_measured ON campaign_performance (campaign_id, measured_at DESC);
