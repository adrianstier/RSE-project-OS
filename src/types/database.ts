// TypeScript types for the RSE database schema

// ============================================
// ENUMS
// ============================================

export type Project = 'mote' | 'fundemar';

export type ScenarioStatus = 'planning' | 'active' | 'completed' | 'on_hold';

export type ScenarioPriority = 'low' | 'medium' | 'high' | 'critical';

export type DataStatus = 'data-ready' | 'data-partial' | 'data-pending';

export type ActionItemStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export type TimelineEventType = 'milestone' | 'deadline' | 'meeting' | 'deliverable';

// ============================================
// TABLE INTERFACES
// ============================================

export interface Scenario {
  id: string;
  title: string;
  description: string | null;
  project: Project;
  status: ScenarioStatus;
  priority: ScenarioPriority;
  data_status: DataStatus;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  scenario_id: string | null;
  owner: string | null;
  status: ActionItemStatus;
  due_date: string | null;
  project: Project | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: TimelineEventType | null;
  project: Project | null;
  user_id: string | null;
  created_at: string;
}

// ============================================
// INSERT/UPDATE TYPES
// ============================================

export interface ScenarioInsert {
  id?: string;
  title: string;
  description?: string | null;
  project: Project;
  status?: ScenarioStatus;
  priority?: ScenarioPriority;
  data_status?: DataStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ScenarioUpdate {
  id?: string;
  title?: string;
  description?: string | null;
  project?: Project;
  status?: ScenarioStatus;
  priority?: ScenarioPriority;
  data_status?: DataStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ActionItemInsert {
  id?: string;
  title: string;
  description?: string | null;
  scenario_id?: string | null;
  owner?: string | null;
  status?: ActionItemStatus;
  due_date?: string | null;
  project?: Project | null;
  created_at?: string;
  updated_at?: string;
}

export interface ActionItemUpdate {
  id?: string;
  title?: string;
  description?: string | null;
  scenario_id?: string | null;
  owner?: string | null;
  status?: ActionItemStatus;
  due_date?: string | null;
  project?: Project | null;
  created_at?: string;
  updated_at?: string;
}

export interface TimelineEventInsert {
  id?: string;
  title: string;
  description?: string | null;
  event_date: string;
  event_type?: TimelineEventType | null;
  project?: Project | null;
  created_at?: string;
}

export interface TimelineEventUpdate {
  id?: string;
  title?: string;
  description?: string | null;
  event_date?: string;
  event_type?: TimelineEventType | null;
  project?: Project | null;
  created_at?: string;
}

// ============================================
// SUPABASE DATABASE TYPE
// ============================================

export interface Database {
  public: {
    Tables: {
      scenarios: {
        Row: Scenario;
        Insert: ScenarioInsert;
        Update: ScenarioUpdate;
        Relationships: [];
      };
      action_items: {
        Row: ActionItem;
        Insert: ActionItemInsert;
        Update: ActionItemUpdate;
        Relationships: [
          {
            foreignKeyName: 'action_items_scenario_id_fkey';
            columns: ['scenario_id'];
            isOneToOne: false;
            referencedRelation: 'scenarios';
            referencedColumns: ['id'];
          }
        ];
      };
      timeline_events: {
        Row: TimelineEvent;
        Insert: TimelineEventInsert;
        Update: TimelineEventUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project: Project;
      scenario_status: ScenarioStatus;
      scenario_priority: ScenarioPriority;
      data_status: DataStatus;
      action_item_status: ActionItemStatus;
      timeline_event_type: TimelineEventType;
    };
  };
}

// ============================================
// FILTER TYPES
// ============================================

export interface ActionItemFilters {
  status?: ActionItemStatus;
  owner?: string;
  scenarioId?: string;
  project?: Project;
}

export interface ScenarioFilters {
  project?: Project;
  status?: ScenarioStatus;
  priority?: ScenarioPriority;
  dataStatus?: DataStatus;
}

export interface TimelineEventFilters {
  project?: Project;
  eventType?: TimelineEventType;
  startDate?: string;
  endDate?: string;
}
