# TalentBridge Analytics Admin Dashboard
## Product Requirements Document

---

## USER STORIES

### 1. View Funnel Metrics
**As:** Maz/Marilyn (CEO/Ops)  
**I want:** See user funnel (signup → verify → create → publish → share) with drop-off rates  
**So I can:** Identify where users drop and prioritize fixes

**Acceptance:**
- Dashboard loads <2 seconds
- Shows 5 funnel stages with counts + percentages
- Shows drop-off % between stages
- Filterable by date range (7d, 30d, 90d, custom)
- Filterable by signup source (organic, email, referral, paid_ad, all)
- Data refreshes every 15 minutes (cached)

---

### 2. View Feature Adoption
**As:** Peter (Marketing)  
**I want:** See which features users are adopting (block types, themes)  
**So I can:** Prioritize marketing messaging

**Acceptance:**
- Shows top 10 blocks by adoption %
- Shows theme distribution (dark/light)
- Filterable by date range
- Data from PostHog block_added events

---

### 3. View Retention Metrics
**As:** Maz (CEO)  
**I want:** See 7-day and 30-day retention rates  
**So I can:** Assess product stickiness

**Acceptance:**
- Shows 7d and 30d retention percentages
- Shows trend over time (week-over-week change)
- Filterable by signup source
- Data from PostHog user_returned events

---

### 4. Search & View Users
**As:** Maz/Marilyn  
**I want:** Search users by email/ID/name and see full journey  
**So I can:** Understand individual behavior and troubleshoot

**Acceptance:**
- Search box accepts email, user ID, or name
- Returns user card (email, signup date, country, source, last active)
- Shows event timeline (chronological, sortable)
- Shows email engagement (campaigns sent, opened, clicked)
- Includes link to PostHog session replay
- Search is real-time (no cache, fresh from PostHog)

---

### 5. View Email Campaign Metrics
**As:** Peter (Marketing)  
**I want:** See email performance (open rate, click rate, bounce rate)  
**So I can:** Optimize email content

**Acceptance:**
- Shows list of campaigns (name, sent date, sent count)
- For each campaign: open %, click %, bounce count
- Filterable by date range
- Shows top performers by click rate
- Data from Mailgun webhooks

---

### 6. Admin Authentication
**As:** System  
**I want:** Authenticate users before dashboard access  
**So I can:** Protect sensitive analytics

**Acceptance:**
- Login page with email + password
- Passwords hashed with bcrypt
- JWT token generated (expires 7 days)
- Token stored in httpOnly cookie
- All API endpoints require valid JWT
- Returns 401 if token invalid/expired

---

### 7. RBAC Configuration
**As:** Maz  
**I want:** Configure role-based access (admin, product, marketing, ops, intern)  
**So I can:** Control who sees what dashboards

**Acceptance:**
- RBAC_ENABLED environment variable (default: false)
- When OFF: all users see all dashboards (MVP)
- When ON: API filters data by role
- Roles defined in config file
- Zero performance impact when OFF

---

## DATABASE SCHEMA

### admin_users
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

### mailgun_events
```sql
CREATE TABLE mailgun_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  campaign_id VARCHAR(255),
  campaign_name VARCHAR(255),
  message_id VARCHAR(255) UNIQUE,
  link_url VARCHAR(500),
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);
```

### dashboard_cache
```sql
CREATE TABLE dashboard_cache (
  id BIGSERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### audit_log (Optional)
```sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id),
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent VARCHAR(500)
);
```

---

## API ENDPOINTS

### Authentication
- `POST /auth/login` — Login with email/password → JWT token
- `POST /auth/logout` — Logout, clear session
- `GET /auth/me` — Get current user info

### Dashboards (Cached)
- `GET /dashboard/funnel?dateRange=7d&signupSource=organic` → Funnel data
- `GET /dashboard/features?dateRange=30d` → Feature adoption
- `GET /dashboard/retention?signupSource=organic` → Retention rates
- `GET /dashboard/email?dateRange=30d` → Email campaigns

### User Lookup (Fresh)
- `GET /users/search?email=alice@example.com` → Search users
- `GET /users/:userId` → Full user profile + events + email engagement

### Webhooks
- `POST /webhooks/mailgun` — Receive Mailgun events (no auth required)

### Admin (Optional)
- `POST /admin/users` — Create new admin user
- `GET /admin/users` — List all admin users

---

## ENVIRONMENT VARIABLES

### Backend
```env
NODE_ENV=production
PORT=3001

DATABASE_URL=postgresql://user:password@localhost:5432/talentbridge
REDIS_URL=redis://default:password@redis-host:6379/0
REDIS_CACHE_TTL=900

JWT_SECRET=your-super-secret-key-32-chars
JWT_EXPIRES_IN=7d

POSTHOG_API_KEY=phc_xxxxxxxxxxxx
POSTHOG_API_URL=https://app.posthog.com

MAILGUN_API_KEY=key-xxxxxxxxxxxx
MAILGUN_DOMAIN=mg.talentbridge.cv
MAILGUN_WEBHOOK_SIGNING_KEY=xxxxxxxxxxxx

RBAC_ENABLED=false
LOG_LEVEL=info
```

### Frontend
```env
VITE_USE_MOCK_DATA=true  (Week 1)
VITE_USE_MOCK_DATA=false (Week 3+)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_POSTHOG_REPLAY_BASE_URL=https://posthog.yourinstance.com
```

---

## EVENTS TO TRACK (PostHog)

### Funnel Events
- `signup_started` (utm_source, utm_medium, referrer)
- `email_verified`
- `showcase_room_created` (room_name)
- `showcase_room_published`
- `showcase_room_shared` (share_type)
- `user_returned_7d`, `user_returned_30d`

### Feature Adoption Events
- `block_added` (block_type: Experience, Skills, Projects, etc.)
- `room_theme_changed` (theme_name)

### Email Events (Mailgun)
- `email_opened`
- `email_link_clicked`
- `email_bounced`
- `email_unsubscribed`

---

## MOCK DATA STRUCTURE (Week 1)

All frontend components use mock data that matches the real API contract exactly.

### Frontend Mock Data Files
```
src/api/mockData/
├── funnel.json
├── features.json
├── retention.json
├── email.json
├── users.json
└── events.json
```

Each JSON file contains hardcoded data with the same shape as the real API responses.

**Week 1:** Frontend imports from `mockData/` folder  
**Week 3:** Frontend imports from real backend API (no file changes needed)

---

## FRONTEND FOLDER STRUCTURE

```
frontend/src/
├── api/
│   ├── dashboardApi.ts (mock data → real API)
│   ├── authApi.ts
│   ├── userApi.ts
│   ├── client.ts (Axios instance)
│   └── mockData/ (Week 1 only)
├── components/
│   ├── Layout/ (Header, Sidebar, Layout)
│   ├── Auth/ (LoginPage, ProtectedRoute)
│   ├── Dashboard/ (FunnelDashboard, FeatureDashboard, RetentionDashboard, EmailDashboard)
│   ├── UserLookup/ (UserSearch, UserProfile, EventTimeline)
│   ├── Charts/ (FunnelChart, LineChart, BarChart)
│   └── Common/ (DateRangePicker, LoadingSpinner, ErrorBoundary)
├── hooks/
│   ├── useAuth.ts
│   ├── useFunnelData.ts
│   ├── useRetentionData.ts
│   ├── useEmailData.ts
│   ├── useFeaturesData.ts
│   └── useUserSearch.ts
├── types/ (All types from this spec)
├── config/ (constants, apiConfig for mock toggle)
├── utils/ (formatters, validators)
└── App.tsx
```

---

## ACCEPTANCE CRITERIA

### Functional
- Funnel dashboard loads and displays correct metrics
- Feature adoption shows block adoption percentages
- Retention shows 7d/30d rates
- Email dashboard shows campaign performance
- User search returns correct results
- Login/logout works with JWT
- API calls complete in <2 seconds

### Non-Functional
- Dashboard loads <2 seconds
- Supports 100+ concurrent users
- Mobile responsive
- WCAG AA accessibility
- Error handling with graceful fallbacks
- Logging of all API calls

### Testing
- Unit tests >80% coverage
- Integration tests for API calls
- E2E tests (login → dashboard → logout)
- Performance tests (<2s dashboard load)

---

## DEPENDENCIES (npm packages)

### Backend
- express, typescript, dotenv, axios, jsonwebtoken, bcrypt, pg, ioredis, cors, helmet, morgan, express-rate-limit

### Frontend
- react, react-dom, typescript, axios, react-router-dom, @tanstack/react-query, recharts, date-fns, tailwindcss, shadcn/ui

---

## ROLLOUT PLAN

### Week 1: UI Build (No Credentials Needed)
- Prompts 1-2: Backend scaffolding + database (1 hour)
- Prompts 10-16: Frontend UI with mock data (10 hours)
- **Deliverable:** Fully working UI, demo-ready

### Week 2: Backend Build (Parallel)
- Prompts 3-9: Real APIs (5 hours)
- **Deliverable:** All endpoints working independently

### Week 3: Integration & Deploy
- Integration Prompt: Swap mocks → real APIs (2 hours)
- Prompt 17: Deploy to EC2 + Vercel (2 hours)
- **Deliverable:** Live dashboard

---

## SUCCESS METRICS

| Metric | Target |
|---|---|
| Dashboard load time | <2 seconds |
| Cache hit rate | >80% |
| PostHog API uptime | 99% |
| Login success rate | 99%+ |
| Mobile usability score | 90+ |
| Team adoption | 4 users + 5+ interns |

---

## READY TO BUILD?

Open **PROMPTS.md** and start with Prompt 1. 🚀
