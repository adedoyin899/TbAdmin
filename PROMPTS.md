# TalentBridge Analytics Dashboard
## Build Prompts (Sequential 1-20)

**Copy the entire contents of this file. Paste into Claude Code. No external dependencies. Everything included.**

---

## BUILD ORDER (SEQUENTIAL)

**Week 1: UI-First Build (Prompts 1-10)**
- Prompts 1-2: Backend scaffolding + database (1 hour)
- Prompts 3-10: Frontend UI with mock data (10 hours)
- **Result:** Working dashboard by Friday

**Week 2: Backend APIs (Prompts 11-17, parallel to Week 1)**
- Prompts 11-17: Real API build (5 hours)
- **Result:** All endpoints working independently

**Week 3: Integration & Deploy (Prompts 18-20)**
- Prompts 18-19: Connect frontend to backend (4 hours)
- Prompt 20: Deploy to production (2 hours)
- **Result:** Live dashboard

---

## DESIGN SYSTEM (FOR ALL PROMPTS)

Use TalentBridge's existing design system:

**Colors:**
- Navy: #0D1F1E (primary)
- Teal: #2DD4BF (accent)
- Dark Teal: #0F766E (dark accent)
- Green: #10B981 (success)

**Typography:**
- Display font: Sora (headings, titles)
- Body font: DM Sans (body text, UI)
- Monospace: JetBrains Mono (code, tables)

**Tailwind:** Configure with these exact colors + fonts

---

---

# PROMPT 1: BACKEND SCAFFOLDING & DEPENDENCIES

## Objective
Set up backend project from scratch with folder structure and dependencies.

## Requirements
- Node.js 18+ installed
- npm or yarn
- Git initialized

## Deliverables

Backend repo (`talentbridge-analytics-api/`) should include:

**Files to create:**
- `package.json` with dependencies: express, typescript, dotenv, axios, jsonwebtoken, bcrypt, pg, ioredis, cors, helmet, morgan, express-rate-limit
- `.env.example` template (list all vars from PRODUCT_REQUIREMENTS)
- `tsconfig.json` with strict mode enabled
- `README.md` with setup instructions
- `.gitignore` (node_modules, .env, dist/, .DS_Store)

**Folders to create:**
- `src/`
  - `db/` (migrations, connection, seeders)
  - `services/` (auth, PostHog, cache)
  - `routes/` (auth, dashboard, users, webhooks)
  - `middleware/` (auth, error handling, RBAC)
  - `controllers/` (business logic)
  - `types/` (TypeScript interfaces)
  - `utils/` (helpers, validators, formatters)
  - `config/` (configuration files)

## Acceptance Criteria
- [ ] `npm run dev` starts without errors → http://localhost:3001
- [ ] All dependencies install cleanly (no warnings)
- [ ] `npm run build` compiles TypeScript without errors
- [ ] Folder structure exists as above
- [ ] `.env.example` includes all required variables
- [ ] No console errors on startup
- [ ] Git initialized and ready to push

---

# PROMPT 2: DATABASE SCHEMA & MIGRATIONS

## Objective
Create database tables and migration scripts.

## Requirements
- Backend from Prompt 1 complete
- PostgreSQL running and accessible
- Connection string ready

## Deliverables

**Files to create in `src/db/`:**

### `migrations/001_create_analytics_schema.sql`
Create these 4 tables:

**admin_users:**
- id (UUID, primary key)
- email (VARCHAR 255, unique)
- password_hash (VARCHAR 255)
- role (VARCHAR 50: admin, product, marketing, operations, intern)
- created_at (TIMESTAMP default now)
- last_login (TIMESTAMP nullable)
- is_active (BOOLEAN default true)
- Index on email

**mailgun_events:**
- id (BIGSERIAL, primary key)
- event_type (VARCHAR 50: opened, clicked, delivered, failed, unsubscribed, complained)
- email_address (VARCHAR 255)
- campaign_id (VARCHAR 255)
- campaign_name (VARCHAR 255)
- message_id (VARCHAR 255, unique)
- link_url (VARCHAR 500)
- timestamp (TIMESTAMP)
- created_at (TIMESTAMP default now)
- metadata (JSONB)
- Indexes on email_address, campaign_id, timestamp

**dashboard_cache:**
- id (BIGSERIAL, primary key)
- cache_key (VARCHAR 255, unique)
- data (JSONB)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP default now)
- Index on expires_at

**audit_log:**
- id (BIGSERIAL, primary key)
- admin_user_id (UUID, foreign key to admin_users)
- action (VARCHAR 255)
- resource (VARCHAR 255)
- timestamp (TIMESTAMP default now)
- ip_address (INET)
- user_agent (VARCHAR 500)
- Indexes on admin_user_id, timestamp

### `migrations/002_create_indexes.sql`
Create all indexes (listed above in table definitions)

### `connection.ts`
Export PostgreSQL connection pool using `pg` library

### `seeders/admin_users.ts`
Seed default admin user: 
- email: maz@talentbridge.cv
- password: temp_password_123
- role: admin

### `types/database.ts`
TypeScript types for each table row

## Acceptance Criteria
- [ ] `npm run migrate` creates all 4 tables
- [ ] Query admin_users → returns seeded user
- [ ] Query mailgun_events → table exists with all columns
- [ ] Query dashboard_cache → table exists
- [ ] All indexes created
- [ ] `src/db/connection.ts` exports working pool
- [ ] Rollback script works: `npm run migrate:rollback`

---

# PROMPT 3: FRONTEND PROJECT SETUP

## Objective
Set up React + TypeScript frontend with design system.

## Requirements
- Node.js 18+ installed
- npm or yarn
- Tailwind + shadcn/ui configured in Vite project

## Deliverables

**Frontend repo (`talentbridge-analytics-dashboard/`) structure:**

**Root files:**
- `package.json` with: react, react-dom, typescript, axios, react-router-dom, @tanstack/react-query, recharts, date-fns, tailwindcss, shadcn/ui, vite, @vitejs/plugin-react
- `.env.example`:
  ```
  VITE_USE_MOCK_DATA=true
  VITE_API_BASE_URL=http://localhost:3001/api
  VITE_POSTHOG_REPLAY_BASE_URL=https://posthog.yourinstance.com
  ```
- `tsconfig.json` with strict mode
- `vite.config.ts` with React plugin
- `tailwind.config.js` with TalentBridge colors (see DESIGN SYSTEM above)
- `.gitignore`

**`src/` folders:**
- `api/`
  - `client.ts` (Axios instance, no real endpoint yet)
  - `dashboardApi.ts` (will return mock data in Prompt 4)
  - `authApi.ts` (mock auth)
  - `userApi.ts` (mock user search)
  - `mockData/` (folder for JSON files)
- `components/` (empty, will fill in later prompts)
- `hooks/` (empty)
- `pages/` (empty)
- `types/` (empty, will fill later)
- `config/` (empty, will fill later)
- `utils/` (empty, will fill later)

**Root `src/` files:**
- `App.tsx` (basic router structure, will expand)
- `main.tsx` (entry point)
- `index.css` (Tailwind directives)

## Acceptance Criteria
- [ ] `npm run dev` starts without errors → http://localhost:5173
- [ ] All dependencies install cleanly
- [ ] `npm run build` compiles without errors
- [ ] Folder structure created
- [ ] `.env.example` has correct variables
- [ ] Tailwind colors configured correctly
- [ ] No TypeScript errors

---

# PROMPT 4: MOCK API LAYER & DATA FILES

## Objective
Create mock API implementations and mock data JSON files.

## Requirements
- Frontend from Prompt 3 complete

## Deliverables

**Create `src/api/mockData/` JSON files** (copy these exact data structures):

### `funnel.json`
```json
{
  "funnel": [
    { "stage": "signup_started", "count": 2450, "percentage": 100 },
    { "stage": "email_verified", "count": 2401, "percentage": 98 },
    { "stage": "showcase_room_created", "count": 1080, "percentage": 45 },
    { "stage": "showcase_room_published", "count": 940, "percentage": 87 },
    { "stage": "showcase_room_shared", "count": 770, "percentage": 82 }
  ],
  "dropoff": [
    { "from": "signup_started", "to": "email_verified", "percentage": 2 },
    { "from": "email_verified", "to": "showcase_room_created", "percentage": 55 },
    { "from": "showcase_room_created", "to": "showcase_room_published", "percentage": 13 },
    { "from": "showcase_room_published", "to": "showcase_room_shared", "percentage": 18 }
  ],
  "cachedAt": "2026-08-20T12:00:00Z",
  "expiresAt": "2026-08-20T12:15:00Z"
}
```

### `features.json`
```json
{
  "blockAdoption": [
    { "blockType": "Experience", "count": 940, "percentage": 87 },
    { "blockType": "Skills", "count": 884, "percentage": 82 },
    { "blockType": "Projects", "count": 809, "percentage": 75 },
    { "blockType": "Achievements", "count": 561, "percentage": 52 },
    { "blockType": "Certification", "count": 442, "percentage": 41 }
  ],
  "themeDistribution": [
    { "theme": "dark", "count": 648, "percentage": 60 },
    { "theme": "light", "count": 432, "percentage": 40 }
  ]
}
```

### `retention.json`
```json
{
  "retention7d": { "percentage": 42 },
  "retention30d": { "percentage": 28 },
  "trend": [
    { "week": "2026-07-24", "retention7d": 38, "retention30d": 25 },
    { "week": "2026-07-31", "retention7d": 40, "retention30d": 26 },
    { "week": "2026-08-07", "retention7d": 42, "retention30d": 28 }
  ]
}
```

### `email.json`
```json
{
  "campaigns": [
    {
      "campaignId": "welcome-email-001",
      "campaignName": "Welcome Email",
      "sentDate": "2026-08-01",
      "sentCount": 500,
      "openCount": 210,
      "openPercentage": 42,
      "clickCount": 85,
      "clickPercentage": 17,
      "bounceCount": 2,
      "unsubscribeCount": 0
    },
    {
      "campaignId": "showcase-tips-001",
      "campaignName": "Showcase Tips",
      "sentDate": "2026-08-03",
      "sentCount": 450,
      "openCount": 156,
      "openPercentage": 35,
      "clickCount": 62,
      "clickPercentage": 14,
      "bounceCount": 1,
      "unsubscribeCount": 1
    }
  ],
  "topPerformers": [
    { "campaignName": "Welcome Email", "clickPercentage": 17 },
    { "campaignName": "Showcase Tips", "clickPercentage": 14 }
  ]
}
```

### `users.json`
```json
{
  "results": [
    {
      "userId": "user_123abc",
      "email": "alice@example.com",
      "firstName": "Alice",
      "lastName": "Chen",
      "signupDate": "2026-08-01T14:22:00Z",
      "country": "UK",
      "signupSource": "organic",
      "planTier": "free",
      "lastActive": "2026-08-20T14:00:00Z"
    },
    {
      "userId": "user_456def",
      "email": "bob@example.com",
      "firstName": "Bob",
      "lastName": "Smith",
      "signupDate": "2026-08-05T10:00:00Z",
      "country": "US",
      "signupSource": "email",
      "planTier": "free",
      "lastActive": "2026-08-20T15:30:00Z"
    }
  ]
}
```

### `events.json`
```json
{
  "events": [
    { "eventId": "evt_001", "eventName": "signup_started", "timestamp": "2026-08-01T14:22:00Z", "properties": {} },
    { "eventId": "evt_002", "eventName": "email_verified", "timestamp": "2026-08-01T14:23:00Z", "properties": {} },
    { "eventId": "evt_003", "eventName": "showcase_room_created", "timestamp": "2026-08-01T14:30:00Z", "properties": { "roomName": "My CV" } },
    { "eventId": "evt_004", "eventName": "block_added", "timestamp": "2026-08-01T15:15:00Z", "properties": { "blockType": "Skills" } },
    { "eventId": "evt_005", "eventName": "showcase_room_shared", "timestamp": "2026-08-02T09:00:00Z", "properties": { "shareType": "public_link" } }
  ]
}
```

**Create `src/api/dashboardApi.ts`:**
```typescript
import MOCK_FUNNEL_DATA from './mockData/funnel.json';
import MOCK_FEATURES_DATA from './mockData/features.json';
import MOCK_RETENTION_DATA from './mockData/retention.json';
import MOCK_EMAIL_DATA from './mockData/email.json';

export const dashboardApi = {
  getFunnel: async (dateRange: string, signupSource: string) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(MOCK_FUNNEL_DATA), 300);
    });
  },
  getFeatures: async (dateRange: string) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(MOCK_FEATURES_DATA), 300);
    });
  },
  getRetention: async (signupSource: string) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(MOCK_RETENTION_DATA), 300);
    });
  },
  getEmail: async (dateRange: string) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(MOCK_EMAIL_DATA), 300);
    });
  },
};
```

**Create `src/api/authApi.ts`:**
```typescript
export const authApi = {
  login: async (email: string, password: string) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockToken = 'mock_jwt_' + Date.now();
        localStorage.setItem('auth_token', mockToken);
        resolve({
          token: mockToken,
          user: { id: 'user_123', email, role: 'admin' }
        });
      }, 300);
    });
  },
  logout: async () => {
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  },
  me: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: 'user_123',
          email: 'maz@talentbridge.cv',
          role: 'admin'
        });
      }, 300);
    });
  },
};
```

**Create `src/api/userApi.ts`:**
```typescript
import MOCK_USERS_DATA from './mockData/users.json';
import MOCK_EVENTS_DATA from './mockData/events.json';

export const userApi = {
  searchUsers: async (query: string, limit: number = 10) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MOCK_USERS_DATA);
      }, 300);
    });
  },
  getUserProfile: async (userId: string) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          user: MOCK_USERS_DATA.results[0],
          events: MOCK_EVENTS_DATA.events,
          emailEngagement: [
            { campaignName: "Welcome Email", sent: "2026-08-01T14:25:00Z", opened: "2026-08-01T14:45:00Z", clicked: true },
            { campaignName: "Showcase Tips", sent: "2026-08-03T10:00:00Z", opened: null, clicked: false }
          ],
          postHogSessionReplayUrl: 'https://posthog.example.com/sessions/sess_123abc'
        });
      }, 300);
    });
  },
};
```

## Acceptance Criteria
- [ ] All 6 JSON files created in `src/api/mockData/`
- [ ] dashboardApi exports all 4 methods (getFunnel, getFeatures, getRetention, getEmail)
- [ ] authApi exports login, logout, me methods
- [ ] userApi exports searchUsers, getUserProfile methods
- [ ] Each method returns mock data with 300ms simulated delay
- [ ] No TypeScript errors

---

# PROMPT 5: TYPES & UTILITIES

## Objective
Create TypeScript types and utility functions.

## Requirements
- Frontend from Prompt 4 complete

## Deliverables

**Create `src/types/index.ts`:**
```typescript
// Dashboard types
export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface Dropoff {
  from: string;
  to: string;
  percentage: number;
}

export interface FunnelDashboardResponse {
  funnel: FunnelStage[];
  dropoff: Dropoff[];
  cachedAt: string;
  expiresAt: string;
}

export interface BlockAdoption {
  blockType: string;
  count: number;
  percentage: number;
}

export interface FeaturesDashboardResponse {
  blockAdoption: BlockAdoption[];
  themeDistribution: Array<{ theme: string; count: number; percentage: number }>;
}

export interface RetentionDashboardResponse {
  retention7d: { percentage: number };
  retention30d: { percentage: number };
  trend: Array<{ week: string; retention7d: number; retention30d: number }>;
}

export interface EmailCampaign {
  campaignId: string;
  campaignName: string;
  sentDate: string;
  sentCount: number;
  openCount: number;
  openPercentage: number;
  clickCount: number;
  clickPercentage: number;
  bounceCount: number;
  unsubscribeCount: number;
}

export interface EmailDashboardResponse {
  campaigns: EmailCampaign[];
  topPerformers: Array<{ campaignName: string; clickPercentage: number }>;
}

// User types
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  signupDate: string;
  country: string;
  signupSource: string;
  planTier: string;
  lastActive: string;
}

export interface UserEvent {
  eventId: string;
  eventName: string;
  timestamp: string;
  properties: Record<string, any>;
}

export interface EmailEngagement {
  campaignName: string;
  sent: string;
  opened?: string;
  clicked: boolean;
}

export interface UserProfile {
  user: User;
  events: UserEvent[];
  emailEngagement: EmailEngagement[];
  postHogSessionReplayUrl: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; role: string };
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'product' | 'marketing' | 'operations' | 'intern';
  createdAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  error: string;
  status: number;
}
```

**Create `src/config/constants.ts`:**
```typescript
export const API_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  DASHBOARD_FUNNEL: '/dashboard/funnel',
  DASHBOARD_FEATURES: '/dashboard/features',
  DASHBOARD_RETENTION: '/dashboard/retention',
  DASHBOARD_EMAIL: '/dashboard/email',
  USERS_SEARCH: '/users/search',
  USERS_PROFILE: (userId: string) => `/users/${userId}`,
};

export const DATE_RANGES = ['7d', '30d', '90d', 'custom'] as const;

export const SIGNUP_SOURCES = ['organic', 'email', 'referral', 'paid_ad', 'all'] as const;

export const ROLES = {
  ADMIN: 'admin',
  PRODUCT: 'product',
  MARKETING: 'marketing',
  OPERATIONS: 'operations',
  INTERN: 'intern',
} as const;

export const RBAC_PERMISSIONS = {
  admin: { dashboards: ['funnel', 'features', 'retention', 'email'], userLookup: true },
  product: { dashboards: ['funnel', 'features', 'retention'], userLookup: true },
  marketing: { dashboards: ['email', 'funnel'], userLookup: false },
  operations: { dashboards: ['funnel', 'features', 'retention', 'email'], userLookup: true },
  intern: { dashboards: ['funnel', 'features'], userLookup: false },
};
```

**Create `src/utils/formatters.ts`:**
```typescript
export const formatPercentage = (num: number): string => {
  return `${Math.round(num)}%`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
```

**Create `src/utils/validators.ts`:**
```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};
```

## Acceptance Criteria
- [ ] All types defined in `src/types/index.ts`
- [ ] No `any` types used
- [ ] Constants defined in `src/config/constants.ts`
- [ ] Formatters working (formatPercentage, formatNumber, formatDate, formatTimestamp)
- [ ] Validators working (validateEmail, validatePassword, validateDateRange)
- [ ] No TypeScript errors

---

# PROMPT 6: FRONTEND AUTH SYSTEM (MOCK)

## Objective
Build login page and auth context with mock authentication.

## Requirements
- Frontend types and constants from Prompt 5 complete
- Mock authApi from Prompt 4 working

## Deliverables

**Create `src/context/AuthContext.tsx`:**
```typescript
import React, { createContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';

export const AuthContext = createContext<{
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check session on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setUser({ id: 'user_123', email: 'maz@talentbridge.cv', role: 'admin' });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      setUser(response.user as AuthUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Create `src/hooks/useAuth.ts`:**
```typescript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**Create `src/components/Auth/LoginPage.tsx`:**
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validators';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    if (password.length < 1) {
      setError('Password required');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard/funnel');
    } catch (err) {
      setError('Login failed. Try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="mb-6 text-2xl font-bold text-center text-navy">TalentBridge Analytics</h1>

        {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-navy">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal"
            disabled={isLoading}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-navy">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-teal text-white rounded font-medium hover:bg-dark-teal disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
```

**Create `src/components/Auth/ProtectedRoute.tsx`:**
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

**Create `src/pages/Login.tsx`:**
```typescript
import React from 'react';
import { LoginPage } from '../components/Auth/LoginPage';

export const LoginPageWrapper: React.FC = () => {
  return <LoginPage />;
};
```

## Acceptance Criteria
- [ ] Login page renders at root path
- [ ] Can login with any email/password
- [ ] Redirects to /dashboard/funnel on success
- [ ] Error messages display on validation failure
- [ ] useAuth() hook works in all components
- [ ] ProtectedRoute redirects unauthenticated users
- [ ] Session persists on page reload
- [ ] Logout clears session
- [ ] No console errors

---

# PROMPT 7: FRONTEND LAYOUT & NAVIGATION

## Objective
Build main layout with header and sidebar navigation.

## Requirements
- Frontend auth from Prompt 6 complete
- Design system configured (TalentBridge colors)

## Deliverables

**Create `src/components/Layout/Header.tsx`:**
```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-navy text-white px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">TalentBridge Analytics</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="px-3 py-2 bg-teal rounded hover:bg-dark-teal"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
```

**Create `src/components/Layout/Sidebar.tsx`:**
```typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/dashboard/funnel', label: 'Dashboard' },
    { path: '/dashboard/features', label: 'Features' },
    { path: '/dashboard/retention', label: 'Retention' },
    { path: '/dashboard/email', label: 'Email' },
    { path: '/lookup', label: 'User Lookup' },
  ];

  return (
    <aside className="w-48 bg-gray-50 border-r border-gray-200 p-4">
      <nav className="space-y-2">
        {navLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-4 py-2 rounded ${
              location.pathname === link.path
                ? 'bg-teal text-white'
                : 'text-navy hover:bg-gray-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
```

**Create `src/components/Layout/Layout.tsx`:**
```typescript
import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};
```

**Create `src/pages/Dashboard.tsx`:**
```typescript
import React from 'react';
import { Layout } from '../components/Layout/Layout';

export const DashboardPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Layout>{children}</Layout>;
};
```

**Create `src/pages/UserLookup.tsx`:**
```typescript
import React from 'react';
import { Layout } from '../components/Layout/Layout';

export const UserLookupPage: React.FC = () => {
  return <Layout>{/* User lookup component will go here */}</Layout>;
};
```

**Update `src/App.tsx`:**
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginPageWrapper } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { UserLookupPage } from './pages/UserLookup';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPageWrapper />} />
          <Route
            path="/dashboard/:metric"
            element={
              <ProtectedRoute>
                <DashboardPage>Dashboard</DashboardPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lookup"
            element={
              <ProtectedRoute>
                <UserLookupPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

## Acceptance Criteria
- [ ] Header shows TalentBridge logo and user email
- [ ] Logout button works
- [ ] Sidebar shows 5 nav links
- [ ] Active link highlighted
- [ ] Clicking nav links navigates
- [ ] Layout responsive
- [ ] No console errors

---

# PROMPT 8: FUNNEL DASHBOARD COMPONENT

## Objective
Build funnel dashboard with chart and filters.

## Requirements
- Frontend layout from Prompt 7 complete
- Mock data from Prompt 4 available

## Deliverables

**Create `src/hooks/useFunnelData.ts`:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { FunnelDashboardResponse } from '../types';

export const useFunnelData = (dateRange: string, signupSource: string) => {
  return useQuery<FunnelDashboardResponse>({
    queryKey: ['funnel', dateRange, signupSource],
    queryFn: () => dashboardApi.getFunnel(dateRange, signupSource),
  });
};
```

**Create `src/components/Common/DateRangePicker.tsx`:**
```typescript
import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const DateRangePicker: React.FC<Props> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded"
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="custom">Custom</option>
    </select>
  );
};
```

**Create `src/components/Charts/FunnelChart.tsx`:**
```typescript
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FunnelStage } from '../../types';

interface Props {
  data: FunnelStage[];
}

export const FunnelChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="stage" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#2DD4BF" />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

**Create `src/components/Dashboard/FunnelDashboard.tsx`:**
```typescript
import React, { useState } from 'react';
import { useFunnelData } from '../../hooks/useFunnelData';
import { DateRangePicker } from '../Common/DateRangePicker';
import { FunnelChart } from '../Charts/FunnelChart';
import { formatNumber, formatPercentage } from '../../utils/formatters';

export const FunnelDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [signupSource, setSignupSource] = useState('all');
  const { data, isLoading, error } = useFunnelData(dateRange, signupSource);

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-600">Error loading data</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        <select
          value={signupSource}
          onChange={(e) => setSignupSource(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="all">All Sources</option>
          <option value="organic">Organic</option>
          <option value="email">Email</option>
          <option value="referral">Referral</option>
          <option value="paid_ad">Paid Ad</option>
        </select>
      </div>

      <FunnelChart data={data.funnel} />

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-navy text-white">
          <tr>
            <th className="border p-3 text-left">Stage</th>
            <th className="border p-3 text-left">Count</th>
            <th className="border p-3 text-left">%</th>
            <th className="border p-3 text-left">Drop-off %</th>
          </tr>
        </thead>
        <tbody>
          {data.funnel.map((stage, idx) => (
            <tr key={stage.stage} className="hover:bg-gray-50">
              <td className="border p-3">{stage.stage}</td>
              <td className="border p-3">{formatNumber(stage.count)}</td>
              <td className="border p-3">{formatPercentage(stage.percentage)}</td>
              <td className="border p-3">
                {idx < data.dropoff.length ? formatPercentage(data.dropoff[idx].percentage) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Acceptance Criteria
- [ ] FunnelDashboard renders without errors
- [ ] Date range picker works (7d, 30d, 90d, custom)
- [ ] Signup source filter works
- [ ] Funnel chart displays 5 stages
- [ ] Each stage shows count + percentage
- [ ] Table shows conversion data
- [ ] Loading state visible while fetching
- [ ] Error state handled gracefully
- [ ] No console errors

---

# PROMPT 9: FEATURES, RETENTION, EMAIL DASHBOARDS

## Objective
Build 3 additional dashboards (Features, Retention, Email).

## Requirements
- Frontend layout from Prompt 7 complete
- Mock data from Prompt 4 available

## Deliverables

**Create `src/hooks/useFeaturesData.ts`:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export const useFeaturesData = (dateRange: string) => {
  return useQuery({
    queryKey: ['features', dateRange],
    queryFn: () => dashboardApi.getFeatures(dateRange),
  });
};
```

**Create `src/hooks/useRetentionData.ts`:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export const useRetentionData = (signupSource: string) => {
  return useQuery({
    queryKey: ['retention', signupSource],
    queryFn: () => dashboardApi.getRetention(signupSource),
  });
};
```

**Create `src/hooks/useEmailData.ts`:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export const useEmailData = (dateRange: string) => {
  return useQuery({
    queryKey: ['email', dateRange],
    queryFn: () => dashboardApi.getEmail(dateRange),
  });
};
```

**Create `src/components/Charts/LineChart.tsx`:**
```typescript
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: any[];
  lines: string[];
}

export const LineChartComponent: React.FC<Props> = ({ data, lines }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map(line => (
          <Line key={line} type="monotone" dataKey={line} stroke="#2DD4BF" />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
```

**Create `src/components/Dashboard/FeatureDashboard.tsx`:**
```typescript
import React, { useState } from 'react';
import { useFeaturesData } from '../../hooks/useFeaturesData';
import { DateRangePicker } from '../Common/DateRangePicker';
import { formatPercentage, formatNumber } from '../../utils/formatters';

export const FeatureDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const { data, isLoading } = useFeaturesData(dateRange);

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="space-y-6">
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      <div>
        <h2 className="text-lg font-bold mb-4 text-navy">Block Adoption</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-navy text-white">
            <tr>
              <th className="border p-3 text-left">Block Type</th>
              <th className="border p-3 text-left">Count</th>
              <th className="border p-3 text-left">Adoption %</th>
            </tr>
          </thead>
          <tbody>
            {data.blockAdoption.map(block => (
              <tr key={block.blockType} className="hover:bg-gray-50">
                <td className="border p-3">{block.blockType}</td>
                <td className="border p-3">{formatNumber(block.count)}</td>
                <td className="border p-3">{formatPercentage(block.percentage)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4 text-navy">Theme Distribution</h2>
        <div className="flex gap-4">
          {data.themeDistribution.map(theme => (
            <div key={theme.theme} className="p-4 bg-gray-50 rounded">
              <p className="font-medium capitalize">{theme.theme}</p>
              <p className="text-2xl font-bold text-teal">{formatPercentage(theme.percentage)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

**Create `src/components/Dashboard/RetentionDashboard.tsx`:**
```typescript
import React, { useState } from 'react';
import { useRetentionData } from '../../hooks/useRetentionData';
import { LineChartComponent } from '../Charts/LineChart';
import { formatPercentage } from '../../utils/formatters';

export const RetentionDashboard: React.FC = () => {
  const [signupSource, setSignupSource] = useState('all');
  const { data, isLoading } = useRetentionData(signupSource);

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="space-y-6">
      <select
        value={signupSource}
        onChange={(e) => setSignupSource(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded"
      >
        <option value="all">All Sources</option>
        <option value="organic">Organic</option>
        <option value="email">Email</option>
      </select>

      <div className="flex gap-6">
        <div className="p-6 bg-gray-50 rounded flex-1">
          <p className="text-gray-600">7-Day Retention</p>
          <p className="text-4xl font-bold text-teal">{formatPercentage(data.retention7d.percentage)}</p>
        </div>
        <div className="p-6 bg-gray-50 rounded flex-1">
          <p className="text-gray-600">30-Day Retention</p>
          <p className="text-4xl font-bold text-teal">{formatPercentage(data.retention30d.percentage)}</p>
        </div>
      </div>

      <LineChartComponent data={data.trend} lines={['retention7d', 'retention30d']} />
    </div>
  );
};
```

**Create `src/components/Dashboard/EmailDashboard.tsx`:**
```typescript
import React, { useState } from 'react';
import { useEmailData } from '../../hooks/useEmailData';
import { DateRangePicker } from '../Common/DateRangePicker';
import { formatNumber, formatPercentage } from '../../utils/formatters';

export const EmailDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const { data, isLoading } = useEmailData(dateRange);

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="space-y-6">
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-navy text-white">
          <tr>
            <th className="border p-3 text-left">Campaign</th>
            <th className="border p-3 text-left">Sent</th>
            <th className="border p-3 text-left">Opens</th>
            <th className="border p-3 text-left">Clicks</th>
            <th className="border p-3 text-left">Click %</th>
          </tr>
        </thead>
        <tbody>
          {data.campaigns.map(campaign => (
            <tr key={campaign.campaignId} className="hover:bg-gray-50">
              <td className="border p-3 font-medium">{campaign.campaignName}</td>
              <td className="border p-3">{formatNumber(campaign.sentCount)}</td>
              <td className="border p-3">{campaign.openPercentage}%</td>
              <td className="border p-3">{formatNumber(campaign.clickCount)}</td>
              <td className="border p-3 font-bold text-teal">{campaign.clickPercentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bg-green-50 p-6 rounded">
        <h3 className="font-bold mb-3 text-navy">Top Performers</h3>
        {data.topPerformers.map(performer => (
          <p key={performer.campaignName} className="text-sm">
            {performer.campaignName}: {performer.clickPercentage}% click rate
          </p>
        ))}
      </div>
    </div>
  );
};
```

## Acceptance Criteria
- [ ] FeatureDashboard renders block adoption + theme distribution
- [ ] RetentionDashboard shows 7d/30d retention % in cards
- [ ] Retention trend chart displays week-over-week data
- [ ] EmailDashboard shows campaigns table with metrics
- [ ] Top performers highlighted
- [ ] All filters work (date range, signup source)
- [ ] Loading states work
- [ ] No console errors

---

# PROMPT 10: USER LOOKUP PAGE

## Objective
Build user search and profile components.

## Requirements
- Frontend layout from Prompt 7 complete
- Mock data from Prompt 4 available

## Deliverables

**Create `src/hooks/useUserSearch.ts`:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import { useCallback, useState } from 'react';

export const useUserSearch = () => {
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', query],
    queryFn: () => (query ? userApi.searchUsers(query) : null),
    enabled: query.length > 0,
  });

  return { query, setQuery, results: data?.results || [], isLoading };
};
```

**Create `src/hooks/useUserProfile.ts`:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/userApi';

export const useUserProfile = (userId: string | null) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => (userId ? userApi.getUserProfile(userId) : null),
    enabled: !!userId,
  });
};
```

**Create `src/components/UserLookup/UserSearch.tsx`:**
```typescript
import React from 'react';
import { useUserSearch } from '../../hooks/useUserSearch';
import { formatDate } from '../../utils/formatters';

interface Props {
  onSelectUser: (userId: string) => void;
}

export const UserSearch: React.FC<Props> = ({ onSelectUser }) => {
  const { query, setQuery, results, isLoading } = useUserSearch();

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search by email, ID, or name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded"
      />

      {isLoading && <p className="text-center py-4">Searching...</p>}

      <div className="space-y-2">
        {results.map(user => (
          <div
            key={user.userId}
            onClick={() => onSelectUser(user.userId)}
            className="p-4 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
          >
            <p className="font-medium">{user.email}</p>
            <p className="text-sm text-gray-600">Signed up: {formatDate(user.signupDate)}</p>
            <p className="text-sm text-gray-600">Last active: {formatDate(user.lastActive)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Create `src/components/UserLookup/UserProfile.tsx`:**
```typescript
import React from 'react';
import { UserProfile as UserProfileType } from '../../types';
import { formatDate, formatTimestamp } from '../../utils/formatters';

interface Props {
  profile: UserProfileType;
  onBack: () => void;
}

export const UserProfile: React.FC<Props> = ({ profile, onBack }) => {
  const { user, events, emailEngagement, postHogSessionReplayUrl } = profile;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-teal hover:underline">
        ← Back to search
      </button>

      <div className="p-6 bg-gray-50 rounded">
        <h2 className="text-xl font-bold text-navy mb-4">{user.email}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Signed up</p>
            <p className="font-medium">{formatDate(user.signupDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Country</p>
            <p className="font-medium">{user.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Source</p>
            <p className="font-medium capitalize">{user.signupSource}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Plan</p>
            <p className="font-medium capitalize">{user.planTier}</p>
          </div>
        </div>
        <a
          href={postHogSessionReplayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block px-4 py-2 bg-teal text-white rounded hover:bg-dark-teal"
        >
          View PostHog Session
        </a>
      </div>

      <div>
        <h3 className="text-lg font-bold text-navy mb-4">Event Timeline</h3>
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.eventId} className="p-4 border-l-4 border-teal bg-gray-50">
              <p className="font-medium">{event.eventName}</p>
              <p className="text-sm text-gray-600">{formatTimestamp(event.timestamp)}</p>
              {Object.keys(event.properties).length > 0 && (
                <p className="text-sm text-gray-500">{JSON.stringify(event.properties)}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-navy mb-4">Email Engagement</h3>
        <div className="space-y-2">
          {emailEngagement.map(email => (
            <div key={email.campaignName} className="p-3 bg-gray-50 rounded">
              <p className="font-medium">{email.campaignName}</p>
              <p className="text-sm">Sent: {formatDate(email.sent)}</p>
              <p className="text-sm">
                {email.opened ? `Opened: ${formatDate(email.opened)}` : 'Not opened'}
              </p>
              <p className="text-sm">{email.clicked ? '✓ Clicked link' : '✗ No click'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

**Create `src/pages/UserLookup.tsx` (update):**
```typescript
import React, { useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { UserSearch } from '../components/UserLookup/UserSearch';
import { UserProfile } from '../components/UserLookup/UserProfile';
import { useUserProfile } from '../hooks/useUserProfile';

export const UserLookupPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: profile, isLoading } = useUserProfile(selectedUserId);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-navy mb-6">User Lookup</h1>

        {!selectedUserId ? (
          <UserSearch onSelectUser={setSelectedUserId} />
        ) : isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : profile ? (
          <UserProfile profile={profile} onBack={() => setSelectedUserId(null)} />
        ) : (
          <div>No user found</div>
        )}
      </div>
    </Layout>
  );
};
```

## Acceptance Criteria
- [ ] UserSearch renders with input + results
- [ ] Search debounced (300ms)
- [ ] Results show email, signup date, last active
- [ ] Clicking result shows UserProfile
- [ ] Profile shows user card with all info
- [ ] Event timeline displays chronological
- [ ] Each event shows timestamp + name + properties
- [ ] Email engagement shows campaigns
- [ ] Session replay link works
- [ ] Back button returns to search
- [ ] No console errors

---

# PROMPT 11: E2E TESTING WITH MOCK DATA

## Objective
Test full user flows with mock data (no backend).

## Requirements
- All frontend components from Prompts 3-10 complete
- Cypress or Playwright configured

## Deliverables

**Create `cypress/e2e/auth.cy.ts`:**
```typescript
describe('Auth Flow', () => {
  it('logs in with email/password', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button').contains('Login').click();
    cy.url().should('include', '/dashboard/funnel');
  });

  it('shows error on invalid email', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('invalid');
    cy.get('input[type="password"]').type('password');
    cy.get('button').contains('Login').click();
    cy.contains('Invalid email').should('be.visible');
  });

  it('persists session on reload', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button').contains('Login').click();
    cy.url().should('include', '/dashboard/funnel');
    cy.reload();
    cy.url().should('include', '/dashboard/funnel');
  });

  it('logs out successfully', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button').contains('Login').click();
    cy.get('button').contains('Logout').click();
    cy.url().should('equal', 'http://localhost:5173/');
  });
});
```

**Create `cypress/e2e/dashboards.cy.ts`:**
```typescript
describe('Dashboard Navigation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button').contains('Login').click();
  });

  it('loads funnel dashboard by default', () => {
    cy.url().should('include', '/dashboard/funnel');
    cy.contains('Signup Started').should('be.visible');
  });

  it('navigates to features dashboard', () => {
    cy.contains('Features').click();
    cy.url().should('include', '/dashboard/features');
    cy.contains('Block Adoption').should('be.visible');
  });

  it('navigates to retention dashboard', () => {
    cy.contains('Retention').click();
    cy.url().should('include', '/dashboard/retention');
    cy.contains('7-Day Retention').should('be.visible');
  });

  it('navigates to email dashboard', () => {
    cy.contains('Email').click();
    cy.url().should('include', '/dashboard/email');
    cy.contains('Campaign').should('be.visible');
  });

  it('filters funnel data by date range', () => {
    cy.get('select').first().select('30d');
    cy.contains('Signup Started').should('be.visible');
  });

  it('filters funnel data by signup source', () => {
    cy.get('select').last().select('organic');
    cy.contains('Signup Started').should('be.visible');
  });
});
```

**Create `cypress/e2e/userLookup.cy.ts`:**
```typescript
describe('User Lookup', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button').contains('Login').click();
    cy.contains('User Lookup').click();
  });

  it('searches for users by email', () => {
    cy.get('input[placeholder*="Search"]').type('alice@example.com');
    cy.contains('alice@example.com').should('be.visible');
  });

  it('displays user profile on click', () => {
    cy.get('input[placeholder*="Search"]').type('alice@example.com');
    cy.contains('alice@example.com').click();
    cy.contains('Event Timeline').should('be.visible');
  });

  it('shows event timeline', () => {
    cy.get('input[placeholder*="Search"]').type('alice@example.com');
    cy.contains('alice@example.com').click();
    cy.contains('signup_started').should('be.visible');
  });

  it('returns to search on back button', () => {
    cy.get('input[placeholder*="Search"]').type('alice@example.com');
    cy.contains('alice@example.com').click();
    cy.contains('Back to search').click();
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });
});
```

## Acceptance Criteria
- [ ] All test scenarios pass
- [ ] Tests use mock data (deterministic)
- [ ] Cypress runs in <2 minutes
- [ ] No console errors during tests
- [ ] No skipped tests

---

# PROMPT 12: CONNECT DASHBOARDS TO ROUTES

## Objective
Wire up dashboard components to router so they display.

## Requirements
- All dashboard components from Prompts 8-10 complete

## Deliverables

**Update `src/App.tsx`:**
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginPageWrapper } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { UserLookupPage } from './pages/UserLookup';
import { FunnelDashboard } from './components/Dashboard/FunnelDashboard';
import { FeatureDashboard } from './components/Dashboard/FeatureDashboard';
import { RetentionDashboard } from './components/Dashboard/RetentionDashboard';
import { EmailDashboard } from './components/Dashboard/EmailDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPageWrapper />} />
            <Route
              path="/dashboard/funnel"
              element={
                <ProtectedRoute>
                  <DashboardPage>
                    <FunnelDashboard />
                  </DashboardPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/features"
              element={
                <ProtectedRoute>
                  <DashboardPage>
                    <FeatureDashboard />
                  </DashboardPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/retention"
              element={
                <ProtectedRoute>
                  <DashboardPage>
                    <RetentionDashboard />
                  </DashboardPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/email"
              element={
                <ProtectedRoute>
                  <DashboardPage>
                    <EmailDashboard />
                  </DashboardPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lookup"
              element={
                <ProtectedRoute>
                  <UserLookupPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

## Acceptance Criteria
- [ ] All 4 dashboards render at their routes
- [ ] /dashboard/funnel shows FunnelDashboard
- [ ] /dashboard/features shows FeatureDashboard
- [ ] /dashboard/retention shows RetentionDashboard
- [ ] /dashboard/email shows EmailDashboard
- [ ] /lookup shows UserLookupPage
- [ ] Navigation between dashboards works
- [ ] No console errors

---

---

# WEEK 2: BACKEND API BUILD (Prompts 13-19)

**These run in parallel while UI is being polished.**

---

# PROMPT 13: BACKEND AUTH SYSTEM (REAL)

## Objective
Build real login/logout endpoints with bcrypt + JWT.

## Requirements
- Backend from Prompts 1-2 complete
- Database with admin_users table
- JWT_SECRET env var set

## Deliverables

Create backend files for real authentication (not mock):

**`src/services/authService.ts`:**
- hashPassword(password: string) → bcrypt hash
- comparePassword(password, hash) → boolean
- generateToken({id, email, role}) → JWT string (expires 7 days)
- verifyToken(token) → decoded payload

**`src/routes/auth.ts`:**
- POST /auth/login (email, password) → token + user
- POST /auth/logout → clears session
- GET /auth/me → current user info

**`src/middleware/authenticateToken.ts`:**
- Validates JWT from Authorization header
- Returns 401 if invalid/expired

**`src/types/auth.ts`:**
- JWT payload interface
- LoginRequest, LoginResponse types

**`src/server.ts`:**
- Register auth routes
- Add auth middleware

## Acceptance Criteria
- [ ] POST /auth/login with valid email/password returns 200 + token
- [ ] Token valid JWT (expires 7 days)
- [ ] POST /auth/login with invalid password returns 401
- [ ] GET /auth/me with valid token returns 200 + user info
- [ ] GET /auth/me without token returns 401
- [ ] POST /auth/logout clears session
- [ ] Passwords hashed with bcrypt
- [ ] Test with seeded user (maz@talentbridge.cv)

---

# PROMPT 14: POSTHOG CLIENT + REDIS CACHING

## Objective
Build PostHog API client and Redis cache layer.

## Requirements
- POSTHOG_API_KEY env var (read-only)
- REDIS_URL env var
- Redis running

## Deliverables

**`src/services/postHogService.ts`:**
- fetchFunnelData(dateRange, signupSource) → funnel array
- fetchFeatureAdoptionData(dateRange) → block adoption array
- fetchRetentionData(signupSource) → 7d/30d retention + trend
- fetchUserProfile(userId) → user + events
- searchUsers(query) → user list

**`src/services/cacheService.ts`:**
- get(key) → cached data or null
- set(key, data, ttl=900) → store in Redis
- delete(key) → clear cache entry
- flushAll() → clear all cache

**`src/utils/postHogHelpers.ts`:**
- Data transformation functions (calculate %, aggregate events)

**`src/types/postHog.ts`:**
- TypeScript types for PostHog API responses

## Acceptance Criteria
- [ ] Queries PostHog API correctly
- [ ] Results cached with 15-min TTL
- [ ] Cache hit returns data <100ms
- [ ] Cache miss calls PostHog (~1-2s)
- [ ] Errors handled gracefully (don't crash)
- [ ] Rate limiting: return last cached value if rate limited

---

# PROMPT 15: DASHBOARD API - FUNNEL ENDPOINT

## Objective
Build GET /api/dashboard/funnel endpoint.

## Requirements
- Auth from Prompt 13 working
- PostHog client from Prompt 14 complete

## Deliverables

**`src/routes/dashboard.ts`:**
- GET /api/dashboard/funnel endpoint

**`src/controllers/dashboardController.ts`:**
- getFunnelDashboard(req, res) method

Endpoint: GET /dashboard/funnel?dateRange=7d&signupSource=organic

Response: {funnel: [], dropoff: [], cachedAt, expiresAt}

## Acceptance Criteria
- [ ] Returns 200 with correct shape
- [ ] Funnel stages: signup_started → room_shared
- [ ] Percentages calculated correctly
- [ ] Dropoff calculated correctly
- [ ] dateRange + signupSource filters work
- [ ] Requires auth token (401 if missing)
- [ ] Cache works (15-min TTL)

---

# PROMPT 16: DASHBOARD API - FEATURES, RETENTION, EMAIL

## Objective
Build 3 additional dashboard endpoints.

## Requirements
- All previous backend prompts complete

## Deliverables

**`src/controllers/dashboardController.ts`:**
- getFeatureDashboard(req, res)
- getRetentionDashboard(req, res)
- getEmailDashboard(req, res)

**`src/routes/dashboard.ts`:**
- GET /dashboard/features
- GET /dashboard/retention
- GET /dashboard/email

## Acceptance Criteria
- [ ] All 3 endpoints return 200 with correct shape
- [ ] Features: blockAdoption (top 10), themeDistribution
- [ ] Retention: retention7d%, retention30d%, trend
- [ ] Email: campaigns, topPerformers
- [ ] All require auth token
- [ ] All cached (15-min TTL)

---

# PROMPT 17: USER LOOKUP API ENDPOINTS

## Objective
Build user search and profile endpoints (fresh data, no cache).

## Requirements
- PostHog client from Prompt 14 complete
- Mailgun events table exists

## Deliverables

**`src/routes/users.ts`:**
- GET /users/search?email=...
- GET /users/:userId

**`src/controllers/userController.ts`:**
- searchUsers(req, res)
- getUserProfile(req, res)

Behavior:
- Search works by email, userId, name
- NO caching (fresh data)
- Email engagement enriched from mailgun_events table
- Session replay URL included

## Acceptance Criteria
- [ ] GET /users/search returns results
- [ ] GET /users/:userId returns full profile
- [ ] NO caching (fresh every time)
- [ ] Email engagement enriched
- [ ] Session replay URL valid
- [ ] Requires auth token

---

# PROMPT 18: MAILGUN WEBHOOKS + RBAC

## Objective
Build Mailgun webhook receiver and RBAC middleware.

## Requirements
- Database with mailgun_events table
- MAILGUN_WEBHOOK_SIGNING_KEY env var

## Deliverables

**`src/routes/webhooks.ts`:**
- POST /api/webhooks/mailgun

**`src/controllers/webhookController.ts`:**
- handleMailgunEvent(req, res)
- Validates HMAC signature
- Parses event
- Stores in mailgun_events table

**`src/middleware/rbacMiddleware.ts`:**
- RBAC enforcement (toggle on/off via RBAC_ENABLED env var)

**`src/config/rbacConfig.ts`:**
- Role definitions + permissions

## Acceptance Criteria
- [ ] Webhook validates HMAC signature
- [ ] Invalid signature returns 401
- [ ] Valid event stored in DB
- [ ] Returns 200 immediately
- [ ] No JWT auth required (server-to-server)
- [ ] Duplicates deduplicated (message_id unique)
- [ ] RBAC_ENABLED toggle works (no impact when OFF)

---

---

# WEEK 3: INTEGRATION & DEPLOYMENT (Prompts 19-20)

---

# PROMPT 19: SWAP MOCK DATA → REAL APIS

## Objective
Connect frontend to real backend (one config change).

## Requirements
- Frontend Prompts 3-12 complete (UI with mocks)
- Backend Prompts 13-18 complete (real APIs running on http://localhost:3001)

## Changes Needed

**`src/api/dashboardApi.ts`:**
Replace mock returns with real axios calls:
```typescript
import axios from './client';

export const dashboardApi = {
  getFunnel: async (dateRange, signupSource) => {
    const res = await axios.get(`/dashboard/funnel?dateRange=${dateRange}&signupSource=${signupSource}`);
    return res.data;
  },
  // ... etc for other endpoints
};
```

**`src/api/userApi.ts`:**
Replace mock with real:
```typescript
export const userApi = {
  searchUsers: async (query) => {
    const res = await axios.get(`/users/search?email=${query}`);
    return res.data;
  },
  // ... etc
};
```

**`src/api/authApi.ts`:**
Replace mock with real:
```typescript
export const authApi = {
  login: async (email, password) => {
    const res = await axios.post('/auth/login', {email, password});
    return res.data;
  },
  // ... etc
};
```

**`.env`:**
```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:3001/api
```

## Acceptance Criteria
- [ ] Frontend still runs without errors
- [ ] Login works with real backend (maz@talentbridge.cv / temp_password_123)
- [ ] Dashboards load real PostHog data
- [ ] User search queries real backend
- [ ] Logout clears real session
- [ ] All API calls successful (no 401/404)
- [ ] Dashboard loads <2 seconds
- [ ] No console errors

---

# PROMPT 20: E2E TESTING WITH REAL BACKEND

## Objective
Re-run E2E tests against real backend.

## Requirements
- Integration Prompt 19 complete
- Backend running on http://localhost:3001
- Real database with seeded data

## Acceptance Criteria
- [ ] Login with real credentials works
- [ ] Dashboard loads real PostHog data
- [ ] User search finds real users
- [ ] Logout clears real session
- [ ] All E2E tests pass (same as Prompt 11)
- [ ] Performance <2 seconds
- [ ] Error handling works (graceful if backend down)
- [ ] No console errors

Then: Deploy to production (manual steps or automation)

---

---

## SUMMARY

**20 sequential prompts:**
- Prompts 1-12: Build solid UI with mock data (Week 1)
- Prompts 13-18: Build real backend APIs (Week 2, parallel)
- Prompts 19-20: Integration + final testing (Week 3)

**Copy each prompt. Paste into Claude Code. Build. Verify acceptance criteria. Move to next.**

**By Friday Week 1: Working UI.**
**By Wednesday Week 2: Working APIs.**
**By Friday Week 3: Live dashboard.**

---

**Ready? Start with Prompt 1. Good luck! 🚀**
