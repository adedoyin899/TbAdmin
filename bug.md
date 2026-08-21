# 🐛 TalentBridge Admin — Bug Tracker

> A living document. Log every bug here as soon as it's found.  
> **Status key:** 🔴 Open · 🟡 In Progress · 🟢 Fixed · ⚫ Won't Fix

---

## HOW TO LOG A BUG

Copy this template and fill it in:

```markdown
### BUG-XXX — [Short title describing the problem]

| Field       | Detail                          |
|-------------|---------------------------------|
| **Status**  | 🔴 Open / 🟢 Fixed              |
| **Found by**| [Your name]                     |
| **Date**    | YYYY-MM-DD                      |
| **Area**    | [Login / Funnel / Features / Retention / Email / User Directory / Layout / Deploy] |
| **Severity**| 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low |

**What happened:**
Describe exactly what went wrong.

**Fix applied (if resolved):**
What was changed to fix it? Which file?

**Fixed on:** YYYY-MM-DD
```

---

## 🟢 RESOLVED BUGS & TECHNICAL ADJUSTMENTS

### BUG-001 — TypeScript `verbatimModuleSyntax` Type Import Errors
| Field | Detail |
|---|---|
| **Status** | 🟢 Fixed |
| **Found by** | Compiler / Build |
| **Date** | 2026-08-20 |
| **Area** | Common Components (`DateRangeSelector.tsx` imports) |
| **Severity** | 🟠 High (Build blocker) |

**What happened:**
`TS1484` error occurred when importing `DateRangeValue` interface without the explicit `type` keyword in dashboards.
**Fix applied:**
Updated all imports to use explicit type syntax (`import { DateRangeSelector, type DateRangeValue } from ...`).
**Fixed on:** 2026-08-20

---

### BUG-002 — Vercel SPA Client Routing 404 on Direct Sub-Path Refresh
| Field | Detail |
|---|---|
| **Status** | 🟢 Fixed |
| **Found by** | Deployment verification |
| **Date** | 2026-08-20 |
| **Area** | Deployment / Routing (`vercel.json`) |
| **Severity** | 🟠 High |

**What happened:**
Refreshing pages on deep routes (e.g. `/dashboard/funnel`, `/dashboard/rooms`, `/lookup`) returned 404 because Vercel looked for physical files instead of rewriting to `/index.html`.
**Fix applied:**
Created `frontend/vercel.json` and root `vercel.json` with SPA rewrite rules (`{"source": "/(.*)", "destination": "/index.html"}`).
**Fixed on:** 2026-08-20

---

### BUG-003 — Unused Import Lint Warnings in CampaignDetailView
| Field | Detail |
|---|---|
| **Status** | 🟢 Fixed |
| **Found by** | TypeScript compiler |
| **Date** | 2026-08-20 |
| **Area** | Email Campaign Drill-Down |
| **Severity** | 🟢 Low |

**What happened:**
Icons declared in `CampaignDetailView.tsx` were not referenced, causing `TS6133` error during production build.
**Fix applied:**
Cleaned up unused icon imports in `CampaignDetailView.tsx`.
**Fixed on:** 2026-08-20

---

### BUG-004 — Blank Page on Fresh User Login Due to Unhandled Empty Telemetry Arrays
| Field | Detail |
|---|---|
| **Status** | 🟢 Fixed |
| **Found by** | User QA / Login Flow |
| **Date** | 2026-08-21 |
| **Area** | Dashboards (`FunnelDashboard`, `FeatureDashboard`, `RetentionDashboard`, `EmailDashboard`, `RoomInsightsDashboard`) |
| **Severity** | 🔴 Critical |

**What happened:**
When a fresh user with 0 telemetry records logged in, components crashed or rendered blank states due to attempting `.reduce()`, `.map()`, or division on empty arrays without guards.
**Fix applied:**
Added default onboarding state cards with icons and guidance across all 5 dashboard components, guarded all array operations, and seeded Maz admin with complete suite datasets.
**Fixed on:** 2026-08-21

---

### BUG-005 — Typography Discrepancy (Sora vs Geist)
| Field | Detail |
|---|---|
| **Status** | 🟢 Fixed |
| **Found by** | Design QA |
| **Date** | 2026-08-21 |
| **Area** | Typography (`index.css`, `tailwind.config.js`) |
| **Severity** | 🟡 Medium |

**What happened:**
Portions of the UI were rendering browser default or inconsistent sans-serif fonts instead of the modern Geist font family.
**Fix applied:**
Imported Google Fonts **Geist** (`sans`) and **Geist Mono** (`mono`), configured in Tailwind, and set global CSS standard rules.
**Fixed on:** 2026-08-21

---

### BUG-006 — Sidebar & Header Navigation Hierarchy Ergonomics
| Field | Detail |
|---|---|
| **Status** | 🟢 Fixed |
| **Found by** | Navigation Review |
| **Date** | 2026-08-21 |
| **Area** | Layout (`Layout.tsx`) |
| **Severity** | 🟡 Medium |

**What happened:**
Sign out and user settings were scattered in the top header, and navigation links lacked categorization.
**Fix applied:**
Grouped sidebar links into clear subheadings (`MAIN NAVIGATION`, `ANALYTICS & MEDIA`, `TOOLS & DIRECTORY`, `SYSTEM & CONFIG`), placed the user profile card with popover at the bottom-left, added a `⌘K` global search bar in the header, and created a top-right avatar dropdown menu.
**Fixed on:** 2026-08-21

---

### BUG-007 — Settings Page Long-Form Sprawl & Key Synchronization
| Field | Detail |
|---|---|
| **Status** | 🟢 Fixed |
| **Found by** | User Request & UX Review |
| **Date** | 2026-08-21 |
| **Area** | Settings (`Settings.tsx`) |
| **Severity** | 🟡 Medium |

**What happened:**
Settings were contained in a single long form without separation of concerns or live key validation.
**Fix applied:**
Re-architected into 5 embedded navigation tabs (Anomaly Triggers, Email & Digest, Integrations & API, Team & Security, Portal Appearance), added live key validation with Accept/Reject feedback, and enabled automatic sync with `localStorage`.
**Fixed on:** 2026-08-21

---

### BUG-008 — Multi-User Role Management & Super Admin Source of Truth
| Field | Detail |
|---|---|
| **Status** | 🟢 Fixed |
| **Found by** | Admin Demo Preparation |
| **Date** | 2026-08-21 |
| **Area** | Team Management (`Settings.tsx`) |
| **Severity** | 🟠 High |

**What happened:**
Admin user list was static and did not allow provisioning, role elevation, suspension, or deletion of team accounts.
**Fix applied:**
Built dynamic Super Admin User Management Suite with Maz (`maz@talentbridge.cv`) as primary owner, allowing live creation (+ Add Administrator modal), role modification, suspension/activation, session reset, and real-time audit logging.
**Fixed on:** 2026-08-21

---

## ACTIVE BUGS

> No active bugs. All 5 test suites (15 unit/integration tests) and production builds passing with 0 errors! 🎉

---

*Last updated: 2026-08-21*
