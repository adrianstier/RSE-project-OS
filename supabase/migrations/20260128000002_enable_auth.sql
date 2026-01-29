-- RSE Database Auth Enhancement Migration
-- This migration adds user_id columns and updates RLS policies
-- to support Supabase Auth while maintaining backward compatibility

-- ============================================
-- ADD USER_ID COLUMNS (Optional - for future user-specific data)
-- ============================================

-- Add user_id to scenarios (nullable for backward compatibility)
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id to action_items (nullable for backward compatibility)
ALTER TABLE action_items
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id to timeline_events (nullable for backward compatibility)
ALTER TABLE timeline_events
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for user_id columns
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON action_items(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON timeline_events(user_id);

-- ============================================
-- DROP EXISTING PERMISSIVE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Allow all access to scenarios" ON scenarios;
DROP POLICY IF EXISTS "Allow all access to action_items" ON action_items;
DROP POLICY IF EXISTS "Allow all access to timeline_events" ON timeline_events;

-- ============================================
-- NEW RLS POLICIES - SCENARIOS
-- ============================================

-- Allow authenticated users to view all scenarios
CREATE POLICY "Authenticated users can view scenarios"
ON scenarios FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert scenarios (auto-set user_id)
CREATE POLICY "Authenticated users can create scenarios"
ON scenarios FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update any scenario
-- (In the future, you could restrict to: user_id = auth.uid() OR user_id IS NULL)
CREATE POLICY "Authenticated users can update scenarios"
ON scenarios FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete any scenario
-- (In the future, you could restrict to: user_id = auth.uid() OR user_id IS NULL)
CREATE POLICY "Authenticated users can delete scenarios"
ON scenarios FOR DELETE
TO authenticated
USING (true);

-- Allow anonymous read access for public dashboards (optional)
CREATE POLICY "Anonymous users can view scenarios"
ON scenarios FOR SELECT
TO anon
USING (true);

-- ============================================
-- NEW RLS POLICIES - ACTION ITEMS
-- ============================================

-- Allow authenticated users to view all action items
CREATE POLICY "Authenticated users can view action_items"
ON action_items FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert action items
CREATE POLICY "Authenticated users can create action_items"
ON action_items FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update any action item
CREATE POLICY "Authenticated users can update action_items"
ON action_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete any action item
CREATE POLICY "Authenticated users can delete action_items"
ON action_items FOR DELETE
TO authenticated
USING (true);

-- Allow anonymous read access for public dashboards (optional)
CREATE POLICY "Anonymous users can view action_items"
ON action_items FOR SELECT
TO anon
USING (true);

-- ============================================
-- NEW RLS POLICIES - TIMELINE EVENTS
-- ============================================

-- Allow authenticated users to view all timeline events
CREATE POLICY "Authenticated users can view timeline_events"
ON timeline_events FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert timeline events
CREATE POLICY "Authenticated users can create timeline_events"
ON timeline_events FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update any timeline event
CREATE POLICY "Authenticated users can update timeline_events"
ON timeline_events FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete any timeline event
CREATE POLICY "Authenticated users can delete timeline_events"
ON timeline_events FOR DELETE
TO authenticated
USING (true);

-- Allow anonymous read access for public dashboards (optional)
CREATE POLICY "Anonymous users can view timeline_events"
ON timeline_events FOR SELECT
TO anon
USING (true);

-- ============================================
-- HELPER FUNCTION FOR AUTO-SETTING USER_ID
-- ============================================

-- Function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set user_id if it's not already provided and user is authenticated
    IF NEW.user_id IS NULL AND auth.uid() IS NOT NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to auto-set user_id on insert
DROP TRIGGER IF EXISTS set_scenarios_user_id ON scenarios;
CREATE TRIGGER set_scenarios_user_id
    BEFORE INSERT ON scenarios
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_action_items_user_id ON action_items;
CREATE TRIGGER set_action_items_user_id
    BEFORE INSERT ON action_items
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_timeline_events_user_id ON timeline_events;
CREATE TRIGGER set_timeline_events_user_id
    BEFORE INSERT ON timeline_events
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

-- ============================================
-- ENABLE REALTIME FOR ALL TABLES
-- ============================================

-- Note: Realtime is enabled per-table in Supabase dashboard
-- or via the following (if you have the required permissions):

-- Enable realtime for scenarios
ALTER PUBLICATION supabase_realtime ADD TABLE scenarios;

-- Enable realtime for action_items
ALTER PUBLICATION supabase_realtime ADD TABLE action_items;

-- Enable realtime for timeline_events
ALTER PUBLICATION supabase_realtime ADD TABLE timeline_events;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN scenarios.user_id IS 'Optional: User who created this scenario';
COMMENT ON COLUMN action_items.user_id IS 'Optional: User who created this action item';
COMMENT ON COLUMN timeline_events.user_id IS 'Optional: User who created this timeline event';

COMMENT ON FUNCTION set_user_id() IS 'Automatically sets user_id to auth.uid() on insert';

-- ============================================
-- FUTURE RESTRICTIVE POLICIES (COMMENTED OUT)
-- ============================================
-- Uncomment and replace the permissive policies above if you want
-- users to only see/edit their own data:

/*
-- Only view own scenarios
CREATE POLICY "Users can view own scenarios"
ON scenarios FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- Only update own scenarios
CREATE POLICY "Users can update own scenarios"
ON scenarios FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Only delete own scenarios
CREATE POLICY "Users can delete own scenarios"
ON scenarios FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);
*/
