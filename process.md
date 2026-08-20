# 📋 TalentBridge Admin Dashboard — Process & Implementation Plan

> **Written for everyone — technical and non-technical alike.**  
> This document explains what we're building, why, how, and in what order.

---

## 🎯 THE BIG PICTURE

### What are we building?
A private admin portal that lets the TalentBridge team (Maz, Marilyn, Peter, Ayo, and interns) see key analytics data **without needing to dig through PostHog**.

Think of it like a simple dashboard on your phone that shows your bank balance — instead of logging into the full banking website and hunting for the number yourself.

### Why do we need it?
Right now, finding a simple metric (like "how many users signed up this week?") takes **45 minutes** in PostHog because PostHog is built for technical users. This tool will surface the most important numbers in **under 5 minutes**, for anyone on the team.

### What it is NOT
- ❌ It will NOT replace PostHog — PostHog stays as the source of truth
- ❌ It will NOT let anyone edit or delete data — it's **read-only**
- ❌ It is NOT a public-facing product — only internal team members can log in

---

## 👥 WHO IS THIS FOR?

| Person | Role | What they'll use it for |
|--------|------|--------------------------|
| Maz | CEO | Funnel performance, retention, user journeys |
| Marilyn | Ops | Funnel drop-offs, troubleshooting users |
| Peter | Marketing | Email campaign results, feature adoption |
| Ayo | Product | Feature usage, funnel data |
| Interns | Various | Funnel & feature dashboards only |

---

## 📊 THE 5 SCREENS

### 1. 🔐 Login Page
The entry point. You enter your email and password to access the portal. Nobody else can get in.

### 2. 📉 Funnel Dashboard
Shows how users move through TalentBridge:
> Sign Up → Verify Email → Create Room → Publish Room → Share Room

You can see at each step: how many users made it through, and how many dropped off. You can filter by time period (last 7 days, 30 days, etc.) or by how users originally found TalentBridge.

### 3. 🧩 Feature Adoption Dashboard
Shows which features users are actually using — e.g. "82% of users added a Skills block" or "60% of users prefer the dark theme."

### 4. 🔄 Retention Dashboard
Shows how many users come back after signing up — after 7 days and after 30 days. This tells us if the product is sticky.

### 5. 📧 Email Dashboard
Shows how our email campaigns are performing — open rates, click rates, bounces — pulled from Mailgun (our email tool).

### 6. 🔍 User Lookup
You can type in a user's email or name and pull up their full journey: when they signed up, what they did, which emails they opened, and a link to watch a session replay of their time in the product.

---

## 🏗️ HOW IT'S BUILT (In Plain English)

The project has two parts that talk to each other:

### The Frontend (What you see)
This is the visual interface — the screens, buttons, charts, and tables you interact with in your browser. Built with React (a popular tool for building web interfaces).

### The Backend (The engine behind the scenes)
This is the server that securely fetches data from PostHog and Mailgun, caches it (stores a copy temporarily to make things fast), and sends it to the frontend. Built with Node.js.

### How they connect
```
You (browser) → Frontend → Backend → PostHog / Mailgun
                                  → PostgreSQL (for email events)
                                  → Redis (for caching / speed)
```

**Caching explained:** Instead of calling PostHog every single time someone opens a dashboard (which would be slow), the backend stores the result for 15 minutes. If you open the dashboard again within that 15 minutes, it loads instantly from the saved copy.

---

## 🗓️ THE BUILD PLAN — 3 WEEKS

### ✅ WEEK 1 — Build the Visual Interface (with fake data)
**Goal:** A fully working, demo-ready dashboard by Friday — without needing any real data connections yet.

We use fake (mock) data that looks exactly like the real data will look. This means the team can see and test the UI immediately while the backend is still being built.

| Step | What happens | Who touches it |
|------|-------------|----------------|
| 1 | Set up the backend project structure (folders, packages) | Developer |
| 2 | Set up the database tables | Developer |
| 3 | Set up the frontend project (React + Tailwind + Vite) | Developer |
| 4 | Create fake data files for all dashboards | Developer |
| 5 | Define all the data shapes (TypeScript types) + utility functions | Developer |
| 6 | Build the Login page + authentication flow | Developer |
| 7 | Build the main layout — header, sidebar, navigation | Developer |
| 8 | Build the Funnel Dashboard with chart + table + filters | Developer |
| 9 | Build the Features, Retention, and Email Dashboards | Developer |
| 10 | Build the User Lookup page (search + profile + timeline) | Developer |
| 11 | Write automated tests to verify everything works | Developer |
| 12 | Wire everything up so navigation works end-to-end | Developer |

**✅ End of Week 1 deliverable:** The whole UI is working, looks great, and can be demoed to the team.

---

### ✅ WEEK 2 — Build the Real Backend APIs (in parallel)
**Goal:** All backend endpoints working and tested independently.

While the UI is being polished, a developer builds the real server that connects to PostHog and Mailgun.

| Step | What happens |
|------|-------------|
| 13 | Build real login system (bcrypt password hashing + JWT tokens) |
| 14 | Build PostHog API client + Redis caching layer |
| 15 | Build the Funnel data endpoint |
| 16 | Build the Features, Retention, and Email data endpoints |
| 17 | Build the User Lookup endpoints (no caching — always fresh) |
| 18 | Build the Mailgun webhook receiver + Role-Based Access Control (RBAC) |

**What is RBAC?**  
Role-Based Access Control means different team members see different things. An intern might only see the Funnel and Features dashboards, while Maz as admin sees everything. This is currently turned OFF (everyone sees everything) and can be turned ON later without code changes.

**✅ End of Week 2 deliverable:** All backend APIs working and tested independently.

---

### ✅ WEEK 3 — Connect Frontend to Real Backend + Deploy
**Goal:** Live dashboard accessible to the team.

| Step | What happens |
|------|-------------|
| 19 | Swap the fake data out for real API calls (one config file change) |
| 20 | Run all tests against real backend, fix any issues |
| 21 | Deploy frontend to Vercel (public URL, login-protected) |
| 22 | Deploy backend to EC2 (our existing server) |

**✅ End of Week 3 deliverable:** Live, working dashboard the whole team can use.

---

## 🔐 SECURITY & ACCESS

- Every team member gets their own login (email + password)
- Passwords are encrypted (hashed with bcrypt — not stored in plain text)
- Sessions expire after 7 days (you'll need to log in again)
- All API routes require a valid login token — no anonymous access
- The portal is not publicly findable — there's no "sign up" button

---

## ⚡ PERFORMANCE TARGETS

| Metric | Target |
|--------|--------|
| Dashboard load time | Under 2 seconds |
| Cache hit rate | Over 80% (most loads are instant) |
| Concurrent users supported | 100+ |
| Mobile usability | Works on tablet and phone |

---

## 🧱 KEY DESIGN DECISIONS (& WHY)

| Decision | Why |
|----------|-----|
| Build the UI with fake data first | Team can review and give feedback without waiting for backend |
| 15-minute cache | Fresh enough for a dashboard, but fast for the user |
| User lookup has NO cache | Individual user data needs to be accurate in real-time |
| RBAC is a toggle (off by default) | Zero performance impact at MVP; can be switched on later |
| Read-only portal | Protects data integrity — no risk of accidental changes |
| Single codebase, simple stack | Easy for the team to maintain and hand over |

---

## 📁 FILE OVERVIEW (For Reference)

```
TbridgeAdmin/
├── ARCHITECTURE.md       ← Tech stack decisions + data flow diagram
├── PRODUCT_REQUIREMENTS.md ← Detailed specs, DB schema, API endpoints
├── DESIGN-2.md           ← Full design system (colours, fonts, components)
├── PROMPTS.md            ← 20 step-by-step build instructions for the developer
├── bug.md                ← Bug tracker (this project)
└── process.md            ← This file — the plan explained simply
```

---

## ✅ HOW TO KNOW IT'S DONE

The project is complete when:

- [ ] You can log in with your email and password
- [ ] The Funnel Dashboard loads in under 2 seconds and shows correct data
- [ ] You can filter by date range and signup source
- [ ] Feature Adoption shows real block usage data
- [ ] Retention shows 7-day and 30-day rates
- [ ] Email Dashboard shows real campaign metrics from Mailgun
- [ ] You can search for any user by name or email and see their full journey
- [ ] Maz, Marilyn, Peter, and Ayo all have working logins
- [ ] The dashboard works on mobile/tablet
- [ ] No bugs are blocking any key workflow

---

## 🙋 QUESTIONS?

If anything is unclear about the plan, log it here so it can be answered before the team starts building:

| Question | Asked by | Answer |
|----------|----------|--------|
| *(none yet)* | | |

---

*Last updated: 2026-08-20 · Maintained by: Antigravity / TalentBridge team*
