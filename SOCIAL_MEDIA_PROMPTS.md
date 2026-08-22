# TalentBridge Analytics Dashboard
## Social Media Marketing Feature - Build Prompts (1-15)

**Feature:** Integrated Social Media + Email Analytics  
**Approach:** Can run in parallel with main dashboard or after (modular)  
**Total Prompts:** 15 sequential prompts  
**Estimated Time:** 12-15 hours build + integration

---

## HOW TO USE

Copy each prompt entirely. Paste into Claude Code. Review output. Move to next prompt.

Prompts follow logical order:
- Prompts 1-3: Database + backend setup
- Prompts 4-9: API integrations (Buffer, LinkedIn, Reddit)
- Prompts 10-12: Frontend dashboards
- Prompts 13-15: Campaign tracking + polish

---

# SOCIAL_PROMPT 1: DATABASE SCHEMA FOR SOCIAL MEDIA

## Objective
Create database tables for social media posts, engagement, and campaign tracking.

## Requirements
- Main database from base dashboard (PostgreSQL)
- Existing admin_users table

## Deliverables

**Create `src/db/migrations/003_create_social_media_schema.sql`:**

All tables from SOCIAL_MEDIA_MARKETING.md:
- `social_media_posts` (posts from Buffer, LinkedIn, Reddit)
- `social_media_engagement` (engagement metrics with history)
- `email_engagement_detailed` (enhanced Mailgun data)
- `campaigns` (marketing campaign tracking)
- `campaign_performance` (aggregated campaign metrics)

**Indexes:**
- `social_media_posts` on platform, posted_at, campaign_id
- `social_media_engagement` on post_id, measured_at
- `campaigns` on created_by, status
- `campaign_performance` on campaign_id, measured_at

**Create `src/types/socialMedia.ts`:**
TypeScript types for all tables above

**Update `src/db/connection.ts`:**
Ensure all new tables accessible via connection pool

## Acceptance Criteria
- [ ] Run migration: `npm run migrate` → all 5 new tables created
- [ ] Query social_media_posts → table exists with all columns
- [ ] All indexes created (verify with `\d table_name` in psql)
- [ ] TypeScript types compile without errors
- [ ] No foreign key constraint violations

---

# SOCIAL_PROMPT 2: BUFFER API INTEGRATION SERVICE

## Objective
Build Buffer API client to sync posts and engagement metrics.

## Requirements
- Backend from Prompts 1-2 (base dashboard)
- BUFFER_API_KEY env var set
- PostgreSQL tables from SOCIAL_PROMPT 1

## Deliverables

**Create `src/services/bufferService.ts`:**
- `fetchBufferPosts()` → Get all scheduled + published posts
- `fetchBufferEngagement()` → Get engagement metrics per post
- `parseBufferPost()` → Extract post data (text, image, link, platforms)
- `storeBufferPost()` → Save to social_media_posts table
- `storeBufferEngagement()` → Save to social_media_engagement table

**Create `src/utils/bufferHelpers.ts`:**
- Format Buffer timestamps to UTC
- Transform Buffer platform names to standardized format
- Calculate engagement rate (engagement / impressions * 100)

**Create `src/types/buffer.ts`:**
TypeScript types for Buffer API responses

**Update `.env.example`:**
```
BUFFER_API_KEY=your-buffer-api-key-here
BUFFER_API_URL=https://api.bufferapp.com/1
```

## Acceptance Criteria
- [ ] `fetchBufferPosts()` returns posts from Buffer API
- [ ] Posts include: text, images, link, platform, scheduled_time, buffer_status
- [ ] `fetchBufferEngagement()` returns engagement counts
- [ ] Posts stored in social_media_posts table correctly
- [ ] Engagement stored with timestamps
- [ ] Engagement rate calculated correctly
- [ ] Error handling if API rate limited
- [ ] No TypeScript errors

---

# SOCIAL_PROMPT 3: LINKEDIN API INTEGRATION SERVICE

## Objective
Build LinkedIn API client to sync organic posts and engagement.

## Requirements
- Backend from Prompts 1-2 (base dashboard)
- LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_COMPANY_URN env vars
- PostgreSQL tables from SOCIAL_PROMPT 1

## Deliverables

**Create `src/services/linkedInService.ts`:**
- `getLinkedInAccessToken()` → Get fresh OAuth token (refresh if expired)
- `fetchLinkedInPosts()` → Get company posts (last 90 days)
- `fetchLinkedInPostEngagement()` → Get engagement per post
- `parseLinkedInPost()` → Extract text, images, link
- `storeLinkedInPost()` → Save to social_media_posts table
- `storeLinkedInEngagement()` → Save to social_media_engagement table

**Create `src/services/linkedInAuth.ts`:**
- OAuth flow (request token, refresh token)
- Store tokens in secure env vars or secure DB table
- Token expiry handling

**Create `src/types/linkedin.ts`:**
TypeScript types for LinkedIn API responses

**Update `.env.example`:**
```
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
LINKEDIN_COMPANY_URN=urn:li:organization:12345
LINKEDIN_REFRESH_TOKEN=your-refresh-token
```

## Acceptance Criteria
- [ ] OAuth token retrieval works
- [ ] `fetchLinkedInPosts()` returns posts
- [ ] Posts include: text, images, link, posted_at, impressions
- [ ] Engagement includes: reactions, comments, shares, clicks
- [ ] Posts stored correctly with platform='linkedin'
- [ ] Engagement stored with measured timestamps
- [ ] Token refresh works automatically
- [ ] Error handling for API errors

---

# SOCIAL_PROMPT 4: REDDIT API INTEGRATION SERVICE

## Objective
Build Reddit API client to sync posts and engagement.

## Requirements
- Backend from Prompts 1-2 (base dashboard)
- REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET env vars
- PostgreSQL tables from SOCIAL_PROMPT 1

## Deliverables

**Create `src/services/redditService.ts`:**
- `getRedditAccessToken()` → Get OAuth token
- `fetchRedditPosts()` → Get posts from configured subreddits
- `parseRedditPost()` → Extract title, body, images, link
- `storeRedditPost()` → Save to social_media_posts table
- `storeRedditEngagement()` → Save engagement (score, upvote ratio, awards, comments)

**Create `src/config/redditConfig.ts`:**
```javascript
export const REDDIT_SUBREDDITS = [
  'r/TalentBridge',      // Your subreddit
  'r/Recruiting',        // Community subs where you post
  'r/hiring',
  'r/careerdevelopment',
];
```

**Create `src/types/reddit.ts`:**
TypeScript types for Reddit API responses

**Update `.env.example`:**
```
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-client-secret
REDDIT_REFRESH_TOKEN=your-refresh-token
REDDIT_USER_AGENT=TalentBridge Analytics (by /u/your-username)
```

## Acceptance Criteria
- [ ] OAuth token retrieval works
- [ ] `fetchRedditPosts()` returns posts from subreddits
- [ ] Posts include: title, body, link, posted_at, score, upvote_ratio, awards, comments
- [ ] Posts stored with platform='reddit', subreddit info
- [ ] Engagement stored with score, upvote_ratio, awards
- [ ] Comment count tracked
- [ ] Posts marked as "viral" if score >100
- [ ] Error handling for API

---

# SOCIAL_PROMPT 5: EMAIL ENGAGEMENT ENHANCEMENT

## Objective
Enhance existing Mailgun data with device, client, location, timing, and user journey tracking.

## Requirements
- Mailgun events table from base dashboard
- Mailgun webhooks already receiving events

## Deliverables

**Migrate `email_engagement_detailed` table additions:**
- Add columns: clicked_device, clicked_client, click_geolocation_country, click_geolocation_city
- Add columns: opened_device, opened_client, opened_geolocation_country
- Add columns: first_clicked_at, opened_at
- Add columns: post_click_action, post_click_action_at, post_click_action_user_id
- Add columns: click_link_index, click_link_label

**Update `src/services/mailgunService.ts`:**
- Parse Mailgun webhook payload for device/client info
- Extract IP geolocation (use MaxMind GeoIP2 or free IP geolocation service)
- Determine device type (mobile, desktop, tablet) from user-agent
- Store email client info (Gmail, Outlook, Apple Mail, etc)
- Track which link was clicked (if multiple links in email)

**Create `src/utils/geoipHelper.ts`:**
- IP to geolocation lookup (free service: ip-api.com or MaxMind)

**Create `src/utils/userAgentParser.ts`:**
- Parse user-agent string to determine device type + email client

**Create `src/services/userJourneyService.ts`:**
- Track: email click → user visits website → user signs up
- Link email click event to signup event
- Calculate time between click and signup
- Calculate email → signup conversion rate

## Acceptance Criteria
- [ ] Mailgun webhook updates email_engagement_detailed columns
- [ ] Device detection works (mobile vs desktop)
- [ ] Email client detection works (Gmail, Outlook, Apple)
- [ ] Geolocation captured (country, city)
- [ ] Click timing accurate (within seconds)
- [ ] User journey tracking links clicks to signups
- [ ] Conversion rate calculated correctly
- [ ] No data loss on existing events

---

# SOCIAL_PROMPT 6: SYNC JOBS & SCHEDULING

## Objective
Set up automated sync jobs to continuously pull data from all platforms.

## Requirements
- All API services from SOCIAL_PROMPTS 2-5 complete

## Deliverables

**Create `src/jobs/scheduleJobs.ts`:**
```
- Buffer sync: Every 1 hour
- LinkedIn sync: Every 4 hours
- Reddit sync: Every 2 hours
- Email aggregation: Every 15 minutes
- Campaign aggregation: Every 6 hours
```

**Create `src/jobs/bufferSyncJob.ts`:**
- Call `syncBufferPosts()` + `syncBufferEngagement()`
- Handle errors (log, retry, alert)
- Track sync status in `sync_logs` table

**Create `src/jobs/linkedInSyncJob.ts`:**
- Call LinkedIn service
- Error handling

**Create `src/jobs/redditSyncJob.ts`:**
- Call Reddit service
- Error handling

**Create `src/jobs/campaignAggregationJob.ts`:**
- Aggregate posts + engagement into campaign_performance table
- Calculate totals: reach, engagement, clicks, signups
- Calculate by-channel breakdown
- Calculate ROI (if budget tracked)

**Create `src/db/migrations/004_create_sync_logs.sql`:**
```sql
CREATE TABLE sync_logs (
  id BIGSERIAL PRIMARY KEY,
  service VARCHAR(50), -- buffer, linkedin, reddit, email
  status VARCHAR(50), -- success, failed, partial
  sync_count INT,
  error_message TEXT,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Update `src/server.ts`:**
- Initialize job scheduler on app start
- Log job status

## Acceptance Criteria
- [ ] Jobs run on schedule (verify logs)
- [ ] Buffer sync: every 1 hour ✓
- [ ] LinkedIn sync: every 4 hours ✓
- [ ] Reddit sync: every 2 hours ✓
- [ ] Errors logged in sync_logs table
- [ ] Failed syncs retry (max 3 times)
- [ ] No duplicate posts created
- [ ] Engagement updated (not replaced)

---

# SOCIAL_PROMPT 7: SOCIAL MEDIA API ENDPOINTS

## Objective
Build API endpoints for social media data queries.

## Requirements
- All services + sync jobs from previous prompts complete

## Deliverables

**Create `src/routes/socialMedia.ts`:**

**Endpoints:**
```
GET /api/social-media/summary?dateRange=7d
  Returns: total posts, impressions, engagement, clicks, by platform

GET /api/social-media/posts?platform=linkedin&dateRange=30d&sort=engagement
  Returns: posts array with engagement

GET /api/social-media/posts/:postId
  Returns: full post details + engagement trend

GET /api/social-media/posts/:postId/engagement
  Returns: current + historical engagement

GET /api/social-media/platform/:platform?dateRange=7d
  Returns: all metrics for specific platform
```

**Create `src/controllers/socialMediaController.ts`:**
- `getSocialMediaSummary()`
- `getSocialMediaPosts()`
- `getPostDetails()`
- `getPostEngagement()`
- `getPlatformMetrics()`

**Query features:**
- Filter by platform (linkedin, buffer, reddit, all)
- Filter by date range (7d, 30d, 90d, custom)
- Sort by engagement, impressions, clicks
- Search by text/keywords
- Pagination

## Acceptance Criteria
- [ ] GET /api/social-media/summary returns correct totals
- [ ] Platform breakdown accurate
- [ ] Posts sorted by engagement correctly
- [ ] Date range filtering works
- [ ] Engagement trend shows historical data
- [ ] All endpoints require auth token
- [ ] Pagination works (limit + offset)
- [ ] Performance <1 second

---

# SOCIAL_PROMPT 8: CAMPAIGN MANAGEMENT ENDPOINTS

## Objective
Build endpoints for campaign creation and tracking.

## Requirements
- Campaign schema from SOCIAL_PROMPT 1
- Sync jobs from SOCIAL_PROMPT 6

## Deliverables

**Create `src/routes/campaigns.ts`:**

**Endpoints:**
```
POST /api/campaigns
  Create new campaign (name, channels, dateRange, budget, goal)

GET /api/campaigns
  List all campaigns (with performance metrics)

GET /api/campaigns/:campaignId
  Get campaign details

GET /api/campaigns/:campaignId/performance
  Get detailed campaign ROI + by-channel breakdown

PATCH /api/campaigns/:campaignId
  Update campaign details

GET /api/campaigns/:campaignId/posts
  Get all posts tagged to this campaign
```

**Create `src/controllers/campaignController.ts`:**
- `createCampaign()`
- `listCampaigns()`
- `getCampaignDetails()`
- `getCampaignPerformance()`
- `updateCampaign()`
- `getCampaignPosts()`

**Campaign performance includes:**
- Total reach, impressions, engagement
- Total clicks, signups, conversion rate
- Breakdown by channel (email, linkedin, reddit)
- Spend + ROI (if budget tracked)
- Trending metrics

## Acceptance Criteria
- [ ] Campaign creation works
- [ ] Performance aggregates posts + engagement
- [ ] By-channel breakdown accurate
- [ ] ROI calculated (signups / spend)
- [ ] Conversion rate accurate (clicks to signups)
- [ ] All endpoints require auth
- [ ] Campaign status tracking (active, completed, archived)

---

# SOCIAL_PROMPT 9: FRONTEND - SOCIAL MEDIA OVERVIEW DASHBOARD

## Objective
Build social media overview dashboard (main view).

## Requirements
- Frontend from base dashboard Prompts 3-12 complete
- API endpoints from SOCIAL_PROMPT 7 ready

## Deliverables

**Create `src/hooks/useSocialMediaSummary.ts`:**
```typescript
Hook fetches GET /api/social-media/summary
Returns: {
  totalPosts, totalEngagement, engagementRate, topPlatform,
  byPlatform: {linkedin, reddit, buffer},
  trend: [{week, engagement}]
}
```

**Create `src/components/SocialMedia/SocialMediaOverview.tsx`:**

**Layout:**
1. Hero cards (top):
   - Total posts this week
   - Total engagement
   - Avg engagement rate
   - Top performing platform

2. Platform cards (row):
   - LinkedIn: posts, impressions, engagement rate, clicks, followers added
   - Reddit: posts, score, comments, upvote rate
   - Buffer: scheduled posts, next post time

3. Engagement trend chart (line chart, last 4 weeks)
   - X-axis: Week
   - Y-axis: Engagement
   - Lines for each platform (colored)

4. Recent posts table:
   - Platform, Posted, Engagement, Clicks, Status
   - Sortable, paginated
   - Click row → see post details

**Create `src/components/SocialMedia/PlatformCard.tsx`:**
Reusable component for platform summary

**Create `src/components/SocialMedia/SocialMediaTrend.tsx`:**
Line chart for engagement trend

## Acceptance Criteria
- [ ] Hero cards render with correct data
- [ ] Platform cards show all metrics
- [ ] Engagement trend chart displays correctly
- [ ] Posts table sortable + paginated
- [ ] Mobile responsive
- [ ] Loads <2 seconds
- [ ] No console errors

---

# SOCIAL_PROMPT 10: FRONTEND - LINKEDIN DETAILED VIEW

## Objective
Build detailed LinkedIn analytics view.

## Requirements
- Frontend from base dashboard complete
- LinkedIn API data synced

## Deliverables

**Create `src/hooks/useLinkedInData.ts`:**
Hook to fetch LinkedIn-specific metrics

**Create `src/components/SocialMedia/LinkedInDetailedView.tsx`:**

**Sections:**
1. Campaign performance table:
   - Campaign name, posts, impressions, engagement, click rate, comments
   - Sortable

2. Per-post breakdown:
   - Post content preview
   - Posted date/time
   - Metrics: impressions, engagement (with breakdown), clicks, link clicks
   - Engagement timeline (hourly for 48 hours)

3. Audience insights:
   - Job title breakdown
   - Company size breakdown
   - Geographic breakdown (top regions)

4. Recommendations:
   - Best posting time (from historical data)
   - Best content type (most engaging format)
   - Next suggested post topic

**Create `src/components/SocialMedia/LinkedInPostDetail.tsx`:**
Modal/panel showing single post with full details

## Acceptance Criteria
- [ ] Campaign table shows all campaigns
- [ ] Post details show engagement breakdown
- [ ] Engagement timeline accurate
- [ ] Audience insights populated
- [ ] Recommendations based on data
- [ ] Mobile responsive
- [ ] Loads <2 seconds

---

# SOCIAL_PROMPT 11: FRONTEND - EMAIL ENHANCED VIEW

## Objective
Build enhanced email analytics with timing, device, journey.

## Requirements
- Frontend from base dashboard complete
- Email engagement enhancements from SOCIAL_PROMPT 5

## Deliverables

**Create `src/hooks/useEmailDetailedAnalytics.ts`:**
Hook to fetch detailed email metrics

**Create `src/components/Email/EmailDetailedView.tsx`:**

**Sections:**
1. Campaign performance table (existing, enhance):
   - Show open%, click%, device breakdown at a glance

2. NEW: Click timing analysis
   - Bar chart: Time of day (6am-12am) → click rate
   - Show peak click times
   - Recommendation: "Best time to send is 10am"

3. NEW: Device breakdown
   - Cards: Desktop (68%), Mobile (28%), Tablet (4%)
   - Each showing engagement rates

4. NEW: Email client breakdown
   - Gmail, Outlook, Apple Mail, Other
   - Show open rates by client

5. NEW: Click location heatmap
   - Visual layout of email
   - Links highlighted by click count
   - Percentage per link

6. NEW: User journey (click → signup)
   - "256 total clicks"
   - "89 users who clicked signed up (34.8%)"
   - "Avg time from click to signup: 4 hours"
   - Breakdown by campaign source

7. Performance grid:
   - Campaign | Sent | Opens | Clicks | Signup Conversion | Time to Signup

**Create `src/components/Email/EmailMetricsCards.tsx`:**
Reusable cards for metrics display

## Acceptance Criteria
- [ ] All 7 sections render
- [ ] Click timing chart accurate
- [ ] Device breakdown percentages correct
- [ ] Link heatmap shows clicks visually
- [ ] User journey conversion rate accurate
- [ ] Charts interactive (hover for details)
- [ ] Mobile responsive
- [ ] Loads <2 seconds

---

# SOCIAL_PROMPT 12: FRONTEND - CAMPAIGN PERFORMANCE VIEW

## Objective
Build cross-platform campaign performance dashboard.

## Requirements
- All frontend components from Prompts 9-11 complete
- Campaign API endpoints from SOCIAL_PROMPT 8

## Deliverables

**Create `src/hooks/useCampaignPerformance.ts`:**
Hook to fetch campaign details + performance

**Create `src/components/Campaigns/CampaignPerformance.tsx`:**

**Layout:**
1. Campaign header:
   - Campaign name, duration, goal, budget
   - Status badge (active, completed, archived)

2. Hero metrics:
   - Total reach (across channels)
   - Total engagement rate
   - Total clicks
   - Total signups
   - Campaign ROI (signups / spend)

3. By-channel breakdown (cards):
   - Email: reach, engagement, clicks, signups, conversion rate
   - LinkedIn: reach, engagement, clicks, signups
   - Reddit: reach, engagement, clicks, signups

4. Performance timeline (area chart):
   - X-axis: Days of campaign
   - Y-axis: Daily reach + engagement
   - Show cumulative signups line

5. Top posts table:
   - Posts in this campaign (sorted by engagement)
   - Shows: Platform, Posted, Engagement, Clicks, Conversions

6. Performance breakdown table:
   - Channel | Reach | Engagement | Clicks | Signups | Conversion %

**Create `src/components/Campaigns/CampaignList.tsx`:**
List of all campaigns with quick performance metrics

## Acceptance Criteria
- [ ] Campaign header shows all info
- [ ] Hero metrics accurate
- [ ] By-channel breakdown correct
- [ ] Timeline chart displays correctly
- [ ] Top posts table populated
- [ ] Conversion rates calculated
- [ ] ROI accurate (if spend tracked)
- [ ] Mobile responsive

---

# SOCIAL_PROMPT 13: FRONTEND ROUTING & NAVIGATION

## Objective
Add social media views to navigation and routing.

## Requirements
- All dashboard components from Prompts 9-12 complete

## Deliverables

**Update `src/App.tsx`:**
Add routes for social media views:
```
/social-media/overview (main view)
/social-media/linkedin (LinkedIn details)
/social-media/reddit (Reddit details)
/email/detailed (Email enhanced)
/campaigns/:campaignId (Campaign performance)
/campaigns (Campaign list)
```

**Update `src/components/Layout/Sidebar.tsx`:**
Add new nav items:
- Social Media (expandable submenu with LinkedIn, Reddit, Overview)
- Email Analytics (expanded version)
- Campaigns

**Create `src/components/SocialMedia/SocialMediaTabs.tsx`:**
Tab selector for switching between platform views

**Update `src/pages/Dashboard.tsx`:**
Dynamic routing to show correct component based on route

## Acceptance Criteria
- [ ] All new routes work
- [ ] Navigation links active correctly
- [ ] Sidebar updated with new items
- [ ] Tab switching works smoothly
- [ ] No console errors
- [ ] Mobile navigation works

---

# SOCIAL_PROMPT 14: INTEGRATION WITH BASE DASHBOARD

## Objective
Integrate social media feature into existing dashboard without breaking it.

## Requirements
- Base dashboard fully functional (Prompts 3-12 from main PROMPTS.md)
- Social media views complete (Prompts 9-13)

## Deliverables

**Update existing dashboard tabs:**
- Funnel dashboard: unchanged
- Features dashboard: unchanged
- Retention dashboard: unchanged
- Email dashboard: now links to enhanced view
- User lookup: unchanged

**Update header/navigation:**
- Add "Marketing" section with Social Media submenu
- Keep existing "Analytics" section for funnel/features/retention

**Update `src/App.tsx`:**
- All existing routes still work
- New social media routes added without conflicting

**Test full flow:**
- Login → Dashboard (funnel) → Switch to Social Media → Back to Funnel
- Email tab → Enhanced email view
- Campaigns list → Campaign detail

## Acceptance Criteria
- [ ] All existing features still work
- [ ] New features don't break old ones
- [ ] Navigation smooth between sections
- [ ] No duplicate data loads
- [ ] Performance not degraded
- [ ] Mobile experience smooth
- [ ] No console errors

---

# SOCIAL_PROMPT 15: POLISH & OPTIMIZATION

## Objective
Optimize performance, refine UI, add missing touches.

## Requirements
- All prompts 1-14 complete and integrated

## Deliverables

**Performance optimization:**
- Lazy load charts (don't load until visible)
- Cache social media data (React Query cache key setup)
- Optimize API calls (remove redundant fetches)
- Debounce filter changes

**UI Polish:**
- Consistent loading states (skeletons, spinners)
- Error states on all views (if API fails)
- Empty states (if no data yet)
- Responsive design check (mobile, tablet, desktop)
- Dark mode verification on all new views

**Add missing features:**
- Manual sync button (trigger immediate sync)
- Sync status indicator (last synced timestamp)
- Error notifications (if sync fails)
- Timezone selector (for time-based metrics like click timing)
- Export campaign report (as PDF or CSV)

**Create `src/components/Common/SyncStatus.tsx`:**
Badge showing last sync time + status

**Create `src/components/Common/EmptyState.tsx`:**
Reusable empty state for all views (when no data)

**Create `src/components/Common/ErrorBoundary.tsx`:**
Error boundary for social media section

**Documentation:**
- Add inline comments in new components
- Document API integration flow
- Add README for marketing team (how to use)

## Acceptance Criteria
- [ ] Charts lazy load
- [ ] React Query caching working
- [ ] All loading states visible
- [ ] Error states handled
- [ ] Empty states show helpful message
- [ ] Responsive on all screen sizes
- [ ] Dark mode working
- [ ] Manual sync button works
- [ ] Sync status visible
- [ ] No console warnings
- [ ] Performance <2 sec load time

---

## SUMMARY

**15 sequential prompts to build complete social media + email marketing dashboard:**

- Prompts 1-6: Backend infrastructure (DB, APIs, sync jobs)
- Prompts 7-8: API endpoints
- Prompts 9-12: Frontend dashboards
- Prompts 13-15: Integration + polish

**Total time:** 12-15 hours

**Can be built:**
1. After base dashboard (Week 4+)
2. In parallel with base dashboard (if you have 2+ developers)

**Result:** Marketing team has single source of truth for all social + email performance. ✅

---

**Ready? Start with SOCIAL_PROMPT 1. Let's build robust marketing analytics! 🚀**
