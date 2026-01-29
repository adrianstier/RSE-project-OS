# RSE Tracker

A project management application for Restoration Strategy Evaluation (RSE) coral conservation initiatives. Built with React, TypeScript, and Supabase.

**Live:** https://rse-tracker.vercel.app

## Features

- **Scenarios** - Track restoration scenarios with status, data readiness, and project assignments (Mote/Fundemar)
- **Action Items** - Manage tasks with priorities, owners, due dates, and status tracking
- **Timeline** - View milestones, deadlines, meetings, and deliverables
- **Dashboard** - Overview of project progress and key metrics
- **Real-time Updates** - Supabase realtime subscriptions for live collaboration
- **Authentication** - Email/password and OAuth (Google, GitHub)

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/RSE-project-OS.git
cd RSE-project-OS

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

### Tables

- **scenarios** - Restoration scenarios with name, description, status, data_status, project
- **action_items** - Tasks with title, description, status, priority, owner, due_date, scenario_id
- **timeline_events** - Events with title, description, event_date, event_type, scenario_id

## Deployment

The app is configured for Vercel deployment:

```bash
# Deploy to production
vercel --prod
```

## OAuth Setup

See [docs/OAUTH_SETUP.md](docs/OAUTH_SETUP.md) for instructions on configuring Google and GitHub OAuth.

## Design

Clean, professional dark theme with ocean-inspired color palette. Minimal visual noise, focused on usability and clarity.

## License

MIT
