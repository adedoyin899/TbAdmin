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

## ACTIVE BUGS

> No active bugs. All test suites and production builds passing with 0 errors! 🎉

---

*Last updated: 2026-08-20*
