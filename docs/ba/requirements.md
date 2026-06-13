# QuickNotes — Requirements & Specifications (requirements.md)

**Version**: 1.0  
**Author**: Business Analyst  
**Date**: 2026-06-13  
**Status**: Complete — Ready for Designer Handoff

---

## 1. Product Vision

**QuickNotes** is a lightweight, authenticated note-taking SaaS application. Signed-in users can create, view, edit, and delete personal notes. Notes are private — each user sees only their own. The app prioritizes speed, clarity, and a clean UI over complex features.

---

## 2. User Roles & Permissions

| Role | Description | Access |
|------|-------------|--------|
| **Authenticated User** | Any user who has signed in via Clerk | Full CRUD on their own notes only |
| **Guest (unauthenticated)** | Visitor who has not signed in | Landing page only — all other routes redirect to sign-in |

> There is no Admin role in v1. All users are equal peers with isolated note data.

---

## 3. Authentication Flow (Clerk)

### 3.1 Sign-Up
- User visits the app for the first time.
- Clerk-hosted or embedded `<SignUp />` component handles registration.
- Supports: Email + Password, Google OAuth, GitHub OAuth.
- On successful sign-up, Clerk fires a `user.created` webhook → Backend syncs user to PostgreSQL `User` table.
- User is redirected to `/dashboard` after sign-up.

### 3.2 Sign-In
- User visits `/sign-in` or is redirected there from any protected route.
- Clerk `<SignIn />` component handles authentication.
- On success, Clerk session cookie is set → user is redirected to `/dashboard`.

### 3.3 Session Management
- Clerk manages JWT sessions automatically (refresh, expiry).
- Backend reads `userId` from Clerk's session via `@clerk/express` middleware (`requireAuth()`).
- All API routes under `/api/notes` are protected — unauthenticated requests receive `401 Unauthorized`.

### 3.4 Sign-Out
- User clicks "Sign Out" in the navigation.
- Clerk `signOut()` is called → session is invalidated → user is redirected to `/` (landing page).

### 3.5 User Sync (Clerk Webhook → DB)
- Endpoint: `POST /api/webhooks/clerk`
- Events handled:
  - `user.created` → Insert new `User` record into PostgreSQL.
  - `user.updated` → Update `email` / `name` on existing `User` record.
  - `user.deleted` → Delete `User` record and cascade-delete all their `Note` records.
- Webhook requests must be verified using Clerk's `svix` signature validation.

### 3.6 Protected Routes (Frontend)
- `/dashboard`, `/notes/new`, `/notes/:id/edit` → wrapped in Clerk `<SignedIn>` guard.
- If `<SignedOut>`, redirect to `/sign-in`.
- Backend also enforces auth independently (defense in depth).

---

## 4. Database Schema (Prisma / PostgreSQL)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id                    // Clerk userId (e.g. "user_2abc...")
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  notes     Note[]
}

model Note {
  id        String   @id @default(uuid())
  title     String
  content   String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

**Key design decisions:**
- `User.id` is the Clerk `userId` string (not a generated UUID) — this simplifies ownership lookups.
- `Note.userId` is indexed for fast per-user queries.
- `onDelete: Cascade` ensures notes are removed when a user is deleted.
- `Note.content` is a plain `String` (no length limit at DB level — enforced at API validation layer).

---

## 5. API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/webhooks/clerk` | Svix signature | Sync Clerk user events to DB |
| `GET` | `/api/notes` | Required | Fetch all notes for authenticated user |
| `POST` | `/api/notes` | Required | Create a new note |
| `GET` | `/api/notes/:id` | Required | Fetch single note (must belong to user) |
| `PUT` | `/api/notes/:id` | Required | Update note title/content (must belong to user) |
| `DELETE` | `/api/notes/:id` | Required | Delete a note (must belong to user) |

**Ownership rule**: Every note operation checks `note.userId === req.auth.userId`. If not, respond `403 Forbidden`.

**Request/Response shapes:**

```
POST /api/notes
Body: { title: string (max 100 chars), content: string (max 10,000 chars) }
Response 201: { id, title, content, userId, createdAt, updatedAt }

PUT /api/notes/:id
Body: { title?: string, content?: string }
Response 200: { id, title, content, userId, createdAt, updatedAt }

GET /api/notes
Response 200: Note[] (sorted by updatedAt DESC)
```

---

## 6. User Stories & Acceptance Criteria

---

### US-101: Sign Up

**As a** new visitor,  
**I want to** create an account using email or OAuth,  
**So that** I can start saving notes.

**Acceptance Criteria:**

- **Given** I am on the landing page  
  **When** I click "Get Started" or "Sign Up"  
  **Then** I am taken to the Clerk sign-up screen.

- **Given** I complete sign-up with a valid email and password  
  **When** Clerk confirms my account  
  **Then** a `User` record is created in the database and I am redirected to `/dashboard`.

- **Given** I try to sign up with an already-registered email  
  **When** I submit the form  
  **Then** Clerk shows an error message and no duplicate record is created.

- **Given** I sign up with Google or GitHub OAuth  
  **When** OAuth flow completes successfully  
  **Then** my account is created and I land on `/dashboard`.

---

### US-102: Sign In

**As a** returning user,  
**I want to** sign in to my account,  
**So that** I can access my notes.

**Acceptance Criteria:**

- **Given** I am on the landing page or any unauthenticated page  
  **When** I click "Sign In"  
  **Then** I am taken to the Clerk sign-in screen at `/sign-in`.

- **Given** I enter correct credentials  
  **When** I submit  
  **Then** I am redirected to `/dashboard` and my notes are visible.

- **Given** I enter wrong credentials  
  **When** I submit  
  **Then** Clerk shows an error; I remain on the sign-in page.

- **Given** I try to access `/dashboard` while signed out  
  **When** the page loads  
  **Then** I am automatically redirected to `/sign-in`.

---

### US-103: View Notes Dashboard

**As an** authenticated user,  
**I want to** see all my notes on a dashboard,  
**So that** I can quickly find and manage them.

**Acceptance Criteria:**

- **Given** I am signed in and have existing notes  
  **When** I navigate to `/dashboard`  
  **Then** I see a grid of note cards, each showing the title, a content preview (truncated at 120 chars), and the last-updated date.

- **Given** I am signed in but have no notes yet  
  **When** I navigate to `/dashboard`  
  **Then** I see an empty-state illustration with a "Create your first note" CTA button.

- **Given** I have more than one note  
  **When** the dashboard loads  
  **Then** notes are sorted by `updatedAt` descending (most recently modified first).

- **Given** the API is fetching my notes  
  **When** the request is in-flight  
  **Then** I see a loading skeleton UI, not a blank screen.

---

### US-104: Create a Note

**As an** authenticated user,  
**I want to** create a new note with a title and content,  
**So that** I can capture my thoughts.

**Acceptance Criteria:**

- **Given** I am on the dashboard  
  **When** I click the "+ New Note" button  
  **Then** a note editor opens (modal or dedicated page at `/notes/new`).

- **Given** I type a title (required) and content (optional) and click "Save"  
  **When** the API call succeeds  
  **Then** the new note appears on the dashboard and the editor closes.

- **Given** I try to save with an empty title  
  **When** I click "Save"  
  **Then** I see a validation error "Title is required" and the request is not sent.

- **Given** I click "Cancel" or press Escape while writing  
  **When** the editor closes  
  **Then** no note is created and the dashboard is unchanged.

---

### US-105: Edit a Note

**As an** authenticated user,  
**I want to** edit the title or content of an existing note,  
**So that** I can update my information.

**Acceptance Criteria:**

- **Given** I see a note card on the dashboard  
  **When** I click the edit icon or the note title  
  **Then** the note editor opens pre-filled with the current title and content.

- **Given** I modify the title or content and click "Save"  
  **When** the API call succeeds  
  **Then** the note card on the dashboard updates to reflect the new content and `updatedAt` timestamp.

- **Given** I try to edit a note that belongs to another user (via direct URL manipulation)  
  **When** the API receives the request  
  **Then** the backend returns `403 Forbidden` and the UI shows a generic error.

---

### US-106: Delete a Note

**As an** authenticated user,  
**I want to** delete a note I no longer need,  
**So that** my dashboard stays clean.

**Acceptance Criteria:**

- **Given** I see a note card on the dashboard  
  **When** I click the delete icon  
  **Then** a confirmation dialog appears: "Are you sure you want to delete this note? This cannot be undone."

- **Given** the confirmation dialog is open  
  **When** I click "Delete"  
  **Then** the note is removed from the DB and disappears from the dashboard immediately (optimistic UI or refetch).

- **Given** the confirmation dialog is open  
  **When** I click "Cancel"  
  **Then** the dialog closes and the note remains unchanged.

---

### US-107: Sign Out

**As an** authenticated user,  
**I want to** sign out of my account,  
**So that** my notes are secure on shared devices.

**Acceptance Criteria:**

- **Given** I am signed in  
  **When** I click "Sign Out" in the navigation bar  
  **Then** my Clerk session is terminated and I am redirected to the landing page `/`.

- **Given** I have signed out  
  **When** I click the browser back button  
  **Then** protected routes redirect me to `/sign-in` (session is truly invalidated).

---

## 7. Screen Inventory (Designer Handoff)

The following screens must be designed by the UX/UI Designer:

| # | Screen Name | Route | Auth Required | Description |
|---|-------------|-------|---------------|-------------|
| 1 | **Landing Page** | `/` | No | Marketing/intro page. CTA buttons: "Sign In", "Get Started". |
| 2 | **Sign In** | `/sign-in` | No | Clerk `<SignIn />` component embedded in branded layout. |
| 3 | **Sign Up** | `/sign-up` | No | Clerk `<SignUp />` component embedded in branded layout. |
| 4 | **Notes Dashboard** | `/dashboard` | Yes | Grid of note cards. Top nav. "+ New Note" button. Empty state. Loading skeleton. |
| 5 | **Note Editor** | `/notes/new` or modal | Yes | Form: title input, content textarea, Save + Cancel buttons. Validation errors. |
| 6 | **Note Edit** | `/notes/:id/edit` or modal | Yes | Same as editor but pre-filled. Same Save/Cancel. |
| 7 | **Delete Confirmation Dialog** | overlay | Yes | Modal overlay: warning text, Delete (destructive) + Cancel buttons. |
| 8 | **404 / Not Found** | `*` | No | Simple error page with a "Go Home" link. |

---

## 8. Non-Functional Requirements

- **Performance**: Dashboard must load and render notes within 2 seconds on a standard connection.
- **Security**: No note data is ever exposed to a user other than its owner. All API routes validate Clerk session.
- **Responsiveness**: All screens must be fully usable on mobile (320px+), tablet (768px+), and desktop (1024px+).
- **Accessibility**: Interactive elements must be keyboard-navigable. Color contrast must meet WCAG AA.
- **Error Handling**: All API errors must surface a user-friendly message in the UI (not raw JSON or console errors).

---

## 9. Out of Scope (v1)

- Note sharing or collaboration
- Markdown rendering or rich text editor
- Note categories / tags / folders
- Search functionality
- Pagination (v1 loads all notes; acceptable for small personal note sets)
- Email notifications
- Billing / subscription tiers
