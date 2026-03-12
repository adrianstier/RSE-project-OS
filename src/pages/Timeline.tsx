import { useState, useMemo, useEffect, useCallback } from 'react';
import { format, isBefore, startOfDay, parseISO, compareAsc, isPast } from 'date-fns';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useTimelineEvents,
  useDeleteTimelineEvent,
  useRealtimeTimeline,
} from '../hooks/useSupabase';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TimelineEventForm } from '../components/forms';
import type { TimelineEvent, TimelineEventType, Project } from '../types/database';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EVENT_TYPE_COLORS: Record<
  TimelineEventType,
  { border: string; dot: string; ring: string }
> = {
  milestone: {
    border: 'border-l-purple-500',
    dot: 'bg-purple-500',
    ring: 'ring-purple-500/20',
  },
  deadline: {
    border: 'border-l-red-500',
    dot: 'bg-red-500',
    ring: 'ring-red-500/20',
  },
  meeting: {
    border: 'border-l-blue-500',
    dot: 'bg-blue-500',
    ring: 'ring-blue-500/20',
  },
  deliverable: {
    border: 'border-l-amber-500',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/20',
  },
};

const EVENT_TYPE_OPTIONS: { value: TimelineEventType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'milestone', label: 'Milestones' },
  { value: 'deadline', label: 'Deadlines' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'deliverable', label: 'Deliverables' },
];

const PROJECT_OPTIONS: { value: Project | 'all'; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'mote', label: 'Mote' },
  { value: 'fundemar', label: 'Fundemar' },
];

// ---------------------------------------------------------------------------
// Skeleton for loading state
// ---------------------------------------------------------------------------

function TimelineLoadingSkeleton() {
  return (
    <div className="space-y-8 pl-8 relative">
      {/* Vertical line */}
      <div className="absolute left-[9px] top-0 bottom-0 w-px bg-border" />

      {/* Month header skeleton */}
      <div className="relative flex items-center gap-4 -ml-8 pl-8">
        <div className="absolute left-[5px] w-[9px] h-[9px] rounded-full bg-border" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>

      {/* Event skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative flex gap-4 -ml-8 pl-8">
          <div className="absolute left-[5px] w-[9px] h-[9px] rounded-full bg-border mt-5" />
          <div className="flex-1 bg-card border border-border rounded-lg p-4 border-l-[3px] border-l-border space-y-3 ml-4">
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Timeline() {
  const [eventTypeFilter, setEventTypeFilter] = useState<TimelineEventType | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<Project | 'all'>('all');
  const [showPast, setShowPast] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<TimelineEvent | null>(null);

  const { data: events, isLoading } = useTimelineEvents();
  const deleteEvent = useDeleteTimelineEvent();

  // Enable realtime updates
  useRealtimeTimeline();

  // Handle keyboard shortcut for new item
  const openNewForm = useCallback(() => {
    setEditingEvent(null);
    setIsFormOpen(true);
  }, []);

  useEffect(() => {
    const handleNewItem = () => openNewForm();
    window.addEventListener('rse:new-item', handleNewItem);
    return () => window.removeEventListener('rse:new-item', handleNewItem);
  }, [openNewForm]);

  // -----------------------------------------------------------------------
  // Filtering
  // -----------------------------------------------------------------------

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const now = startOfDay(new Date());

    return events
      .filter((event) => {
        if (eventTypeFilter !== 'all' && event.event_type !== eventTypeFilter) return false;
        if (projectFilter !== 'all' && event.project !== projectFilter) return false;
        if (!showPast && isBefore(parseISO(event.event_date), now)) return false;
        return true;
      })
      .sort((a, b) => compareAsc(parseISO(a.event_date), parseISO(b.event_date)));
  }, [events, eventTypeFilter, projectFilter, showPast]);

  // -----------------------------------------------------------------------
  // Group by month
  // -----------------------------------------------------------------------

  const groupedEvents = useMemo(() => {
    const groups: { key: string; events: TimelineEvent[] }[] = [];
    const map = new Map<string, TimelineEvent[]>();

    filteredEvents.forEach((event) => {
      const monthKey = format(parseISO(event.event_date), 'MMMM yyyy');
      if (!map.has(monthKey)) {
        map.set(monthKey, []);
      }
      map.get(monthKey)!.push(event);
    });

    map.forEach((evts, key) => {
      groups.push({ key, events: evts });
    });

    return groups;
  }, [filteredEvents]);

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  const isEventPast = (dateStr: string) => isPast(parseISO(dateStr)) && format(parseISO(dateStr), 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd');

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;

    try {
      await deleteEvent.mutateAsync(deletingEvent.id);
      toast.success('Event deleted successfully');
      setDeletingEvent(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const hasActiveFilters = eventTypeFilter !== 'all' || projectFilter !== 'all' || !showPast;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl font-bold text-foreground tracking-tight">
            Timeline
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openNewForm} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Event</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Event Type Filter */}
        <div>
          <label htmlFor="tl-event-type" className="sr-only">Event type</label>
          <select
            id="tl-event-type"
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value as TimelineEventType | 'all')}
            className="select-field !py-1.5 !text-sm min-w-[140px]"
          >
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        <div>
          <label htmlFor="tl-project" className="sr-only">Project</label>
          <select
            id="tl-project"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value as Project | 'all')}
            className="select-field !py-1.5 !text-sm min-w-[140px]"
          >
            {PROJECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Show Past Events Checkbox */}
        <label htmlFor="tl-show-past" className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="tl-show-past"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-white text-primary focus:ring-primary/50 focus:ring-offset-0"
          />
          <span className="text-sm text-muted-foreground">Show past events</span>
        </label>
      </div>

      {/* Timeline Content */}
      {isLoading ? (
        <TimelineLoadingSkeleton />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          variant={hasActiveFilters ? 'filter' : 'timeline'}
          onAction={!hasActiveFilters ? openNewForm : undefined}
        />
      ) : (
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-6">
            {groupedEvents.map((group) => (
              <div key={group.key}>
                {/* Month Header */}
                <div className="relative flex items-center -ml-8 pl-8 mb-4">
                  {/* Node on the line */}
                  <div className="absolute left-[5px] w-[9px] h-[9px] rounded-full bg-border border-2 border-border" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {group.key}
                  </h2>
                </div>

                {/* Events in this month */}
                <div className="space-y-3">
                  {group.events.map((event) => {
                    const past = isEventPast(event.event_date);
                    const colors = event.event_type
                      ? EVENT_TYPE_COLORS[event.event_type]
                      : { border: 'border-l-neutral-400', dot: 'bg-neutral-400', ring: 'ring-neutral-400/20' };

                    return (
                      <div
                        key={event.id}
                        className={`group relative -ml-8 pl-8 ${past ? 'opacity-50' : ''}`}
                      >
                        {/* Dot on the line */}
                        <div
                          className={`
                            absolute left-[5px] top-5 w-[9px] h-[9px] rounded-full
                            ${past ? 'bg-neutral-300' : `${colors.dot} ring-2 ${colors.ring}`}
                          `}
                        />

                        {/* Event Card */}
                        <div
                          className={`
                            ml-4 rounded-lg border border-border bg-card
                            border-l-[3px] ${colors.border}
                            p-4 transition-colors
                          `}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground truncate">
                                {event.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {format(parseISO(event.event_date), 'EEEE, MMMM d')}
                              </p>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                {event.event_type && (
                                  <StatusBadge type="event-type" value={event.event_type} />
                                )}
                                {event.project && (
                                  <StatusBadge type="project" value={event.project} />
                                )}
                              </div>
                            </div>

                            {/* Action buttons (visible on hover) */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onClick={() => handleEdit(event)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                                aria-label={`Edit ${event.title}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingEvent(event)}
                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-muted rounded-md transition-colors"
                                aria-label={`Delete ${event.title}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={isFormOpen} onOpenChange={(open) => { if (!open) handleFormClose(); }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingEvent ? 'Edit Event' : 'New Event'}</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <TimelineEventForm
              event={editingEvent || undefined}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingEvent} onOpenChange={(open) => { if (!open) setDeletingEvent(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{deletingEvent?.title ? ` "${deletingEvent.title}"` : ' this timeline event'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEvent.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
