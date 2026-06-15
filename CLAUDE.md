# SaaS Project Developer Handbook (CLAUDE.md)

This is the **QuickNotes** project. Each project lives in its own repo under `D:\vibes\`. New projects get their own folder at the same level (e.g., `D:\vibes\project-two\`).

Tech stack: React (Vite) frontend, Node.js (Express) backend, PostgreSQL + Prisma ORM, Clerk auth, React Native + Expo mobile app, Playwright (web) / Maestro (mobile) for QA.

## Workspace Organization

- `frontend/` - React SPA (Vite, CSS Variables, modern responsive layouts) — deployed on Vercel
- `backend/` - Node.js Express server (Prisma clients, API endpoints, Zod schema validation) — deployed on Railway
- `mobile/` - React Native + Expo app (Android, Material Design 3) — distributed via Play Store
- `docs/` - Documentation & Logs (maintained by PM, BA, Security, and QA roles)
- `tests/` - Playwright web tests + `tests/maestro/` Maestro mobile flows

---

## Technical Stack & Commmands

### Setup & Migrations
- Install all dependencies: `npm install` (run in workspace root, frontend, and backend)
- Database schema migration: `npx prisma migrate dev`
- Generate Prisma client: `npx prisma generate`

### Development Servers
- Start frontend: `npm --prefix frontend run dev` (Runs on `http://localhost:5173`)
- Start backend: `npm --prefix backend run dev` (Runs on `http://localhost:5000`)

### Building
- Build frontend: `npm --prefix frontend run build`
- Build backend: `npm --prefix backend run build`

### Testing & Auditing
- Run Playwright UI tests: `npx playwright test --config tests/playwright.config.js`
- Run security audit: `npm audit` or `snyk test`

---

## Agent Delegation Protocol

This project operates under a hierarchical agent structure. All interactions begin with the **Project Manager (PM)**.

### Full Lifecycle Workflow:

**Phase 1 — Specification**
- PM spawns **BA** → writes full spec, user stories, DB schema, auth flow in `docs/ba/requirements.md`.

**Phase 2 — UX/UI Design** *(runs after BA spec is complete)*
- PM + BA + **Designer** → review spec together, Designer produces screen layouts, user flows, component map, and design system in `docs/design/screens.md`.
- PM presents design to user → **approval gate** before any coding begins.

**Phase 3 — Development**
- PM spawns **BE** → builds Express API, Prisma schema, auth middleware in `backend/`.
- PM spawns **Reviewer** → reviews BE code. If score < 7, PM sends fix list to BE. Loop until approved.
- PM spawns **FE** → builds React UI from `docs/design/screens.md` in `frontend/`.
- PM spawns **Reviewer** → reviews FE code. If score < 7, PM sends fix list to FE. Loop until approved.

**Phase 4 — Security Audit**
- PM spawns **Security** → audits auth coverage, ownership checks, input validation, CORS. Updates `docs/security/audit.md`.
- If issues found, PM routes to BE/FE for fixes, then Security re-audits.

**Phase 5 — QA Testing (Playwright + Claude Browser Extension)**
- PM spawns **QA** → writes and runs Playwright E2E tests in `tests/`.
- QA uses **Claude browser extension** for visual screen verification across all 8 screens at 3 viewports.
- Both dev servers must be running during QA: `npm --prefix frontend run dev` + `npm --prefix backend run dev`.
- Results and bug reports logged in `docs/qa/test_results.md`.

**Phase 6 — Bug Fix Loop** *(triggered if QA finds bugs)*
- PM routes bug reports to FE/BE → Security re-checks if auth-related → Reviewer re-reviews fixed files → QA re-tests affected flows.
- Loop repeats until QA reports zero open bugs.

**Phase 7 — Done**
- PM reports final status to user with summary of all phases.

### Docs & Design Directories:
- `docs/ba/` — BA specifications and user stories
- `docs/design/` — UX/UI screen designs and component maps (maintained by Designer)
- `docs/security/` — Security audit reports
- `docs/reviews/` — Code review logs
- `docs/qa/` — QA test results and screenshots
- `docs/pm/` — Kanban task board
