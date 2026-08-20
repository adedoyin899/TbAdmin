# TalentBridge Analytics API (Backend Gateway)

Secure, read-only analytics gateway that integrates PostHog event data, Mailgun webhooks, and team authentication for the TalentBridge Admin Portal.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Run Database Migrations
```bash
npm run migrate
```

### 4. Seed Initial Admin User
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
# Starts API server on http://localhost:3001
```

---

## 📦 Scripts
- `npm run dev`: Start development server with hot reload (`tsx`)
- `npm run build`: Compile TypeScript into `dist/`
- `npm run start`: Run compiled production build
- `npm run migrate`: Execute database migration scripts
- `npm run migrate:rollback`: Rollback database migrations
- `npm run seed`: Seed default administrator account
