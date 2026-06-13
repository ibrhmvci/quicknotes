# QuickNotes — UX/UI Design Document (screens.md)

**Version**: 1.0  
**Author**: UX/UI Designer  
**Date**: 2026-06-13  
**Status**: Complete — Ready for Frontend Developer  
**Source**: docs/ba/requirements.md v1.0

---

## 0. User Flow

```
[Guest visits /]
       │
       ├─── clicks "Sign In"  ──────► [/sign-in] ──► Clerk auth ──► [/dashboard]
       │                                                                   │
       └─── clicks "Get Started" ──► [/sign-up] ──► Clerk auth ──► [/dashboard]
                                                                           │
                                          ┌────────────────────────────────┤
                                          │                                │
                                    [Empty State]                  [Note Cards Grid]
                                          │                                │
                                    "+ New Note"                  click Edit icon
                                          │                                │
                                          └───────► [Note Editor Modal] ◄──┘
                                                           │
                                                     Save / Cancel
                                                           │
                                                    [/dashboard] (refreshed)
                                                           │
                                                    click Delete icon
                                                           │
                                              [Delete Confirmation Dialog]
                                                     │           │
                                                  Delete       Cancel
                                                     │           │
                                              (note removed)  [/dashboard]

       Any protected route while signed out ──► redirect to [/sign-in]
       Unknown route ──► [404 Page]
       Sign Out (TopNav) ──► [/] Landing
```

---

## 1. Design System

### 1.1 Color Palette (CSS HSL Variables)

```css
:root {
  /* Brand */
  --color-primary:        hsl(243, 75%, 59%);   /* Indigo — CTAs, links, focus rings */
  --color-primary-hover:  hsl(243, 75%, 50%);   /* Darker indigo on hover */
  --color-primary-light:  hsl(243, 75%, 95%);   /* Tint for backgrounds */

  /* Neutrals */
  --color-bg:             hsl(220, 20%, 98%);   /* Near-white page background */
  --color-surface:        hsl(0, 0%, 100%);     /* Cards, modals, inputs */
  --color-border:         hsl(220, 13%, 91%);   /* Dividers, input borders */
  --color-border-focus:   hsl(243, 75%, 59%);   /* Input focus border */

  /* Text */
  --color-text-primary:   hsl(222, 47%, 11%);   /* Headings, body copy */
  --color-text-secondary: hsl(220, 9%, 46%);    /* Timestamps, placeholders, labels */
  --color-text-inverse:   hsl(0, 0%, 100%);     /* Text on dark/primary backgrounds */

  /* Semantic */
  --color-danger:         hsl(0, 72%, 51%);     /* Delete button, destructive actions */
  --color-danger-hover:   hsl(0, 72%, 43%);
  --color-danger-light:   hsl(0, 72%, 95%);
  --color-success:        hsl(142, 71%, 45%);   /* Success toasts */
  --color-warning:        hsl(38, 92%, 50%);    /* Warning states */

  /* Shadows */
  --shadow-sm:   0 1px 2px hsl(222, 47%, 11%, 0.06);
  --shadow-md:   0 4px 12px hsl(222, 47%, 11%, 0.10);
  --shadow-lg:   0 8px 32px hsl(222, 47%, 11%, 0.14);
  --shadow-xl:   0 20px 60px hsl(222, 47%, 11%, 0.18);
}
```

### 1.2 Typography

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Scale */
  --text-xs:   0.75rem;   /* 12px — timestamps, badges */
  --text-sm:   0.875rem;  /* 14px — labels, secondary copy */
  --text-base: 1rem;      /* 16px — body, inputs */
  --text-lg:   1.125rem;  /* 18px — card titles */
  --text-xl:   1.25rem;   /* 20px — section headings */
  --text-2xl:  1.5rem;    /* 24px — page headings */
  --text-3xl:  1.875rem;  /* 30px — hero heading */
  --text-4xl:  2.25rem;   /* 36px — landing hero */

  /* Weights */
  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  /* Line heights */
  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed:1.75;
}
```

### 1.3 Spacing Scale

```css
:root {
  --space-1:  0.25rem;  /*  4px */
  --space-2:  0.5rem;   /*  8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.25rem;  /* 20px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

### 1.4 Border Radius

```css
:root {
  --radius-sm:   4px;    /* Badges, tags */
  --radius-md:   8px;    /* Inputs, buttons */
  --radius-lg:   12px;   /* Cards */
  --radius-xl:   16px;   /* Modals */
  --radius-full: 9999px; /* Pills, avatars */
}
```

### 1.5 Transitions

```css
:root {
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow:   400ms ease;
}
```

### 1.6 Icons

Use **Lucide React** (`lucide-react` npm package). Icon size: `20px` inline, `24px` standalone buttons. Stroke width: `1.75`. Never use filled icons — outline style only.

Key icons used:
- `Plus` — New Note button
- `Pencil` — Edit action
- `Trash2` — Delete action
- `FileText` — Empty state / logo accent
- `LogOut` — Sign out
- `X` — Close modal
- `AlertTriangle` — Delete warning
- `CheckCircle2` — Success toast
- `ChevronRight` — Landing CTA arrow

---

## 2. Shared Components

These components appear across multiple screens. FE should build them once.

### `<TopNav>`
- **Height**: 64px
- **Contents**: Logo left (`FileText` icon + "QuickNotes" text), user avatar + "Sign Out" button right
- **Background**: `var(--color-surface)` with `border-bottom: 1px solid var(--color-border)`
- **Sticky**: `position: sticky; top: 0; z-index: 100`
- **States**:
  - Default: as described
  - Scroll shadow: adds `var(--shadow-sm)` when page is scrolled > 0px

### `<Button>`
Variants:
| Variant | Background | Text | Border | Use |
|---------|-----------|------|--------|-----|
| `primary` | `--color-primary` | `--color-text-inverse` | none | Main CTAs |
| `secondary` | transparent | `--color-text-primary` | `1px solid --color-border` | Cancel, secondary |
| `danger` | `--color-danger` | `--color-text-inverse` | none | Delete confirm |
| `ghost` | transparent | `--color-text-secondary` | none | Icon buttons in cards |

States for all variants: hover (darken 10%), active (scale 0.97), disabled (opacity 0.4, cursor not-allowed), loading (spinner replaces label).

Sizes: `sm` (32px height, px-3), `md` (40px height, px-4, default), `lg` (48px height, px-6).

### `<Input>`
- Height: 40px, border: `1px solid var(--color-border)`, border-radius: `var(--radius-md)`
- Focus: border-color `var(--color-border-focus)`, box-shadow `0 0 0 3px hsl(243, 75%, 59%, 0.15)`
- Error: border-color `var(--color-danger)`, red helper text below
- Placeholder: `--color-text-secondary`

### `<Textarea>`
- Same border/focus as `<Input>`, min-height: 200px, resize: vertical
- Line height: `var(--leading-relaxed)`

### `<NoteCard>`
- Background: `var(--color-surface)`, border-radius: `var(--radius-lg)`, border: `1px solid var(--color-border)`
- Padding: `var(--space-5)`
- Shadow: `var(--shadow-sm)`
- Contents: title (bold, 1 line, ellipsis), content preview (2 lines, secondary color), timestamp (xs, secondary)
- Action icons (Pencil + Trash2) shown on hover (opacity 0 → 1, transition-fast)
- States:
  - Default: `var(--shadow-sm)`
  - Hover: `var(--shadow-md)`, translateY(-2px), action icons appear
  - Active (click): scale(0.98)
  - Loading skeleton: animated shimmer replacing title/content/timestamp

### `<Modal>`
- Backdrop: `hsl(222, 47%, 11%, 0.5)`, `backdrop-filter: blur(4px)`
- Panel: `var(--color-surface)`, `var(--radius-xl)`, `var(--shadow-xl)`, max-width 560px, width 92vw
- Animation: backdrop fades in (250ms), panel slides up 16px + fades in (250ms)
- Close on: X button, backdrop click, Escape key
- Header: title left, X button right
- Footer: action buttons right-aligned

### `<EmptyState>`
- Centered vertically and horizontally in content area
- Large `FileText` icon (64px, `--color-primary-light` fill, `--color-primary` stroke)
- Heading: "No notes yet"
- Subtext: "Create your first note to get started."
- CTA Button (primary, lg)

### `<SkeletonCard>`
- Same dimensions as `<NoteCard>`
- Animated shimmer (`background: linear-gradient(90deg, --color-border 25%, --color-bg 50%, --color-border 75%)`, background-size 200%, animation 1.5s infinite)
- Fake title bar: 60% width, 20px height
- Fake content lines: 100%, 80% widths, 14px height each, 2 lines
- Fake timestamp: 40% width, 12px height

### `<Toast>`
- Position: bottom-right, 16px margin
- Width: 320px max
- Variants: `success` (green left border), `error` (red left border)
- Auto-dismiss: 4 seconds
- Animation: slide in from right (250ms), fade out (250ms)

---

## 3. Screen Designs

---

### Screen 1 — Landing Page (`/`)

**Purpose**: Convert visitors to sign-ups. Communicate the product value in seconds. Provide clear sign-in and sign-up paths.

**Auth**: Not required. If already signed in, redirect to `/dashboard`.

#### Desktop Wireframe (>1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (transparent, becomes solid on scroll)                  │
│  [FileText icon]  QuickNotes              [Sign In]  [Get Started▶]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      HERO SECTION                               │
│                                                                 │
│          Your thoughts,                                         │
│          beautifully organized.                                 │
│                                                                 │
│   Capture ideas instantly. Access them anywhere.                │
│   Private, fast, and always yours.                              │
│                                                                 │
│          [Get Started — it's free ▶]   [Sign In]                │
│                                                                 │
│   ┌──────────────────────────────────────────────────────┐      │
│   │          [App UI Preview / Illustration]             │      │
│   │          (Screenshot-style mockup of dashboard)      │      │
│   └──────────────────────────────────────────────────────┘      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    FEATURES SECTION (3 columns)                 │
│                                                                 │
│  [icon]              [icon]              [icon]                 │
│  Fast & Simple       Private & Secure    Always Accessible      │
│  Write notes in      Your notes are      Works on all           │
│  seconds, no         yours alone —       devices, synced        │
│  friction.           end-to-end auth.    in real time.          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                         FOOTER                                  │
│  © 2026 QuickNotes                          Privacy   Terms     │
└─────────────────────────────────────────────────────────────────┘
```

#### Components
- `<LandingNav>` — transparent header, primary `Get Started` button, ghost `Sign In` button
- `<HeroSection>` — H1 (4xl, bold), subtitle (lg, secondary), two CTA buttons, app mockup image
- `<FeatureCard>` × 3 — icon (32px, primary color), heading (lg), body text (sm, secondary)
- `<LandingFooter>` — copyright, two text links

#### Interactions
- Header: transparent → solid `var(--color-surface)` + shadow on scroll past 80px (transition-normal)
- "Get Started" button → navigate to `/sign-up`
- "Sign In" button/link → navigate to `/sign-in`
- Feature cards: subtle hover lift (translateY -4px, shadow-md)

#### Responsive

| Breakpoint | Changes |
|-----------|---------|
| Tablet (768–1024px) | Hero text smaller (3xl). Feature cards → 2 col + 1 centered. |
| Mobile (<768px) | Single column. Nav collapses to logo + "Get Started" only. Hero subtitle shortened. Feature cards stacked. App mockup hidden. |

---

### Screen 2 — Sign In (`/sign-in`)

**Purpose**: Authenticate a returning user via Clerk.

**Auth**: Not required. Redirect to `/dashboard` if already signed in.

#### Desktop Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  [FileText]  QuickNotes                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────────────────┐   ┌────────────────────────────┐ │
│   │                          │   │                            │ │
│   │  Left Panel              │   │  Sign In Card              │ │
│   │  (Brand / Tagline)       │   │                            │ │
│   │                          │   │  Welcome back              │ │
│   │  [Large FileText icon]   │   │  Sign in to QuickNotes     │ │
│   │                          │   │                            │ │
│   │  "Your notes are         │   │  [Clerk <SignIn /> embed]  │ │
│   │   waiting for you."      │   │                            │ │
│   │                          │   │  ─── or ───                │ │
│   │                          │   │  [Google] [GitHub]         │ │
│   │                          │   │                            │ │
│   │                          │   │  Don't have an account?    │ │
│   │                          │   │  [Sign up]                 │ │
│   │                          │   │                            │ │
│   └──────────────────────────┘   └────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Components
- `<AuthLayout>` — two-column wrapper. Left: brand panel (indigo gradient background). Right: white card.
- `<BrandPanel>` — large icon, tagline text, subtle pattern overlay on indigo bg
- Clerk `<SignIn />` component — styled to match design system via Clerk appearance API
- "Sign up" link → `/sign-up`

#### Interactions
- Clerk handles all form logic (email/password, OAuth, error states)
- On success → Clerk redirects to `/dashboard`
- On error → Clerk shows inline error (we apply custom error text color `--color-danger`)

#### Responsive
| Breakpoint | Changes |
|-----------|---------|
| Mobile/Tablet (<1024px) | Left brand panel hidden. Card becomes full-width with logo at top. |

---

### Screen 3 — Sign Up (`/sign-up`)

**Purpose**: Register a new user via Clerk.

**Auth**: Not required. Redirect to `/dashboard` if already signed in.

#### Layout
Identical to Sign In screen (`<AuthLayout>`) but:
- Right panel heading: "Create your account"
- Subheading: "Start capturing ideas in seconds."
- Clerk `<SignUp />` component replaces `<SignIn />`
- Footer link: "Already have an account? [Sign in]" → `/sign-in`

#### Interactions / Responsive
Same as Sign In screen.

---

### Screen 4 — Notes Dashboard (`/dashboard`)

**Purpose**: Central hub. View all notes. Create, edit, delete. Primary working screen.

**Auth**: Required. Unauthenticated → redirect `/sign-in`.

#### Desktop Wireframe — Has Notes

```
┌─────────────────────────────────────────────────────────────────┐
│ TOPNAV (sticky)                                                 │
│ [FileText] QuickNotes              [Avatar] John D.  [LogOut]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PAGE HEADER                                                    │
│  My Notes                              [+ New Note]            │
│  ─────────────────────────────────────────────────────          │
│                                                                 │
│  NOTES GRID (3 columns, 24px gap)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Note Title  │  │ Note Title  │  │ Note Title  │            │
│  │             │  │             │  │             │            │
│  │ Preview     │  │ Preview     │  │ Preview     │            │
│  │ text here.. │  │ text here.. │  │ text here.. │            │
│  │             │  │             │  │             │            │
│  │ Jun 12, 26  │  │ Jun 11, 26  │  │ Jun 10, 26  │  [✏] [🗑]  │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │ Note Title  │  │ Note Title  │                              │
│  │             │  │             │                              │
│  │ Preview...  │  │ Preview...  │                              │
│  │             │  │             │                              │
│  │ Jun 9, 26   │  │ Jun 8, 26   │                              │
│  └─────────────┘  └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Desktop Wireframe — Empty State

```
┌─────────────────────────────────────────────────────────────────┐
│ TOPNAV ...                                                      │
├─────────────────────────────────────────────────────────────────┤
│  My Notes                              [+ New Note]            │
│  ────────────────────────────────────────────────────           │
│                                                                 │
│                    [FileText icon — 64px]                       │
│                       No notes yet                              │
│              Create your first note to get started.             │
│                                                                 │
│                   [+ Create your first note]                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Desktop Wireframe — Loading State

```
│  My Notes                              [+ New Note]            │
│  ────────────────────────────────────────────────────           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │▓▓▓▓▓▓▓▓     │  │▓▓▓▓▓▓       │  │▓▓▓▓▓▓▓▓▓    │ ← shimmer  │
│  │▓▓▓▓▓▓▓▓▓▓▓▓ │  │▓▓▓▓▓▓▓▓▓▓▓▓ │  │▓▓▓▓▓▓▓▓▓▓▓▓ │            │
│  │▓▓▓▓▓▓▓▓▓▓   │  │▓▓▓▓▓▓▓▓     │  │▓▓▓▓▓▓▓▓▓▓▓  │            │
│  │▓▓▓▓         │  │▓▓▓▓         │  │▓▓▓▓         │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
```

#### Components
- `<TopNav>` (shared)
- `<PageHeader>` — "My Notes" h1 left, `<Button variant="primary">+ New Note</Button>` right
- `<NoteGrid>` — CSS grid, `repeat(auto-fill, minmax(280px, 1fr))`, gap `var(--space-6)`
- `<NoteCard>` × N (shared)
- `<EmptyState>` (shared) — shown when `notes.length === 0` and not loading
- `<SkeletonCard>` × 6 (shared) — shown during initial fetch

#### Interactions
- "+ New Note" button → opens `<NoteEditorModal>` in create mode
- `<NoteCard>` edit icon → opens `<NoteEditorModal>` in edit mode (pre-filled)
- `<NoteCard>` delete icon → opens `<DeleteConfirmModal>`
- `<NoteCard>` title click → opens `<NoteEditorModal>` in edit mode
- After successful create/edit/delete → refetch notes, dismiss modal, show `<Toast>`

#### Responsive
| Breakpoint | Grid Columns |
|-----------|-------------|
| Desktop (>1024px) | 3 columns |
| Tablet (768–1024px) | 2 columns |
| Mobile (<768px) | 1 column |

Mobile: TopNav shows only logo + avatar (sign-out in dropdown). Page header stacks vertically (title on top, "+ New Note" button full-width below).

---

### Screen 5 — Note Editor Modal (Create Mode)

**Purpose**: Create a new note. Triggered by "+ New Note" button.

**Auth**: Required (modal only renders inside authenticated dashboard).

**Decision**: Use a modal (not separate page) to keep the user anchored to the dashboard context.

#### Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  BACKDROP (blurred, dark)                                       │
│                                                                 │
│        ┌───────────────────────────────────────┐               │
│        │  New Note                         [X] │               │
│        ├───────────────────────────────────────┤               │
│        │                                       │               │
│        │  Title *                              │               │
│        │  ┌─────────────────────────────────┐  │               │
│        │  │ Enter a title...                │  │               │
│        │  └─────────────────────────────────┘  │               │
│        │  [! Title is required]  ← error state │               │
│        │                                       │               │
│        │  Content                              │               │
│        │  ┌─────────────────────────────────┐  │               │
│        │  │                                 │  │               │
│        │  │ Write your note here...         │  │               │
│        │  │                                 │  │               │
│        │  │                                 │  │               │
│        │  └─────────────────────────────────┘  │               │
│        │                                       │               │
│        │              [Cancel]  [Save Note]    │               │
│        └───────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Components
- `<Modal>` wrapper (shared)
- Modal title: "New Note"
- `<Input>` — label "Title", required, placeholder "Enter a title...", maxLength 100
- Validation error: red text below input "Title is required" (visible when submitted empty)
- `<Textarea>` — label "Content", optional, placeholder "Write your note here...", minHeight 200px
- Character counter: bottom-right of textarea, `current / 10000`, turns red > 9000
- Footer: `<Button variant="secondary">Cancel</Button>` + `<Button variant="primary" loading={isSaving}>Save Note</Button>`

#### States
| State | Description |
|-------|-------------|
| Default | Empty inputs, Save button enabled |
| Validation error | Title input has red border + error message below |
| Saving | Save button shows spinner, all inputs disabled |
| Save error | Toast appears: "Failed to save note. Try again." |
| Save success | Modal closes, dashboard refreshes, success toast |

#### Interactions
- X button → close modal (no save)
- Backdrop click → close modal (no save)
- Escape key → close modal (no save)
- Tab order: Title → Content → Cancel → Save
- Save: validates title not empty → POST /api/notes → close on success

#### Responsive
- Modal width: `min(560px, 92vw)`
- On mobile: modal is full-screen (100vw × 100vh), slides up from bottom

---

### Screen 6 — Note Editor Modal (Edit Mode)

**Purpose**: Edit an existing note's title or content.

**Auth**: Required.

#### Layout
Identical to Screen 5 with these differences:
- Modal title: "Edit Note"
- Title `<Input>` pre-filled with `note.title`
- Content `<Textarea>` pre-filled with `note.content`
- Save button label: "Save Changes"
- On save → PUT `/api/notes/:id`

#### States
Same as Screen 5. Additionally:
| State | Description |
|-------|-------------|
| Unchanged | If user edits nothing and clicks Save, still sends PUT (idempotent) |
| 403 Error | Toast: "You don't have permission to edit this note." |

---

### Screen 7 — Delete Confirmation Dialog

**Purpose**: Confirm destructive intent before deleting a note.

**Auth**: Required.

#### Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  BACKDROP                                                       │
│                                                                 │
│          ┌────────────────────────────────────┐                 │
│          │  [AlertTriangle icon — 32px, red]  │                 │
│          │                                    │                 │
│          │    Delete Note?                    │                 │
│          │                                    │                 │
│          │  Are you sure you want to delete   │                 │
│          │  this note? This action cannot     │                 │
│          │  be undone.                        │                 │
│          │                                    │                 │
│          │           [Cancel]  [Delete]       │                 │
│          └────────────────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Components
- `<Modal>` wrapper, max-width 420px, centered
- `AlertTriangle` icon (32px, `--color-danger`)
- Heading: "Delete Note?" (xl, bold, `--color-text-primary`)
- Body: "Are you sure you want to delete this note? This action cannot be undone." (base, secondary)
- Footer: `<Button variant="secondary">Cancel</Button>` + `<Button variant="danger" loading={isDeleting}>Delete</Button>`

#### States
| State | Description |
|-------|-------------|
| Default | Both buttons enabled |
| Deleting | Delete button shows spinner, both buttons disabled |
| Error | Toast: "Failed to delete note. Try again." Dialog stays open. |
| Success | Dialog closes, note removed from grid, success toast |

#### Interactions
- Cancel → close dialog, note unchanged
- Backdrop click → close dialog, note unchanged
- Escape → close dialog, note unchanged
- Delete → DELETE `/api/notes/:id` → success: remove card from UI optimistically

#### Responsive
- Mobile: dialog is still centered (not full-screen), width 92vw

---

### Screen 8 — 404 / Not Found (`*`)

**Purpose**: Gracefully handle unknown routes.

**Auth**: Not required.

#### Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  [FileText]  QuickNotes                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         404                                     │
│                   (4xl, bold, primary color)                    │
│                                                                 │
│                  Page not found                                 │
│                  (xl, text-primary)                             │
│                                                                 │
│          The page you're looking for doesn't exist.             │
│                  (base, text-secondary)                         │
│                                                                 │
│                   [← Go to Home]                               │
│                   (primary button)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Components
- Minimal nav (logo only)
- "404" text (display, primary color)
- Heading, body text
- `<Button variant="primary">← Go to Home</Button>` → navigates to `/`

#### Responsive
All text and button centered, works at all widths.

---

## 4. Animation & Transition Summary

| Element | Animation | Duration |
|---------|-----------|---------|
| Modal open | Backdrop fade-in + panel slide-up (16px) + fade-in | 250ms |
| Modal close | Backdrop fade-out + panel fade-out | 200ms |
| Note card hover | translateY(-2px), shadow-md, action icons appear | 150ms |
| Note card delete | opacity 0 + scale(0.95) (optimistic removal) | 200ms |
| Skeleton shimmer | background-position sweep | 1.5s loop |
| Page navigation | Simple opacity fade (React Router) | 200ms |
| Toast enter | Slide in from right | 250ms |
| Toast exit | Fade out | 250ms |
| Button active | scale(0.97) | 100ms |
| TopNav shadow | opacity 0 → 1 on scroll | 200ms |

---

## 5. Approval Checklist (PM / User Sign-Off Required)

Before the Frontend Developer begins implementation, confirm the following design decisions:

- [ ] **DES-APPROVE-01**: Color palette — Indigo (`hsl(243, 75%, 59%)`) as primary brand color. Alternative: Blue, Violet, Teal?
- [ ] **DES-APPROVE-02**: Note Editor as **modal** (not separate `/notes/new` page). BA spec left this open. Modal keeps user on dashboard — recommended for simplicity.
- [ ] **DES-APPROVE-03**: **Lucide React** as icon library. Alternative: Heroicons, Phosphor Icons?
- [ ] **DES-APPROVE-04**: **Inter** as the primary typeface (via Google Fonts). Alternative: System font stack only (no external font load)?
- [ ] **DES-APPROVE-05**: Landing page includes a **features section** and **app mockup image**. Confirm scope — or simplify to hero + CTAs only?
- [ ] **DES-APPROVE-06**: Card action icons (edit/delete) are **hidden by default, revealed on hover**. Mobile: always visible (no hover on touch)?
- [ ] **DES-APPROVE-07**: Delete uses **optimistic UI** (card disappears immediately, reverts on error). Alternative: wait for API response before removing?

---

*Design document complete. All 8 screens from BA spec section 7 are covered. Awaiting PM approval gate before FE begins.*
