# Security Vulnerability Audit Log (audit.md)

This log records the reports of the **Security Specialist subagent**, auditing authentication systems, database access control, and endpoint verification.

---

## Audit Index

| ID | Date | Scope | Verdict | Findings |
|----|------|-------|---------|----------|
| AUD-001 | 2026-06-13 | Full-stack QuickNotes | **CLEAR** (after fixes) | 1 High fixed, 1 High (dev-only advisory), 1 Medium documented |

---

## AUD-001 — Full-Stack Security Audit (QuickNotes v1.0)
**Date**: 2026-06-13  
**Auditor**: Security Specialist  
**Scope**: `backend/src/`, `backend/prisma/`, `frontend/src/`, dependency manifests  
**References**: OWASP Top 10, `docs/ba/requirements.md`

---

### OWASP A01 — Broken Access Control

**Auth middleware coverage** ✅ CLEAR  
`app.use('/api/notes', authenticate, notesRouter)` in `index.js` applies `requireAuth()` to every route under `/api/notes`. No route is accidentally unprotected.

**Ownership enforcement** ✅ CLEAR  
`resolveNote(noteId, userId, res)` in `routes/notes.js` fetches the note then checks `note.userId !== userId` → 403. Applied to `GET /:id`, `PUT /:id`, `DELETE /:id`. The `GET /` list route uses `where: { userId }` — users only ever see their own notes. `POST /` sets `userId` from `req.auth.userId`, not from request body — users cannot forge ownership.

**ProtectedRoute race condition** ✅ CLEAR  
`App.jsx` returns `null` while `isLoaded === false` (Clerk initializing). Only after Clerk confirms session state does it evaluate `isSignedIn`. No flash of protected content and no premature redirect to sign-in.

---

### OWASP A02 — Cryptographic Failures

**Secrets in frontend bundle** ✅ CLEAR  
Only `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` are exposed via `VITE_` prefix. `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, and `DATABASE_URL` live exclusively in the backend `.env` — Vite's bundler never touches them.

**Token transport** ✅ CLEAR  
Clerk JWT is passed as `Authorization: Bearer <token>` header in `api/notes.js`. Never placed in a URL query string, `localStorage`, or a cookie that could be read by `document.cookie`.

**Missing `.gitignore`** 🔴 HIGH → **FIXED**  
No `.gitignore` existed in the project root, backend, or frontend. A developer could accidentally `git add .` and commit a real `.env` file containing database credentials, Clerk secret key, and webhook secret.  
**Fix applied**: Created `.gitignore` at root, `backend/`, and `frontend/` excluding `.env`, `.env.local`, `node_modules/`, `dist/`.

---

### OWASP A03 — Injection

**SQL Injection** ✅ CLEAR  
All database access in `routes/notes.js` and `webhooks/clerk.js` uses the Prisma ORM API (`findUnique`, `findMany`, `create`, `upsert`, `update`, `delete`, `deleteMany`). No `$queryRaw` or `$executeRaw` usage. Prisma uses parameterized queries at the driver level.

**Input validation** ✅ CLEAR  
`routes/notes.js` defines Zod schemas:
- `createSchema`: `title` min 1 / max 100, `content` max 10,000, defaults `''`
- `updateSchema`: both fields optional but constrained to same limits
Validation runs before any DB call. Invalid payloads receive 422 with the Zod error message.

**XSS via note content** ✅ CLEAR  
Note content is rendered in React JSX via `{truncate(note.content)}` — React escapes all string values by default. There is no `dangerouslySetInnerHTML` usage anywhere in the codebase. Notes are stored and returned as plain text.

---

### OWASP A05 — Security Misconfiguration

**CORS** ✅ CLEAR  
```js
cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true })
```
Origin is a single explicit string — not `*`. `credentials: true` is safe because the origin is not a wildcard. In production, setting `FRONTEND_URL` to the actual deployed domain is required.

**HTTP Security Headers (Helmet)** ✅ CLEAR  
`app.use(helmet())` is the first middleware registered, before CORS and body parsers. Default Helmet v7 protections include: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-DNS-Prefetch-Control: off`, `Strict-Transport-Security` (HTTPS only), `Referrer-Policy: no-referrer`, and a default Content Security Policy.

**Webhook endpoint security** ✅ CLEAR  
`/api/webhooks/clerk` is NOT behind `requireAuth()` (correct — Clerk's backend cannot provide a user JWT for its own webhooks). Instead, `webhooks/clerk.js` verifies the `svix-signature` header using the `CLERK_WEBHOOK_SECRET` before any DB write. Missing or invalid headers return 400 before the switch/case is reached.

---

### OWASP A06 — Vulnerable and Outdated Components

**Backend** ✅ CLEAR  
`npm audit` (backend): **0 vulnerabilities**

**Frontend** ⚠️ MEDIUM — dev-server advisory (esbuild / Vite)  
`npm audit` (frontend):
```
esbuild <=0.28.0 — Severity: High (dev server only)
vite <=6.4.1    — Depends on vulnerable esbuild
```
**Nature of risk**: The `esbuild` development server accepts cross-origin requests, allowing any website visited during development to read dev server responses. This is a **development-time-only** vulnerability. Production builds (`npm run build`) produce static files served by a separate web server — `esbuild`/Vite's dev server is not involved.  
**Fix**: Run `npm --prefix frontend audit fix --force` to upgrade to Vite 8. This is a major version bump — deferred to a planned upgrade sprint to avoid breaking the dev workflow mid-project.  
**Workaround**: Only run `npm run dev` on trusted networks. Do not demo the dev server on public WiFi.

---

### OWASP A07 — Identification and Authentication Failures

**Session management** ✅ CLEAR  
Clerk handles JWT issuance, rotation, and expiry. The backend does not implement its own session logic. `requireAuth()` from `@clerk/express` validates the JWT on every request.

**Sign-out** ✅ CLEAR  
`TopNav.jsx` calls `signOut()` from `useClerk()`, which invalidates the Clerk session server-side. The ProtectedRoute correctly blocks back-navigation after sign-out because `isSignedIn` becomes `false`.

---

### Findings Summary

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| SEC-001 | 🔴 High | No `.gitignore` — `.env` secrets could be committed to git | **FIXED** — `.gitignore` created at root, backend/, frontend/ |
| SEC-002 | ⚠️ Medium | esbuild/Vite dev-server cross-origin advisory (dev-only, not production) | **DOCUMENTED** — upgrade deferred; workaround: use on trusted networks |
| SEC-003 | 🟡 Low | No API rate limiting — brute-force / flood possible on note endpoints | **DOCUMENTED** — recommend `express-rate-limit` before production deploy |

---

### Recommendations for Production

1. Set `FRONTEND_URL` to the exact production domain in the backend `.env`.
2. Add `express-rate-limit` middleware (e.g. 100 req/15 min per IP) to `/api/notes`.
3. Upgrade Vite to v8 when upgrading dev toolchain.
4. Enable TLS/HTTPS on both frontend host and backend API.
5. Rotate `CLERK_WEBHOOK_SECRET` after initial deployment.

---

### Verdict: **CLEAR** (after SEC-001 fix)
No blocking Critical or High runtime vulnerabilities found. One High issue (missing .gitignore) was fixed inline. Application is cleared to proceed to QA.
