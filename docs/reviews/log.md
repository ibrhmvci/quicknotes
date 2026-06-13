# Senior Code Reviewer Log (log.md)

This log tracks code reviews, code quality scores, optimization details, and approvals.

---

## Review Index

| Round | Date | Scope | Verdict | Files Failed |
|-------|------|-------|---------|-------------|
| BE-R1 | 2026-06-13 | Backend — all files | REQUIRES FIXES | webhooks/clerk.js |
| BE-R2 | 2026-06-13 | Backend — webhooks/clerk.js | **APPROVED** | none |
| FE-R1 | 2026-06-13 | Frontend — all files | REQUIRES FIXES | TopNav.jsx, Toast.jsx |
| FE-R2 | 2026-06-13 | Frontend — TopNav.jsx, Toast.jsx | **APPROVED** | none |

---

## BE-R1 — Backend Round 1
**Date**: 2026-06-13  
**Reviewer**: Senior Code Reviewer  
**Scope**: All files in `backend/`  
**Reference**: `docs/ba/requirements.md`

### File Scores

| File | Score | Verdict |
|------|-------|---------|
| `backend/package.json` | 9/10 | PASS |
| `backend/prisma/schema.prisma` | 9/10 | PASS |
| `backend/src/index.js` | 8/10 | PASS |
| `backend/src/lib/prisma.js` | 10/10 | PASS |
| `backend/src/middleware/auth.js` | 9/10 | PASS |
| `backend/src/routes/notes.js` | 7/10 | PASS |
| `backend/src/webhooks/clerk.js` | **5/10** | **FAIL** |

### Findings

#### `package.json` — 9/10
- All required dependencies present and correctly versioned.
- `"type": "module"` correctly set for ESM. `prisma` in devDependencies. ✓
- Minor: no `engines` field for Node.js version. Non-blocking.

#### `prisma/schema.prisma` — 9/10
- `User.id` as Clerk userId string ✓. `@@index([userId])` ✓. `onDelete: Cascade` ✓.
- `Note.content @default("")` makes content optional correctly ✓.

#### `src/index.js` — 8/10
- `helmet()` first ✓. CORS locked to `FRONTEND_URL` env var ✓. `clerkMiddleware()` global ✓.
- Webhook registered with `express.raw()` **before** `express.json()` — critical order correct ✓.
- Global 404 and error handlers present ✓. `process.stdout.write` for startup ✓.

#### `src/lib/prisma.js` — 10/10
- Single instantiation, exported correctly. Perfect.

#### `src/middleware/auth.js` — 9/10
- Clean `requireAuth()` delegation. Correct.

#### `src/routes/notes.js` — 7/10
- All 5 endpoints, try/catch on all, ownership check in `resolveNote` ✓.
- Zod validation before DB write on POST/PUT ✓. `updatedAt: 'desc'` sort ✓. 204 on DELETE ✓.
- Code smell: `resolveNote` accepts `res` and sends response inside helper — couples I/O to data logic. Acceptable at this scale.
- Code smell: `updateSchema` accepts empty `{}` (no-op update). Non-blocking.

#### `src/webhooks/clerk.js` — 5/10 ❌

**Issue 1 — CRITICAL** (line 37, `user.created`):  
`prisma.user.create()` throws `P2002` on duplicate delivery (Clerk is at-least-once). Must use `upsert`.

**Issue 2 — CRITICAL** (line 42, `user.updated`):  
`prisma.user.update()` throws `P2025 Record not found` if `user.created` was missed or events arrive out of order. Must use `upsert`.

**Issue 3 — CRITICAL** (line 46, `user.deleted`):  
`prisma.user.delete()` throws `P2025` if user was never synced. Must use `deleteMany` (no-op on zero matches).

**Issue 4 — MEDIUM** (lines 53–55, catch block):  
Single catch swallows all error types — P2002 unique violation looks identical to connection error. Differentiate by Prisma error code.

### Required Fixes for `backend/src/webhooks/clerk.js`

1. **Line 37** — `user.created`: replace `create` with `upsert`
2. **Line 42** — `user.updated`: replace `update` with `upsert`  
3. **Line 46** — `user.deleted`: replace `delete` with `deleteMany`
4. **Lines 53–55** — catch block: check `err.code` for `P2002` → respond 409

### Verdict: **REQUIRES FIXES**
Fixes applied by Backend Developer. Re-review covers `webhooks/clerk.js` only.

---

## BE-R2 — Backend Round 2 (webhook re-review)
**Date**: 2026-06-13  
**Scope**: `backend/src/webhooks/clerk.js` only

| Fix | Applied | Score Impact |
|-----|---------|-------------|
| `user.created` → `upsert` (idempotency) | ✓ | +1 |
| `user.updated` → `upsert` (out-of-order safety) | ✓ | +1 |
| `user.deleted` → `deleteMany` (no-op on missing) | ✓ | +1 |
| Catch block differentiates P2002 → 409 | ✓ | +0.5 |
| Bonus: `user.created` and `user.updated` collapsed to shared `upsert` case | clean | +0.5 |

**Revised score: 9/10**

### Verdict: **APPROVED**
All backend files now score ≥ 7. Backend is cleared for Security Audit and QA.

---

## FE-R1 — Frontend Round 1
**Date**: 2026-06-13  
**Scope**: All files in `frontend/src/`  
**Reference**: `docs/ba/requirements.md`, `docs/design/screens.md`

### File Scores

| File | Score | Verdict |
|------|-------|---------|
| `main.jsx` | 9/10 | PASS |
| `App.jsx` | 9/10 | PASS |
| `index.css` | 9/10 | PASS |
| `api/notes.js` | 9/10 | PASS |
| `components/Button.jsx` | 9/10 | PASS |
| `components/Button.module.css` | 9/10 | PASS |
| `components/TopNav.jsx` | **6/10** | **FAIL** |
| `components/TopNav.module.css` | 8/10 | PASS |
| `components/NoteCard.jsx` | 8/10 | PASS |
| `components/NoteCard.module.css` | 9/10 | PASS |
| `components/Modal.jsx` | 9/10 | PASS |
| `components/Modal.module.css` | 9/10 | PASS |
| `components/EmptyState.jsx` | 9/10 | PASS |
| `components/SkeletonCard.jsx` | 9/10 | PASS |
| `components/Toast.jsx` | **6/10** | **FAIL** |
| `components/Toast.module.css` | 8/10 | PASS |
| `components/DeleteConfirmModal.jsx` | 9/10 | PASS |
| `components/NoteEditorModal.jsx` | 9/10 | PASS |
| `components/NoteEditorModal.module.css` | 9/10 | PASS |
| `pages/LandingPage.jsx` | 8/10 | PASS |
| `pages/LandingPage.module.css` | 9/10 | PASS |
| `pages/SignInPage.jsx` | 9/10 | PASS |
| `pages/SignUpPage.jsx` | 9/10 | PASS |
| `pages/AuthPage.module.css` | 9/10 | PASS |
| `pages/DashboardPage.jsx` | 8/10 | PASS |
| `pages/DashboardPage.module.css` | 9/10 | PASS |
| `pages/NotFoundPage.jsx` | 9/10 | PASS |
| `pages/NotFoundPage.module.css` | 9/10 | PASS |

### Acceptance Criteria Check
- US-101 Sign Up: ✓ SignUpPage with Clerk `<SignUp />`, redirect to `/dashboard`
- US-102 Sign In: ✓ SignInPage with Clerk `<SignIn />`, ProtectedRoute redirects guests
- US-103 Dashboard: ✓ Grid, skeleton loading, empty state, updatedAt sort (from API)
- US-104 Create Note: ✓ NoteEditorModal create mode, title validation, optimistic prepend
- US-105 Edit Note: ✓ NoteEditorModal edit mode pre-filled, card click opens editor
- US-106 Delete Note: ✓ DeleteConfirmModal, optimistic removal with revert on error
- US-107 Sign Out: ✓ TopNav sign-out button, Clerk `signOut()`, redirect to `/`

### Issues Found

#### `components/TopNav.jsx` — 6/10 ❌
**Issue**: `<a href="/dashboard">` triggers a full-page browser reload, bypassing React Router. All navigation inside the SPA must use `<Link>` from `react-router-dom`.  
**Fix applied**: Imported `Link`, replaced `<a href="/dashboard">` with `<Link to="/dashboard">`.

#### `components/Toast.jsx` — 6/10 ❌
**Issue**: `onDismiss` prop is `() => setToast(null)` — a new function reference created on every DashboardPage render. The `useEffect([onDismiss])` dependency in Toast fires again on each re-render, clearing the 4s timer and restarting it. A note fetch mid-display would reset the countdown indefinitely.  
**Fix applied**: Stored `onDismiss` in a `useRef` and removed it from the `useEffect` dependency array. Timer now fires exactly once on mount regardless of parent re-renders.

### Verdict: **REQUIRES FIXES** → fixes applied inline → see FE-R2

---

## FE-R2 — Frontend Round 2
**Date**: 2026-06-13  
**Scope**: `TopNav.jsx`, `Toast.jsx` only  
**Build verification**: `npm --prefix frontend run build` → ✓ 1597 modules, 0 errors

| Fix | Applied | Revised Score |
|-----|---------|--------------|
| `TopNav.jsx`: `<a href>` → `<Link to>` | ✓ | 9/10 |
| `Toast.jsx`: `useRef` for stable timer, empty dep array | ✓ | 9/10 |

### Verdict: **APPROVED**
All frontend files score ≥ 7. Frontend cleared for Security Audit.
