# Project Manager Kanban Board (task_board.md)

**Project**: QuickNotes — Authenticated Note-Taking App  
**Status**: Phase M6 In Progress — Maestro flows written, awaiting user run on device  
**Last Updated**: 2026-06-13

---

## 📋 Backlog (Raw Ideas)

---

## 📝 Phase 1 — Specification (BA) ✅ COMPLETE
- [x] BA-01: Write full QuickNotes requirements & user stories
- [x] BA-02: Define Prisma DB schema (Note model, User sync)
- [x] BA-03: Define Clerk auth flow (sign-in, sign-out, protected routes)
- [x] BA-04: List all screens needed for Designer handoff (8 screens identified)

---

## 🎨 Phase 2 — UX/UI Design (Designer) ✅ COMPLETE
- [x] DES-01: Review BA spec and map all screens
- [x] DES-02: Define design system (colors, typography, spacing, icons)
- [x] DES-03: Design all 8 screen layouts with ASCII wireframes
- [x] DES-04: Define component map with all state variants + animations
- [x] DES-05: PM approved all defaults — Indigo palette, Modal editor, Lucide icons, Inter font, Full landing, Optimistic delete

---

## ⚙️ Phase 3a — Backend Development (BE) ✅ COMPLETE
- [x] BE-01: Initialize Express server + Prisma setup
- [x] BE-02: Implement Clerk auth middleware (requireAuth singleton)
- [x] BE-03: `GET /api/notes` — fetch user's notes (sorted by updatedAt DESC)
- [x] BE-04: `POST /api/notes` — create note (Zod validation)
- [x] BE-05: `PUT /api/notes/:id` — update note (ownership check)
- [x] BE-06: `DELETE /api/notes/:id` — delete note (204 response)
- [x] BE-07: Clerk webhook handler (svix verified, user.created/updated/deleted)
- [x] BE-08: PrismaClient singleton in src/lib/prisma.js

---

## 🔍 Phase 3b — Code Review: Backend ✅ APPROVED (Round 2)
- [x] REV-BE-01: Review all backend files — webhooks/clerk.js scored 5/10
- [x] REV-BE-02: Fix loop — 4 fixes applied (upsert, deleteMany, P2002 catch)
- [x] REV-BE-03: APPROVED — all files score ≥ 7 after Round 2

---

## 🎨 Phase 3c — Frontend Development (FE) ✅ COMPLETE
- [~] FE-01: Setup Vite + Clerk provider + routing
- [~] FE-02: Build design system (CSS variables from screens.md)
- [~] FE-03: Build shared components (TopNav, Button, Input, Modal, Toast, NoteCard, EmptyState, Skeleton)
- [~] FE-04: Build Landing page (hero + features)
- [~] FE-05: Build Sign In / Sign Up pages (Clerk embedded)
- [~] FE-06: Build Notes Dashboard (grid, loading, empty state)
- [~] FE-07: Build Note Editor modal (create + edit modes)
- [~] FE-08: Build Delete Confirmation dialog
- [~] FE-09: Build 404 page
- [~] FE-10: Wire all API calls to backend

---

## 🔍 Phase 3d — Code Review: Frontend ✅ APPROVED (Round 2)
- [x] REV-FE-01: Review all FE files — TopNav.jsx + Toast.jsx scored 6/10
- [x] REV-FE-02: Fix loop — Link fix + useRef timer fix applied
- [x] REV-FE-03: APPROVED — all files score ≥ 7. Build: ✓ 1597 modules

---

## 🔒 Phase 4 — Security Audit (Security) ✅ CLEAR
- [x] SEC-01: Clerk middleware covers all /api/notes routes ✓
- [x] SEC-02: Ownership enforced on all note mutations — 403 on mismatch ✓
- [x] SEC-03: Zod validation, no raw SQL, React XSS-safe ✓
- [x] SEC-04: CORS locked to FRONTEND_URL, Helmet applied, secrets backend-only ✓
- [x] SEC-FIX-01: Created .gitignore (root + backend + frontend) — HIGH issue fixed
- [x] SEC-DOC-01: esbuild dev advisory documented (Medium, dev-only)
- [x] SEC-DOC-02: Rate limiting recommended for production (Low)

---

## 🧪 Phase 5 — QA Testing (Playwright + Claude Browser Extension) ✅ COMPLETE
- [x] QA-01: Playwright test suite written — tests/quicknotes.spec.js (18 tests)
- [x] QA-02: Fixed playwright.config.js testDir bug + @playwright/test install
- [x] QA-03: Fixed frontend/.env placeholder key (Clerk SDK startup)
- [x] QA-04: Fixed Clerk-dependent test assertions for placeholder-key resilience
- [x] QA-05: **18/18 tests PASSED** — 23.7s, Chromium, zero failures
- [x] QA-06: Playwright screenshots captured (landing × 3vp, sign-in × 2vp, 404 × 1vp)
- [x] QA-07: Full visual verification checklist written in docs/qa/test_results.md
- [ ] QA-08 (USER): Visual verify Screens 4–8 using Claude browser extension (requires real Clerk key)

---

## 🐛 Phase 6 — Bug Fix Loop
*No automated test bugs found. Visual bugs may be reported after user completes QA-08 with real Clerk credentials.*

---

---

## 📱 MOBILE APP LIFECYCLE — Android (React Native + Expo)

---

## 📱 Phase M1 — Mobile Spec ✅ REUSE (BA spec covers core CRUD + auth)
- [x] BA spec already defines notes CRUD, Clerk auth, API endpoints
- [x] Backend API already live on Railway — mobile will reuse same endpoints
- [x] Auth: `@clerk/clerk-expo` for mobile session management

---

## 🎨 Phase M2 — Mobile UX/UI Design (Designer) ✅ COMPLETE
- [x] DES-M01: Add mobile section to docs/design/screens.md (1,331 lines appended)
- [x] DES-M02: Design system (dark theme #0f0f0f, MD3 color palette, dp spacing)
- [x] DES-M03: Portrait wireframes for all 8 screens + Profile screen (ASCII ~390dp)
- [x] DES-M04: Bottom tab nav (Notes + Profile) + FAB (56dp bottom-right)
- [x] DES-M05: Bottom sheet for note card context menu (Edit/Delete)
- [x] DES-M06: Thumb-zone diagram — FAB + tabs in natural zone
- [x] DES-M07: Clerk Expo auth flow (useSignIn/useSignUp, SecureStore tokenCache)

---

## 📱 Phase M3 — Mobile Development (Mobile Agent) ✅ COMPLETE
- [x] MOB-01: Scaffold Expo project in mobile/ (expo-router, TypeScript) — 43 files
- [x] MOB-02: Configure Clerk Expo auth provider (tokenCache via SecureStore)
- [x] MOB-03: Build navigation (bottom tabs: Notes + Profile, Stack + modal)
- [x] MOB-04: Build HomeScreen (FlatList, pull-to-refresh, FAB, swipe-to-delete+undo)
- [x] MOB-05: Build NoteEditorScreen (create + edit modes, unsaved-changes BackHandler)
- [x] MOB-06: Build auth screens (Sign In email+OTP+OAuth, Sign Up, Landing)
- [x] MOB-07: Wire all API calls to Railway backend (Bearer token via lib/api.ts)
- [x] MOB-08: Build EmptyState, SkeletonCard, Snackbar, ContextBottomSheet components

---

## 🔍 Phase M4 — Code Review: Mobile ✅ APPROVED (Round 2 — 9/10)
- [x] REV-MOB-01: Round 1 review — 6.5/10, NEEDS FIXES (5 critical + 2 major issues)
- [x] REV-MOB-02: Mobile Dev applied all 7 fixes
- [x] REV-MOB-03: Round 2 review — 9/10, APPROVED

---

## 🔒 Phase M5 — Security Audit: Mobile ✅ CLEAR (with advisories)
- [x] SEC-MOB-01: SecureStore confirmed — AsyncStorage never imported
- [x] SEC-MOB-02: Only API_URL + Clerk publishable key in EXPO_PUBLIC_ — both safe
- [x] SEC-MOB-03: All API calls go through lib/api.ts with Bearer token — no bypasses
- [x] SEC-MOB-FIX-01: HTTP fallback in api.ts replaced with hard throw (Medium — fixed)
- [x] SEC-MOB-FIX-02: .env.example updated with HTTPS production note (Low — fixed)

---

## 🧪 Phase M6 — QA: Mobile (Maestro)
- [x] QA-MOB-01: Write Maestro flows in tests/maestro/ — 6 flows: landing, sign-in, create, edit, delete, sign-out
- [ ] QA-MOB-02 (USER): Run flows on Android device/emulator — `maestro test tests/maestro/`

---

## 🚀 Phase M7 — EAS Build + Play Store
- [ ] EAS-01: Run Mobile Deploy Checklist
- [ ] EAS-02: eas build --profile preview --platform android
- [ ] EAS-03: User tests preview APK on device
- [ ] EAS-04: eas build --profile production --platform android
- [ ] EAS-05: Play Store Internal Testing submission

---

## ✅ Done (Completed & Verified)
- [x] Workspace hierarchy and rule definition bootstrap
- [x] UX/UI Designer agent created (designer skill + rules)
- [x] docs/design/screens.md created (web version)
- [x] Kanban board restructured for full lifecycle workflow
- [x] Web app fully built, reviewed, security-audited, QA-tested
