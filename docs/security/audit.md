# Security Vulnerability Audit Log (audit.md)

This log records the reports of the **Security Specialist subagent**, auditing authentication systems, database access control, and endpoint verification.

---

## Audit Index

| ID | Date | Scope | Verdict | Findings |
|----|------|-------|---------|----------|
| AUD-001 | 2026-06-13 | Full-stack QuickNotes | **CLEAR** (after fixes) | 1 High fixed, 1 High (dev-only advisory), 1 Medium documented |
| AUD-002 | 2026-06-13 | Mobile — React Native + Expo (Android) | **MOBILE AUDIT: CLEAR (with advisories)** | 0 High, 1 Medium fixed inline, 1 Low fixed inline, 1 Low open advisory |

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

---

## Mobile Security Audit (2026-06-13)

**Date**: 2026-06-13
**Auditor**: Security Specialist
**Scope**: `mobile/` — React Native + Expo Android app (all source files audited directly)
**Files reviewed**: `lib/tokenCache.ts`, `lib/api.ts`, `app/_layout.tsx`, `app/(app)/_layout.tsx`, `app/index.tsx`, `app/(app)/(tabs)/index.tsx`, `app/(app)/(tabs)/profile.tsx`, `app/(app)/editor.tsx`, `app/(auth)/_layout.tsx`, `app/(auth)/landing.tsx`, `app/(auth)/sign-in.tsx`, `app/(auth)/sign-up.tsx`, `context/NotesContext.tsx`, `hooks/useNotes.ts`, `package.json`, `app.json`, `eas.json`, `.env`, `.env.example`, `.gitignore`

---

### 1. Token Storage

**SecureStore usage** ✅ CLEAR
`lib/tokenCache.ts` implements `getToken`, `saveToken`, and `clearToken` exclusively using `expo-secure-store` (`SecureStore.getItemAsync`, `SecureStore.setItemAsync`, `SecureStore.deleteItemAsync`). The `tokenCache` object is passed directly to `<ClerkProvider tokenCache={tokenCache}>` in `app/_layout.tsx`. Clerk tokens are never written anywhere else.

**AsyncStorage not used for tokens** ✅ CLEAR
`@react-native-async-storage/async-storage` is listed in `package.json` as a direct dependency (version 1.23.1), but a codebase-wide grep confirms it is never imported in any source file. It is installed as a transitive dependency peer requirement of some Expo packages. No token or auth state flows through it.

**MMKV** ✅ CLEAR
`mmkv` / `react-native-mmkv` is not present in `package.json` and is not referenced anywhere in the codebase.

---

### 2. EXPO_PUBLIC_ Variable Exposure

**Variable inventory** ✅ CLEAR
Only two `EXPO_PUBLIC_*` variables exist in the project:
- `EXPO_PUBLIC_API_URL` — the backend server URL. This is a network endpoint, not a secret. Acceptable.
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk's publishable key, explicitly designed to be embedded in client bundles. Acceptable.

No database credentials, webhook secrets, or private API keys are present under the `EXPO_PUBLIC_` prefix in either `.env` or `.env.example`.

**`.env` in `.gitignore`** ✅ CLEAR
`mobile/.gitignore` explicitly lists `.env`. The actual `.env` file contains only `http://localhost:5000` as the API URL and a placeholder Clerk key (`your_clerk_key_here`) — no real secrets are present even in the committed state of this file.

**`.env.example` placeholder values** ✅ CLEAR
`EXPO_PUBLIC_API_URL=http://localhost:5000` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here` — both are clearly placeholder values, not real credentials.

---

### 3. API Auth Header

**Authorization header on all note API calls** ✅ CLEAR
`lib/api.ts` defines a single `request<T>()` function that always injects `Authorization: Bearer ${token}` into every HTTP call. All four note operations (`list`, `create`, `update`, `delete`) route exclusively through this function. There is no overridable header mechanism that could accidentally omit the Bearer token.

**`getToken()` returning null** ✅ CLEAR
`hooks/useNotes.ts` handles the null token case correctly and explicitly for every mutation:
- `fetchNotes`: `if (!token) return;` — silently exits rather than making an unauthenticated request.
- `createNote`, `updateNote`, `deleteNoteImmediate`: `if (!token) throw new Error('Not authenticated');` — throws immediately, preventing any API call.
- `deleteNoteOptimistic` (delayed API call): `if (token) { await api.notes.delete(...) }` — guarded before the delete executes.

**No raw `fetch` calls bypassing `lib/api.ts`** ✅ CLEAR
A full grep of `fetch(` across the entire `mobile/` directory returned exactly one result: line 17 of `lib/api.ts` itself (the canonical `request()` function). No component, hook, screen, or context makes a direct `fetch` call outside the API layer.

---

### 4. Auth Gate Coverage

**`app/(app)/_layout.tsx` guard** ✅ CLEAR
The protected layout applies a two-stage guard before rendering any `(app)` content:
```
if (!isLoaded) return null;        // Wait for Clerk to initialize — no flash
if (!isSignedIn) return <Redirect href="/(auth)/landing" />;
```
This pattern matches the Clerk-recommended implementation and prevents both the flash-of-content race condition (identical to the web audit finding SEC-002 which was cleared) and any possibility of seeing note data without a valid session.

**`NotesProvider` placement** ✅ CLEAR
`<NotesProvider>` wraps the `<Stack>` inside the auth-guarded layout — it is only mounted after `isSignedIn === true`. No note data is fetched or held in context before authentication completes.

**Root `app/index.tsx` entry point** ✅ CLEAR
The root redirect performs the same `isLoaded` guard before evaluating `isSignedIn`, then routes authenticated users to `/(app)/(tabs)` and unauthenticated users to `/(auth)/landing`. No note data is accessible via a deep link or direct route navigation without passing through the `(app)/_layout.tsx` guard.

---

### 5. Input Handling

**No XSS vectors** ✅ CLEAR
React Native has no DOM, no `innerHTML`, and no `dangerouslySetInnerHTML`. All text rendering uses React Native `<Text>` components, which treat content as opaque strings. There is no WebView rendering user-supplied note content anywhere in the codebase.

**Client-side length limits enforced** ✅ CLEAR
`app/(app)/editor.tsx` enforces both limits via React Native `TextInput` props:
- Title: `maxLength={100}` — matches the backend Zod `createSchema` limit.
- Content: `maxLength={10000}` — matches the backend Zod `updateSchema` limit.
A character counter with a warning color change at 9,000 characters provides additional UX feedback.

---

### 6. Network Security

**HTTP fallback in production** ⚠️ MEDIUM — SEC-004
`lib/api.ts` line 1:
```ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';
```
The hardcoded fallback is HTTP on localhost. If `EXPO_PUBLIC_API_URL` is not set in an EAS build environment (e.g., the developer forgets to run `eas env:create`), a production APK or AAB would silently send authentication tokens and note content in plaintext to `http://localhost:5000`, which would fail to connect but represents a configuration failure mode that could theoretically be exploited on a modified device or emulator. The fallback URL is also non-functional in any real deployment context, meaning the failure is silent rather than loud.

**Fix**: Replace the silent HTTP fallback with a fail-loud guard:
```ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!BASE_URL) {
  throw new Error(
    '[api] EXPO_PUBLIC_API_URL is not set. Set it in your .env file or EAS environment.'
  );
}
```
This converts a silent misconfiguration into an immediate, visible crash at module load time — which is the correct behavior for a missing required configuration value.

**`.env.example` uses HTTP** 🟡 LOW — SEC-005
`EXPO_PUBLIC_API_URL=http://localhost:5000` in `.env.example` is technically correct for local development, but the example should note that production EAS builds must use `https://`. This is a documentation gap, not a runtime risk.

---

### 7. Build Artifact Security

**`.gitignore` coverage** ✅ CLEAR
`mobile/.gitignore` excludes all of the following:
- `.env` — local secrets file
- `*.jks` — Android keystore files (all variants)
- `*.p8`, `*.p12`, `*.key`, `*.mobileprovision` — certificate and key formats
- `google-play-key.json` — Google Play service account key
- `node_modules/`, `.expo/`, `dist/`, `web-build/` — build artifacts

Coverage is complete. No build credentials or secrets could be accidentally committed.

**`eas.json` submit profile** 🟡 LOW — SEC-006
`eas.json` has an empty `submit.production` object (`{}`). This means `eas submit` will prompt interactively for the Google Play service account key path rather than reading it from a configured path. This is not a security vulnerability (the key is not committed), but it means the key path must be provided manually on every automated submission. The EAS deploy rules document recommends adding `serviceAccountKeyPath` pointing to a file that is excluded from git — the current configuration is safe but incomplete for CI automation.

---

### Findings Summary

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| SEC-004 | ⚠️ Medium | HTTP fallback in `lib/api.ts` — silent misconfiguration could send tokens over HTTP if `EXPO_PUBLIC_API_URL` is not set in EAS | **FIXED** — replaced silent fallback with fail-loud `throw` in `mobile/lib/api.ts` |
| SEC-005 | 🟡 Low | `.env.example` `EXPO_PUBLIC_API_URL` uses `http://` with no production note — documentation gap | **FIXED** — production note and EAS command added to `mobile/.env.example` |
| SEC-006 | 🟡 Low | `eas.json` submit profile is empty — Google Play key path not configured for CI/CD automation | **OPEN** — advisory; apply when Google Play service account key is created |

---

### Recommended Fixes

**SEC-004 (Medium) — Fail-loud guard in `lib/api.ts`**

Replace line 1 of `mobile/lib/api.ts`:
```ts
// BEFORE
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';

// AFTER
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!BASE_URL) {
  throw new Error(
    '[api] EXPO_PUBLIC_API_URL is not set. Add it to your .env file (local) or run: eas env:create --name EXPO_PUBLIC_API_URL --value "https://your-backend.railway.app" --environment production'
  );
}
```

**SEC-005 (Low) — Add production note to `.env.example`**

Update `mobile/.env.example`:
```
# Local development only. For EAS production builds, set via: eas env:create
EXPO_PUBLIC_API_URL=http://localhost:5000

# Clerk publishable key — safe to include in client bundle
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
```

**SEC-006 (Low) — Document EAS submit configuration**

No code change required. When the Google Play service account key is created, update `eas.json`:
```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-play-key.json",
      "track": "internal"
    }
  }
}
```
`google-play-key.json` is already in `.gitignore`.

---

### Verdict: **MOBILE AUDIT: CLEAR (with advisories)**

No High or Critical vulnerabilities found. Token storage, API authentication, auth gate coverage, input limits, and build artifact exclusions are all correctly implemented. The one Medium finding (SEC-004: HTTP fallback) was fixed inline — `mobile/lib/api.ts` now throws at module load time if `EXPO_PUBLIC_API_URL` is not set. SEC-005 (documentation gap in `.env.example`) was also fixed inline. One Low advisory (SEC-006: EAS submit profile) remains open and should be addressed when the Google Play service account key is created. The mobile app is cleared to proceed to QA.
