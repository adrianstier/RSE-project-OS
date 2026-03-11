# RSE Tracker UX/UI Redesign — Design Spec

**Date:** 2026-03-11
**Goal:** Modern SaaS overhaul + usability-first rework. Elevate the app toward Notion-level quality while improving daily workflows for the 4-person team.
**Approach:** Full rebuild with shadcn/ui component library. Parallel agent swarm execution.

---

## 1. Design System Foundation

### Component Library
- **shadcn/ui** (built on Radix primitives), installed via CLI
- Provides accessible, keyboard-navigable components out of the box
- Components installed to `src/components/ui/`
- **shadcn/ui init config:** style "default", RSC false (Vite/React, not Next.js), Tailwind CSS at `src/index.css`, components alias `@/components`, utils alias `@/lib/utils`

### Dependencies to Install
```bash
# shadcn/ui peer dependencies (install before running shadcn CLI)
npm install clsx tailwind-merge class-variance-authority tailwindcss-animate sonner cmdk
# Note: @radix-ui/* packages are auto-installed by the shadcn CLI per component
```

### Vite Configuration
Add `@/` path alias to `vite.config.ts`:
```ts
resolve: { alias: { "@": path.resolve(__dirname, "./src") } }
```

### Color System (Notion-inspired, mapped to shadcn/ui CSS variables)

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `#ffffff` | Page background |
| `--foreground` | `#1a1a1a` | Primary text |
| `--muted` | `#f5f5f5` | Secondary surfaces, hover states |
| `--muted-foreground` | `#737373` | Secondary text |
| `--card` | `#ffffff` | Card background |
| `--border` | `#e5e5e5` | Borders, dividers |
| `--ring` | `#1a1a1a` | Focus rings |
| `--primary` | `#1a1a1a` | Primary buttons, active states |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--accent` | `#f5f5f5` | Hover backgrounds |
| `--accent-foreground` | `#1a1a1a` | Text on accent |
| `--destructive` | `#dc2626` | Delete, error |
| `--destructive-foreground` | `#ffffff` | Text on destructive |

### Project Colors (preserved)
- Mote Marine: `#d4507a` (pink)
- Fundemar: `#2d8ab8` (teal)

### Action Item Status Colors (soft pastels with strong text)
- `todo`: `bg-neutral-100 text-neutral-600`
- `in_progress`: `bg-blue-50 text-blue-700`
- `done`: `bg-emerald-50 text-emerald-700`
- `blocked`: `bg-red-50 text-red-700`

### Scenario Status Colors
- `planning`: `bg-neutral-100 text-neutral-600`
- `active`: `bg-blue-50 text-blue-700`
- `completed`: `bg-emerald-50 text-emerald-700`
- `on_hold`: `bg-amber-50 text-amber-700`

### Priority Colors
- `low`: `bg-neutral-100 text-neutral-600`
- `medium`: `bg-amber-50 text-amber-700`
- `high`: `bg-orange-50 text-orange-700`
- `critical`: `bg-red-50 text-red-700`

### Data Status Colors
- `data-ready`: `bg-emerald-50 text-emerald-700`
- `data-partial`: `bg-amber-50 text-amber-700`
- `data-pending`: `bg-neutral-100 text-neutral-600`

### Event Type Colors
- `milestone`: `#7c3aed` (purple) — badge: `bg-purple-50 text-purple-700`
- `deadline`: `#dc2626` (red) — badge: `bg-red-50 text-red-700`
- `meeting`: `#3b82f6` (blue) — badge: `bg-blue-50 text-blue-700`
- `deliverable`: `#f59e0b` (amber) — badge: `bg-amber-50 text-amber-700`

### Typography
- **Font:** Inter (replaces DM Sans / Space Grotesk)
- Remove old font imports from `index.html`, add Inter via Google Fonts or local
- Update `tailwind.config.js` `fontFamily` to use Inter
- **Scale:** 13px body, 12px secondary, 20px page titles, 14px card titles
- **Weights:** 400 body, 500 labels/nav, 600 headings

### Spacing
- 4px grid throughout
- Cards: `p-4` or `p-5`
- Page sections: `space-y-6`
- Generous whitespace — the Notion feel comes from letting content breathe

### Border Radius
- `0.5rem` (8px) default — rounded but not bubbly

---

## 2. Layout & Navigation

### Sidebar (Notion-style)
- White background, no colored header block
- Logo + "RSE Tracker" text at top (simple, not branded block)
- Nav items: icon + label, subtle `bg-accent` on hover, `font-medium` on active with subtle bg change (no colored dots or tinted backgrounds)
- User avatar + name at bottom with popover menu (sign out, profile link)
- Collapsible to icon-only on desktop (toggle button)
- Slide-out drawer on mobile with backdrop overlay

### Header (minimal top bar)
- Breadcrumb on the left (page context)
- Command palette trigger (Cmd+K) on the right
- No sticky badges or decorative elements

### Command Palette (Cmd+K)
- shadcn/ui `CommandDialog` built on cmdk
- Searches across scenarios, action items, timeline events, and navigation
- Recent items shown by default when opened
- Keyboard-first: arrow keys navigate, enter selects
- Grouped results by type (Scenarios, Action Items, Events, Pages)
- Absorbs existing keyboard shortcuts: `g+d` (dashboard), `g+s` (scenarios), `g+a` (action items), `g+t` (timeline), `n` (new item) — these become command palette actions
- Global `Cmd+K` and `?` (help) shortcuts registered at the Layout level

### Page Layout Pattern (consistent across all pages)
- Page title (20px, font-semibold) + optional count + primary action button (top right)
- Filter bar below title (using shadcn `Select`, `DropdownMenu`, toggle buttons)
- Content area below filters

---

## 3. Page Designs

### Dashboard
- **Welcome section removed** — straight to content (remove `WelcomeHeader.tsx`)
- **4 stat cards** in a row: Scenarios (count + active), Action Items (count + in progress), Overdue (red number), Upcoming (next 7 days). Clean numbers with context line, no colored icon backgrounds.
- **My Action Items** — interactive checklist with checkboxes, owner initials, due dates, overdue items in red. "View all →" link.
- **Upcoming Events** — compact list with thin color accent bar on left (event type color). Date + type shown. "View all →" link.
- **Project Progress** — Mote and Fundemar cards with progress bars, scenario/item counts, overdue count.

### Scenarios
- **Layout: Table** (not card grid) — higher information density, scannable columns
- **Columns:** Scenario (title + description), Project (dot + name), Status (badge), Data (badge), Items (count)
- **Priority:** visible in the detail Sheet, not as a table column (keeps the table clean)
- **Sortable** column headers
- **Filter bar:** project tabs (All / Mote / Fundemar) + status dropdown + sort dropdown
- **Click row → slide-out Sheet** from right (not centered modal) for detail view
- **Sheet contains:** full description, priority badge, metadata, linked action items list, edit/delete actions

### Action Items
- **Board/List toggle** — users choose between kanban and flat list views
- **Kanban columns:** Todo, In Progress, Done, Blocked — each with colored dot header and count
- **Cards:** title, owner initials avatar, project dot + name, due date. Minimal info on face.
- **Blocked items:** red-tinted card background (`bg-red-50 border-red-200`) with blocker reason visible inline
- **Overdue dates** shown in red with warning indicator
- **Drag-and-drop** between columns (keep @dnd-kit at current versions: `@dnd-kit/core@^6.3.1`, `@dnd-kit/sortable@^10.0.0`)
- **Filter bar:** owner dropdown, project dropdown, "My Items" toggle
- **Click card → slide-out Sheet** for detail/edit
- **Inline status change:** click status badge on card to get dropdown (no need to open detail)
- **List view:** table layout similar to Scenarios page, sortable columns

### Timeline
- **Vertical timeline** with thin gray line and small colored dots (not large icon circles)
- **Month headers:** uppercase, letter-spaced, minimal, with small circle node on the line
- **Event cards:** border-left accent in event type color, title + date + optional description, type badge + project indicator
- **Past events:** 50% opacity, gray dots, desaturated badges
- **Upcoming events:** full opacity, colored dots with ring shadow
- **Filter bar:** type dropdown, project dropdown, "Show past events" checkbox
- **Click card → inline edit** or slide-out sheet

### Profile
- Keep current layout (it's simple and works)
- Restyle form inputs to use shadcn `Input`, `Label`, `Button`
- Avatar preview with shadcn `Avatar` component

### Login
- Keep split-screen layout
- Left side: restyle with new color system (clean white/neutral instead of dark navy)
- Right side: shadcn `Card`, `Button`, `Input` components
- Google OAuth button restyled to match

---

## 4. Interaction Patterns

### Detail Panels
- shadcn `Sheet` (slide from right) instead of centered `Modal` for all detail/edit views
- Page stays visible underneath — less context loss
- Used for: scenario detail, action item detail, timeline event detail, create/edit forms

### Inline Status Changes
- Click any status badge to get a `DropdownMenu` with status options
- Change status without opening the detail panel

### Toast Notifications
- shadcn `Sonner` (toast library)
- White background, thin left border with status color
- Auto-dismiss, minimal styling
- Foundation agent replaces `<ToastProvider>` in `src/App.tsx` with Sonner's `<Toaster />` component

### Loading States
- shadcn `Skeleton` components replace custom skeleton loaders
- Consistent pulse animation across all pages

### Empty States
- Simplified: icon + one sentence + CTA button
- No coral illustration — clean and functional
- Consistent across all pages

### Delete Confirmation
- shadcn `AlertDialog` — accessible, focus-trapped
- Warning icon, description, cancel + delete buttons

### Forms
- shadcn `Input`, `Textarea`, `Select`, `Label`
- Consistent validation pattern with inline error messages
- Team member dropdown for owner field (preserved)

### Responsive Design
- Same breakpoint strategy: mobile sidebar → drawer, grids collapse to single column
- Notion-style spacing breathes better at all screen sizes
- Touch targets: min 44px on mobile

---

## 5. shadcn/ui Components to Install

```
button card input label select textarea
separator avatar badge skeleton
dialog sheet alert-dialog dropdown-menu
command popover tooltip sonner
table tabs checkbox
```

---

## 6. Agent Swarm Architecture

### Execution Order

```
Phase 1 (sequential):
  └─ Foundation Agent
       Install shadcn/ui + dependencies, configure CSS tokens/typography,
       set up components/ui/, update tailwind config + vite config,
       create shared utilities (cn helper), rebuild StatusBadge + EmptyState,
       swap fonts (DM Sans/Space Grotesk → Inter),
       replace ToastProvider with Sonner <Toaster /> in App.tsx

Phase 2 (parallel — all run simultaneously):
  ├─ Layout/Nav Agent
  │    Sidebar, header, command palette (absorbs keyboard shortcuts),
  │    breadcrumbs, page shell
  ├─ Dashboard Agent
  │    Stat cards, my items list, events list, project progress
  ├─ Scenarios Agent
  │    Table view, filter bar, detail sheet, create/edit form
  ├─ Action Items Agent
  │    Kanban board, list view toggle, cards, filter bar, detail sheet
  └─ Timeline Agent
       Timeline list, event cards, month headers, filter bar

Phase 3 (sequential):
  └─ Cleanup Agent
       Remove old components, verify no stale references in index.css.
       Final consistency pass across all pages.
       Verify: npm run build passes, npm run lint passes.
```

### Agent Boundaries
- Each page agent owns its page component and any page-specific sub-components
- Shared components (StatusBadge, EmptyState, etc.) are rebuilt by the Foundation agent
- Layout agent owns Layout.tsx, sidebar, header, and command palette
- All agents use the shadcn/ui components installed by Foundation
- Foundation agent performs the full replacement of `src/index.css` — Cleanup agent only verifies no stale references remain (read-only check on index.css)

### Files Affected Per Agent

**Foundation:**
- `package.json` (new dependencies)
- `vite.config.ts` (add `@/` path alias)
- `tailwind.config.js` (new theme, Inter font, tailwindcss-animate plugin)
- `src/index.css` (full replacement with shadcn/ui globals + custom tokens)
- `index.html` (swap font imports: DM Sans/Space Grotesk → Inter)
- `src/lib/utils.ts` (cn helper)
- `components.json` (shadcn/ui config)
- `src/components/ui/*` (all shadcn components)
- `src/components/StatusBadge.tsx` (rebuilt with new badge system — full status mapping for all types)
- `src/components/EmptyState.tsx` (simplified)
- `src/App.tsx` (replace `<ToastProvider>` with Sonner `<Toaster />`)

**Layout/Nav:**
- `src/components/Layout.tsx` (full rewrite)
- `src/components/Sidebar.tsx` (new)
- `src/components/CommandPalette.tsx` (new, replaces GlobalSearch + KeyboardShortcuts)
- `src/components/Breadcrumbs.tsx` (restyled)

**Dashboard:**
- `src/pages/Dashboard.tsx` (full rewrite)
- `src/components/StatCard.tsx` (simplified)

**Scenarios:**
- `src/pages/Scenarios.tsx` (full rewrite — cards → table)
- `src/components/forms/ScenarioForm.tsx` (restyled with shadcn inputs)
- `src/components/ScenarioSheet.tsx` (new, replaces modal)

**Action Items:**
- `src/pages/ActionItems.tsx` (full rewrite — refined kanban + list toggle)
- `src/components/forms/ActionItemForm.tsx` (restyled)
- `src/components/ActionItemSheet.tsx` (new, replaces modal)

**Timeline:**
- `src/pages/Timeline.tsx` (full rewrite — simplified nodes + card events)
- `src/components/forms/TimelineEventForm.tsx` (restyled)

**Cleanup — Components to Remove:**
- `src/components/Modal.tsx` (replaced by shadcn Sheet)
- `src/components/Toast.tsx` (replaced by Sonner)
- `src/components/GlobalSearch.tsx` (replaced by CommandPalette)
- `src/components/Card.tsx` (replaced by shadcn Card)
- `src/components/Skeleton.tsx` (replaced by shadcn Skeleton)
- `src/components/Tooltip.tsx` (replaced by shadcn Tooltip)
- `src/components/DeleteConfirm.tsx` (replaced by shadcn AlertDialog)
- `src/components/KeyboardShortcuts.tsx` (absorbed into CommandPalette)
- `src/components/WelcomeHeader.tsx` (removed, dashboard goes straight to content)
- `src/components/FloatingActionButton.tsx` (removed, primary actions are in page headers)
- `src/components/SuccessAnimation.tsx` (removed, toast handles success feedback)

**Cleanup — Components to Preserve Unchanged:**
- `src/components/ProtectedRoute.tsx` (auth, not visual)
- `src/components/CharacterCount.tsx` (keep if used in forms, remove if not)
- `src/components/ProgressIndicator.tsx` (evaluate: if only used in Dashboard, the Dashboard agent rebuilds it inline; if shared, keep)

**Cleanup — Verify:**
- `npm run build` passes
- `npm run lint` passes
- No unused imports across all files
- No references to removed components

---

## 7. What's Preserved

- All Supabase data hooks in `src/hooks/useSupabase.ts` (exports `useScenarios`, `useActionItems`, `useTimelineEvents`, etc.) — unchanged
- `src/contexts/AuthContext.tsx` — unchanged
- React Query data layer — unchanged
- Routing structure in `src/App.tsx` — unchanged (only ToastProvider swap)
- `@dnd-kit` for kanban drag-and-drop — unchanged (keep current versions)
- Real-time updates via `useRealtimeAll()` — unchanged
- All TypeScript types in `src/types/` — unchanged
- All business logic — unchanged

### React 19 Compatibility Note
The project uses React 19 (`react@^19.2.4`). The Foundation agent should verify that the latest shadcn/ui CLI and Radix primitives are compatible with React 19 during installation. If any component has issues, pin to a compatible version.

This is a **visual and component layer rebuild only**. The data layer, auth, and business logic remain untouched.
