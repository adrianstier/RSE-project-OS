import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  Scenario,
  ScenarioInsert,
  ScenarioUpdate,
  ActionItem,
  ActionItemInsert,
  ActionItemUpdate,
  TimelineEvent,
  TimelineEventInsert,
  TimelineEventUpdate,
  ActionItemFilters,
  Project,
} from '../types/database';

// ============================================
// QUERY KEYS
// ============================================

export const queryKeys = {
  scenarios: (project?: Project) => ['scenarios', project] as const,
  scenario: (id: string) => ['scenario', id] as const,
  actionItems: (filters?: ActionItemFilters) => [
    'actionItems',
    filters ? { status: filters.status, owner: filters.owner, scenarioId: filters.scenarioId, project: filters.project } : undefined,
  ] as const,
  actionItem: (id: string) => ['actionItem', id] as const,
  timelineEvents: (project?: Project) => ['timelineEvents', project] as const,
  timelineEvent: (id: string) => ['timelineEvent', id] as const,
  actionItemsWithScenarios: (filters?: ActionItemFilters) => [
    'actionItemsWithScenarios',
    filters ? { status: filters.status, owner: filters.owner, scenarioId: filters.scenarioId, project: filters.project } : undefined,
  ] as const,
};

// ============================================
// SCENARIOS HOOKS
// ============================================

export function useScenarios(project?: Project) {
  return useQuery({
    queryKey: queryKeys.scenarios(project),
    queryFn: async () => {
      let query = supabase
        .from('scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (project) {
        query = query.eq('project', project);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch scenarios: ${error.message}`);
      }

      return data as Scenario[];
    },
  });
}

export function useScenario(id: string) {
  return useQuery({
    queryKey: queryKeys.scenario(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch scenario: ${error.message}`);
      }

      return data as Scenario;
    },
    enabled: !!id,
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scenario: ScenarioInsert) => {
      const { data, error } = await supabase
        .from('scenarios')
        .insert(scenario as never)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create scenario: ${error.message}`);
      }

      return data as Scenario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

export function useUpdateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ScenarioUpdate }) => {
      const { data, error } = await supabase
        .from('scenarios')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update scenario: ${error.message}`);
      }

      return data as Scenario;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.scenario(data.id) });
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scenarios').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete scenario: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

// ============================================
// ACTION ITEMS HOOKS
// ============================================

export function useActionItems(filters?: ActionItemFilters) {
  return useQuery({
    queryKey: queryKeys.actionItems(filters),
    queryFn: async () => {
      let query = supabase
        .from('action_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.owner) {
        query = query.eq('owner', filters.owner);
      }
      if (filters?.scenarioId) {
        query = query.eq('scenario_id', filters.scenarioId);
      }
      if (filters?.project) {
        query = query.eq('project', filters.project);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch action items: ${error.message}`);
      }

      return data as ActionItem[];
    },
  });
}

export function useActionItem(id: string) {
  return useQuery({
    queryKey: queryKeys.actionItem(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch action item: ${error.message}`);
      }

      return data as ActionItem;
    },
    enabled: !!id,
  });
}

export function useCreateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionItem: ActionItemInsert) => {
      const { data, error } = await supabase
        .from('action_items')
        .insert(actionItem as never)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create action item: ${error.message}`);
      }

      return data as ActionItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
    },
  });
}

export function useUpdateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ActionItemUpdate }) => {
      const { data, error } = await supabase
        .from('action_items')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update action item: ${error.message}`);
      }

      return data as ActionItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItem(data.id) });
    },
  });
}

export function useDeleteActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('action_items').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete action item: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
    },
  });
}

// ============================================
// TIMELINE EVENTS HOOKS
// ============================================

export function useTimelineEvents(project?: Project) {
  return useQuery({
    queryKey: queryKeys.timelineEvents(project),
    queryFn: async () => {
      let query = supabase
        .from('timeline_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (project) {
        query = query.eq('project', project);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch timeline events: ${error.message}`);
      }

      return data as TimelineEvent[];
    },
  });
}

export function useTimelineEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.timelineEvent(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch timeline event: ${error.message}`);
      }

      return data as TimelineEvent;
    },
    enabled: !!id,
  });
}

export function useCreateTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: TimelineEventInsert) => {
      const { data, error } = await supabase
        .from('timeline_events')
        .insert(event as never)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create timeline event: ${error.message}`);
      }

      return data as TimelineEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timelineEvents'] });
    },
  });
}

export function useUpdateTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TimelineEventUpdate }) => {
      const { data, error } = await supabase
        .from('timeline_events')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update timeline event: ${error.message}`);
      }

      return data as TimelineEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['timelineEvents'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.timelineEvent(data.id) });
    },
  });
}

export function useDeleteTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('timeline_events').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete timeline event: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timelineEvents'] });
    },
  });
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook to fetch action items with their associated scenario data
 */
export function useActionItemsWithScenarios(filters?: ActionItemFilters) {
  return useQuery({
    queryKey: queryKeys.actionItemsWithScenarios(filters),
    queryFn: async () => {
      let query = supabase
        .from('action_items')
        .select(`
          *,
          scenario:scenarios(id, title, project)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.owner) {
        query = query.eq('owner', filters.owner);
      }
      if (filters?.scenarioId) {
        query = query.eq('scenario_id', filters.scenarioId);
      }
      if (filters?.project) {
        query = query.eq('project', filters.project);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch action items with scenarios: ${error.message}`);
      }

      return data;
    },
  });
}

// ============================================
// REALTIME HOOKS
// ============================================

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Hook to subscribe to realtime changes on the scenarios table
 * Automatically invalidates React Query cache when changes occur
 */
export function useRealtimeScenarios(options?: {
  project?: Project;
  enabled?: boolean;
  events?: RealtimeEvent[];
}) {
  const queryClient = useQueryClient();
  const { project, enabled = true, events = ['*'] } = options || {};

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Scenario>) => {
      // Invalidate the scenarios list query
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });

      // If we have a specific record, invalidate that too
      if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        const oldRecord = payload.old as Scenario;
        if (oldRecord?.id) {
          queryClient.invalidateQueries({ queryKey: queryKeys.scenario(oldRecord.id) });
        }
      }
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const newRecord = payload.new as Scenario;
        if (newRecord?.id) {
          queryClient.invalidateQueries({ queryKey: queryKeys.scenario(newRecord.id) });
        }
      }

      // Also invalidate action items with scenarios (joined query)
      queryClient.invalidateQueries({ queryKey: ['actionItemsWithScenarios'] });
    },
    [queryClient]
  );

  useEffect(() => {
    if (!enabled) return;

    const channelName = project ? `scenarios-${project}` : 'scenarios-all';

    let channel = supabase.channel(channelName);

    // Subscribe to each event type
    events.forEach((event) => {
      const filter = project ? `project=eq.${project}` : undefined;

      channel = channel.on<Scenario>(
        'postgres_changes',
        {
          event: event === '*' ? '*' : event,
          schema: 'public',
          table: 'scenarios',
          filter,
        },
        handleChange
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, project, events, handleChange]);
}

/**
 * Hook to subscribe to realtime changes on the action_items table
 * Automatically invalidates React Query cache when changes occur
 */
export function useRealtimeActionItems(options?: {
  scenarioId?: string;
  project?: Project;
  enabled?: boolean;
  events?: RealtimeEvent[];
}) {
  const queryClient = useQueryClient();
  const { scenarioId, project, enabled = true, events = ['*'] } = options || {};

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<ActionItem>) => {
      // Invalidate the action items list queries
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
      queryClient.invalidateQueries({ queryKey: ['actionItemsWithScenarios'] });

      // If we have a specific record, invalidate that too
      if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        const oldRecord = payload.old as ActionItem;
        if (oldRecord?.id) {
          queryClient.invalidateQueries({ queryKey: queryKeys.actionItem(oldRecord.id) });
        }
      }
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const newRecord = payload.new as ActionItem;
        if (newRecord?.id) {
          queryClient.invalidateQueries({ queryKey: queryKeys.actionItem(newRecord.id) });
        }
      }
    },
    [queryClient]
  );

  useEffect(() => {
    if (!enabled) return;

    const channelName = scenarioId
      ? `action-items-scenario-${scenarioId}`
      : project
        ? `action-items-project-${project}`
        : 'action-items-all';

    let channel = supabase.channel(channelName);

    // Build filter based on options
    let filter: string | undefined;
    if (scenarioId) {
      filter = `scenario_id=eq.${scenarioId}`;
    } else if (project) {
      filter = `project=eq.${project}`;
    }

    events.forEach((event) => {
      channel = channel.on<ActionItem>(
        'postgres_changes',
        {
          event: event === '*' ? '*' : event,
          schema: 'public',
          table: 'action_items',
          filter,
        },
        handleChange
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, scenarioId, project, events, handleChange]);
}

/**
 * Hook to subscribe to realtime changes on the timeline_events table
 * Automatically invalidates React Query cache when changes occur
 */
export function useRealtimeTimeline(options?: {
  project?: Project;
  enabled?: boolean;
  events?: RealtimeEvent[];
}) {
  const queryClient = useQueryClient();
  const { project, enabled = true, events = ['*'] } = options || {};

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<TimelineEvent>) => {
      // Invalidate the timeline events list query
      queryClient.invalidateQueries({ queryKey: ['timelineEvents'] });

      // If we have a specific record, invalidate that too
      if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        const oldRecord = payload.old as TimelineEvent;
        if (oldRecord?.id) {
          queryClient.invalidateQueries({ queryKey: queryKeys.timelineEvent(oldRecord.id) });
        }
      }
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const newRecord = payload.new as TimelineEvent;
        if (newRecord?.id) {
          queryClient.invalidateQueries({ queryKey: queryKeys.timelineEvent(newRecord.id) });
        }
      }
    },
    [queryClient]
  );

  useEffect(() => {
    if (!enabled) return;

    const channelName = project ? `timeline-events-${project}` : 'timeline-events-all';

    let channel = supabase.channel(channelName);

    const filter = project ? `project=eq.${project}` : undefined;

    events.forEach((event) => {
      channel = channel.on<TimelineEvent>(
        'postgres_changes',
        {
          event: event === '*' ? '*' : event,
          schema: 'public',
          table: 'timeline_events',
          filter,
        },
        handleChange
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, project, events, handleChange]);
}

/**
 * Combined hook to subscribe to all realtime changes
 * Useful for dashboard or overview pages
 */
export function useRealtimeAll(options?: {
  project?: Project;
  enabled?: boolean;
}) {
  const { project, enabled = true } = options || {};

  useRealtimeScenarios({ project, enabled });
  useRealtimeActionItems({ project, enabled });
  useRealtimeTimeline({ project, enabled });
}
