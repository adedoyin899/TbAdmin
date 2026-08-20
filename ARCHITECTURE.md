# TalentBridge Analytics Admin Dashboard
## Architecture & Tech Stack

---

## PROBLEM

PostHog is powerful but operationally opaque. Team spends 45 min finding simple metrics. Need a fast, usable analytics dashboard for Maz, Marilyn, Peter, Ayo + growing intern team.

---

## SOLUTION

Build a read-only analytics gateway that pulls from PostHog + Mailgun, surfaces key metrics in <5 minutes, and lets anyone (non-technical) use it.

**Not replacing PostHog. Building a layer on top.**

---

## TECH STACK (LOCKED)

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TanStack Query (caching)
- Recharts (charting)
- Deploy: Vercel

### Backend
- Node.js 18+ + Express + TypeScript
- PostgreSQL (existing TalentBridge DB)
- Redis (caching, 15-min TTL)
- Deploy: EC2 (existing VPC)

### Integrations
- PostHog API (read-only)
- Mailgun webhooks + API

---

## DATA ARCHITECTURE

```
PostHog (source of truth)
    ↓ API calls
Analytics API (Node.js)
    ↓ caches for 15 min
Redis
    ↓ also queries fresh
Dashboard (React)
    
Mailgun (emails)
    ↓ webhooks
Analytics API
    ↓ stores
PostgreSQL (mailgun_events table)
```

---

## KEY DECISIONS

✅ **No data warehouse** — Cache is enough at this scale  
✅ **UI-first build** — Mock data Week 1, real APIs Week 3  
✅ **Parallel teams** — Frontend doesn't wait for backend  
✅ **RBAC toggle** — Built in now, enforced later  
✅ **15-min cache** — Acceptable lag for dashboards  
✅ **Real-time user lookup** — No cache (fresh PostHog data)  

---

## SUCCESS METRICS

- Dashboard loads <2 seconds
- Cache hit rate >80%
- 4 users + 5+ interns using it
- No external credential delays
- UI working by Friday Week 1

---

## TIMELINE

- **Week 1:** Build solid UI with mock data (no backends)
- **Week 2:** Build real backend APIs (parallel)
- **Week 3:** Integrate + deploy

**Total: 3 weeks from start to live.**

---

## WHAT YOU NEED TO START

- Node.js 18+ installed
- PostgreSQL (existing TalentBridge DB)
- GitHub repos ready

**Credentials needed LATER (Week 2):**
- PostHog API key (read-only)
- Mailgun API key + webhook signing key
- Redis instance (AWS ElastiCache ~£20/mo)

---

## FILES IN THIS PACKAGE

1. **ARCHITECTURE.md** — This file (decisions, tech stack)
2. **PRODUCT_REQUIREMENTS.md** — Detailed spec (user stories, DB schema, API endpoints)
3. **PROMPTS.md** — All 17+ copy-paste prompts (what to build)

---

## NEXT STEP

Read **PRODUCT_REQUIREMENTS.md**, then open **PROMPTS.md** to start building.

---

**Ready to build? 🚀**
