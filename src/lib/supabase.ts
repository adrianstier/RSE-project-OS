import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type exports for convenience
export type { Database };
export type Tables = Database['public']['Tables'];
export type Scenario = Tables['scenarios']['Row'];
export type ScenarioInsert = Tables['scenarios']['Insert'];
export type ScenarioUpdate = Tables['scenarios']['Update'];
export type ActionItem = Tables['action_items']['Row'];
export type ActionItemInsert = Tables['action_items']['Insert'];
export type ActionItemUpdate = Tables['action_items']['Update'];
export type TimelineEvent = Tables['timeline_events']['Row'];
export type TimelineEventInsert = Tables['timeline_events']['Insert'];
export type TimelineEventUpdate = Tables['timeline_events']['Update'];
