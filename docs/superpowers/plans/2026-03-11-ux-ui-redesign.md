# RSE Tracker UX/UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the RSE Tracker UI with shadcn/ui components and a Notion-inspired design system, improving usability across all 6 pages while preserving the entire data layer unchanged.

**Architecture:** Full visual/component layer rebuild. Phase 1 installs shadcn/ui and establishes the design foundation. Phase 2 dispatches parallel agents — one per page/layout — working from the shared foundation. Phase 3 cleans up dead code and verifies the build.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix primitives), cmdk, Sonner, @dnd-kit

**Spec:** `docs/superpowers/specs/2026-03-11-ux-ui-redesign-design.md`

---

## Chunk 1: Foundation

### Task 1: Install shadcn/ui Dependencies and Configure Tooling

This task sets up the entire design system foundation that all other tasks depend on. No other task can start until this completes.

**Files:**
- Modify: `package.json` (add dependencies)
- Modify: `vite.config.ts` (add path alias)
- Modify: `tailwind.config.js` (new theme)
- Modify: `index.html` (swap fonts)
- Modify: `src/index.css` (full replacement)
- Create: `src/lib/utils.ts` (cn helper)
- Create: `components.json` (shadcn/ui config)
- Modify: `src/App.tsx` (swap ToastProvider for Sonner)

- [ ] **Step 1: Install peer dependencies**

```bash
npm install clsx tailwind-merge class-variance-authority tailwindcss-animate sonner cmdk
```

- [ ] **Step 2: Add path alias to vite.config.ts**

Current file at `/Users/adrianstier/RSE-project-OS/vite.config.ts` (16 lines). Add the resolve.alias config:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
})
```

- [ ] **Step 3: Create cn utility**

Create `/Users/adrianstier/RSE-project-OS/src/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Create components.json**

Create `/Users/adrianstier/RSE-project-OS/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

- [ ] **Step 5: Install shadcn/ui components**

Run each command. These will create files in `src/components/ui/` and install required `@radix-ui/*` packages automatically. If any component has React 19 compatibility issues, install with `--legacy-peer-deps`.

```bash
npx shadcn@latest add button card input label select textarea separator avatar badge skeleton dialog sheet alert-dialog dropdown-menu command popover tooltip sonner table tabs checkbox
```

- [ ] **Step 6: Replace tailwind.config.js**

Full replacement of `/Users/adrianstier/RSE-project-OS/tailwind.config.js` (currently 104 lines):

```js
import tailwindcssAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Project colors
        mote: {
          400: "#d4507a",
          50: "#fdf2f8",
        },
        fundemar: {
          400: "#2d8ab8",
          50: "#eff6ff",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
```

- [ ] **Step 7: Replace index.html fonts**

Replace font imports in `/Users/adrianstier/RSE-project-OS/index.html` (21 lines). Swap DM Sans + Space Grotesk for Inter:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/coral.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="description" content="RSE Tracker - Restoration Strategy Evaluation for Coral Conservation" />
    <title>RSE Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Replace src/index.css**

Full replacement of `/Users/adrianstier/RSE-project-OS/src/index.css` (currently 376 lines). This is the shadcn/ui base CSS with our custom tokens:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 10%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 10%;
    --primary: 0 0% 10%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 10%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;
    --accent: 0 0% 96%;
    --accent-foreground: 0 0% 10%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 0 0% 10%;
    --radius: 0.5rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-size: 13px;
    line-height: 1.5;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground));
  }

  /* Selection */
  ::selection {
    background: hsl(var(--primary) / 0.1);
    color: hsl(var(--foreground));
  }
}

@layer utilities {
  .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
  .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
  .line-clamp-3 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
}

/* Skip link for accessibility */
.skip-link {
  @apply absolute -translate-y-full bg-primary text-primary-foreground px-4 py-2 z-50 focus:translate-y-0 transition-transform;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print */
@media print {
  .no-print { display: none !important; }
  body { background: white; color: black; }
}
```

- [ ] **Step 9: Add Sonner Toaster alongside existing ToastProvider in App.tsx**

In `/Users/adrianstier/RSE-project-OS/src/App.tsx` (87 lines):

1. Add import: `import { Toaster } from 'sonner';`
2. Add `<Toaster />` as a sibling inside `<BrowserRouter>` (do NOT remove `<ToastProvider>` yet — it will be removed in Task 11 after all pages have migrated their `useToast()` calls to `toast()` from Sonner)
3. Also update the `PageLoader` component: replace `className="loading-spinner"` with `className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-primary"` and replace `text-text-secondary` with `text-muted-foreground`

The Toaster renders as a portal and doesn't need to wrap anything. Both toast systems will coexist temporarily.

- [ ] **Step 10: Verify build passes**

```bash
cd /Users/adrianstier/RSE-project-OS && npm run build
```

Expected: Build will have errors because existing components reference old CSS classes and removed imports. This is expected — the page agents will fix their own pages. The goal here is that the foundation files themselves are syntactically valid.

If there are import errors for ToastProvider in other files, note them but don't fix — each page agent will update their own imports.

- [ ] **Step 11: Commit foundation**

```bash
git add components.json src/lib/utils.ts src/components/ui/ package.json package-lock.json vite.config.ts tailwind.config.js index.html src/index.css src/App.tsx
git commit -m "feat: install shadcn/ui foundation with Notion-inspired design tokens"
```

---

### Task 2: Rebuild StatusBadge Component

**Files:**
- Rewrite: `src/components/StatusBadge.tsx` (currently 215 lines)

- [ ] **Step 1: Rewrite StatusBadge.tsx**

Replace `/Users/adrianstier/RSE-project-OS/src/components/StatusBadge.tsx` with a new implementation using shadcn/ui Badge and the full status color mapping from the spec. Must handle all types: ScenarioStatus, ActionItemStatus, ScenarioPriority, DataStatus, TimelineEventType, Project.

```tsx
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// -- Status color mappings --

const scenarioStatusStyles: Record<string, string> = {
  planning: "bg-neutral-100 text-neutral-600 border-transparent",
  active: "bg-blue-50 text-blue-700 border-transparent",
  completed: "bg-emerald-50 text-emerald-700 border-transparent",
  on_hold: "bg-amber-50 text-amber-700 border-transparent",
}

const actionItemStatusStyles: Record<string, string> = {
  todo: "bg-neutral-100 text-neutral-600 border-transparent",
  in_progress: "bg-blue-50 text-blue-700 border-transparent",
  done: "bg-emerald-50 text-emerald-700 border-transparent",
  blocked: "bg-red-50 text-red-700 border-transparent",
}

const priorityStyles: Record<string, string> = {
  low: "bg-neutral-100 text-neutral-600 border-transparent",
  medium: "bg-amber-50 text-amber-700 border-transparent",
  high: "bg-orange-50 text-orange-700 border-transparent",
  critical: "bg-red-50 text-red-700 border-transparent",
}

const dataStatusStyles: Record<string, string> = {
  "data-ready": "bg-emerald-50 text-emerald-700 border-transparent",
  "data-partial": "bg-amber-50 text-amber-700 border-transparent",
  "data-pending": "bg-neutral-100 text-neutral-600 border-transparent",
}

const eventTypeStyles: Record<string, string> = {
  milestone: "bg-purple-50 text-purple-700 border-transparent",
  deadline: "bg-red-50 text-red-700 border-transparent",
  meeting: "bg-blue-50 text-blue-700 border-transparent",
  deliverable: "bg-amber-50 text-amber-700 border-transparent",
}

const projectStyles: Record<string, string> = {
  mote: "bg-mote-50 text-mote-400 border-transparent",
  fundemar: "bg-fundemar-50 text-fundemar-400 border-transparent",
}

// -- Label formatters --

const formatLabel = (value: string): string =>
  value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/^Data /, "")

const projectLabels: Record<string, string> = {
  mote: "Mote",
  fundemar: "Fundemar",
}

// -- Component --

type BadgeType = "scenario-status" | "action-status" | "priority" | "data-status" | "event-type" | "project"

const styleMap: Record<BadgeType, Record<string, string>> = {
  "scenario-status": scenarioStatusStyles,
  "action-status": actionItemStatusStyles,
  priority: priorityStyles,
  "data-status": dataStatusStyles,
  "event-type": eventTypeStyles,
  project: projectStyles,
}

interface StatusBadgeProps {
  type: BadgeType
  value: string
  className?: string
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const styles = styleMap[type]?.[value] ?? "bg-neutral-100 text-neutral-600 border-transparent"
  const label = type === "project" ? (projectLabels[value] ?? value) : formatLabel(value)

  return (
    <Badge variant="outline" className={cn("text-xs font-medium", styles, className)}>
      {label}
    </Badge>
  )
}

// Project dot indicator (small colored dot + name)
interface ProjectDotProps {
  project: string
  className?: string
}

export function ProjectDot({ project, className }: ProjectDotProps) {
  const dotColor = project === "mote" ? "bg-mote-400" : "bg-fundemar-400"
  const label = projectLabels[project] ?? project

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatusBadge.tsx
git commit -m "feat: rebuild StatusBadge with shadcn/ui Badge and full status color mapping"
```

---

### Task 3: Rebuild EmptyState Component

**Files:**
- Rewrite: `src/components/EmptyState.tsx` (currently 207 lines)

- [ ] **Step 1: Rewrite EmptyState.tsx**

Replace `/Users/adrianstier/RSE-project-OS/src/components/EmptyState.tsx`. Simplified: icon + sentence + CTA. No coral illustration.

```tsx
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { InboxIcon, SearchIcon, LayoutListIcon, CheckSquareIcon, CalendarIcon, FilterIcon } from "lucide-react"

type EmptyVariant = "default" | "search" | "scenarios" | "actions" | "timeline" | "filter"

const variantConfig: Record<EmptyVariant, { icon: typeof InboxIcon; title: string; description: string }> = {
  default: {
    icon: InboxIcon,
    title: "Nothing here yet",
    description: "Get started by creating your first item.",
  },
  search: {
    icon: SearchIcon,
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
  scenarios: {
    icon: LayoutListIcon,
    title: "No scenarios yet",
    description: "Create your first scenario to get started.",
  },
  actions: {
    icon: CheckSquareIcon,
    title: "No action items yet",
    description: "Create your first action item to get started.",
  },
  timeline: {
    icon: CalendarIcon,
    title: "No events yet",
    description: "Add your first timeline event.",
  },
  filter: {
    icon: FilterIcon,
    title: "No matches",
    description: "No items match your current filters.",
  },
}

interface EmptyStateProps {
  variant?: EmptyVariant
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  variant = "default",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title ?? config.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description ?? config.description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EmptyState.tsx
git commit -m "feat: simplify EmptyState with shadcn/ui Button, remove coral illustration"
```

---

## Chunk 2: Layout & Navigation

### Task 4: Rewrite Layout, Sidebar, and Header

**Files:**
- Rewrite: `src/components/Layout.tsx` (currently 268 lines)
- Create: `src/components/Sidebar.tsx`
- Rewrite: `src/components/Breadcrumbs.tsx` (currently 64 lines)

- [ ] **Step 1: Create Sidebar.tsx**

Create `/Users/adrianstier/RSE-project-OS/src/components/Sidebar.tsx`:

```tsx
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboardIcon,
  LayoutListIcon,
  CheckSquareIcon,
  CalendarIcon,
  UserIcon,
  LogOutIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react"

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { path: "/scenarios", label: "Scenarios", icon: LayoutListIcon },
  { path: "/actions", label: "Action Items", icon: CheckSquareIcon },
  { path: "/timeline", label: "Timeline", icon: CalendarIcon },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onMobileClose?: () => void
}

export function Sidebar({ collapsed, onToggle, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const { user, displayName, avatarUrl, signOut } = useAuth()

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  const handleNavClick = () => {
    onMobileClose?.()
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r border-border",
      collapsed ? "w-16" : "w-56"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center h-14 px-4", collapsed && "justify-center")}>
        {!collapsed && <span className="text-sm font-semibold text-foreground">RSE Tracker</span>}
        {collapsed && <span className="text-sm font-semibold">RSE</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/dashboard" && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Collapse toggle */}
      <div className="px-2 py-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground w-full transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpenIcon className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftCloseIcon className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User */}
      <div className="px-2 py-3 border-t border-border">
        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent w-full transition-colors",
              collapsed && "justify-center px-2"
            )}>
              <Avatar className="h-7 w-7">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <span className="truncate text-foreground text-xs">{displayName}</span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" side={collapsed ? "right" : "top"} align="start">
            <Link
              to="/profile"
              onClick={handleNavClick}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors w-full text-left text-destructive"
            >
              <LogOutIcon className="h-4 w-4" />
              Sign out
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite Breadcrumbs.tsx**

Replace `/Users/adrianstier/RSE-project-OS/src/components/Breadcrumbs.tsx` (64 lines):

```tsx
import { Link, useLocation } from "react-router-dom"
import { ChevronRightIcon, HomeIcon } from "lucide-react"

const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  scenarios: "Scenarios",
  actions: "Action Items",
  timeline: "Timeline",
  profile: "Profile",
}

export function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">
        <HomeIcon className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, i) => (
        <span key={segment} className="flex items-center gap-1.5">
          <ChevronRightIcon className="h-3 w-3" />
          {i === segments.length - 1 ? (
            <span className="text-foreground font-medium" aria-current="page">
              {routeNames[segment] ?? segment}
            </span>
          ) : (
            <Link to={`/${segments.slice(0, i + 1).join("/")}`} className="hover:text-foreground transition-colors">
              {routeNames[segment] ?? segment}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
```

- [ ] **Step 3: Rewrite Layout.tsx**

Replace `/Users/adrianstier/RSE-project-OS/src/components/Layout.tsx` (268 lines):

```tsx
import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "@/components/Sidebar"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { CommandPalette } from "@/components/CommandPalette"
import { Button } from "@/components/ui/button"
import { MenuIcon, SearchIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const location = useLocation()
  const isDashboard = location.pathname === "/dashboard"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transition-transform duration-200",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center h-14 px-4 lg:px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2 h-8 w-8"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </Button>

          {/* Breadcrumbs */}
          {!isDashboard && <Breadcrumbs />}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Command palette trigger */}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground h-8 px-3"
            onClick={() => setCommandOpen(true)}
          >
            <SearchIcon className="h-3.5 w-3.5" />
            <span>Search...</span>
            <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-8 w-8"
            onClick={() => setCommandOpen(true)}
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="animate-fade-in p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
```

- [ ] **Step 4: Verify imports compile**

```bash
cd /Users/adrianstier/RSE-project-OS && npx tsc --noEmit src/components/Layout.tsx src/components/Sidebar.tsx src/components/Breadcrumbs.tsx 2>&1 | head -20
```

Note: CommandPalette doesn't exist yet — that's the next step. This step may show that error. Other imports should resolve.

- [ ] **Step 5: Commit**

```bash
git add src/components/Layout.tsx src/components/Sidebar.tsx src/components/Breadcrumbs.tsx
git commit -m "feat: rewrite Layout with Notion-style sidebar, minimal header"
```

---

### Task 5: Create Command Palette

**Files:**
- Create: `src/components/CommandPalette.tsx` (replaces GlobalSearch.tsx + KeyboardShortcuts.tsx)

- [ ] **Step 1: Create CommandPalette.tsx**

Create `/Users/adrianstier/RSE-project-OS/src/components/CommandPalette.tsx`:

```tsx
import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboardIcon,
  LayoutListIcon,
  CheckSquareIcon,
  CalendarIcon,
  UserIcon,
  PlusIcon,
} from "lucide-react"
import { useScenarios, useActionItems, useTimelineEvents } from "@/hooks/useSupabase"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { data: scenarios } = useScenarios()
  const { data: actionItems } = useActionItems()
  const { data: timelineEvents } = useTimelineEvents()

  // Global keyboard shortcut: Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search scenarios, action items, events..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
            <LayoutDashboardIcon className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/scenarios"))}>
            <LayoutListIcon className="mr-2 h-4 w-4" />
            Scenarios
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/actions"))}>
            <CheckSquareIcon className="mr-2 h-4 w-4" />
            Action Items
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/timeline"))}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Timeline
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/profile"))}>
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Scenarios */}
        {scenarios && scenarios.length > 0 && (
          <CommandGroup heading="Scenarios">
            {scenarios.slice(0, 5).map((s) => (
              <CommandItem
                key={s.id}
                value={`scenario ${s.title}`}
                onSelect={() => runCommand(() => navigate("/scenarios", { state: { openId: s.id } }))}
              >
                <LayoutListIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{s.title}</span>
                {s.project && (
                  <span className="ml-auto text-xs text-muted-foreground capitalize">{s.project}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Action Items */}
        {actionItems && actionItems.length > 0 && (
          <CommandGroup heading="Action Items">
            {actionItems.slice(0, 5).map((a) => (
              <CommandItem
                key={a.id}
                value={`action ${a.title}`}
                onSelect={() => runCommand(() => navigate("/actions", { state: { openId: a.id } }))}
              >
                <CheckSquareIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{a.title}</span>
                {a.owner && (
                  <span className="ml-auto text-xs text-muted-foreground">{a.owner}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Timeline Events */}
        {timelineEvents && timelineEvents.length > 0 && (
          <CommandGroup heading="Events">
            {timelineEvents.slice(0, 5).map((e) => (
              <CommandItem
                key={e.id}
                value={`event ${e.title}`}
                onSelect={() => runCommand(() => navigate("/timeline", { state: { openId: e.id } }))}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{e.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CommandPalette.tsx
git commit -m "feat: add command palette with cmdk for global search and navigation"
```

---

## Chunk 3: Page Agents (Parallel)

Tasks 6-10 are independent and can be executed in parallel by separate agents. Each task rewrites one page and its associated components.

### Task 6: Rewrite Dashboard Page

**Files:**
- Rewrite: `src/pages/Dashboard.tsx`
- Rewrite: `src/components/StatCard.tsx` (currently part of Card.tsx — extract and simplify)

- [ ] **Step 1: Create simplified StatCard.tsx**

Create or replace `/Users/adrianstier/RSE-project-OS/src/components/StatCard.tsx`:

```tsx
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number | string
  detail?: string
  valueClassName?: string
}

export function StatCard({ label, value, detail, valueClassName }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-xs font-medium text-muted-foreground mb-2">{label}</div>
      <div className={cn("text-2xl font-semibold text-foreground leading-none", valueClassName)}>
        {value}
      </div>
      {detail && <div className="text-xs text-muted-foreground mt-1">{detail}</div>}
    </div>
  )
}
```

- [ ] **Step 2: Rewrite Dashboard.tsx**

Replace `/Users/adrianstier/RSE-project-OS/src/pages/Dashboard.tsx`. The new dashboard has: 4 stat cards, My Action Items checklist, Upcoming Events list, Project Progress bars. Uses data from `useScenarios`, `useActionItems`, `useTimelineEvents` from `@/hooks/useSupabase`. Uses `useRealtimeAll` for real-time updates. Uses `useAuth` for the signed-in user's display name.

Key imports:
```tsx
import { useScenarios, useActionItems, useTimelineEvents, useRealtimeAll } from "@/hooks/useSupabase"
import { useAuth } from "@/contexts/AuthContext"
import { StatCard } from "@/components/StatCard"
import { StatusBadge, ProjectDot } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Link } from "react-router-dom"
import { format, isAfter, isBefore, addDays } from "date-fns"
```

Layout structure:
1. Page header: "Dashboard" title + subtitle
2. 4 stat cards in `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`
3. Two-column grid (`grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6`):
   - Left: "My Action Items" — filter action items by current user's displayName, show as checklist with checkboxes (clicking toggles status between todo/done), due dates in red if overdue. Max 5 items, "View all →" link to action items page.
   - Right: "Upcoming Events" — filter to future events, show with colored left border accent (3px, event type color), title + date + type. Max 5 items, "View all →" link.
4. Project progress row (`grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4`):
   - Mote card: dot + name + percentage + progress bar (bg-mote-400) + scenario/item counts
   - Fundemar card: same pattern with fundemar colors

Use `Skeleton` components during loading. Use `EmptyState` variant="default" when all data is empty.

- [ ] **Step 3: Verify build**

```bash
cd /Users/adrianstier/RSE-project-OS && npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx src/components/StatCard.tsx
git commit -m "feat: redesign Dashboard with clean stat cards, task checklist, event list"
```

---

### Task 7: Rewrite Scenarios Page

**Files:**
- Rewrite: `src/pages/Scenarios.tsx`
- Create: `src/components/ScenarioSheet.tsx`
- Modify: `src/components/forms/ScenarioForm.tsx` (restyle inputs)

- [ ] **Step 1: Create ScenarioSheet.tsx**

Create `/Users/adrianstier/RSE-project-OS/src/components/ScenarioSheet.tsx`. This is a slide-out detail panel using shadcn Sheet:

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { StatusBadge, ProjectDot } from "@/components/StatusBadge"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { PencilIcon, Trash2Icon } from "lucide-react"
import type { Scenario } from "@/types/database"

interface ScenarioSheetProps {
  scenario: Scenario | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (scenario: Scenario) => void
  onDelete: (id: string) => void
}

export function ScenarioSheet({ scenario, open, onOpenChange, onEdit, onDelete }: ScenarioSheetProps) {
  if (!scenario) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base">{scenario.title}</SheetTitle>
              {scenario.project && (
                <SheetDescription asChild>
                  <div className="mt-1">
                    <ProjectDot project={scenario.project} />
                  </div>
                </SheetDescription>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(scenario)}>
                <PencilIcon className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete scenario?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{scenario.title}" and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => onDelete(scenario.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge type="scenario-status" value={scenario.status} />
            {scenario.priority && <StatusBadge type="priority" value={scenario.priority} />}
            {scenario.data_status && <StatusBadge type="data-status" value={scenario.data_status} />}
          </div>

          {/* Description */}
          {scenario.description && (
            <>
              <Separator />
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Description</div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{scenario.description}</p>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Created</div>
              <div className="text-foreground">{format(new Date(scenario.created_at), "MMM d, yyyy")}</div>
            </div>
            {scenario.updated_at && (
              <div>
                <div className="text-xs font-medium text-muted-foreground">Updated</div>
                <div className="text-foreground">{format(new Date(scenario.updated_at), "MMM d, yyyy")}</div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Restyle ScenarioForm.tsx**

Modify `/Users/adrianstier/RSE-project-OS/src/components/forms/ScenarioForm.tsx`. Read the file first, then:
- Replace `import { useToast } from '../Toast'` → `import { toast } from 'sonner'`
- Replace `const toast = useToast()` / `const { success, error } = useToast()` → use `toast.success()` / `toast.error()` directly
- Replace `className="input-field"` → use shadcn `<Input />` component
- Replace `className="select-field"` → use shadcn `<Select />` component
- Button classes → use shadcn `<Button />` component
- Add `<Label />` components above each field
- Wrap form in a Sheet when used for edit (the page handles this)

- [ ] **Step 3: Rewrite Scenarios.tsx**

Replace `/Users/adrianstier/RSE-project-OS/src/pages/Scenarios.tsx`. Change from card grid to table layout.

Key imports:
```tsx
import { useScenarios, useCreateScenario, useUpdateScenario, useDeleteScenario, useRealtimeScenarios } from "@/hooks/useSupabase"
import { StatusBadge, ProjectDot } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { ScenarioSheet } from "@/components/ScenarioSheet"
import { ScenarioForm } from "@/components/forms"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusIcon } from "lucide-react"
```

Layout:
1. Page header: "Scenarios" + count subtitle + "New Scenario" button (top right)
2. Filter bar: project tabs (All / Mote / Fundemar as toggle buttons) + status Select + sort Select
3. Table with columns: Scenario (title + desc), Project (dot + name), Status (badge), Data (badge), Items (count)
4. Click row → open ScenarioSheet for detail
5. "New Scenario" button → open Sheet with ScenarioForm
6. ScenarioSheet has edit/delete actions

- [ ] **Step 4: Verify and commit**

```bash
cd /Users/adrianstier/RSE-project-OS && npm run build 2>&1 | tail -20
git add src/pages/Scenarios.tsx src/components/ScenarioSheet.tsx src/components/forms/ScenarioForm.tsx
git commit -m "feat: redesign Scenarios page with table layout and slide-out detail sheet"
```

---

### Task 8: Rewrite Action Items Page

**Files:**
- Rewrite: `src/pages/ActionItems.tsx`
- Create: `src/components/ActionItemSheet.tsx`
- Modify: `src/components/forms/ActionItemForm.tsx` (restyle inputs)

- [ ] **Step 1: Create ActionItemSheet.tsx**

Create `/Users/adrianstier/RSE-project-OS/src/components/ActionItemSheet.tsx`. Same pattern as ScenarioSheet but for action items. Includes: title, description, owner, status badge (with inline dropdown to change), due date (red if overdue), project dot, scenario link, edit/delete buttons. Use shadcn Sheet, AlertDialog, DropdownMenu for inline status change.

- [ ] **Step 2: Restyle ActionItemForm.tsx**

Modify `/Users/adrianstier/RSE-project-OS/src/components/forms/ActionItemForm.tsx`. Same approach as ScenarioForm:
- Replace `useToast()` → `toast` from `sonner`
- Replace custom classes with shadcn Input, Select, Label, Button, Textarea.

- [ ] **Step 3: Rewrite ActionItems.tsx**

Replace `/Users/adrianstier/RSE-project-OS/src/pages/ActionItems.tsx`. Must include:

Key imports:
```tsx
import { useActionItems, useUpdateActionItem, useCreateActionItem, useDeleteActionItem, useRealtimeActionItems } from "@/hooks/useSupabase"
import { useAuth } from "@/contexts/AuthContext"
import { StatusBadge, ProjectDot } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { ActionItemSheet } from "@/components/ActionItemSheet"
import { ActionItemForm } from "@/components/forms"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
```

Layout:
1. Page header: "Action Items" + count/overdue subtitle + Board/List toggle + "New Item" button
2. Filter bar: owner Select, project Select, "My Items" toggle button
3. **Board view** (default): 4 kanban columns (Todo, In Progress, Done, Blocked). Each column has colored dot header + count. Cards show: title, owner avatar (initials), project dot, due date. Blocked items get `bg-red-50 border-red-200` with blocker text. Drag-and-drop between columns using @dnd-kit (preserve existing DnD logic from current implementation).
4. **List view**: Table layout with columns: Title, Owner, Status (badge), Project, Due Date. Click row → ActionItemSheet.
5. Inline status change: click status badge on kanban card → DropdownMenu with status options → calls `useUpdateActionItem` mutation.

- [ ] **Step 4: Verify and commit**

```bash
cd /Users/adrianstier/RSE-project-OS && npm run build 2>&1 | tail -20
git add src/pages/ActionItems.tsx src/components/ActionItemSheet.tsx src/components/forms/ActionItemForm.tsx
git commit -m "feat: redesign Action Items with refined kanban, list toggle, inline status"
```

---

### Task 9: Rewrite Timeline Page

**Files:**
- Rewrite: `src/pages/Timeline.tsx`
- Modify: `src/components/forms/TimelineEventForm.tsx` (restyle inputs)

- [ ] **Step 1: Restyle TimelineEventForm.tsx**

Modify `/Users/adrianstier/RSE-project-OS/src/components/forms/TimelineEventForm.tsx`. Same approach:
- Replace `useToast()` → `toast` from `sonner`
- Replace custom classes with shadcn Input, Select, Label, Button, Textarea.

- [ ] **Step 2: Rewrite Timeline.tsx**

Replace `/Users/adrianstier/RSE-project-OS/src/pages/Timeline.tsx`.

Key imports:
```tsx
import { useTimelineEvents, useCreateTimelineEvent, useUpdateTimelineEvent, useDeleteTimelineEvent, useRealtimeTimeline } from "@/hooks/useSupabase"
import { StatusBadge, ProjectDot } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { TimelineEventForm } from "@/components/forms"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { format, isPast, parseISO } from "date-fns"
```

Layout:
1. Page header: "Timeline" + count subtitle + "New Event" button
2. Filter bar: type Select, project Select, "Show past events" Checkbox
3. Vertical timeline with thin gray line (`w-px bg-border`) on the left
4. Month group headers: uppercase, letter-spaced, small circle node on the line
5. Event cards: `border-l-3` accent in event type color. Content: title (font-medium), date (text-muted-foreground), optional description, type badge + project dot. Hover: `bg-accent`. Edit/delete buttons on hover.
6. Past events: `opacity-50`, gray dot nodes, desaturated badges
7. Upcoming events: full opacity, colored dots with ring (`ring-2 ring-{color}/20`)
8. Click edit → Sheet with TimelineEventForm
9. Delete → AlertDialog confirmation

Event type → border color mapping:
- milestone: `border-l-purple-500`
- deadline: `border-l-red-500`
- meeting: `border-l-blue-500`
- deliverable: `border-l-amber-500`

Event type → dot color mapping:
- milestone: `bg-purple-500`
- deadline: `bg-red-500`
- meeting: `bg-blue-500`
- deliverable: `bg-amber-500`

- [ ] **Step 3: Verify and commit**

```bash
cd /Users/adrianstier/RSE-project-OS && npm run build 2>&1 | tail -20
git add src/pages/Timeline.tsx src/components/forms/TimelineEventForm.tsx
git commit -m "feat: redesign Timeline with clean vertical layout, colored event cards"
```

---

### Task 10: Restyle Login and Profile Pages

**Files:**
- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/Profile.tsx`

- [ ] **Step 1: Restyle Login.tsx**

Modify `/Users/adrianstier/RSE-project-OS/src/pages/Login.tsx` (currently ~130 lines). Keep the split-screen layout and CoralBrandIcon SVG. Specific changes:
- Left side: `bg-ocean-950` → `bg-muted`. `text-white` → `text-foreground`. `text-ocean-300` → `text-muted-foreground`. `bg-white/10 border-white/20` → `bg-background border-border`. Keep the feature checklist and Mote/Fundemar project badges (use `StatusBadge` type="project").
- Right side: `bg-surface` → `bg-background`. Replace custom card markup with shadcn `Card`, `CardHeader`, `CardContent`. Replace Google button with shadcn `Button variant="outline"` containing the Google SVG icon. Error alert → `bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3`.
- Replace all old class references: `glass-card` → shadcn Card, `text-text-primary` → `text-foreground`, `text-text-secondary` → `text-muted-foreground`, `bg-surface` → `bg-background`, `surface-hover` → `accent`.
- Keep the `handleGoogleLogin` function and `useOAuthSignIn` hook unchanged.

- [ ] **Step 2: Restyle Profile.tsx**

Replace `/Users/adrianstier/RSE-project-OS/src/pages/Profile.tsx` (currently 131 lines). Current file uses:
- `import { useToast } from '../components/Toast'` → change to `import { toast } from 'sonner'`
- `import Card, { CardHeader, CardTitle, CardContent } from '../components/Card'` → change to `import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'`
- `toast.error(...)` / `toast.success(...)` → same API with Sonner, just different import
- `className="input-field"` → use shadcn `<Input />`
- `className="btn-primary"` → use shadcn `<Button />`
- `text-text-primary` / `text-text-secondary` / `text-text-muted` → `text-foreground` / `text-muted-foreground`
- `border-surface-border` → `border-border`
- `bg-gradient-to-br from-coral-400/20 to-gold-400/10` → `bg-muted`
- Avatar img → use shadcn `<Avatar>`, `<AvatarImage>`, `<AvatarFallback>`
- `font-heading` → remove (Inter for everything now)
- Add `<Label>` components above each input field

- [ ] **Step 3: Verify and commit**

```bash
cd /Users/adrianstier/RSE-project-OS && npm run build 2>&1 | tail -20
git add src/pages/Login.tsx src/pages/Profile.tsx
git commit -m "feat: restyle Login and Profile pages with shadcn/ui components"
```

---

## Chunk 4: Cleanup & Verification

### Task 11: Remove Dead Components and Verify Build

**Files:**
- Delete: `src/components/Modal.tsx`
- Delete: `src/components/Toast.tsx`
- Delete: `src/components/GlobalSearch.tsx`
- Delete: `src/components/Card.tsx`
- Delete: `src/components/Skeleton.tsx`
- Delete: `src/components/Tooltip.tsx`
- Delete: `src/components/DeleteConfirm.tsx`
- Delete: `src/components/KeyboardShortcuts.tsx`
- Delete: `src/components/WelcomeHeader.tsx`
- Delete: `src/components/FloatingActionButton.tsx`
- Delete: `src/components/SuccessAnimation.tsx`

- [ ] **Step 1: Search for remaining imports of old components**

Search the codebase for imports of each component being removed. Fix any remaining references before deleting:

```bash
# Search for each old component import
grep -r "from.*components/Modal" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*components/Toast" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*components/GlobalSearch" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*components/Card" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*components/Skeleton" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*components/Tooltip" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*components/DeleteConfirm" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*components/KeyboardShortcuts" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*components/WelcomeHeader" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*components/FloatingActionButton" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*components/SuccessAnimation" src/ --include="*.tsx" --include="*.ts"
```

For any remaining references: update the import to use the shadcn replacement or remove if no longer needed.

- [ ] **Step 2: Also search for old CSS class usage**

```bash
grep -r "glass-card\|btn-primary\|btn-secondary\|btn-gold\|btn-danger\|input-field\|select-field\|nav-link\|loading-spinner\|bubble-loader\|skeleton " src/ --include="*.tsx" --include="*.ts"
```

Replace any remaining old CSS classes with Tailwind/shadcn equivalents.

- [ ] **Step 3: Also search for old useToast hook usage**

```bash
grep -r "useToast" src/ --include="*.tsx" --include="*.ts"
```

Replace any remaining `useToast()` from `@/components/Toast` with Sonner's `toast()` function:
```tsx
// Old:
import { useToast } from '@/components/Toast'
const { success, error } = useToast()
success('Saved!')

// New:
import { toast } from 'sonner'
toast.success('Saved!')
```

- [ ] **Step 3b: Remove ToastProvider from App.tsx**

Now that all `useToast()` calls have been migrated, remove the old ToastProvider:

In `src/App.tsx`:
1. Remove `import { ToastProvider } from './components/Toast';`
2. Remove the `<ToastProvider>` wrapper (keep `<Toaster />` from Sonner)

- [ ] **Step 4: Delete old components**

```bash
cd /Users/adrianstier/RSE-project-OS
rm src/components/Modal.tsx
rm src/components/Toast.tsx
rm src/components/GlobalSearch.tsx
rm src/components/Card.tsx
rm src/components/Skeleton.tsx
rm src/components/Tooltip.tsx
rm src/components/DeleteConfirm.tsx
rm src/components/KeyboardShortcuts.tsx
rm src/components/WelcomeHeader.tsx
rm src/components/FloatingActionButton.tsx
rm src/components/SuccessAnimation.tsx
```

- [ ] **Step 5: Check CharacterCount and ProgressIndicator**

```bash
grep -r "CharacterCount\|ProgressIndicator" src/ --include="*.tsx" --include="*.ts"
```

If not referenced by any remaining file, delete them too. If still used in forms, keep them.

- [ ] **Step 6: Full build verification**

```bash
cd /Users/adrianstier/RSE-project-OS && npm run build
```

Expected: **Build succeeds with zero errors.** If there are errors, fix each one (likely missed import replacements).

- [ ] **Step 7: Lint check**

```bash
cd /Users/adrianstier/RSE-project-OS && npm run lint
```

Fix any lint errors.

- [ ] **Step 8: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove old UI components, fix remaining references, verify clean build"
```

---

## Execution Notes

### Parallel Execution Map

```
Task 1 (Foundation) ──→ Task 2 (StatusBadge) ──→ Task 3 (EmptyState)
                                                         │
                                                         ├──→ Task 4 + 5 (Layout/Nav)
                                                         ├──→ Task 6 (Dashboard)     ← parallel
                                                         ├──→ Task 7 (Scenarios)      ← parallel
                                                         ├──→ Task 8 (Action Items)   ← parallel
                                                         ├──→ Task 9 (Timeline)       ← parallel
                                                         └──→ Task 10 (Login/Profile) ← parallel
                                                                     │
                                                                     ↓
                                                              Task 11 (Cleanup)
```

Tasks 4-10 can run in parallel as separate agents/worktrees. Task 11 must run after all others complete.

### Key Constraints
- All page agents must import from `@/components/StatusBadge`, `@/components/EmptyState`, and `@/components/ui/*` — never from old components
- All page agents must use `toast` from `sonner` — never `useToast` from old Toast component
- Each page agent should only modify files in their scope — see spec Section 6 for boundaries
- The Cleanup agent (Task 11) should search and fix before deleting — never delete first
