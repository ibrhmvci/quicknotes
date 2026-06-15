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
| Mobile-R1 | 2026-06-13 | Mobile — all files | NEEDS FIXES | editor.tsx, useNotes.ts, sign-up.tsx, ContextBottomSheet.tsx, Snackbar.tsx |
| Mobile-R2 | 2026-06-13 | Mobile — 9 changed files (Round 2) | **APPROVED** | none |

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

---

## Mobile Code Review — Round 1 (2026-06-13)
**Reviewer**: Senior Code Reviewer  
**Scope**: All files under `mobile/app/`, `mobile/components/`, `mobile/hooks/`, `mobile/lib/`, `mobile/constants/theme.ts`, `mobile/package.json`, `mobile/app.json`  
**Reference**: `docs/ba/requirements.md`, `docs/design/screens.md`

---

### File Group Scores

| Group | Score | Issues |
|-------|-------|--------|
| `constants/theme.ts` | 10/10 | None — clean, typed, exhaustive design system |
| `lib/tokenCache.ts` | 9/10 | Silent SecureStore failure acceptable; minor: no log on save failure |
| `lib/api.ts` | 8/10 | Good generic request fn; `EXPO_PUBLIC_API_URL` defaults to localhost (acceptable for dev) |
| `hooks/useSnackbar.ts` | 9/10 | Solid; timer cleanup on re-show prevents overlap |
| `hooks/useNotes.ts` | 6/10 | **FAIL** — silent fetch error; stale closure in optimistic delete |
| `app/_layout.tsx` | 9/10 | Correct provider nesting; loading gate before Stack renders |
| `app/index.tsx` | 9/10 | Clean auth redirect entry point |
| `app/(auth)/_layout.tsx` | 9/10 | Fine; slide animation correct |
| `app/(auth)/landing.tsx` | 9/10 | Correct safe area, buttons, scroll — no issues |
| `app/(auth)/sign-in.tsx` | 8/10 | Good; non-critical: missing empty-field guard before `signIn.create` |
| `app/(auth)/sign-up.tsx` | 6/10 | **FAIL** — interval leak on unmount during countdown |
| `app/(app)/_layout.tsx` | 9/10 | Correct auth guard with Redirect |
| `app/(app)/(tabs)/_layout.tsx` | 9/10 | Clean tab config; bottom nav correct for Android |
| `app/(app)/(tabs)/index.tsx` | 7/10 | `FlatList`, `useFocusEffect`, all states handled; see minor notes |
| `app/(app)/(tabs)/profile.tsx` | 9/10 | Clean; sign-out error handled; user data fallback correct |
| `app/(app)/editor.tsx` | 5/10 | **FAIL** — isolated `useNotes` instance; stale state on save |
| `app/(app)/index.tsx` | 9/10 | Correct redirect shim |
| `app/(app)/profile.tsx` | 9/10 | Correct redirect shim |
| `app/+not-found.tsx` | 9/10 | Auth-aware redirect correct |
| `components/PrimaryButton.tsx` | 9/10 | Correct 48dp height, ripple, loading state, disabled logic |
| `components/SecondaryButton.tsx` | 9/10 | Same quality as PrimaryButton |
| `components/OAuthButton.tsx` | 8/10 | Minor: text initials instead of real SVG provider logos — functional but not polished |
| `components/AuthInput.tsx` | 9/10 | forwardRef correct; eye toggle; no `any` |
| `components/OTPInput.tsx` | 9/10 | Hidden input pattern correct; digit filtering clean |
| `components/NoteCard.tsx` | 7/10 | React.memo correct; double-delete risk on swipe (see Major Issues) |
| `components/FAB.tsx` | 9/10 | 56×56dp, ripple, absolute position — correct Material spec |
| `components/ContextBottomSheet.tsx` | 6/10 | **FAIL** — backdrop tap propagates through sheet, dismissing on any sheet touch |
| `components/Snackbar.tsx` | 6/10 | **FAIL** — early `return null` kills exit animation; snackbar disappears abruptly |
| `components/SkeletonCard.tsx` | 9/10 | Loop animation with cleanup; matches NoteCard dimensions |
| `components/EmptyState.tsx` | 9/10 | Accessible, clean |
| `components/DividerWithLabel.tsx` | 9/10 | Correct, minimal |
| `components/DeleteConfirmAlert.ts` | 9/10 | Correct abstraction; used in HomeScreen directly but helper is still clean |
| `mobile/package.json` | 8/10 | All deps correct; `expo install` versions appropriate for SDK 51 |
| `mobile/app.json` | 7/10 | Correct Android config; EAS projectId is a placeholder |
| `mobile/eas.json` | 8/10 | All three profiles defined; `submit.production` missing `serviceAccountKeyPath` (expected pre-Play Store) |

---

### Critical Issues (block merge — fix required)

#### CRIT-1 — `app/(app)/editor.tsx`: Isolated `useNotes` instance causes stale home screen list
**Score impact**: 5/10

`EditorScreen` calls `const { createNote, updateNote } = useNotes()` on line 42, instantiating a brand-new hook with its own private `notes` state. This state is completely independent of the `useNotes()` instance in `HomeScreen`. When `createNote` or `updateNote` succeeds, the optimistic update runs on the editor's private state — the home screen list is NOT updated. The home screen only refreshes via `useFocusEffect → fetchNotes()` when it regains focus, but it fetches from the server, so the note will appear eventually. However, the editor's own snackbar "Note created" fires correctly, which masks this architectural flaw.

**The real risk**: If the user creates a note, the editor's `createNote` optimistically prepends to a private empty array `[]`. On router.back(), the home screen's `useFocusEffect` re-fetches. This works today, but only because every screen-focus triggers a network refetch. If the network call fails, the user sees their "created" note vanish. More critically, if this pattern is extended (e.g., creating from a deep-linked editor without returning to home), state will diverge.

**Fix**: Do not call `useNotes()` inside `EditorScreen`. Instead, pass `createNote` and `updateNote` as props from the parent route, or lift state to a React Context (e.g., `NotesContext`) shared across all screens in the `(app)` layout. The editor should receive the mutation functions it needs — it should not own a second note store.

---

#### CRIT-2 — `hooks/useNotes.ts`: `fetchNotes` silently swallows API errors
**Score impact**: 6/10

```typescript
const fetchNotes = useCallback(async () => {
  try {
    const token = await getToken();
    if (!token) return;
    const data = await api.notes.list(token);
    setNotes(data);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [getToken]);
```

If `api.notes.list(token)` throws (network error, 401, 500), the `catch` block is absent. The error propagates out of the `try` but is caught by the `finally` which correctly resets loading flags — however the error is then **silently re-thrown** to the caller. In `HomeScreen`, `useFocusEffect` calls `fetchNotes()` bare without a `try/catch`. The thrown error crashes the effect silently (React Native's global error handler may catch it, but no user-visible feedback is shown). The home screen will display an empty list with no skeleton, no error message, and no retry button — a silent failure.

**Fix**: Add an explicit `catch` block to `fetchNotes` that sets an `error` state (add `const [error, setError] = useState<string | null>(null)` to the hook), and return `{ error }` from the hook. Display an error state in `HomeScreen` when `error` is set.

---

#### CRIT-3 — `app/(auth)/sign-up.tsx`: `setInterval` leaks on component unmount
**Score impact**: 6/10

```typescript
const startResendCountdown = () => {
  setResendDisabled(true);
  setResendCountdown(30);
  const interval = setInterval(() => { ... }, 1000);
};
```

The `interval` reference is a local variable inside `startResendCountdown`. If the user navigates away (presses back, or OAuth redirect completes) while the 30s countdown is active, `setInterval` continues firing. Each tick calls `setResendCountdown` on an unmounted component, which in React Native produces a "Warning: Can't perform a React state update on an unmounted component" and leaks the interval for up to 30 seconds.

**Fix**: Store the interval ID in a `useRef<ReturnType<typeof setInterval> | null>`. Clear it in a `useEffect` cleanup:
```typescript
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, []);

const startResendCountdown = () => {
  if (intervalRef.current) clearInterval(intervalRef.current);
  setResendDisabled(true);
  setResendCountdown(30);
  intervalRef.current = setInterval(() => {
    setResendCountdown((n) => {
      if (n <= 1) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setResendDisabled(false);
        return 0;
      }
      return n - 1;
    });
  }, 1000);
};
```

---

#### CRIT-4 — `components/ContextBottomSheet.tsx`: Backdrop tap propagates through sheet content
**Score impact**: 6/10

The backdrop is a `Pressable` with `onPress={onDismiss}` that wraps the entire `Animated.View` sheet. Any tap on the sheet — including the "Edit note" or "Delete note" options — bubbles up to the backdrop `Pressable` and fires `onDismiss` immediately after the option's `onPress`. The `setTimeout(onEdit, 50)` pattern on the option buttons (lines 68–71 and 84–87) was added as a workaround, but the dismiss fires anyway. In practice, the `onDismiss` → `setSheetVisible(false)` → modal unmounts sequence races with the `setTimeout(onEdit, 50)` — this is fragile and platform-timing dependent.

**Fix**: Add a touch-blocking `Pressable` inside the backdrop that wraps only the sheet, preventing touch propagation to the backdrop:
```tsx
<Pressable style={styles.backdrop} onPress={onDismiss}>
  <Pressable onPress={(e) => e.stopPropagation()}>
    <Animated.View style={[styles.sheet, ...]}>
      ...
    </Animated.View>
  </Pressable>
</Pressable>
```
Or restructure: remove `onPress` from the backdrop wrapper, and add a separate transparent overlay behind the sheet that handles dismiss. Remove the `setTimeout` workarounds entirely.

---

#### CRIT-5 — `components/Snackbar.tsx`: Early `return null` prevents exit animation
**Score impact**: 6/10

```typescript
if (!visible) return null;   // line 66 — kills the component before animation runs
```

The `useEffect` at line 41 correctly starts a fade-out animation when `visible` becomes `false`, but immediately after that state change, the component returns `null` on the very next render. The `Animated.timing` to `opacity: 0` never has a chance to complete — the snackbar simply vanishes instantly.

**Fix**: Remove the early `return null` guard. Instead, conditionally render based on the animated opacity value, or use a `display: none` approach. The standard pattern is to always render the container but control visibility via the animation, using `pointerEvents="none"` when hidden to avoid blocking touches:
```tsx
return (
  <Animated.View
    style={[styles.container, { bottom: bottomOffset + spacing.sm }, { transform: [{ translateY }], opacity }]}
    pointerEvents={visible ? 'auto' : 'none'}
    accessibilityLiveRegion="polite"
  >
    ...
  </Animated.View>
);
```

---

### Major Issues (score < 7 — fix recommended)

#### MAJ-1 — `hooks/useNotes.ts`: Stale closure in `deleteNoteOptimistic` during rapid deletes
`deleteNoteOptimistic` captures `notes` and `removedIndex` from the outer closure at call time (line 60–64). If the user swipes to delete two notes quickly, the second call's `removedIndex` reflects the original array before the first optimistic removal, so the undo for the first delete will splice the note back at the wrong index. Use a functional state update with a stable note ID for restoration instead:

```typescript
// Instead of capturing removedIndex at call time, store the note's ID and
// restore by ID in the undo function — position-agnostic:
const undo = () => {
  if (removedNote) {
    setNotes((prev) => {
      // Re-insert at a reasonable position (beginning, or by date)
      return [removedNote, ...prev];
    });
  }
};
```

#### MAJ-2 — `components/NoteCard.tsx`: Double-delete risk on swipe
`onSwipeableOpen` (line 77) fires `handleSwipeDelete` as soon as the swipeable reaches the open state. The red trash-icon `Pressable` inside `renderRightActions` also calls `handleSwipeDelete` on press (line 55). If the user swipes partially open and then taps the icon, both `onSwipeableOpen` AND the `Pressable` `onPress` will fire, calling `onSwipeDelete(note)` twice. The second call will find the note already removed from `notes` (optimistic removal already done) and schedule a second API `DELETE` for an already-deleted note ID.

**Fix**: Debounce or add a guard flag. The cleanest solution is to remove `onSwipeableOpen` and rely solely on the Pressable inside `renderRightActions` for the delete trigger. Swipe-to-fully-open reveals the red area; the user must tap it to confirm delete. Alternatively, keep `onSwipeableOpen` but remove the redundant Pressable onPress.

#### MAJ-3 — `app/(auth)/sign-in.tsx` and `sign-up.tsx`: No client-side empty field validation
Both sign-in and sign-up screens submit to Clerk without checking that `email` and `password` are non-empty. An accidental tap of "Sign In" with blank fields sends a network request to Clerk (which returns an error the app then maps correctly). This is a minor UX issue but wastes a round-trip and shows a flash of error state. A pre-flight `if (!email.trim() || !password.trim()) { setError('Please enter your email and password.'); return; }` guard before the `signIn.create()` call is standard practice.

---

### Minor Issues (score ≥ 7 — suggestions only)

#### MIN-1 — `app.json`: EAS `projectId` is a placeholder
`"projectId": "YOUR_EAS_PROJECT_ID"` — this must be replaced with a real EAS project ID before any cloud build. Not a code defect, but must not ship to Play Store in this state.

#### MIN-2 — `eas.json`: `submit.production` missing `serviceAccountKeyPath`
The Google Play submit config is empty. This is expected pre-Play Store setup, but the EAS deploy agent will need this populated with the service account JSON path before automated submission works.

#### MIN-3 — `app/(app)/(tabs)/index.tsx`: `renderItem` in `FlatList` is `useCallback`-wrapped but not `React.memo`-wrapped at the NoteCard level
`NoteCard` IS already `React.memo`-wrapped, so this is correct. Just confirming — no action needed.

#### MIN-4 — `mobile/.env` contains a real `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` placeholder but `.gitignore` correctly excludes `.env`
Confirmed: `.env` is in `.gitignore`. No secrets are committed. `.env.example` correctly uses `pk_test_your_clerk_publishable_key_here`. Compliant.

#### MIN-5 — `lib/api.ts`: No request timeout
`fetch` has no timeout. On a flaky mobile network, API calls can hang indefinitely with no user feedback. Consider wrapping with `AbortController` and a 15s timeout in a future iteration.

#### MIN-6 — `components/OAuthButton.tsx`: Text initials instead of provider brand icons
`'G'` for Google and `'GH'` for GitHub are functional but do not meet Google's branding guidelines (which require the official Google "G" logo for OAuth buttons). This is a guideline/polish issue, not a defect, but should be resolved before Play Store submission.

#### MIN-7 — `useNotes.ts`: `pendingDeleteRef` tracks only one pending delete at a time
If the user swipes to delete note A (starts 4s timer), then immediately swipes to delete note B, `pendingDeleteRef.current` is overwritten with note B's timer. Note A's timer is orphaned in memory — it will fire the API call at 4s but cannot be cancelled via undo because the ref no longer points to it. The undo snackbar for note A would call the now-orphaned undo closure (which still works for state restoration), but `clearTimeout` on the old timer is skipped. This is a low-risk edge case but should be addressed by storing pending deletes in a `Map<id, timer>` instead of a single ref.

---

### Overall Score: 6.5/10

### Verdict: NEEDS FIXES

The app has a strong structural foundation — provider nesting, auth guards, Expo Router patterns, TypeScript types, accessibility labels, and design system token usage are all excellent. However, five issues block approval:

1. **Editor screen instantiates its own isolated note store** — architectural mismatch that will cause state divergence bugs as the app grows.
2. **`fetchNotes` silently swallows API errors** — users see a blank list with no feedback on network failure.
3. **`setInterval` in sign-up resend countdown is not cleaned up on unmount** — memory leak.
4. **ContextBottomSheet backdrop dismisses sheet on any content tap** — makes edit/delete unreliable.
5. **Snackbar early `return null` kills exit animation** — abrupt disappearance, not the smooth fade specified in design.

---

### Fix List for Mobile Developer

| # | File | Fix |
|---|------|-----|
| 1 | `mobile/app/(app)/editor.tsx` | Remove `useNotes()` call. Lift note mutations to a `NotesContext` shared across the `(app)` layout, or pass `createNote`/`updateNote` as route-level props. The editor must not own independent note state. |
| 2 | `mobile/hooks/useNotes.ts` | Add `const [error, setError] = useState<string \| null>(null)` to the hook. Wrap `api.notes.list()` call in a `try/catch` that calls `setError(message)`. Return `error` from the hook. Display an error state in `HomeScreen` when `error` is non-null. |
| 3 | `mobile/app/(auth)/sign-up.tsx` | Store `setInterval` return value in a `useRef`. Add a `useEffect` cleanup that calls `clearInterval(intervalRef.current)` on unmount. |
| 4 | `mobile/components/ContextBottomSheet.tsx` | Add an inner touch-blocking `Pressable` (or `onStartShouldSetResponder`) wrapping the `Animated.View` sheet so backdrop taps do not propagate through sheet content. Remove the `setTimeout` workarounds on option buttons. |
| 5 | `mobile/components/Snackbar.tsx` | Remove the `if (!visible) return null` early return. Always render the `Animated.View`; use `pointerEvents={visible ? 'auto' : 'none'}` to prevent invisible snackbar from blocking touches. The fade-out animation will then complete before the component is visually gone. |
| 6 | `mobile/hooks/useNotes.ts` | Replace `pendingDeleteRef` (single ref) with `pendingDeletesRef` as a `Map<string, ReturnType<typeof setTimeout>>` to support multiple concurrent optimistic deletes. Update `deleteNoteOptimistic` to use stable ID-based restore (not index-based) in the undo function. |
| 7 | `mobile/app/(auth)/sign-in.tsx` + `sign-up.tsx` | Add empty-field guard before Clerk API calls: check `email.trim()` and `password.trim()`, set error and return early if blank. |

Items 1–5 are required before merge. Items 6–7 are strongly recommended but may be deferred to Round 2 discussion with the PM.

---

## Mobile Code Review — Round 2 (2026-06-13)
**Reviewer**: Senior Code Reviewer
**Scope**: 9 changed files — `context/NotesContext.tsx` (new), `app/(app)/_layout.tsx`, `app/(app)/(tabs)/index.tsx`, `app/(app)/editor.tsx`, `hooks/useNotes.ts`, `app/(auth)/sign-up.tsx`, `app/(auth)/sign-in.tsx`, `components/ContextBottomSheet.tsx`, `components/Snackbar.tsx`
**Focus**: Verify all 7 prescribed fixes from Round 1 were applied correctly and introduced no new regressions.

---

### Fix Verification

| # | Fix | File | Applied | Verdict |
|---|-----|------|---------|---------|
| 1 | Lift note state to `NotesContext`; editor uses shared context | `NotesContext.tsx`, `_layout.tsx`, `editor.tsx` | ✓ | Correct |
| 2 | Add `error` state + `catch` block to `fetchNotes`; display error UI in HomeScreen | `useNotes.ts`, `index.tsx` | ✓ | Correct |
| 3 | Store `setInterval` ID in `useRef`; clear on unmount | `sign-up.tsx` | ✓ | Correct |
| 4 | Inner touch-blocking `Pressable` around sheet; remove `setTimeout` workarounds | `ContextBottomSheet.tsx` | ✓ | Correct |
| 5 | Remove early `return null`; use `pointerEvents` prop instead | `Snackbar.tsx` | ✓ | Correct |
| 6 | Replace single `pendingDeleteRef` with `Map<string, timer>`; ID-based undo restore | `useNotes.ts` | ✓ | Correct |
| 7 | Empty-field guard before Clerk API calls in both sign-in and sign-up | `sign-in.tsx`, `sign-up.tsx` | ✓ | Correct |

---

### File-by-File Scores

| File | R1 Score | R2 Score | Verdict |
|------|----------|----------|---------|
| `context/NotesContext.tsx` | — (new) | 9/10 | PASS |
| `app/(app)/_layout.tsx` | 9/10 | 9/10 | PASS |
| `app/(app)/(tabs)/index.tsx` | 7/10 | 9/10 | PASS |
| `app/(app)/editor.tsx` | 5/10 | 9/10 | PASS |
| `hooks/useNotes.ts` | 6/10 | 8/10 | PASS |
| `app/(auth)/sign-up.tsx` | 6/10 | 9/10 | PASS |
| `app/(auth)/sign-in.tsx` | 8/10 | 9/10 | PASS |
| `components/ContextBottomSheet.tsx` | 6/10 | 9/10 | PASS |
| `components/Snackbar.tsx` | 6/10 | 9/10 | PASS |

---

### Detailed Findings

#### `context/NotesContext.tsx` — 9/10 PASS (NEW FILE)

Fix 1 is implemented correctly. `NotesContext` is created with `createContext<NotesContextValue | null>(null)`. `NotesProvider` calls `useNotes()` exactly once — the single source of truth for all screens in the `(app)` segment. `useNotesContext()` throws a descriptive error if called outside the provider, which is the correct guard pattern. The `NotesContextValue` interface is fully typed with no `any` — all 9 fields match what `useNotes` returns. Clean separation of concerns: the context is a thin wrapper, it does not duplicate logic.

Minor: The interface declares `deleteNoteImmediate: (id: string) => Promise<void>` which is correct and matches the hook's signature. No issues.

---

#### `app/(app)/_layout.tsx` — 9/10 PASS

`NotesProvider` correctly wraps `<Stack>` so that every screen in the `(app)` segment — including the editor modal — has access to the shared notes context. The auth guard (`isSignedIn`, `isLoaded`) runs before the provider is mounted, which means `useNotes()` (inside the provider) will only be called for authenticated users. This prevents the hook from making authenticated API calls as an unauthenticated user. Correct and intentional ordering.

---

#### `app/(app)/(tabs)/index.tsx` — 9/10 PASS

`useNotesContext()` replaces the prior `useNotes()` call (Fix 1 consumer side). Error state UI is correctly implemented: when `error` is non-null, the screen renders a centred error message with a "Try Again" `Pressable` that calls `fetchNotes` directly (Fix 2 consumer side). The retry button has `accessibilityRole="button"`, `accessibilityLabel="Retry loading notes"`, and `android_ripple` — complete and correct. The `colors.primaryDark` token used on the ripple is defined in `constants/theme.ts`. The `renderBody` function correctly gates on `loading`, then `error`, then the list — the priority order is right (loading takes precedence over an error that may be stale). All previous `useCallback` and `React.memo` patterns are preserved.

---

#### `app/(app)/editor.tsx` — 9/10 PASS

Line 42 now reads `const { createNote, updateNote } = useNotesContext()` — the isolated `useNotes()` instance that caused CRIT-1 is gone. The editor now mutates the shared notes array. When `createNote` or `updateNote` resolves, the optimistic update runs on the single `notes` state in `NotesContext`, which the HomeScreen is also subscribed to. State is now consistent across screens. The `setTimeout(() => router.back(), 300)` delay (line 91) is intentional — it lets the snackbar be visible briefly before navigation. Acceptable, though 300ms is short; awareness note only.

TypeScript: `(err as { status?: number })` cast is acceptable — the API client's error shape is not formally typed with a `status` field, so a cast is reasonable here. No `any` used.

---

#### `hooks/useNotes.ts` — 8/10 PASS

**Fix 2**: `const [error, setError] = useState<string | null>(null)` added (line 10). `setError(null)` called at the top of `fetchNotes` to clear stale errors on retry (line 17). `catch` block sets a user-friendly message (lines 23-25). `error` is exported from the hook. Correct.

**Fix 6**: `pendingDeletesRef` is now `useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())` (line 14). `undo` reads the timer by ID from the map (lines 70-77), calls `clearTimeout`, and removes the entry. The timer's callback also removes its own entry on completion (line 81). The restore function uses `[note, ...prev.filter(n => n.id !== id)]` — prepends and deduplicates by ID, which is position-agnostic. Correct.

**Remaining minor issue (non-blocking)**: `deleteNoteOptimistic` lists `notes` in its dependency array (line 99: `[notes, getToken]`) because it reads `notes.find(n => n.id === id)` on line 65 to capture the `note` reference for undo. This means the function is recreated on every notes change, and `handleSwipeDelete` + `renderItem` in HomeScreen also re-create, causing FlatList to re-render all visible rows on each note mutation. This is a performance concern, not a correctness bug. The `notes.find` could be moved inside a functional `setNotes` call, or the note could be found from a ref that mirrors notes state, eliminating the `notes` dependency. Not blocking at this scale but worth addressing before the app grows to large note lists.

Score held at 8 rather than 9 for this residual pattern.

---

#### `app/(auth)/sign-up.tsx` — 9/10 PASS

**Fix 3**: `intervalRef` is declared as `useRef<ReturnType<typeof setInterval> | null>(null)` (line 57). The `useEffect` at lines 59-63 returns a cleanup that calls `clearInterval(intervalRef.current)` on unmount — the leak is sealed. `startResendCountdown` at line 66 guards against double-start (`if (intervalRef.current) clearInterval(intervalRef.current)`). The interval callback uses a functional state update (`setResendCountdown((n) => ...)`) which avoids the stale-closure issue with the countdown value. When `n <= 1`, the interval clears itself and nulls the ref. This matches the prescribed fix exactly and is the idiomatic pattern.

**Fix 7**: Lines 84-87 add the empty-field guard before `signUp.create()`. `!email.trim() || !password.trim()` covers both fields; the error message is user-friendly. Correct.

---

#### `app/(auth)/sign-in.tsx` — 9/10 PASS

**Fix 7**: Lines 56-59 add the empty-field guard before `signIn.create()`. Pattern is identical to sign-up — `!email.trim() || !password.trim()`. No interval work needed here (sign-in has no resend countdown). `hitSlop` on the back button is a bonus improvement not in the original — widens the touch target beyond the 48dp visual size. Welcome addition.

---

#### `components/ContextBottomSheet.tsx` — 9/10 PASS

**Fix 4**: The inner `Pressable` at line 55 (`onPress={(e) => e.stopPropagation()}`) wraps the `Animated.View` sheet. Any tap on the sheet surface, option rows, handle, or title text now stops the event from propagating up to the backdrop `Pressable` (line 54) which would fire `onDismiss`. The `setTimeout` workarounds from Round 1 are gone — the option `onPress` handlers call `onEdit` and `onDelete` directly. The sheet closes because the parent (HomeScreen) sets `sheetVisible(false)` in `handleSheetEdit`/`handleSheetDelete` — correct and deliberate. The animation (spring-in, timing-out) is preserved and runs correctly. No new bugs.

---

#### `components/Snackbar.tsx` — 9/10 PASS

**Fix 5**: The early `if (!visible) return null` is gone. The `Animated.View` is always rendered. `pointerEvents={visible ? 'auto' : 'none'}` (line 75) prevents the invisible snackbar from intercepting touches when hidden. The fade-out animation (lines 55-63) now completes in full — `opacity` animates to 0 over 200ms, then `translateY` is reset to 20 for the next show. The `accessibilityLiveRegion="polite"` attribute is correctly placed on the container so screen readers announce the snackbar message when it appears. No new bugs.

---

### Remaining Awareness Items (non-blocking)

These are carried forward from Round 1 or newly observed. None block APPROVED status.

| ID | File | Issue | Priority |
|----|------|-------|----------|
| AWR-1 | `hooks/useNotes.ts` | `deleteNoteOptimistic` depends on `notes` array, causing recreation on every list change and unnecessary FlatList re-renders. Fix: read note from a mirrored ref or extract via functional setState. | Low |
| AWR-2 | `app/(app)/editor.tsx` | `setTimeout(() => router.back(), 300)` delay is short — snackbar is barely visible before navigation. Consider 600ms or displaying the snackbar on the HomeScreen after navigation instead. | Low |
| AWR-3 | `components/NoteCard.tsx` | Double-delete risk from Round 1 (MAJ-2) was not in scope for Round 2 but remains unaddressed. | Medium — address before Play Store submission |
| AWR-4 | `app.json` | EAS `projectId` is still a placeholder. Must be replaced before any cloud build. | Pre-deploy |
| AWR-5 | `components/OAuthButton.tsx` | Text initials `'G'` / `'GH'` instead of official brand icons. Required fix before Play Store submission per Google branding guidelines. | Pre-deploy |

---

### Overall Score: 9/10

All 7 prescribed fixes were applied correctly. Every file in scope scores ≥ 7. No new regressions introduced. The architectural improvement — shared `NotesContext` replacing two isolated `useNotes()` instances — is clean, correctly typed, and properly scoped to the `(app)` layout. The error and loading states are complete. Auth screens are hardened. Animations are correct.

### Verdict: APPROVED

The mobile codebase is cleared for Security Audit and QA. Before Play Store submission, address AWR-3 (double-delete in `NoteCard`) and AWR-5 (OAuth button branding) at minimum.
