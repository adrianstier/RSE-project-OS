# CLAUDE.md

This file provides guidance for Claude Code when working on this project.

## Project Overview

RSE Tracker is a React/TypeScript application for managing coral restoration project scenarios, action items, and timeline events. It uses Supabase as the backend.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Supabase** for database, auth, and realtime
- **TanStack Query** for server state management
- **React Router v6** for routing
- **Vercel** for deployment

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers (Auth)
├── hooks/          # Custom hooks (useScenarios, useActionItems, etc.)
├── lib/            # Utilities and Supabase client
├── pages/          # Route components (Dashboard, Scenarios, ActionItems, Timeline, Login)
├── types/          # TypeScript type definitions
├── App.tsx         # Main app with routing
└── main.tsx        # Entry point
```

## Key Files

- `src/lib/supabase.ts` - Supabase client initialization
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/hooks/useScenarios.ts` - Scenario CRUD operations with React Query
- `src/hooks/useActionItems.ts` - Action item CRUD operations
- `src/hooks/useTimelineEvents.ts` - Timeline event CRUD operations
- `tailwind.config.js` - Custom theme with ocean color palette
- `src/index.css` - Global styles and component classes

## Database Tables

- **scenarios**: id, name, description, status, data_status, project, created_at, updated_at
- **action_items**: id, scenario_id, title, description, status, priority, owner, due_date, created_at, updated_at
- **timeline_events**: id, scenario_id, title, description, event_date, event_type, created_at, updated_at

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
vercel --prod    # Deploy to Vercel
```

## Design Guidelines

- Clean, professional aesthetic (like Linear/Notion)
- Dark theme with ocean color palette
- Minimal visual effects - no excessive glows, gradients, or animations
- Use Inter font family
- Status badges use flat colors with subtle opacity
- Cards use simple borders, no glass effects

## Color Palette

- **ocean-900**: Main background (#0f1c22)
- **surface-card**: Card backgrounds (#162229)
- **coral-400**: Primary accent (#4ecdc4)
- **mote-400**: Mote project color (#ee7996)
- **fundemar-400**: Fundemar project color (#5bb5d5)
- **gold-400**: Secondary accent (#f0c850)

## Authentication

- Supabase Auth with email/password and OAuth (Google, GitHub)
- Protected routes require authentication
- Auth state managed via AuthContext

## Deployment

- Hosted on Vercel at https://rse-tracker.vercel.app
- Supabase project: qtfjzghdcatdjmarjjvu
- Environment variables set in Vercel dashboard
