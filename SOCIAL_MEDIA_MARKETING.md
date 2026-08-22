# TalentBridge Analytics Dashboard
## Social Media Marketing Feature Specification

**Feature Name:** Integrated Social Media Marketing Dashboard  
**Status:** Planned (Phase 2, parallel to base dashboard)  
**Priority:** High  
**Target Users:** Marketing team (Peter + social media manager)  

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Platform Integrations](#platform-integrations)
3. [Dashboard Views](#dashboard-views)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Data Sync Strategy](#data-sync-strategy)
7. [Feature Breakdown](#feature-breakdown)
8. [User Stories](#user-stories)
9. [Technical Requirements](#technical-requirements)

---

## OVERVIEW

### Problem

The marketing team currently spreads their time across multiple platforms:
- **Buffer:** Social media scheduler (where they post to LinkedIn, Reddit, Twitter)
- **LinkedIn:** Native organic posts + analytics
- **Reddit:** Community engagement + tracking
- **Ad Platforms:** LinkedIn Ads, Facebook Ads (future)
- **Email:** Mailgun (already integrated)

**Solution:** Centralize all marketing data (social + email) into the existing TalentBridge Analytics Dashboard, giving the team one place to see:
- Post performance across platforms
- Engagement metrics (likes, comments, shares, retweets)
- Click-through rates → signups correlation
- Email performance with detailed timing + user behavior
- Campaign ROI tracking

### Success Metrics

- Marketing team spends <5 min to find key metrics (vs 30 min today)
- All social posts tracked from creation to engagement
- Email metrics enriched with behavioral data
- Campaign ROI visible (spend → clicks → signups)
- <2 second dashboard load time

---

## PLATFORM INTEGRATIONS

### 1. Buffer API

**What we sync:**
- Scheduled posts (before publish)
- Published posts (after publish)
- Engagement metrics (likes, comments, shares)
- Post-level analytics (impressions, clicks, follows)
- Campaign/content grouping

**Data available:**
- Post ID, text, image, link
- Platform (LinkedIn, Twitter, Reddit, Facebook)
- Publish time, creation time
- Engagement counts
- Clicks, link clicks
- Follower growth

**Sync frequency:** Every 1 hour (Buffer updates ~hourly)

**Cost:** Free tier available (limited posts), paid tiers scale with usage

**Docs:** https://buffer.com/developers/api

---

### 2. LinkedIn API (Organic)

**What we sync:**
- Organic posts (posts made directly on LinkedIn, not via Buffer)
- Post engagement (reactions, comments, shares)
- Post impressions + clicks
- Follower growth

**Data available:**
- Post ID, text, image
- Publish time
- Engagement breakdown (by reaction type)
- View counts
- Click URL (if any)
- Comments + comment engagement

**Sync frequency:** Every 4 hours (LinkedIn doesn't update real-time)

**Cost:** Free (part of LinkedIn Marketing Developer Platform)

**Docs:** https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management

**Note:** Requires LinkedIn Company Page admin access + OAuth

---

### 3. Reddit API

**What we sync:**
- Posts made to r/TalentBridge or relevant subreddits
- Comments on posts
- Upvotes/downvotes
- Award counts
- Traffic from posts

**Data available:**
- Post ID, title, body, image
- Created time, updated time
- Score (net upvotes)
- Number of comments
- Award counts
- Traffic metrics (if accessible)

**Sync frequency:** Every 2 hours

**Cost:** Free (rate limited to ~60 requests/min)

**Docs:** https://www.reddit.com/dev/api/

---

### 4. LinkedIn Ads API (Future Phase)

**What we sync:**
- Ad campaigns (name, status, budget)
- Ad performance (impressions, clicks, conversions)
- Cost per click, cost per conversion
- Audience demographics

**Data available:**
- Campaign ID, name, status
- Budget + spent
- Impressions, clicks, conversions
- CTR, CPC, CPA
- Audience breakdown

**Sync frequency:** Every 6 hours (ads update slower)

**Cost:** LinkedIn Ads Access requires active ad account

**Docs:** https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting

---

### 5. Email (Mailgun) — Enhanced

**Already integrated.** Enhance with:

- Click timing analysis (what time of day users click)
- Click location (which link in email)
- User behavior after click (did they sign up?)
- Device type (mobile vs desktop)
- Geographic breakdown
- Cohort analysis (by signup source, plan, region)

**Data available:**
- Email opened → opened timestamp
- Link clicked → which link, timestamp
- Bounce, unsubscribe, complaint
- Device: mobile/desktop/other
- Client: Gmail, Outlook, Apple Mail, etc.
- Geographic location (from IP)

**Sync frequency:** Real-time (webhooks already set up)

---

## DASHBOARD VIEWS

### 1. Social Media Overview (New Tab)

**What the marketing team sees:**

**Hero Cards (Top):**
```
Total Posts This Week:    42 posts
Total Engagement:         1,250 interactions
Avg Engagement Rate:      3.2%
Top Performing Platform:  LinkedIn (65% of engagement)
```

**Platform Breakdown (Cards for each platform):**

**LinkedIn Card:**
```
Posts This Week:          12
Impressions:              8,420
Engagement Rate:          4.1%
Clicks:                   342
Link Clicks:              89
Followers Added:          24
```

**Buffer/Scheduled Card:**
```
Scheduled Posts:          8
Next Post:                In 2 hours
Platforms:                LinkedIn, Reddit, Twitter
```

**Reddit Card:**
```
Posts This Week:          5
Score (Total):            1,240
Comments:                 142
Upvote Rate:              78%
```

**Platform Trends (Line Chart):**
```
Show last 4 weeks of engagement trend per platform
X-axis: Week
Y-axis: Total engagement
Lines: LinkedIn, Buffer, Reddit (colored)
```

**Recent Posts Table:**
```
Platform | Posted | Engagement | Clicks | Status
---------|--------|------------|--------|--------
LinkedIn | 2h ago | 45         | 12     | Live
Buffer   | 4h ago | 89         | 22     | Live
Reddit   | 1d ago | 234        | 45     | Viral 🔥
```

---

### 2. LinkedIn Detailed View (New Tab)

**What appears:**

**Campaign Performance:**
```
Campaign Name     | Posts | Impressions | Engagement | Click Rate | Comments
------------------|-------|-------------|------------|------------|----------
Product Launch    | 3     | 12,450      | 521        | 4.2%       | 89
Company Culture   | 5     | 8,920       | 340        | 3.8%       | 56
Founder Voice     | 4     | 9,120       | 612        | 6.7%       | 142
```

**Per-Post Breakdown:**
```
Post: "New feature launched: Showcase Rooms 2.0"
Posted: 2 days ago
Impressions: 4,200
Engagement: 189 (4.5%)
  - Reactions: 156 (likes, celebrates, etc)
  - Comments: 23
  - Shares: 10
Clicks: 45
Link clicks (to website): 12
```

**Engagement Timeline:**
```
Show hourly engagement over 48 hours
Peak engagement time identified
Recommendation: Post at this time for better reach
```

**Audience Insights:**
```
Audience breakdown (by job title, company size, location)
Top regions: UK (45%), US (30%), EU (15%), Other (10%)
Top job titles: Hiring Manager, Recruiter, HR Lead, CTO, CEO
```

---

### 3. Email Enhanced View (Expanded Tab)

**Current state:** Campaign performance (sent, opens, clicks)

**New state:** Detailed user journey

**Campaign Performance (Existing):**
```
Campaign | Sent | Opened | Open % | Clicked | Click % | Bounce | Unsub
----------|------|--------|--------|---------|---------|--------|------
Welcome  | 500  | 210    | 42%    | 45      | 21%     | 2      | 0
Tips     | 450  | 156    | 35%    | 62      | 40%     | 1      | 1
```

**NEW: Click Timing Analysis**
```
Time of Day | Click Rate | Avg Clicks
------------|------------|----------
6am-9am    | 12%        | 45
9am-12pm   | 28%        | 102
12pm-3pm   | 18%        | 67
3pm-6pm    | 22%        | 82
6pm-9pm    | 15%        | 56
9pm-12am   | 5%         | 19
```

**NEW: Device Breakdown**
```
Desktop: 68% of opens, 72% of clicks
Mobile: 28% of opens, 26% of clicks
Tablet: 4% of opens, 2% of clicks
```

**NEW: Email Client Breakdown**
```
Gmail:    45% of opens
Outlook:  28% of opens
Apple:    18% of opens
Other:    9% of opens
```

**NEW: Click Location Heatmap**
```
For each email, show which links got clicked most
[CTA Button] - 89 clicks (78%)
[Blog Link] - 18 clicks (16%)
[Social Link] - 5 clicks (4%)
```

**NEW: User Journey (Click → Signup)**
```
Total Clicks from Email: 256
Clicked users who signed up: 89
Signup Conversion Rate: 34.8%

Time from Click to Signup (avg): 4 hours
Platform breakdown (where they signed up from email click):
  - From LinkedIn email: 45 signups
  - From Weekly digest: 32 signups
  - From Promo: 12 signups
```

---

### 4. Campaign Performance (New Tab)

**Cross-platform campaign view:**

```
Campaign: "Q3 Product Launch"
Channels: LinkedIn posts (3) + Email (2) + Buffer posts (5)
Duration: Aug 1-15

Overall Performance:
- Total Reach: 28,000
- Total Engagement: 1,200 (4.3%)
- Total Clicks: 340
- Signups from Campaign: 45
- Campaign ROI: 45 signups / $0 cost (organic)

By Channel:
Channel | Reach | Engagement | Clicks | Signups | ROI
--------|-------|------------|--------|---------|-----
Email   | 2,400 | 456 (19%)  | 89     | 32      | Best
LinkedIn| 18,000| 650 (3.6%) | 201    | 12      | Good
Reddit  | 7,600 | 94 (1.2%)  | 50     | 1       | Poor
```

---

## DATABASE SCHEMA

### social_media_posts

```sql
CREATE TABLE social_media_posts (
  id UUID PRIMARY KEY,
  platform VARCHAR(50) NOT NULL, -- linkedin, buffer, reddit, twitter
  platform_post_id VARCHAR(255) UNIQUE NOT NULL,
  posted_by UUID NOT NULL REFERENCES admin_users(id),
  content_text TEXT,
  content_image_urls JSONB[], -- array of URLs
  link_url VARCHAR(500),
  posted_at TIMESTAMP NOT NULL,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  
  -- Buffer-specific
  buffer_id VARCHAR(255),
  buffer_status VARCHAR(50), -- scheduled, published, failed
  buffer_scheduled_time TIMESTAMP,
  
  -- LinkedIn-specific
  linkedin_post_id VARCHAR(255),
  linkedin_urn VARCHAR(255),
  
  -- Reddit-specific
  reddit_post_id VARCHAR(255),
  reddit_subreddit VARCHAR(100),
  
  -- Meta
  campaign_id UUID REFERENCES campaigns(id),
  tags JSONB, -- {topic: "product-launch", category: "update"}
  metadata JSONB, -- platform-specific metadata
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### social_media_engagement

```sql
CREATE TABLE social_media_engagement (
  id BIGSERIAL PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES social_media_posts(id),
  platform VARCHAR(50) NOT NULL,
  
  -- Counts (refreshed hourly)
  impressions INT DEFAULT 0,
  views INT DEFAULT 0,
  reactions INT DEFAULT 0, -- likes, celebrates, etc
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  reposts INT DEFAULT 0, -- Twitter/Reddit retweets/upvotes
  clicks INT DEFAULT 0, -- clicks on link
  
  -- Reddit-specific
  score INT DEFAULT 0, -- net upvotes
  upvote_ratio DECIMAL(3,2), -- 0.0 to 1.0
  awards INT DEFAULT 0,
  
  -- Engagement rate
  engagement_rate DECIMAL(5,2), -- calculated: engagement/impressions*100
  
  -- Timestamps
  measured_at TIMESTAMP NOT NULL, -- when this snapshot was taken
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (post_id, measured_at)
);
```

### email_engagement_detailed

```sql
ALTER TABLE mailgun_events ADD COLUMN (
  clicked_by_user_id VARCHAR(255), -- if we can link it
  click_link_index INT, -- which link in the email (0, 1, 2, etc)
  click_link_label VARCHAR(255), -- "CTA Button", "Blog Link", etc
  click_device VARCHAR(50), -- mobile, desktop, tablet, unknown
  click_client VARCHAR(100), -- Gmail, Outlook, Apple Mail, etc
  click_geolocation_country VARCHAR(100), -- from IP
  click_geolocation_city VARCHAR(100),
  opened_by_user_id VARCHAR(255),
  opened_device VARCHAR(50),
  opened_client VARCHAR(100),
  opened_geolocation_country VARCHAR(100),
  opened_at TIMESTAMP, -- when the email was opened
  first_clicked_at TIMESTAMP, -- when first link was clicked
  
  -- User journey tracking
  post_click_action VARCHAR(50), -- signed_up, visited_profile, viewed_room, etc
  post_click_action_at TIMESTAMP,
  post_click_action_user_id VARCHAR(255),
  
  metadata JSONB -- extra data from Mailgun
);
```

### campaigns

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50), -- planning, active, completed, archived
  start_date DATE,
  end_date DATE,
  budget_usd DECIMAL(10,2),
  goal VARCHAR(255), -- awareness, engagement, signups, etc
  channels JSONB, -- ["email", "linkedin", "reddit"]
  created_by UUID NOT NULL REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

### campaign_performance

```sql
CREATE TABLE campaign_performance (
  id BIGSERIAL PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  
  -- Aggregated metrics
  total_reach INT,
  total_impressions INT,
  total_engagement INT,
  engagement_rate DECIMAL(5,2),
  total_clicks INT,
  total_signups INT,
  signup_conversion_rate DECIMAL(5,2), -- clicks to signups
  
  -- Breakdown by channel
  channel_data JSONB, -- {email: {reach, clicks, signups}, linkedin: {...}, ...}
  
  -- Cost metrics
  spend_usd DECIMAL(10,2),
  cost_per_click DECIMAL(8,2),
  cost_per_signup DECIMAL(8,2),
  roi DECIMAL(8,2), -- signups / spend
  
  measured_at TIMESTAMP NOT NULL,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (campaign_id, measured_at)
);
```

---

## API ENDPOINTS

### Social Media Posts

**Get all social posts (with filters):**
```
GET /api/social-media/posts
Query params:
  - platform: linkedin, buffer, reddit, all (default: all)
  - dateRange: 7d, 30d, 90d, custom
  - startDate, endDate (if custom)
  - campaignId (optional)
  - status: scheduled, published, archived

Response: {posts: [...], totalCount, pageInfo}
```

**Get post details:**
```
GET /api/social-media/posts/:postId

Response: {
  id, platform, content, link, postedAt,
  engagement: {impressions, reactions, comments, shares, clicks},
  engagement_trend: [{timestamp, impressions, reactions, ...}],
  metadata: {...}
}
```

### Social Media Engagement

**Get engagement for a post:**
```
GET /api/social-media/posts/:postId/engagement

Response: {
  current: {impressions, reactions, comments, shares, clicks, engagementRate},
  trend: [{timestamp, impressions, reactions, clicks}],
  timeline: [{timestamp, action, count}]
}
```

**Get platform summary:**
```
GET /api/social-media/summary
Query params:
  - dateRange: 7d, 30d, 90d

Response: {
  linkedin: {posts, impressions, engagement, clicks, trend},
  reddit: {posts, score, upvote_rate, comments, trend},
  buffer: {posts, platforms, engagement},
  total: {reach, engagement, clicks}
}
```

### Email Engagement (Enhanced)

**Get email campaign with detailed clicks:**
```
GET /api/email/campaigns/:campaignId/detailed

Response: {
  campaign: {name, sent, opened, clicked},
  click_timing: [{timeOfDay, clickRate, avgClicks}],
  device_breakdown: [{device, opens, clicks, percentage}],
  client_breakdown: [{client, opens, percentage}],
  link_performance: [{linkLabel, clicks, percentage}],
  user_journey: {
    totalClicks, signups, signupRate, avgTimeToSignup,
    signupsByChannel: {...}
  }
}
```

**Get email engagement timeline:**
```
GET /api/email/campaigns/:campaignId/timeline

Response: {
  events: [
    {timestamp, eventType, count}, -- eventType: opened, clicked, bounced, unsubscribed
  ]
}
```

### Campaigns

**Get campaign performance:**
```
GET /api/campaigns/:campaignId/performance

Response: {
  campaign: {...},
  totalReach, totalEngagement, engagementRate,
  totalClicks, totalSignups, conversionRate,
  byChannel: {
    email: {reach, clicks, signups},
    linkedin: {reach, clicks, signups},
    reddit: {reach, clicks, signups}
  },
  spend, costPerClick, costPerSignup, roi,
  timeline: [{date, reach, engagement, signups, spend}]
}
```

**Create campaign:**
```
POST /api/campaigns

Body: {
  name, description, startDate, endDate, budget, goal, channels
}
```

---

## DATA SYNC STRATEGY

### Sync Layers

**Layer 1: Initial Setup**
- User connects Buffer account (OAuth)
- User connects LinkedIn account (OAuth)
- User connects Reddit account (OAuth)
- System fetches last 90 days of historical data
- Duration: ~5 minutes

**Layer 2: Continuous Sync**
- Every 1 hour: Sync Buffer posts + engagement
- Every 4 hours: Sync LinkedIn posts + engagement
- Every 2 hours: Sync Reddit posts + engagement
- Every 15 min: Aggregate email clicks (from webhooks)
- Real-time: Mailgun webhooks (email events)

**Layer 3: Aggregation**
- Every 6 hours: Calculate campaign performance
- Every 24 hours: Calculate trending metrics
- On demand: User-triggered manual sync

### Sync Implementation

**Backend jobs (Node.js + node-cron):**

```javascript
// Buffer sync (every 1 hour)
cron.schedule('0 * * * *', async () => {
  await syncBufferPosts();
  await syncBufferEngagement();
});

// LinkedIn sync (every 4 hours)
cron.schedule('0 */4 * * *', async () => {
  await syncLinkedInPosts();
  await syncLinkedInEngagement();
});

// Reddit sync (every 2 hours)
cron.schedule('0 */2 * * *', async () => {
  await syncRedditPosts();
  await syncRedditEngagement();
});

// Campaign aggregation (every 6 hours)
cron.schedule('0 */6 * * *', async () => {
  await aggregateCampaignPerformance();
});
```

### Error Handling

- Sync failures logged in `sync_logs` table
- Retry with exponential backoff (max 3 retries)
- Alert team if sync fails >3 times
- Manual sync button available in UI

---

## FEATURE BREAKDOWN

### Phase 1 (Weeks 1-2): Core Social Media

**What we build:**
- Buffer integration (posts + engagement)
- LinkedIn integration (posts + engagement)
- Social media overview dashboard
- Database schema for posts + engagement
- Real-time sync jobs

**Acceptance:**
- [ ] Buffer posts sync correctly
- [ ] LinkedIn posts sync correctly
- [ ] Engagement counts update every 1-4 hours
- [ ] Dashboard loads <2 seconds
- [ ] All posts searchable + filterable

---

### Phase 2 (Weeks 2-3): Email Enhancement

**What we build:**
- Enhanced mailgun events table (device, client, location, timing)
- Click timing analysis dashboard
- Device breakdown view
- User journey tracking (click → signup)
- Email performance comparison

**Acceptance:**
- [ ] Click timing data captured correctly
- [ ] Device breakdown accurate
- [ ] User journey links clicks to signups
- [ ] Analytics updated real-time (from webhooks)

---

### Phase 3 (Weeks 3-4): Reddit + Campaign Tracking

**What we build:**
- Reddit integration (posts + engagement)
- Campaign creation UI
- Campaign performance aggregation
- Cross-platform campaign view

**Acceptance:**
- [ ] Reddit posts sync correctly
- [ ] Campaign view shows all channels
- [ ] ROI metrics calculated
- [ ] Trending posts highlighted

---

### Phase 4+ (Future): Ads + Advanced

**Planned:**
- LinkedIn Ads integration (budget, spend, conversions)
- Facebook Ads integration
- Campaign budget forecasting
- A/B testing framework
- Content recommendation engine (based on performance)

---

## USER STORIES

### Story 1: View This Week's Social Performance

**As:** Peter (Marketing Lead)  
**I want:** See all social posts from this week and their engagement  
**So I can:** Know what's working and prioritize content

**Acceptance:**
- Dashboard shows posts from LinkedIn, Buffer, Reddit
- Sorted by engagement (highest first)
- Shows impressions, clicks, conversions
- Colored by platform

---

### Story 2: Find Best Posting Times

**As:** Social Media Manager  
**I want:** Know what time of day gets most engagement  
**So I can:** Schedule posts optimally

**Acceptance:**
- Email timing analysis shows click rate by hour
- LinkedIn shows when impressions peak
- Recommendation shown (e.g., "Post at 10am for best reach")

---

### Story 3: Track Campaign ROI

**As:** CEO (Maz)  
**I want:** See if marketing campaigns convert to signups  
**So I can:** Decide where to invest marketing budget

**Acceptance:**
- Campaign view shows posts + clicks + signups
- Conversion rate calculated (clicks to signups)
- Cost per signup shown (if spend included)
- Trend visible over campaign duration

---

### Story 4: See Who's Clicking & When

**As:** Email Marketer  
**I want:** Detailed breakdown of who clicked which links  
**So I can:** Improve email copy + timing

**Acceptance:**
- See which links got most clicks
- Know what time users are clicking
- See device/client breakdown
- Link performance compared to open rate

---

## TECHNICAL REQUIREMENTS

### New API Credentials Needed

```
Buffer:
  - API Key
  - OAuth tokens for connected accounts

LinkedIn:
  - Client ID
  - Client Secret
  - OAuth refresh token
  - LinkedIn company page URN

Reddit:
  - Client ID
  - Client Secret
  - Refresh token
  - Subreddit names to track

Mailgun: (already have)
  - API key
  - Webhook signing key
```

### New Dependencies

**Backend:**
- `node-buffer-api` (or axios for manual HTTP)
- `linkedin-official-api` (unofficial but maintained)
- `snoowrap` (Reddit API wrapper)
- `node-cron` (job scheduling)
- `axios` (HTTP requests)
- `dotenv` (credential management)

**Frontend:**
- `date-fns` (date formatting)
- `recharts` (charts - already have)
- `react-query` (caching - already have)

### Infrastructure

**New resources:**
- Sync jobs table (track sync history + errors)
- Audit log for data imports
- Redis cache for API rate limiting
- Scheduled job runner (Node.js process or AWS Lambda)

---

## ROLLOUT TIMELINE

```
Week 1:
├─ Setup: Create DB schema + API credentials
├─ Buffer: Sync posts + engagement
└─ LinkedIn: Sync posts + engagement

Week 2:
├─ Email: Enhanced engagement tracking
├─ Dashboard: Social media overview + detail views
└─ Testing: Manual QA on all integrations

Week 3:
├─ Reddit: Sync posts + engagement
├─ Campaigns: Campaign creation + tracking
└─ Aggregation: Campaign performance calculations

Week 4:
├─ Polish: UI refinement
├─ Performance: Optimize sync jobs
└─ Launch: Release to marketing team

Post-Launch:
├─ LinkedIn Ads integration
├─ Advanced features (forecasting, A/B testing)
└─ Community feedback loop
```

---

## SUCCESS CRITERIA

- [ ] All social posts syncing correctly (Buffer, LinkedIn, Reddit)
- [ ] Engagement metrics updating hourly
- [ ] Email clicks linked to device/client/time
- [ ] Campaigns show ROI metrics
- [ ] Dashboard loads <2 seconds
- [ ] Marketing team uses dashboard daily
- [ ] No manual data entry needed
- [ ] Sync failures <1% of attempts

---

**Ready to build this feature? Let's make marketing data accessible! 🚀**
