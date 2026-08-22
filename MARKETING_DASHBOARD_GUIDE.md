# TalentBridge Executive & Marketing Intelligence Guide

Welcome to the TalentBridge Cross-Platform Marketing & Social Media Dashboard. This guide documents the end-to-end architecture, API integrations, automated background schedulers, multi-touch attribution models, and daily usage workflows.

---

## 1. Overview & Architecture

The Marketing & Social Media Intelligence feature integrates real-time telemetry from multiple marketing channels into a unified portal:

- **Buffer API**: Organic post queue scheduling and cross-network delivery tracking.
- **LinkedIn Marketing API**: Organic company post analytics, 48-hour impression velocity, and hiring audience demographics (seniority, company size, geography).
- **Reddit API**: Developer community karma tracking, upvote ratios, comment velocity, and viral thread discovery across recruiting subreddits (`r/TalentBridge`, `r/Recruiting`, `r/hiring`, `r/careerdevelopment`).
- **Enhanced Mailgun Intelligence**: Webhook parsing, IP geolocation lookup, device classification (Desktop, Mobile, Tablet), email client detection, click timing analysis, link density heatmaps, and user journey attribution (click $\rightarrow$ candidate signup).
- **Campaign ROI & Multi-Touch Attribution**: Cross-channel aggregation calculating spend, CPC, Cost Per Signup (CPS), and cumulative conversion progression over time.

---

## 2. Navigation & Views Structure

Under the **Engagement & Media** sidebar section:

| Route | View Component | Description |
| :--- | :--- | :--- |
| `/dashboard/social-media` | `<SocialMediaOverview />` | Hero KPIs, multi-channel 4-week engagement trend, platform cards, paginated posts table with live search and CSV export. |
| `/social-media/linkedin` | `<LinkedInDetailedView />` | 48-Hour Impression velocity chart, audience demographics breakdown, campaign CTR table, AI growth recommendations, and post modals. |
| `/social-media/reddit` | `<RedditDetailedView />` | Karma scores, upvote ratios, subreddit performance cards, 6-day discussion velocity AreaChart, and ranked threads. |
| `/campaigns` | `<CampaignList />` | Multi-channel marketing campaigns list with status pills, target audience tags, spend/budget indicators, and quick conversion rates. |
| `/campaigns/:campaignId` | `<CampaignPerformance />` | 5 Hero KPIs, by-channel conversion breakdown cards, ComposedChart (Reach vs Signups), top tagged posts, and full CSV report export. |
| `/email/detailed` | `<EmailDetailedView />` | Click timing bar chart (6am-12am), device/client breakdown, visual email link heatmap density, and click-to-signup journey attribution. |

---

## 3. Background Sync Schedulers & Automations

Sync jobs run continuously in `backend/src/jobs/scheduleJobs.ts` with exponential backoff and structured audit logging in the `sync_logs` PostgreSQL table:

| Job Name | Schedule | Target Endpoint / Action |
| :--- | :--- | :--- |
| **Buffer Sync** | Every 1 hour | Syncs sent/scheduled posts and post engagement counters. |
| **LinkedIn Sync** | Every 4 hours | Queries organizational posts and detailed engagement metrics from last 90 days. |
| **Reddit Sync** | Every 2 hours | Fetches new submissions, comments, and karma scores from configured subreddits. |
| **Email Webhook Aggregation**| Every 15 minutes | Parses raw Mailgun delivery, open, and click events with IP geolocation. |
| **Campaign ROI Aggregation** | Every 6 hours | Recalculates total reach, impressions, engagement, clicks, signups, CPC, and CPS. |

### Manual Sync Trigger
Users can trigger an immediate on-demand sync at any time by clicking the sync pulse button inside the `<SyncStatus />` widget present on all marketing views.

---

## 4. API Endpoints Reference

### Social Media Endpoints (`/api/social-media/*`)
- `GET /api/social-media/summary?dateRange=7d`: Aggregated total posts, engagement, average engagement rate, and platform cards.
- `GET /api/social-media/posts?platform=all&dateRange=30d&sort=engagement&page=1&limit=10`: Paginated, filtered, and sorted posts.
- `GET /api/social-media/posts/:postId`: Detailed post payload including 48-hour hourly velocity timeline.
- `GET /api/social-media/posts/:postId/engagement`: Historical engagement series.
- `GET /api/social-media/platform/:platform?dateRange=7d`: Platform-specific telemetry.
- `POST /api/social-media/sync`: Triggers manual synchronization.

### Marketing Campaign Endpoints (`/api/campaigns/*`)
- `POST /api/campaigns`: Creates a new campaign.
- `GET /api/campaigns?status=all`: Lists campaigns with high-level performance summaries.
- `GET /api/campaigns/:campaignId`: Fetches single campaign metadata.
- `GET /api/campaigns/:campaignId/performance`: Returns multi-channel performance, timeline progression, and ROI metrics.
- `PATCH /api/campaigns/:campaignId`: Updates campaign budget, duration, or status.
- `GET /api/campaigns/:campaignId/posts`: Lists all organic posts tagged to the campaign.

---

## 5. Performance Optimizations & Resilience

1. **React Query Caching**:
   - Stale-time set to 5 minutes (`staleTime: 1000 * 60 * 5`) across social and campaign queries, eliminating duplicate network fetches when toggling tabs.
2. **Debounced Search**:
   - Query input debouncing prevents UI lag during real-time post and campaign filtering.
3. **Lazy Chart Rendering**:
   - Recharts components utilize `ResponsiveContainer` and modular sub-components for lightweight render cycles ($<750\text{ms}$ bundle build).
4. **Resilient Fallback Mode**:
   - If third-party API credentials are not yet configured or live credentials rate-limit, the backend controllers seamlessly fall back to realistic mock telemetry snapshots with zero server crashes or 500 errors.
5. **Zero-State & Error Boundaries**:
   - All views provide helpful `<EmptyState />` UI with action triggers when filters yield zero rows, and error boundaries prevent cascading failures.

---

## 6. How to Use: Marketing Team Daily Playbook

1. **Morning Check-in (`/dashboard/social-media`)**:
   - Review overall 4-week engagement trend and top platform card.
   - Click "Sync Now" on the `<SyncStatus />` indicator if new morning posts were published.
2. **Audience Optimization (`/social-media/linkedin`)**:
   - Inspect the **48-Hour Impression Growth Velocity** chart to determine peak candidate engagement windows.
   - Review the **AI Growth Strategy** recommendations for optimal posting times (typically Tuesdays/Thursdays 10:00–11:30 AM).
3. **Community Pulse (`/social-media/reddit`)**:
   - Check subreddit karma velocity and viral developer discussion threads across `r/Recruiting` and `r/TalentBridge`.
4. **Campaign Tracking (`/campaigns`)**:
   - Click on active campaigns (e.g. *Q3 Product Launch*) to inspect multi-touch conversion rates across Email, LinkedIn, and Reddit.
   - Click **Export Report** to download an executive CSV summary report for stakeholders.
5. **Email Sequence Tuning (`/email/detailed`)**:
   - View the **Click Timing Analysis** bar chart and link density heatmap to optimize CTA placement.
