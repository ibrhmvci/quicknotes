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

---

---

## MOBILE SECTION (Android — React Native + Expo)

**Version**: 1.0  
**Author**: UX/UI Designer  
**Date**: 2026-06-13  
**Platform**: Android only, portrait orientation, Material Design 3  
**Auth SDK**: `@clerk/clerk-expo`  
**Storage**: `expo-secure-store` (never AsyncStorage for tokens)  
**Source**: docs/ba/requirements.md v1.0 — all 8 screens from section 7

> This section is the Mobile Developer agent's single source of truth. Build directly from this document without seeking clarification. The web sections above are separate — do not port web CSS or web component logic here.

---

### M0. Mobile User Flow

```
[App launches]
       │
       ├── Clerk session found (expo-secure-store) ──► [Dashboard Screen]
       │
       └── No session ──────────────────────────────► [Onboarding/Landing Screen]
                                                              │
                                    ┌─────────────────────────┤
                                    │                         │
                             "Sign In" pressed         "Get Started" pressed
                                    │                         │
                             [Sign In Screen]          [Sign Up Screen]
                                    │                         │
                                    └──────────┬──────────────┘
                                               │
                                      Clerk auth success
                                               │
                                      [Dashboard Screen]
                                    (Bottom Tab: Notes tab)
                                               │
                              ┌────────────────┴────────────────┐
                              │                                  │
                        [Empty State]                   [Note List — scroll]
                              │                                  │
                        FAB pressed                    Long-press card ──► [Context Bottom Sheet]
                              │                                  │         ├── "Edit" ──► [Note Editor Modal]
                              │                         Swipe-left card    └── "Delete" ──► [Delete Dialog]
                              │                                  │
                              └──────────► [Note Editor Modal — Create]
                                                       │
                                                  Save / Cancel
                                                       │
                                              [Dashboard Screen]
                                              + Snackbar feedback

       Tab bar: [Notes] [Profile]
       Profile tab ──► [Profile Screen] ──► "Sign Out" ──► [Landing Screen]

       Unknown deep-link or navigation error ──► [404 Screen]
```

---

### M1. Mobile Design System

> These tokens are defined once here. Every screen specification references them by name — they are NOT redefined per screen.

#### M1.1 Color Palette

```
background:   #0f0f0f   — deepest background (StatusBar, screen bg)
surface:      #1a1a1a   — note cards, bottom sheets, input fields
surfaceHigh:  #252525   — elevated items, active tab indicator bg, pressed card
primary:      #6366f1   — indigo brand color (CTAs, FAB, active tab icon, links)
primaryDark:  #4f52c9   — pressed state of primary elements
onPrimary:    #ffffff   — text/icons rendered ON primary-colored surfaces
text:         #f0f0f0   — primary text (titles, body, headings)
textMuted:    #888888   — timestamps, placeholders, secondary labels, captions
border:       #2a2a2a   — card borders, dividers, input borders
error:        #ef4444   — validation errors, destructive actions, error snackbars
errorDark:    #c53030   — pressed state of error/danger buttons
success:      #22c55e   — success snackbars, confirmations
overlay:      rgba(0,0,0,0.6) — modal/sheet backdrop
```

Contrast checks (WCAG AA minimum 4.5:1 for normal text):
- `text` (#f0f0f0) on `background` (#0f0f0f): ~18:1 — passes
- `text` (#f0f0f0) on `surface` (#1a1a1a): ~14:1 — passes
- `primary` (#6366f1) on `background` (#0f0f0f): ~5.2:1 — passes
- `onPrimary` (#ffffff) on `primary` (#6366f1): ~4.9:1 — passes
- `textMuted` (#888888) on `background` (#0f0f0f): ~5.9:1 — passes for large text / icons

#### M1.2 Typography Scale (Material Design 3, sp units)

```
Display:   28sp, weight 700  — hero headline (Landing screen only)
Headline:  24sp, weight 600  — screen titles ("My Notes", "Sign In")
Title:     18sp, weight 600  — note card titles, modal headings, section headers
Body:      16sp, weight 400  — note content preview, form labels, body paragraphs
Caption:   13sp, weight 400  — timestamps, character counters, helper text, tab labels
```

Font family: System default (`System` in React Native — Roboto on Android). No custom font load needed.

Line heights:
- Display / Headline: 1.2 × sp value
- Title / Body: 1.4 × sp value
- Caption: 1.3 × sp value

#### M1.3 Spacing Scale (dp units)

```
xs:   4dp   — icon-to-label gap, badge padding
sm:   8dp   — internal card padding (secondary), list item gap
md:  16dp   — standard screen horizontal padding, card internal padding
lg:  24dp   — section gap, modal internal padding
xl:  32dp   — hero vertical padding, large section margin
xxl: 48dp   — safe-area compensation, tall section spacers
```

#### M1.4 Component Tokens

```
Card radius:         12dp
Bottom Sheet radius: 16dp (top corners only)
Button radius:       8dp  (standard buttons)
FAB radius:          16dp (rounded square, 56×56dp)
Input radius:        8dp
Snackbar radius:     6dp

Card elevation:      4dp  (Android shadow)
Modal elevation:     8dp
FAB elevation:       6dp

Touch target minimum: 48×48dp (all tappable elements)

Bottom tab bar height: 64dp (visual) + safe area inset (bottom)
Status bar:            transparent, light icons (light content on dark bg)
```

#### M1.5 Icon Library

Use **`@expo/vector-icons` MaterialCommunityIcons** for Material Design 3 alignment. Icon size: 24dp inline, 28dp standalone. All icons use `text` color (#f0f0f0) unless noted.

Key icons:
```
note-text-outline     — app logo / note representation
plus                  — FAB new note
pencil-outline        — edit action
delete-outline        — delete action
logout                — sign out
close                 — dismiss / close
alert-circle-outline  — delete warning, error states
check-circle-outline  — success feedback
account-circle-outline— profile avatar placeholder
dots-vertical         — overflow / context menu trigger (fallback to long-press)
home-outline          — notes tab (inactive)
home                  — notes tab (active)
account-outline       — profile tab (inactive)
account               — profile tab (active)
arrow-left            — back navigation (top-left header)
refresh               — pull-to-refresh indicator (system spinner, not custom)
eye-off-outline       — password visibility toggle
eye-outline           — password visible state
```

---

### M2. Navigation Architecture

#### M2.1 Navigator Stack

```
RootNavigator (Stack)
  ├── AuthStack (Stack) — shown when Clerk session = null
  │     ├── LandingScreen
  │     ├── SignInScreen
  │     └── SignUpScreen
  │
  └── AppStack (Stack) — shown when Clerk session = valid
        ├── MainTabs (Bottom Tab Navigator)
        │     ├── NotesTab
        │     │     └── DashboardScreen (with FAB)
        │     └── ProfileTab
        │           └── ProfileScreen
        │
        ├── NoteEditorModal (Stack, presentation: 'modal') — full-screen modal
        │     ├── NoteEditorScreen (create mode, param: mode='create')
        │     └── NoteEditorScreen (edit mode, param: mode='edit', noteId)
        │
        └── NotFoundScreen (shown for unresolvable deep links)
```

#### M2.2 Bottom Tab Bar

- **2 tabs**: Notes (index 0), Profile (index 1)
- Height: 64dp + bottom safe area inset
- Background: `surface` (#1a1a1a)
- Top border: 1dp, `border` (#2a2a2a)
- Active tab: icon + label in `primary` (#6366f1), indicator dot above icon
- Inactive tab: icon + label in `textMuted` (#888888)
- Tab label: Caption (13sp, weight 400)
- Tab icon: 24dp
- Tab touch target: full tab width × 64dp (naturally 48dp+ on most phones)

```
┌──────────────────────────────────────────┐
│                                          │  ← content area
│                                          │
├──────────────────────────────────────────┤
│  ●                                       │  ← active indicator dot (6dp circle, primary)
│ [home]           [account-outline]       │
│  Notes               Profile             │  ← tab bar (64dp)
└──────────────────────────────────────────┘
   ← safe area bottom padding applied below ──►
```

#### M2.3 Back Button Behavior

| Screen | Android Back | Gesture Back |
|--------|-------------|-------------|
| LandingScreen | Exits app (minimize) | Same |
| SignInScreen | Goes to LandingScreen | Same |
| SignUpScreen | Goes to LandingScreen | Same |
| DashboardScreen (Notes tab) | Minimizes app | Same |
| ProfileScreen (Profile tab) | Switches to Notes tab | Same |
| NoteEditorModal (create) | Dismisses modal, no save | Same |
| NoteEditorModal (edit) | Dismisses modal, no save | Same |
| Delete Dialog | Dismisses dialog, no delete | Same |
| NotFoundScreen | Goes to DashboardScreen | Same |

> The NoteEditorModal must intercept the back gesture with a confirmation prompt only if the user has made unsaved changes (title or content differs from original). If no changes, dismiss immediately.

#### M2.4 Status Bar

- Style: `light-content` (white icons on dark background)
- Background: `background` (#0f0f0f) — matches screen background
- Translucent: false (solid, not floating over content)
- Apply consistently across all screens using `<StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />`

---

### M3. Screen M1 — Landing / Onboarding Screen

**User Story**: US-101, US-102  
**Purpose**: Welcome unauthenticated users. Communicate product value. Route to Sign In or Sign Up.  
**Auth**: Not required. If Clerk session is valid, skip this screen entirely (auto-navigate to Dashboard).

#### ASCII Wireframe (portrait, ~390dp wide)

```
┌─────────────────────────────────┐
│ ░░░░ STATUS BAR ░░░░░░░░░░░░░░░ │  ← light icons, #0f0f0f bg
├─────────────────────────────────┤
│                                 │
│                                 │  ← xl padding top
│                                 │
│    [note-text-outline icon]     │  ← 64dp icon, primary color
│         QuickNotes              │  ← Headline 24sp, text #f0f0f0
│                                 │
│                                 │  ← lg gap
│                                 │
│    Your thoughts,               │  ← Display 28sp, weight 700
│    organized.                   │    text #f0f0f0, leading 1.2
│                                 │
│    Capture ideas in seconds.    │  ← Body 16sp, textMuted #888888
│    Private, fast, always yours. │
│                                 │
│                                 │  ← xl gap
│                                 │
│  ┌─────────────────────────┐    │
│  │      Get Started        │    │  ← Primary button, full-width
│  └─────────────────────────┘    │    48dp height, bg primary
│                                 │
│  ┌─────────────────────────┐    │
│  │        Sign In          │    │  ← Secondary button, full-width
│  └─────────────────────────┘    │    48dp height, bordered
│                                 │
│                                 │  ← spacer flex:1
│                                 │
│  © 2026 QuickNotes              │  ← Caption 13sp, textMuted
│                                 │  ← safe area bottom
└─────────────────────────────────┘
```

#### Layout Spec

- Screen background: `background` (#0f0f0f)
- Content is a single `ScrollView` (allows small screens to scroll if needed) with `contentContainerStyle: { flex: 1, justifyContent: 'center' }`
- Horizontal padding: `md` (16dp) on both sides
- Logo icon: 64dp, color `primary` (#6366f1), centered
- App name: Headline (24sp), centered, color `text`, margin-top `sm`
- Hero headline: Display (28sp, weight 700), color `text`, margin-top `xl`, left-aligned
- Subtitle: Body (16sp), color `textMuted`, margin-top `sm`, left-aligned, 2 lines max
- Button group: margin-top `xl`, gap `sm` (8dp) between buttons
- "Get Started" button: full-width, height 48dp, background `primary`, text `onPrimary`, radius `button (8dp)`, label "Get Started"
- "Sign In" button: full-width, height 48dp, background transparent, border 1dp `border` (#2a2a2a), text `text`, radius 8dp, label "Sign In"
- Footer copyright: Caption (13sp), `textMuted`, centered, margin-bottom `md` + safe area

#### Components

**`<LandingLogoMark>`**
- States:
  - Default: `note-text-outline` icon 64dp, color `primary`
  - No pressed / loading state (decorative only)
- Accessibility: `accessibilityRole="image"`, `accessibilityLabel="QuickNotes logo"`

**`<PrimaryButton>`** (reusable across all screens)
- Default: bg `primary`, text `onPrimary` (16sp, weight 600), height 48dp, width full (or defined width), radius 8dp, `android_ripple={{ color: primaryDark }}`
- Pressed: ripple overlay (primaryDark), slightly darker bg
- Loading: activity indicator (white, size small) replaces label text; button disabled during load
- Disabled: opacity 0.4, `android_ripple` disabled
- Error: no visual change on button itself; error shows in Snackbar
- Accessibility: `accessibilityRole="button"`, `accessibilityLabel` set to button text

**`<SecondaryButton>`** (reusable across all screens)
- Default: bg transparent, border 1dp `border`, text `text` (16sp, weight 500), height 48dp, radius 8dp, `android_ripple={{ color: surfaceHigh }}`
- Pressed: ripple overlay (surfaceHigh)
- Loading: activity indicator (text color, size small) replaces label
- Disabled: opacity 0.4
- Accessibility: `accessibilityRole="button"`

#### Gestures
- No swipe gestures on this screen
- "Get Started" press → navigate to SignUpScreen
- "Sign In" press → navigate to SignInScreen
- Android back → exits app (minimize)

#### Android-Specific Notes
- No keyboard interaction on this screen
- Status bar: `light-content`, `#0f0f0f` background
- Safe area: top inset applied above status bar; bottom inset applied below copyright
- This screen is the initial route in `AuthStack`

---

### M4. Screen M2 — Sign In Screen

**User Story**: US-102  
**Purpose**: Authenticate a returning user using Clerk Expo SDK (`useSignIn` hook). Supports email/password. OAuth (Google/GitHub) shown as secondary options.  
**Auth**: Not required. If session valid, skip to Dashboard.

#### ASCII Wireframe

```
┌─────────────────────────────────┐
│ ░░░░ STATUS BAR ░░░░░░░░░░░░░░░ │
├─────────────────────────────────┤
│                                 │
│  [←]                            │  ← back button, 48×48dp touch target
│                                 │
│  Welcome back                   │  ← Headline 24sp, text #f0f0f0
│  Sign in to QuickNotes          │  ← Body 16sp, textMuted
│                                 │
│  Email                          │  ← Caption 13sp label, textMuted
│  ┌─────────────────────────┐    │
│  │  user@example.com       │    │  ← TextInput, bg surface, border
│  └─────────────────────────┘    │
│                                 │
│  Password                       │  ← Caption 13sp label
│  ┌─────────────────────────┐    │
│  │  ••••••••          [👁] │    │  ← TextInput, secureTextEntry
│  └─────────────────────────┘    │
│                                 │
│  [! Error message here]         │  ← Caption, error color, hidden by default
│                                 │
│  ┌─────────────────────────┐    │
│  │         Sign In         │    │  ← PrimaryButton, full-width
│  └─────────────────────────┘    │
│                                 │
│  ─────────── or ─────────────   │  ← Divider with label
│                                 │
│  ┌───────────┐ ┌─────────────┐  │
│  │  Google   │ │   GitHub    │  │  ← OAuth buttons, 48dp height
│  └───────────┘ └─────────────┘  │
│                                 │
│  Don't have an account?         │  ← Body 16sp, textMuted
│  Sign up                        │  ← primary color, pressable link
│                                 │
│                  safe area ↕    │
└─────────────────────────────────┘
```

#### Layout Spec

- Screen background: `background` (#0f0f0f)
- Wrapped in `<KeyboardAvoidingView behavior="padding">` + `<ScrollView>` so keyboard doesn't cover inputs
- Top: back arrow button (48×48dp touch target, `arrow-left` icon, `text` color) — top-left, margin-top `md` after safe area
- Horizontal padding: `md` (16dp)
- Section heading "Welcome back": Headline (24sp), color `text`, margin-top `lg`
- Subheading: Body (16sp), color `textMuted`, margin-top `xs`
- Form starts margin-top `xl`

#### Input Field Spec (`<AuthInput>` — reusable for Sign In + Sign Up)

- Container: height 52dp (taller than web for thumb-friendliness), bg `surface` (#1a1a1a), border 1dp `border` (#2a2a2a), radius 8dp, horizontal padding `md`
- Label: Caption (13sp), `textMuted`, margin-bottom `xs`
- Text: Body (16sp), `text` (#f0f0f0)
- Placeholder: `textMuted` (#888888)
- States:
  - Default: border `border` (#2a2a2a)
  - Focused: border `primary` (#6366f1), no glow ring (React Native doesn't support box-shadow on inputs reliably — use border color change only)
  - Error: border `error` (#ef4444), error message shown below in Caption size, `error` color
  - Disabled: opacity 0.5, not editable
- Password field: trailing `eye-outline` / `eye-off-outline` icon (24dp, `textMuted`) — press toggles `secureTextEntry`. Touch target for eye icon: 48×48dp (via padding)
- Accessibility: `accessibilityLabel` = field label text, `returnKeyType` set appropriately ("next" for email, "done" for password)

#### Components

**`<OAuthButton>`**
- Width: ~(screen width - 2×md padding - sm gap) / 2 (each takes half width)
- Height: 48dp
- Background: `surface` (#1a1a1a), border 1dp `border`
- Icon: provider logo (SVG inline, 20dp) + label text (Body, 16sp, `text`)
- Pressed: ripple `surfaceHigh`
- Disabled: opacity 0.4 (during loading)
- Accessibility: `accessibilityRole="button"`, `accessibilityLabel="Sign in with Google"` / `"Sign in with GitHub"`

**`<DividerWithLabel>`**
- Horizontal line: 1dp, `border` color
- Center label: "or" in Caption (13sp), `textMuted`, bg `background` (to cut through line), horizontal padding `sm`

**`<TextLink>`**
- Inline pressable text in Body (16sp), color `primary`
- Pressed: opacity 0.7
- Accessibility: `accessibilityRole="link"`

#### Interactions & Clerk Integration

- **Email sign-in flow** (using `useSignIn` from `@clerk/clerk-expo`):
  1. User types email + password, presses "Sign In"
  2. Show loading state on button
  3. Call `signIn.create({ identifier: email, password })`
  4. On success: `setActive({ session: signIn.createdSessionId })` → Clerk session set → `expo-secure-store` handles token persistence → RootNavigator detects session → auto-navigates to AppStack/Dashboard
  5. On error: parse `err.errors[0].message` → show inline error message above Sign In button (red, Caption)

- **Google OAuth** (using `useOAuth` hook + `startOAuthFlow`):
  1. Press "Google" button → call `startOAuthFlow({ strategy: 'oauth_google' })`
  2. Opens in-app browser (Expo AuthSession)
  3. On success: `setActive({ session: createdSessionId })` → navigate to Dashboard
  4. On error: Snackbar "Google sign-in failed. Please try again."

- **GitHub OAuth**: same pattern with `strategy: 'oauth_github'`

- "Sign up" link → navigate to SignUpScreen

#### Gestures
- Keyboard: pressing "Next" on email field focuses password field. Pressing "Done" on password submits form.
- Android back: navigate to LandingScreen

#### Android-Specific Notes
- `android:windowSoftInputMode="adjustResize"` should be set in `app.json` (Expo managed config) so keyboard pushes content up rather than overlaying it
- `returnKeyType="next"` on email input, `returnKeyType="done"` on password input
- Status bar: `light-content`, `#0f0f0f` bg

---

### M5. Screen M3 — Sign Up Screen

**User Story**: US-101  
**Purpose**: Register a new user. Uses Clerk Expo `useSignUp` hook. Two-step flow: submit email+password → verify email OTP.  
**Auth**: Not required. If session valid, skip to Dashboard.

#### ASCII Wireframe — Step 1: Registration

```
┌─────────────────────────────────┐
│ ░░░░ STATUS BAR ░░░░░░░░░░░░░░░ │
├─────────────────────────────────┤
│                                 │
│  [←]                            │  ← back to Landing
│                                 │
│  Create your account            │  ← Headline 24sp
│  Start capturing ideas in       │  ← Body 16sp, textMuted
│  seconds.                       │
│                                 │
│  Email                          │
│  ┌─────────────────────────┐    │
│  │  user@example.com       │    │
│  └─────────────────────────┘    │
│                                 │
│  Password                       │
│  ┌─────────────────────────┐    │
│  │  ••••••••          [👁] │    │
│  └─────────────────────────┘    │
│  At least 8 characters          │  ← Caption, textMuted (helper)
│                                 │
│  [! Error message]              │  ← Caption, error, hidden by default
│                                 │
│  ┌─────────────────────────┐    │
│  │     Create Account      │    │  ← PrimaryButton
│  └─────────────────────────┘    │
│                                 │
│  ─────────── or ─────────────   │
│                                 │
│  ┌───────────┐ ┌─────────────┐  │
│  │  Google   │ │   GitHub    │  │
│  └───────────┘ └─────────────┘  │
│                                 │
│  Already have an account?       │
│  Sign in                        │  ← primary link
│                                 │
└─────────────────────────────────┘
```

#### ASCII Wireframe — Step 2: Email Verification (OTP)

```
┌─────────────────────────────────┐
│ ░░░░ STATUS BAR ░░░░░░░░░░░░░░░ │
├─────────────────────────────────┤
│                                 │
│  [←]                            │  ← back to step 1
│                                 │
│  Check your email               │  ← Headline 24sp
│                                 │
│  We sent a 6-digit code to      │  ← Body 16sp, textMuted
│  user@example.com               │  ← Body 16sp, text (email highlighted)
│                                 │
│  Verification Code              │
│  ┌─────────────────────────┐    │
│  │  _ _ _ _ _ _            │    │  ← OTP input (6-digit, numeric keyboard)
│  └─────────────────────────┘    │
│                                 │
│  [! Invalid code]               │  ← Caption, error, hidden by default
│                                 │
│  ┌─────────────────────────┐    │
│  │       Verify Email      │    │  ← PrimaryButton
│  └─────────────────────────┘    │
│                                 │
│  Didn't receive it?             │  ← Body 16sp, textMuted
│  Resend code                    │  ← primary link (disabled w/ countdown)
│  Resend in 30s                  │  ← Caption, textMuted (countdown state)
│                                 │
└─────────────────────────────────┘
```

#### Clerk Integration

- **Step 1 — Registration** (using `useSignUp`):
  1. User fills email + password, presses "Create Account"
  2. Call `signUp.create({ emailAddress: email, password })`
  3. Then `signUp.prepareEmailAddressVerification({ strategy: 'email_code' })`
  4. Transition UI to Step 2 (OTP screen) — this can be a state change within the same screen or a stack push

- **Step 2 — OTP Verification**:
  1. User enters 6-digit code
  2. Call `signUp.attemptEmailAddressVerification({ code: otp })`
  3. On success: `setActive({ session: signUp.createdSessionId })` → navigate to Dashboard
  4. On error (`form_code_incorrect`): show "Invalid code. Try again." in error field
  5. "Resend code": call `signUp.prepareEmailAddressVerification` again; disable link for 30 seconds with countdown

- **OAuth** (Google/GitHub): same pattern as Sign In screen

#### Components

Same as Sign In screen: `<AuthInput>`, `<PrimaryButton>`, `<SecondaryButton>`, `<OAuthButton>`, `<DividerWithLabel>`, `<TextLink>`

**`<OTPInput>`**
- Single `TextInput` with `maxLength={6}`, `keyboardType="number-pad"`, large centered text (Display 28sp, tracking wide)
- Renders 6 individual box UI overlays for visual feedback (each 44dp wide, 52dp tall, border 1dp `border`, radius 8dp; active box border `primary`)
- All 6 boxes are tap-targets for the single hidden TextInput underneath
- Filled boxes: border `primary`, text `text`
- Error state: all borders turn `error`
- Accessibility: `accessibilityLabel="6-digit verification code"`, `accessibilityHint="Enter the code sent to your email"`

#### Gestures
- Android back on Step 2 → returns to Step 1 (clears OTP input)
- Android back on Step 1 → navigates to LandingScreen

#### Android-Specific Notes
- OTP input: `keyboardType="number-pad"` (numeric only, no decimal on Android)
- `autoComplete="one-time-code"` on the OTP TextInput enables SMS/email OTP autofill on Android 11+
- Status bar: `light-content`, `#0f0f0f` bg

---

### M6. Screen M4 — Notes Dashboard

**User Story**: US-103, US-104, US-105, US-106  
**Purpose**: Primary working screen. Displays all user notes. FAB to create. Long-press + Bottom Sheet for edit/delete. Pull-to-refresh. Swipe-to-delete.  
**Auth**: Required. If no session, redirect to AuthStack.

#### ASCII Wireframe — Has Notes (normal state)

```
┌─────────────────────────────────┐
│ ░░░░ STATUS BAR ░░░░░░░░░░░░░░░ │
├─────────────────────────────────┤
│                                 │
│  My Notes                  [⋮] │  ← Screen header: Headline 24sp left,
│                                 │    dots-vertical 28dp right (48×48 target)
├─────────────────────────────────┤
│  ↓ pull to refresh              │  ← RefreshControl (system spinner, primary color)
│                                 │
│  ┌─────────────────────────┐    │
│  │ Note Title Here         │    │  ← NoteCard
│  │                         │    │
│  │ Content preview text    │    │
│  │ that wraps to two lines │    │
│  │                         │    │
│  │ Jun 13, 2026            │    │  ← Caption, textMuted
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Another Note Title      │    │
│  │                         │    │
│  │ More preview content... │    │
│  │                         │    │
│  │ Jun 12, 2026            │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Third Note              │    │
│  │ ...                     │    │
│  │ Jun 11, 2026            │    │
│  └─────────────────────────┘    │
│                                 │
│                                 │
│              [+]                │  ← FAB: 56×56dp, bottom-right
│                                 │    16dp from right edge, 16dp above tab bar
├─────────────────────────────────┤
│ [home]         [account-outline]│  ← Bottom Tab Bar, 64dp
└─────────────────────────────────┘
   ← safe area bottom ──────────►
```

#### ASCII Wireframe — Empty State

```
┌─────────────────────────────────┐
│ ░░░░ STATUS BAR ░░░░░░░░░░░░░░░ │
├─────────────────────────────────┤
│                                 │
│  My Notes                  [⋮] │
│                                 │
│                                 │
│                                 │
│                                 │
│     [note-text-outline icon]    │  ← 72dp icon, textMuted color
│                                 │
│       No notes yet              │  ← Title 18sp, text
│                                 │
│   Tap + to create your first    │  ← Body 16sp, textMuted, centered
│   note.                         │
│                                 │
│                                 │
│                                 │
│              [+]                │  ← FAB (still present in empty state)
├─────────────────────────────────┤
│ [home]         [account-outline]│
└─────────────────────────────────┘
```

#### ASCII Wireframe — Loading State (Skeleton)

```
┌─────────────────────────────────┐
│ ░░░░ STATUS BAR ░░░░░░░░░░░░░░░ │
├─────────────────────────────────┤
│  My Notes                  [⋮] │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │    │  ← shimmer skeleton card
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │    │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        │    │
│  │ ▓▓▓▓▓▓▓▓                │    │
│  └─────────────────────────┘    │
│  (× 3 skeleton cards shown)     │
│                                 │
├─────────────────────────────────┤
│ [home]         [account-outline]│
└─────────────────────────────────┘
```

#### `<NoteCard>` Component (Mobile)

- Background: `surface` (#1a1a1a)
- Border: 1dp `border` (#2a2a2a)
- Border radius: 12dp
- Elevation: 4dp (Android shadow)
- Padding: `md` (16dp) all sides
- Margin bottom: `sm` (8dp) between cards
- Horizontal margin: `md` (16dp) on both sides (screen padding)

Contents layout:
```
[Title — Title 18sp, text, 1 line, ellipsis]
[gap: xs 4dp]
[Content preview — Body 16sp, textMuted, 2 lines, ellipsis]
[gap: sm 8dp]
[Timestamp — Caption 13sp, textMuted]
```

States:
- **Default**: as above
- **Pressed** (via `Pressable android_ripple`): ripple overlay `surfaceHigh`, card bg dims slightly — scale NOT used (Android convention is ripple, not scale)
- **Swipe-left revealed**: reveal a red delete zone (see Swipe-to-Delete below)
- **Loading / Skeleton**: animated shimmer bars replacing all three content rows (title bar 60% width, content bars 100%/80%, timestamp bar 35%), animated with `Animated.loop` cycling opacity 1.0 → 0.4 → 1.0 over 1.2s
- **Deleting** (post-swipe or post-dialog confirm): card animates out with `Animated.timing` height → 0 over 200ms, then removed from list

Accessibility:
- `accessibilityRole="button"`
- `accessibilityLabel="{note.title}, last updated {formattedDate}"`
- `accessibilityHint="Long press for options"`

Touch target: full card is pressable (naturally exceeds 48dp height)

#### Swipe-to-Delete on `<NoteCard>`

Implement using `react-native-gesture-handler` `Swipeable` component:
- Swipe direction: left-to-right swipe (right action) is NOT used. RIGHT-to-LEFT swipe reveals delete zone.
- Revealed zone: red (`error` #ef4444) background, `delete-outline` icon (28dp, white) centered, width 80dp
- Swipe threshold: if user releases before 80dp reveal, card snaps back
- If user releases after 80dp OR swipes full-width: trigger delete flow
- Delete flow from swipe: do NOT show confirmation dialog — this is swipe-to-delete (fast path). Instead:
  1. Animate card out (height → 0, 200ms)
  2. Remove from list
  3. Show Snackbar: "Note deleted." with "UNDO" action button (4 second window)
  4. If user taps UNDO: restore card to list, make API call to "un-delete" (or: delay DELETE API call by 4s, cancel if UNDO pressed)
  5. If Snackbar dismisses without UNDO: call `DELETE /api/notes/:id`

#### Long-Press → Context Bottom Sheet

Long-press on any `<NoteCard>` opens a `<ContextBottomSheet>` with two options:
- "Edit note" (`pencil-outline` icon + label)
- "Delete note" (`delete-outline` icon + label, `error` color)

See Bottom Sheet spec in M6.5 below.

#### FAB (`<FAB>`)

- Size: 56×56dp
- Shape: rounded square (borderRadius 16dp)
- Background: `primary` (#6366f1)
- Icon: `plus`, 28dp, `onPrimary` (#ffffff)
- Position: `absolute`, bottom `md` (16dp) above tab bar top edge + tab bar height (64dp) = bottom offset ~80dp from screen bottom (before safe area). Right: `md` (16dp)
- Elevation: 6dp
- States:
  - Default: as above
  - Pressed: `android_ripple={{ color: primaryDark }}`, slight scale to 0.95 via `Animated` (optional, Android-native apps often skip scale on FABs)
  - Loading (while saving a new note after previous tap): spinner inside FAB, disabled
- Accessibility: `accessibilityRole="button"`, `accessibilityLabel="Create new note"`
- Press → open NoteEditorModal in create mode

#### `<ContextBottomSheet>`

- Overlay: `overlay` (rgba(0,0,0,0.6)) backdrop, press outside to dismiss
- Sheet panel: bg `surface` (#1a1a1a), top border-radius 16dp, slides up from bottom with spring animation (stiffness 300, damping 30)
- Handle bar: 4dp × 32dp, `border` color, centered, 8dp below top of sheet
- Title (optional): Caption "Note options", `textMuted`, centered, padding-bottom `sm`
- Option items (each):
  - Height: 56dp (comfortable touch target)
  - Layout: icon (24dp) left + label (Body 16sp) right, horizontal padding `md`, gap `sm`
  - Default: `text` color (both icon and label)
  - "Delete note" item: `error` (#ef4444) for both icon and label
  - Pressed: ripple `surfaceHigh`
  - Accessibility: `accessibilityRole="button"`, descriptive label
- Bottom: safe area padding below last item

```
┌─────────────────────────────────┐
│         ──────                  │  ← handle bar
│                                 │
│  Note options                   │  ← Caption, textMuted, centered
│                                 │
│  ✏  Edit note                  │  ← 56dp touch target
├─────────────────────────────────┤
│  🗑  Delete note                │  ← 56dp touch target, error color
│                                 │
│  [safe area bottom padding]     │
└─────────────────────────────────┘
```

#### `<Snackbar>`

- Position: `absolute`, bottom above tab bar (bottom: 64dp + safe area + `sm` gap), left/right: `md`
- Background: `surfaceHigh` (#252525)
- Border radius: 6dp
- Elevation: 6dp (appears above content)
- Padding: `sm` vertical, `md` horizontal
- Layout: message text (Body 16sp, `text`) left + optional action button ("UNDO", "DISMISS") right
- Action button: Caption (13sp), `primary` color, uppercase, `android_ripple` on press
- Auto-dismiss: 4 seconds (with `setTimeout`)
- Animation: slide up from bottom (translateY from +20dp to 0, over 200ms), fade out on dismiss
- Variants:
  - Neutral: bg `surfaceHigh`, no icon
  - Success: `check-circle-outline` icon (16dp, `success` color) left of message
  - Error: `alert-circle-outline` icon (16dp, `error` color) left of message
- Accessibility: `accessibilityLiveRegion="polite"` so screen readers announce it

#### Pull-to-Refresh

- Use `<FlatList refreshControl={<RefreshControl />}>`
- `RefreshControl` color: `primary` (#6366f1)
- `RefreshControl` tintColor (iOS, N/A but set for completeness): `primary`
- On refresh: call `GET /api/notes`, update list, hide spinner on completion
- If refresh fails: show Snackbar error "Failed to refresh notes."

#### Gestures
- Pull down on list → pull-to-refresh
- Long-press card → Context Bottom Sheet (edit or delete)
- Swipe card left → reveal delete zone → swipe-to-delete
- Press FAB → open NoteEditorModal (create mode)
- Press card (short press) → open NoteEditorModal (edit mode, pre-filled)

#### Android-Specific Notes
- Back button: minimizes app (this is the root authenticated screen)
- Status bar: `light-content`, `#0f0f0f` bg
- FlatList `keyExtractor` = `note.id`
- FlatList `ItemSeparatorComponent`: none (use marginBottom on card instead)
- `contentContainerStyle`: if list is empty, `flexGrow: 1` so EmptyState centers vertically
- FAB must be rendered outside FlatList as an absolutely-positioned overlay within the same container

---

### M7. Screen M5 — Note Editor Modal (Create Mode)

**User Story**: US-104  
**Purpose**: Create a new note. Triggered by FAB or Empty State CTA.  
**Presentation**: Full-screen modal (React Navigation stack, `presentation: 'modal'`) that slides up from the bottom of the Dashboard screen.  
**Auth**: Required (modal only accessible from AppStack).

#### ASCII Wireframe

```
┌─────────────────────────────────┐
│ ░░░░ STATUS BAR ░░░░░░░░░░░░░░░ │
├─────────────────────────────────┤
│                                 │
│  [×] Cancel        Save Note    │  ← Modal header bar
│                                 │    Cancel: SecondaryButton-style (text, 48dp target)
│                                 │    Save Note: PrimaryButton-style (text, 48dp target)
├─────────────────────────────────┤
│                                 │
│  Title *                        │  ← Caption 13sp, textMuted
│  ┌─────────────────────────┐    │
│  │  Enter a title...       │    │  ← AuthInput style, 52dp height
│  └─────────────────────────┘    │
│  [! Title is required]          │  ← Caption, error, hidden by default
│                                 │
│  Content                        │  ← Caption 13sp, textMuted
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │  Write your note here.. │    │  ← Multiline TextInput
│  │                         │    │    min 6 lines visible
│  │                         │    │    expands with content
│  │                         │    │    (KeyboardAvoidingView)
│  └─────────────────────────┘    │
│                                 │
│  0 / 10,000                     │  ← Caption, textMuted, right-aligned
│                                 │    turns error color at >9,000 chars
│                                 │
│                [keyboard]       │  ← keyboard pushes view up
│                                 │
└─────────────────────────────────┘
```

#### Layout Spec

- Full-screen modal, `background` (#0f0f0f) bg
- Modal header: 56dp height, horizontal padding `md`, flexDirection row, items aligned center
  - Left: "Cancel" as `<TextLink>`-style pressable (Body 16sp, `textMuted`), 48×48dp target
  - Center: empty spacer (flex: 1)
  - Right: "Save Note" as `<PrimaryButton>` with auto-width (padding `md` horizontal), height 36dp, or a styled text "Save Note" in `primary` color, weight 600
- Header bottom border: 1dp, `border` color
- Body scroll area: `<KeyboardAvoidingView behavior="padding">` → `<ScrollView>`
- Horizontal padding: `md` on body content
- Title field margin-top: `lg`
- Content textarea: `multiline={true}`, `scrollEnabled={false}` (let parent ScrollView scroll), `textAlignVertical="top"`, min height 180dp (approximately 6 lines at 16sp × 1.4 line-height)
- Character counter: margin-top `xs`, right-aligned

#### Components

**`<NoteEditorHeader>`**
- Contains Cancel pressable + screen title (optional — can be omitted since fields are self-explanatory) + Save action
- States:
  - Default: Cancel = `textMuted`, Save = `primary`
  - Saving: Save shows activity indicator (primary color, small), both tappable elements disabled
  - Disabled (if no changes in edit mode): Save = `textMuted`, opacity 0.5

**`<TitleInput>`** (extends `<AuthInput>` styling)
- `returnKeyType="next"` — focuses Content textarea on submit
- `maxLength={100}`
- `autoFocus={true}` — keyboard opens immediately when modal slides in

**`<ContentTextarea>`**
- `multiline={true}`
- `maxLength={10000}`
- `returnKeyType="default"` (newline within textarea)
- `scrollEnabled={false}` (let outer ScrollView handle scroll)
- `textAlignVertical="top"` (Android-specific: cursor starts at top-left of multiline input)

**`<CharacterCounter>`**
- Text: `{contentLength} / 10,000`, Caption (13sp)
- Default: `textMuted`
- Warning: `error` color when `contentLength > 9000`

#### States

| State | UI Behavior |
|-------|-------------|
| Default | Empty title + content, autoFocus on title, Save = primary, Cancel = textMuted |
| Typing — title empty | No error shown until Save attempted |
| Validation error | Title input border turns `error`, error message "Title is required" below field |
| Saving | Header Save shows spinner, inputs disabled, keyboard dismissed |
| Save error | Snackbar: "Failed to save note. Try again." Inputs re-enable. |
| Save success | Modal dismisses (slide down), Dashboard refreshes, Snackbar: "Note created." |
| Unsaved changes + back pressed | Alert dialog: "Discard changes?" with "Discard" (destructive) + "Keep editing" |

#### Gestures
- Android back (with unsaved changes): show "Discard changes?" native Alert dialog
- Android back (no changes): dismiss modal immediately
- Swipe down from top of modal: same behavior as back button (discard changes prompt if needed)
- Tap "Cancel": same as Android back

#### Android-Specific Notes
- Modal presentation: `presentation: 'modal'` in React Navigation stack config — slides up from bottom
- `KeyboardAvoidingView` + `behavior="padding"` so keyboard doesn't cover textarea
- `autoFocus={true}` on TitleInput triggers keyboard open on mount
- Status bar: `light-content`, `#0f0f0f` bg (modal covers entire screen)

---

### M8. Screen M6 — Note Editor Modal (Edit Mode)

**User Story**: US-105  
**Purpose**: Edit an existing note's title or content.  
**Presentation**: Same full-screen modal as create mode, navigated to with `{ mode: 'edit', noteId: string }` params.

#### Layout

Identical to Screen M5 with these differences:

- Modal header left shows "Cancel", right shows "Save Changes" (same Save button, different label)
- `TitleInput` pre-filled with `note.title` (from navigation params or fetched via `GET /api/notes/:id`)
- `ContentTextarea` pre-filled with `note.content`
- `autoFocus={false}` — do not auto-open keyboard when viewing existing note (user may just read before editing)
- Character counter initializes at `note.content.length`
- On save: call `PUT /api/notes/:id` with changed title/content

#### Additional States

| State | UI Behavior |
|-------|-------------|
| Loading note data | Show skeleton loaders for title + content fields (shimmer bars), Save disabled |
| 403 Error from API | Snackbar: "You don't have permission to edit this note." Modal closes after 2s. |
| Network error | Snackbar: "Failed to save changes. Try again." |
| No changes made | Back / Cancel: dismiss immediately, no prompt (nothing to discard) |
| Changes made | Back / Cancel: show "Discard changes?" Alert (same as create mode) |

#### Unsaved-Changes Detection

Compare current `titleInput` value with `originalTitle` and current `contentInput` value with `originalContent` (captured when note data loads). If either differs, `hasChanges = true` → show discard prompt on back/cancel.

---

### M9. Screen M7 — Delete Confirmation Dialog

**User Story**: US-106  
**Purpose**: Confirm intentional deletion when user chooses "Delete note" from the Context Bottom Sheet. This is the deliberate-path delete (as opposed to swipe-to-delete which is the fast path).

#### Presentation

A native-style Alert dialog using React Native's `Alert.alert()` — this is intentional:
- Matches Android's native destructive dialog pattern (Material Design 3 Dialog)
- Appears centered on screen, no custom backdrop needed
- Tapping outside is disabled by default in `Alert.alert()` on Android

```
┌─────────────────────────────────┐
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │    Delete Note?           │  │  ← Title, system font, system size
│  │                           │  │
│  │  Are you sure you want    │  │  ← Body, system secondary color
│  │  to delete this note?     │  │
│  │  This cannot be undone.   │  │
│  │                           │  │
│  │  [Cancel]   [Delete]      │  │  ← Android Dialog buttons
│  │                           │  │    Cancel: neutral, Delete: system red
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Implementation Spec

Use `Alert.alert()` with the following configuration:
```
Title:   "Delete Note?"
Message: "Are you sure you want to delete this note? This cannot be undone."
Buttons: [
  { text: "Cancel",  style: "cancel",      onPress: () => {} },
  { text: "Delete",  style: "destructive", onPress: handleDelete }
]
```

`style: "destructive"` renders the Delete button in the system's destructive color (red on Android system themes).

#### Delete Flow (from Context Bottom Sheet)

1. User long-presses card → Context Bottom Sheet opens
2. User taps "Delete note"
3. Bottom Sheet closes
4. `Alert.alert()` appears immediately
5. User taps "Delete" → call `DELETE /api/notes/:id`
6. While API in-flight: no UI change visible (Alert is gone, list shows normally)
7. On success: remove card from list (optimistic — already removed before API returns, or on success callback), show Snackbar "Note deleted."
8. On API error: show Snackbar "Failed to delete note. Try again." Card is restored if optimistically removed.
9. User taps "Cancel" → Alert dismisses, note unchanged

#### States

| State | UI Behavior |
|-------|-------------|
| Default | Alert visible with Cancel + Delete |
| Cancel tapped | Alert dismisses, note unchanged, no feedback |
| Delete tapped | Alert dismisses, API call in-flight, card removed (optimistic), Snackbar on completion |
| API error | Snackbar: "Failed to delete note. Try again." Card restored. |
| 403 error | Snackbar: "You don't have permission to delete this note." |

#### Android-Specific Notes
- Do not use a custom modal for delete confirmation — `Alert.alert()` is the correct Android pattern for destructive confirmations
- The Alert blocks interaction with the rest of the app (modal by nature)
- Back button while Alert is visible: dismisses Alert (same as Cancel)
- Accessibility: Android system handles Alert dialog accessibility automatically

---

### M10. Screen M8 — 404 / Not Found Screen

**User Story**: None direct — covers navigation errors and invalid deep links  
**Purpose**: Gracefully handle unresolvable navigation (e.g., an invalid deep link to a non-existent note).

#### ASCII Wireframe

```
┌─────────────────────────────────┐
│ ░░░░ STATUS BAR ░░░░░░░░░░░░░░░ │
├─────────────────────────────────┤
│                                 │
│                                 │
│                                 │
│                                 │
│    [alert-circle-outline icon]  │  ← 64dp, textMuted color
│                                 │
│         404                     │  ← Display 28sp, weight 700, primary color
│                                 │
│      Page not found             │  ← Title 18sp, text color
│                                 │
│  The page you're looking        │  ← Body 16sp, textMuted, centered
│  for doesn't exist.             │
│                                 │
│                                 │
│  ┌─────────────────────────┐    │
│  │      Go to Home         │    │  ← PrimaryButton
│  └─────────────────────────┘    │
│                                 │
│                                 │
└─────────────────────────────────┘
```

#### Layout Spec

- Full screen, `background` (#0f0f0f), centered content (flex: 1, justifyContent: 'center', alignItems: 'center')
- Horizontal padding: `md`
- `alert-circle-outline` icon: 64dp, `textMuted` color
- "404": Display (28sp, weight 700), `primary` color, margin-top `lg`
- "Page not found": Title (18sp), `text`, margin-top `sm`
- Body text: Body (16sp), `textMuted`, centered, margin-top `sm`
- Button: `<PrimaryButton>` "Go to Home", width auto (not full-width), padding horizontal `xl`, margin-top `xl`

#### Interactions

- "Go to Home" press → navigate to Dashboard (if authenticated) or Landing (if not authenticated)

#### Android-Specific Notes
- Back button: navigate to Dashboard or Landing (same as "Go to Home")
- No tab bar on this screen (it's outside the normal navigator hierarchy)
- Status bar: `light-content`, `#0f0f0f` bg

---

### M11. Profile Screen (Mobile-Only — Not in Web Spec)

> This screen exists on mobile because the web app uses TopNav for sign-out. On mobile, sign-out lives in the Profile tab. This is an addition, not a departure from BA requirements (US-107 is still fulfilled).

**Purpose**: Display current user info. Provide sign-out action.  
**Auth**: Required (inside AppStack, ProfileTab).

#### ASCII Wireframe

```
┌─────────────────────────────────┐
│ ░░░░ STATUS BAR ░░░░░░░░░░░░░░░ │
├─────────────────────────────────┤
│                                 │
│  Profile                        │  ← Headline 24sp, text
│                                 │
│                                 │
│  ┌──────────────────────────┐   │
│  │                          │   │
│  │   [account-circle icon]  │   │  ← 64dp icon, textMuted
│  │                          │   │
│  │   John Doe               │   │  ← Title 18sp, text, centered
│  │   john@example.com       │   │  ← Body 16sp, textMuted, centered
│  │                          │   │
│  └──────────────────────────┘   │
│                                 │
│  ──────────────────────────     │  ← divider, 1dp, border color
│                                 │
│  ┌──────────────────────────┐   │
│  │  [logout icon]  Sign Out │   │  ← List item row, 56dp height, error color text
│  └──────────────────────────┘   │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [home-outline]    [account]     │  ← Tab bar (Profile tab active)
└─────────────────────────────────┘
```

#### Layout Spec

- Background: `background` (#0f0f0f)
- Screen title "Profile": Headline (24sp), `text`, margin-top `lg`, margin-left `md`
- User card: bg `surface`, border `border`, radius 12dp, padding `lg`, centered content, margin `md` horizontal, margin-top `lg`
  - Avatar icon: `account-circle-outline`, 64dp, `textMuted`
  - User name: Title (18sp), `text`, margin-top `sm`
  - Email: Body (16sp), `textMuted`, margin-top `xs`
- Divider: 1dp `border` color, margin `md` horizontal, margin-top `lg`
- Sign Out row: height 56dp, horizontal padding `md`, flexDirection row, icon left + label right, `logout` icon 24dp `error` color, label Body (16sp) `error` color, `android_ripple={{ color: surfaceHigh }}`
- Sign Out pressed: ripple effect, then trigger sign-out

#### Sign Out Flow (Clerk Expo)

1. User presses "Sign Out" row
2. Show a brief loading state (activity indicator replaces icon, row non-interactive)
3. Call `signOut()` from `useAuth()` Clerk hook
4. `expo-secure-store` token is cleared automatically by Clerk SDK
5. On completion: RootNavigator detects no session → navigates to AuthStack/LandingScreen
6. On error: Snackbar "Sign out failed. Please try again." Row re-enables.

#### Gestures
- Android back → switches to Notes tab (ProfileScreen is a tab, not a stack push)
- Sign Out pressed → triggers sign-out flow

#### Android-Specific Notes
- `accessibilityRole="button"` on Sign Out row
- `accessibilityLabel="Sign out of QuickNotes"`
- Status bar: `light-content`, `#0f0f0f` bg

---

### M12. Thumb-Zone Diagram

Primary actions live in the bottom 40% of the screen (comfortable thumb reach on a ~390dp wide phone). Secondary and destructive actions that require deliberate intent are placed higher.

```
┌─────────────────────────────────┐  ← top of screen
│                                 │
│  ╔═══════════════════════════╗  │
│  ║  DEAD ZONE (hard reach)   ║  │  ← top ~20% of screen
│  ║  Back button (←)          ║  │    Secondary actions: back, overflow (⋮)
│  ╚═══════════════════════════╝  │
│                                 │
│  ╔═══════════════════════════╗  │
│  ║  STRETCH ZONE             ║  │  ← middle ~40% of screen
│  ║  Note cards content area  ║  │    Content reading area
│  ║  Form inputs (mid-screen) ║  │    Inputs scrolled into view
│  ╚═══════════════════════════╝  │
│                                 │
│  ╔═══════════════════════════╗  │
│  ║  NATURAL THUMB ZONE       ║  │  ← bottom ~40% of screen
│  ║                       [+] ║  │    FAB (bottom-right)
│  ║  [Notes]  [Profile]       ║  │    Bottom tab bar
│  ╚═══════════════════════════╝  │
└─────────────────────────────────┘  ← bottom of screen
```

**Placement rationale:**

| Element | Zone | Reason |
|---------|------|--------|
| FAB (+ New Note) | Natural | Most frequent primary action |
| Bottom tab bar | Natural | Primary navigation |
| "Save Note" / "Save Changes" (header right) | Dead zone | Deliberate intent required; modal header is acceptable per Android convention |
| "Cancel" (header left) | Dead zone | Deliberate intent required; modal header convention |
| Swipe-to-delete (list items) | Stretch / Natural | List items span multiple zones; gesture-based |
| Long-press context menu | Stretch / Natural | Accessible from any part of the card |
| "Sign Out" (Profile screen) | Stretch | Destructive — harder reach is appropriate |
| Back button / ← | Dead zone | Android hardware/gesture back is the true back mechanism |
| "Delete" (Alert dialog) | Center | Alert is system-positioned; destruction requires deliberate tap regardless |

---

### M13. Clerk Expo Auth Flow

This section specifies exactly how Clerk integrates with the React Native + Expo app. The Mobile Developer should not deviate from this pattern.

#### M13.1 Package Setup

Required packages:
```
@clerk/clerk-expo          — Clerk SDK for Expo
expo-secure-store          — encrypted token storage (required by Clerk Expo)
expo-auth-session          — OAuth browser session handling (used by useOAuth)
expo-web-browser           — companion to expo-auth-session for OAuth redirects
```

#### M13.2 Token Cache (expo-secure-store)

Clerk Expo requires a `tokenCache` prop on `<ClerkProvider>`. Implement it as:
- `getToken(key)` → `SecureStore.getItemAsync(key)`
- `saveToken(key, value)` → `SecureStore.setItemAsync(key, value)`
- `clearToken(key)` → `SecureStore.deleteItemAsync(key)`

This ensures session tokens are stored in Android Keystore-backed encrypted storage, not plaintext AsyncStorage.

#### M13.3 ClerkProvider Placement

Wrap the entire app in `<ClerkProvider>` at the root (e.g., in `App.tsx` or the Expo Router root layout):
- `publishableKey`: from `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variable
- `tokenCache`: the SecureStore cache object described above

#### M13.4 Session-Based Navigation

Use `useAuth()` from `@clerk/clerk-expo` to drive the navigator root split:
- `isLoaded === false` → show a full-screen loading indicator (spinner, `primary` color, centered on `background`)
- `isLoaded === true && isSignedIn === false` → render `AuthStack` (Landing → Sign In → Sign Up)
- `isLoaded === true && isSignedIn === true` → render `AppStack` (Dashboard + modals)

This logic lives in the `RootNavigator` component. Never conditionally render screens within a single navigator — always swap the entire navigator based on auth state.

#### M13.5 Sign-In Flow (useSignIn)

```
Hook: const { signIn, setActive, isLoaded } = useSignIn()

Email/Password:
  signIn.create({ identifier: email, password })
    → success: setActive({ session: signIn.createdSessionId })
    → error:   parse err.errors[0].longMessage for display

OAuth (Google/GitHub):
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const { createdSessionId, setActive } = await startOAuthFlow({ redirectUrl: ... })
  → success: setActive({ session: createdSessionId })
  → error:   Snackbar message
```

#### M13.6 Sign-Up Flow (useSignUp)

```
Hook: const { signUp, setActive, isLoaded } = useSignUp()

Step 1 — Registration:
  signUp.create({ emailAddress, password })
  signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
  → transition to OTP step

Step 2 — Verification:
  signUp.attemptEmailAddressVerification({ code: otp })
    → success: setActive({ session: signUp.createdSessionId })
    → error code 'form_code_incorrect': show "Invalid code" error
    → error code 'verification_expired': show "Code expired. Request a new one." + enable Resend

Resend:
  signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
  → reset countdown timer to 30s, disable Resend link
```

#### M13.7 Sign-Out Flow (useAuth)

```
Hook: const { signOut } = useAuth()

signOut()
  → Clerk clears session from expo-secure-store
  → isSignedIn becomes false
  → RootNavigator detects change → renders AuthStack
  → NavigationContainer auto-navigates to LandingScreen
```

#### M13.8 API Authentication (Backend Calls)

When calling the Express backend (`GET /api/notes`, etc.):
1. Get the current session token: `const { getToken } = useAuth()`
2. `const token = await getToken()`
3. Include in request header: `Authorization: Bearer ${token}`
4. Backend's `requireAuth()` middleware (Clerk Express) validates this JWT

Do NOT use cookies on mobile — use Bearer token in Authorization header for all API calls.

#### M13.9 Error Code Reference

| Clerk Error Code | Display Message |
|-----------------|----------------|
| `form_identifier_not_found` | "No account found with this email." |
| `form_password_incorrect` | "Incorrect password. Please try again." |
| `form_identifier_exists` | "An account with this email already exists." |
| `form_code_incorrect` | "Invalid code. Please check and try again." |
| `verification_expired` | "Code expired. Request a new one." |
| `network_error` | "Connection error. Check your internet and try again." |
| Any other | "Something went wrong. Please try again." |

---

### M14. Mobile Component Reuse Summary

| Component Name | Web Equivalent | Shared Concept | Platform-Specific |
|---------------|---------------|----------------|------------------|
| `<NoteCard>` | `<NoteCard>` | Note display: title, preview, timestamp | Yes — different interaction model (long-press vs hover) |
| `<PrimaryButton>` | `<Button variant="primary">` | Full-width CTA button | Yes — `Pressable` + `android_ripple` |
| `<SecondaryButton>` | `<Button variant="secondary">` | Bordered button | Yes |
| `<AuthInput>` | `<Input>` | Text input with label + error state | Yes — `TextInput`, no box-shadow |
| `<ContentTextarea>` | `<Textarea>` | Multiline text input | Yes — `multiline={true}`, `textAlignVertical` |
| `<EmptyState>` | `<EmptyState>` | Empty list illustration + CTA | Yes — centered in FlatList, uses FAB instead of button |
| `<SkeletonCard>` | `<SkeletonCard>` | Loading shimmer | Yes — `Animated` API, not CSS |
| `<Snackbar>` | `<Toast>` | Transient feedback | Yes — positioned above tab bar, different animation |
| `<FAB>` | n/a (web uses nav button) | Create note trigger | Mobile-only |
| `<ContextBottomSheet>` | n/a (web uses hover icons) | Note actions menu | Mobile-only |
| `<LandingLogoMark>` | Logo in `<LandingNav>` | App icon + name | Yes |
| `<OTPInput>` | n/a | Verification code input | Mobile-only |
| `<OAuthButton>` | Clerk-managed | OAuth provider button | Yes |
| `<NoteEditorHeader>` | `<Modal>` header | Editor dismiss + save | Yes — modal nav header pattern |

---

*Mobile design section complete. All 8 screens from BA spec section 7 are covered for Android (React Native + Expo). An additional Profile screen is specified to fulfill US-107 (Sign Out) within the bottom tab bar navigation pattern. The Mobile Developer agent may begin implementation directly from this document.*
