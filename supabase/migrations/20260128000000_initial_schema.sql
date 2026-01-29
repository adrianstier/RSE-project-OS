-- RSE (Restoration Strategy Evaluation) Database Schema
-- Run this in Supabase SQL Editor to create the database structure

-- ============================================
-- EXTENSION SETUP
-- ============================================
-- Enable UUID generation (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SCENARIOS TABLE
-- ============================================
-- Stores RSE scenarios for Mote and Fundemar projects

CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    project TEXT NOT NULL CHECK (project IN ('mote', 'fundemar')),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    data_status TEXT DEFAULT 'data-pending' CHECK (data_status IN ('data-ready', 'data-partial', 'data-pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update updated_at on scenarios
CREATE TRIGGER update_scenarios_updated_at
    BEFORE UPDATE ON scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scenarios_project ON scenarios(project);
CREATE INDEX IF NOT EXISTS idx_scenarios_status ON scenarios(status);
CREATE INDEX IF NOT EXISTS idx_scenarios_priority ON scenarios(priority);
CREATE INDEX IF NOT EXISTS idx_scenarios_data_status ON scenarios(data_status);
CREATE INDEX IF NOT EXISTS idx_scenarios_created_at ON scenarios(created_at DESC);

-- ============================================
-- ACTION ITEMS TABLE
-- ============================================
-- Stores action items that can be linked to scenarios or standalone

CREATE TABLE IF NOT EXISTS action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE SET NULL,
    owner TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
    due_date DATE,
    project TEXT CHECK (project IS NULL OR project IN ('mote', 'fundemar')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update updated_at on action_items
CREATE TRIGGER update_action_items_updated_at
    BEFORE UPDATE ON action_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_action_items_scenario_id ON action_items(scenario_id);
CREATE INDEX IF NOT EXISTS idx_action_items_owner ON action_items(owner);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON action_items(due_date);
CREATE INDEX IF NOT EXISTS idx_action_items_project ON action_items(project);
CREATE INDEX IF NOT EXISTS idx_action_items_created_at ON action_items(created_at DESC);

-- ============================================
-- TIMELINE EVENTS TABLE
-- ============================================
-- Stores key dates, milestones, and events for the RSE project

CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_type TEXT CHECK (event_type IN ('milestone', 'deadline', 'meeting', 'deliverable')),
    project TEXT CHECK (project IS NULL OR project IN ('mote', 'fundemar')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_timeline_events_event_date ON timeline_events(event_date);
CREATE INDEX IF NOT EXISTS idx_timeline_events_event_type ON timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_events_project ON timeline_events(project);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Permissive policies for development (allow all operations for authenticated and anon users)
-- Note: In production, you should restrict these policies based on your auth requirements

-- Scenarios policies
CREATE POLICY "Allow all access to scenarios" ON scenarios
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Action items policies
CREATE POLICY "Allow all access to action_items" ON action_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Timeline events policies
CREATE POLICY "Allow all access to timeline_events" ON timeline_events
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE scenarios IS 'RSE scenarios for coral restoration strategy evaluation';
COMMENT ON TABLE action_items IS 'Action items and tasks, optionally linked to scenarios';
COMMENT ON TABLE timeline_events IS 'Key dates, milestones, meetings, and deliverables';

COMMENT ON COLUMN scenarios.project IS 'Project identifier: mote or fundemar';
COMMENT ON COLUMN scenarios.data_status IS 'Data availability status for the scenario';
COMMENT ON COLUMN action_items.scenario_id IS 'Optional link to parent scenario';
COMMENT ON COLUMN action_items.project IS 'For standalone action items not linked to a scenario';
COMMENT ON COLUMN timeline_events.event_type IS 'Type of event: milestone, deadline, meeting, or deliverable';
