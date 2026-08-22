# TalentBridge Analytics Platform
## Complete Scope: Dashboard + Social Media Marketing

**Status:** Specification Complete, Ready to Build  
**Last Updated:** 2026-08-20  
**Total Documentation:** 6 files, 40,000+ lines  

---

## WHAT YOU NOW HAVE

### Core Analytics Dashboard (Base Feature)
**Status:** Ready to build (20 sequential prompts)  
**Time:** 3 weeks (Weeks 1-3)  

- Funnel analytics (signup → publish → share)
- Feature adoption tracking
- Retention metrics (7d, 30d)
- User search + profile view
- Email campaign basics
- Admin authentication
- RBAC infrastructure (optional toggle)

**Files:**
- `ARCHITECTURE.md` — Tech stack + decisions
- `PRODUCT_REQUIREMENTS.md` — Specs + DB schema
- `DESIGN.md` — Complete design system (dark/light mode)
- `PROMPTS.md` — 20 sequential build prompts

---

### Social Media Marketing Integration (New Feature)
**Status:** Specification complete, ready to build (15 sequential prompts)  
**Time:** 2 weeks (Weeks 2-3, can overlap with base dashboard)  

- Buffer integration (LinkedIn, Reddit, Twitter posts)
- LinkedIn organic posts + analytics
- Reddit posts + engagement
- Enhanced email metrics (device, client, timing, user journey)
- Campaign performance tracking (cross-platform ROI)
- Marketing team dashboards

**Files:**
- `SOCIAL_MEDIA_MARKETING.md` — Feature spec (what you're building)
- `SOCIAL_MEDIA_PROMPTS.md` — 15 sequential build prompts

---

## FEATURE BREAKDOWN

### Base Dashboard Features

| Feature | Week | Status | Time |
|---------|------|--------|------|
| Backend scaffolding | 1 | ✅ Spec | 30 min |
| Database schema | 1 | ✅ Spec | 30 min |
| Frontend UI with mocks | 1 | ✅ Spec | 10 hrs |
| Auth system (real) | 2 | ✅ Spec | 1.5 hrs |
| PostHog integration | 2 | ✅ Spec | 1.5 hrs |
| Funnel/Features/Retention APIs | 2 | ✅ Spec | 3 hrs |
| User lookup API | 2 | ✅ Spec | 1.5 hrs |
| Mailgun webhooks + RBAC | 2 | ✅ Spec | 1.5 hrs |
| Dashboard integration | 3 | ✅ Spec | 4 hrs |
| E2E testing + deploy | 3 | ✅ Spec | 4 hrs |
| **Total Base Dashboard** | | | **~20 hrs** |

---

### Social Media Marketing Features

| Feature | Week | Status | Time |
|---------|------|--------|------|
| Database schema (social) | 2 | ✅ Spec | 1 hr |
| Buffer API integration | 2 | ✅ Spec | 2 hrs |
| LinkedIn API integration | 2 | ✅ Spec | 2 hrs |
| Reddit API integration | 2 | ✅ Spec | 1.5 hrs |
| Email enhancements | 2 | ✅ Spec | 2 hrs |
| Sync jobs + scheduling | 2 | ✅ Spec | 1.5 hrs |
| Social media API endpoints | 2-3 | ✅ Spec | 2 hrs |
| Campaign management | 3 | ✅ Spec | 1.5 hrs |
| Social media dashboards (frontend) | 3 | ✅ Spec | 5 hrs |
| Email enhanced view | 3 | ✅ Spec | 2 hrs |
| Campaign view | 3 | ✅ Spec | 2 hrs |
| Integration + routing | 3 | ✅ Spec | 1 hr |
| Polish + optimization | 3 | ✅ Spec | 1.5 hrs |
| **Total Social Media** | | | **~20 hrs** |

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                 TalentBridge Analytics Portal               │
│                       (Vercel Frontend)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             Navigation & Routing                    │   │
│  │  Analytics | Social Media | Email | Campaigns      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            ANALYTICS DASHBOARDS                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ├─ Funnel (signup → publish → share)               │   │
│  │ ├─ Features (block adoption)                        │   │
│  │ ├─ Retention (7d/30d)                              │   │
│  │ └─ User Lookup (search → profile)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           MARKETING DASHBOARDS (NEW)                │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ├─ Social Media Overview                            │   │
│  │ │  ├─ Platform summary (LinkedIn, Reddit, Buffer)  │   │
│  │ │  ├─ Engagement trends                            │   │
│  │ │  └─ Recent posts table                           │   │
│  │ ├─ LinkedIn Detailed                               │   │
│  │ │  ├─ Campaign performance                         │   │
│  │ │  ├─ Per-post analytics                           │   │
│  │ │  └─ Audience insights                            │   │
│  │ ├─ Email Enhanced                                  │   │
│  │ │  ├─ Click timing analysis                        │   │
│  │ │  ├─ Device/client breakdown                      │   │
│  │ │  ├─ User journey (click → signup)                │   │
│  │ │  └─ Link performance heatmap                     │   │
│  │ └─ Campaign Performance                            │   │
│  │    ├─ Cross-platform view                          │   │
│  │    ├─ ROI tracking                                 │   │
│  │    └─ By-channel breakdown                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Admin Features                         │   │
│  │ ├─ Dark/Light mode toggle                           │   │
│  │ ├─ Manual data sync                                 │   │
│  │ ├─ Export reports (PDF/CSV)                         │   │
│  │ └─ Sync status                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓ APIs
┌─────────────────────────────────────────────────────────────┐
│            Analytics Backend API (EC2 Node.js)              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Auth Layer                                                  │
│  ├─ JWT validation                                          │
│  ├─ RBAC middleware                                         │
│  └─ Session management                                      │
│                                                              │
│  Dashboard APIs                    Social Media APIs        │
│  ├─ /dashboard/funnel              ├─ /social-media/posts  │
│  ├─ /dashboard/features            ├─ /social-media/summary
│  ├─ /dashboard/retention           ├─ /campaigns           │
│  ├─ /dashboard/email               └─ /campaigns/:id/perf  │
│  └─ /users/search                                           │
│                                                              │
│  Sync Jobs                                                   │
│  ├─ Buffer sync (every 1 hour)                              │
│  ├─ LinkedIn sync (every 4 hours)                           │
│  ├─ Reddit sync (every 2 hours)                             │
│  ├─ Email aggregation (every 15 min)                        │
│  └─ Campaign aggregation (every 6 hours)                    │
│                                                              │
│  Caching Layer (Redis)                                       │
│  ├─ Dashboard metrics (15 min TTL)                           │
│  ├─ User profiles (5 min TTL)                               │
│  ├─ Social media posts (1 hour TTL)                         │
│  └─ Campaign metrics (1 hour TTL)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓ Integrations
┌─────────────────────────────────────────────────────────────┐
│                  External Data Sources                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Analytics Sources          Social Media Sources             │
│  ├─ PostHog API              ├─ Buffer API                  │
│  ├─ Mailgun Webhooks         ├─ LinkedIn API                │
│  └─ Mailgun API              ├─ Reddit API                  │
│                              └─ (Future: LinkedIn Ads API)  │
│                                                              │
│  Database                                                    │
│  └─ PostgreSQL (TalentBridge DB)                             │
│     ├─ admin_users                                          │
│     ├─ mailgun_events                                       │
│     ├─ dashboard_cache                                      │
│     ├─ social_media_posts (NEW)                             │
│     ├─ social_media_engagement (NEW)                        │
│     └─ campaigns (NEW)                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## BUILD ROADMAP

### Week 1: UI Foundation (No Backend Needed)

**Monday-Tuesday (1 hour):**
- Prompt 1: Backend scaffolding
- Prompt 2: Database schema

**Wednesday-Friday (10 hours):**
- Prompts 3-12: Complete frontend with mock data
- **RESULT:** Working UI, demo-ready, no credentials needed

---

### Week 2: Backend APIs (Parallel)

**Monday-Friday (20 hours total):**

**Base Dashboard (5 hours):**
- Prompt 13: Backend auth system
- Prompt 14: PostHog client + caching
- Prompt 15: Funnel/Features/Retention APIs
- Prompt 16: Email/User lookup APIs
- Prompt 17: Mailgun webhooks + RBAC

**Social Media Marketing (15 hours):**
- SOCIAL_PROMPT 1: Social media DB schema
- SOCIAL_PROMPT 2-4: Buffer, LinkedIn, Reddit API integration
- SOCIAL_PROMPT 5: Email enhancements
- SOCIAL_PROMPT 6: Sync jobs + scheduling
- SOCIAL_PROMPT 7-8: API endpoints

**RESULT:** All APIs working independently, credentials configured

---

### Week 3: Integration + Deploy (4 days)

**Monday-Tuesday (4 hours):**
- Prompts 18-19: Connect frontend to real APIs
- SOCIAL_PROMPTS 9-12: Build frontend dashboards
- Re-run E2E tests (now against real backend)

**Wednesday-Thursday (4 hours):**
- SOCIAL_PROMPTS 13-15: Integration + polish
- Full QA (all features, both dashboards)
- Optimize performance

**Friday (2 hours):**
- Prompt 20: Deploy to EC2 + Vercel
- Production configuration
- **RESULT:** Live platform, both features working

---

## TECH STACK (LOCKED)

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TanStack Query (caching)
- Recharts (charting)
- Vercel (hosting)

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (TalentBridge DB)
- Redis (caching)
- node-cron (job scheduling)
- EC2 (hosting)

### Integrations
- PostHog API (analytics)
- Mailgun API + webhooks (email)
- Buffer API (social scheduling)
- LinkedIn API (organic posts)
- Reddit API (community posts)

### Design System
- Sora + DM Sans + JetBrains Mono
- Navy + Teal + Green color palette
- Dark/light mode toggle
- Complete component library included

---

## FILES YOU HAVE

| File | Purpose | Status |
|------|---------|--------|
| ARCHITECTURE.md | Tech decisions + overview | ✅ Complete |
| PRODUCT_REQUIREMENTS.md | Base dashboard specs | ✅ Complete |
| DESIGN.md | Complete design system | ✅ Complete |
| PROMPTS.md | 20 base dashboard prompts | ✅ Complete |
| SOCIAL_MEDIA_MARKETING.md | Social feature spec | ✅ Complete |
| SOCIAL_MEDIA_PROMPTS.md | 15 social media prompts | ✅ Complete |
| **TOTAL** | Everything needed to build | ✅ Complete |

---

## NEXT STEPS

### Immediate (Today)

1. **Review scope:**
   - Read SOCIAL_MEDIA_MARKETING.md (10 min) — understand features
   - Skim SOCIAL_MEDIA_PROMPTS.md (5 min) — see build sequence

2. **Gather credentials (send to Adedoyin/Peter):**
   - Buffer API key
   - LinkedIn OAuth credentials + company URN
   - Reddit OAuth credentials
   - PostHog API key (if not done already)
   - Mailgun credentials (already have)

3. **Assign team:**
   - Frontend developer: Start base dashboard (Prompts 3-12)
   - Backend developer: Start base backend + social integration (Prompts 1-2, then 13-17, then SOCIAL_PROMPTS 1-8)
   - QA: Prepare test cases

### This Week

**Option A: Sequential (recommended for solo dev)**
1. Complete base dashboard (Prompts 1-20)
2. Then build social media feature (SOCIAL_PROMPTS 1-15)
3. Total: 6 weeks

**Option B: Parallel (recommended for 2+ devs)**
1. Week 1: Frontend (Prompts 3-12) + Backend setup (Prompts 1-2)
2. Week 2: Backend APIs (Prompts 13-17) + Social media backend (SOCIAL_PROMPTS 1-8)
3. Week 3: Frontend dashboards (Prompts 18-19 + SOCIAL_PROMPTS 9-12)
4. Week 4: Polish + deploy (Prompts 20 + SOCIAL_PROMPTS 13-15)
5. Total: 4 weeks

### Credentials Checklist

**PostHog (if not done):**
- [ ] PostHog API key (read-only)
- [ ] PostHog instance URL

**Mailgun (if not done):**
- [ ] Mailgun API key
- [ ] Webhook signing key

**Buffer:**
- [ ] Buffer API key
- [ ] (OAuth will be user-initiated in UI)

**LinkedIn:**
- [ ] LinkedIn Client ID
- [ ] LinkedIn Client Secret
- [ ] LinkedIn Company Page URN
- [ ] (OAuth will be user-initiated in UI)

**Reddit:**
- [ ] Reddit Client ID
- [ ] Reddit Client Secret
- [ ] (OAuth will be user-initiated in UI)

---

## SUCCESS METRICS

### Base Dashboard
- [ ] Funnel loads <2 seconds
- [ ] All 4 dashboards working
- [ ] User search finds users
- [ ] Email basics visible
- [ ] Dark/light mode works
- [ ] Mobile responsive

### Social Media Marketing
- [ ] Buffer posts syncing hourly
- [ ] LinkedIn posts syncing every 4 hours
- [ ] Reddit posts syncing every 2 hours
- [ ] Email clicks tracked by device/client/time
- [ ] Campaign ROI visible
- [ ] Marketing team uses dashboard daily
- [ ] Sync failures <1%

### Overall
- [ ] Zero console errors
- [ ] All tests passing
- [ ] Deployment smooth
- [ ] Performance <2 sec load time
- [ ] Team happy with features

---

## ESTIMATED COSTS

### Cloud Infrastructure
- **EC2 (backend):** t3.small (~$20/month)
- **Redis (ElastiCache):** t3.micro (~$20/month)
- **PostgreSQL (RDS):** Existing TalentBridge DB (no extra cost)
- **Vercel (frontend):** Free tier (or Pro $20/month for extra features)
- **Total:** ~$40/month

### Third-Party APIs
- **PostHog:** Free tier (existing)
- **Mailgun:** Free tier (existing)
- **Buffer:** Free tier (or paid for more accounts/scheduling)
- **LinkedIn API:** Free (part of Marketing Dev Platform)
- **Reddit API:** Free (rate limited)
- **Total:** ~$0-50/month (depending on Buffer plan)

---

## QUESTIONS? GAPS?

If you notice:
- Missing a feature
- Want to add something
- Platform not covered (TikTok, Twitter, Facebook Ads)
- Different data structure needed

→ Let me know, and I'll add it to the scope. Everything is modular and extensible.

---

## YOU'RE READY

Everything is documented, designed, and specced out.

**Start with Prompt 1 from PROMPTS.md** (base dashboard first).

When base dashboard is stable → add SOCIAL_PROMPTS (social media feature).

Both features integrate seamlessly into one admin portal.

---

**Let's build a category-dominating analytics platform. 🚀**

Questions? I'm here to help clarify anything or adjust scope.
