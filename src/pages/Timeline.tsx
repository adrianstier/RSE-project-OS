import { useState, useMemo, useEffect, useCallback } from 'react';
import { format, isAfter, isBefore, startOfDay, parseISO } from 'date-fns';
import {
  Calendar,
  Filter,
  Flag,
  Clock,
  Users,
  Package,
  Circle,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  useTimelineEvents,
  useDeleteTimelineEvent,
  useRealtimeTimeline,
} from '../hooks/useSupabase';
import Card, { CardContent } from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { TimelineSkeleton } from '../components/Skeleton';
import Modal from '../components/Modal';
import DeleteConfirm from '../components/DeleteConfirm';
import { TimelineEventForm } from '../components/forms';
import { useToast } from '../components/Toast';
import type { TimelineEvent, TimelineEventType, Project } from '../types/database';

const eventTypeConfig: Record<TimelineEventType, { icon: typeof Flag; color: string; bgColor: string }> = {
  milestone: { icon: Flag, color: 'text-purple-400', bgColor: 'bg-purple-400' },
  deadline: { icon: Clock, color: 'text-red-400', bgColor: 'bg-red-400' },
  meeting: { icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-400' },
  deliverable: { icon: Package, color: 'text-coral-400', bgColor: 'bg-coral-400' },
};

const eventTypeOptions: { value: TimelineEventType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'milestone', label: 'Milestones' },
  { value: 'deadline', label: 'Deadlines' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'deliverable', label: 'Deliverables' },
];

const projectOptions: { value: Project | 'all'; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'mote', label: 'Mote' },
  { value: 'fundemar', label: 'Fundemar' },
];

export default function Timeline() {
  const [eventTypeFilter, setEventTypeFilter] = useState<TimelineEventType | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<Project | 'all'>('all');
  const [showPast, setShowPast] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<TimelineEvent | null>(null);

  const { data: events, isLoading } = useTimelineEvents();
  const deleteEvent = useDeleteTimelineEvent();
  const { success, error: showError } = useToast();

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

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const now = startOfDay(new Date());

    return events.filter((event) => {
      if (eventTypeFilter !== 'all' && event.event_type !== eventTypeFilter) return false;
      if (projectFilter !== 'all' && event.project !== projectFilter) return false;
      if (!showPast && isBefore(parseISO(event.event_date), now)) return false;
      return true;
    });
  }, [events, eventTypeFilter, projectFilter, showPast]);

  // Group events by month
  const groupedEvents = useMemo(() => {
    const groups: Record<string, typeof filteredEvents> = {};

    filteredEvents.forEach((event) => {
      const monthKey = format(parseISO(event.event_date), 'MMMM yyyy');
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(event);
    });

    return groups;
  }, [filteredEvents]);

  const monthKeys = Object.keys(groupedEvents);

  const isPastEvent = (dateStr: string) => {
    return isBefore(parseISO(dateStr), startOfDay(new Date()));
  };

  const isUpcomingEvent = (dateStr: string) => {
    const eventDate = parseISO(dateStr);
    const now = startOfDay(new Date());
    return isAfter(eventDate, now) || format(eventDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
  };

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
      success('Event deleted successfully');
      setDeletingEvent(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <Calendar className="w-7 h-7 md:w-8 md:h-8 text-coral-400 flex-shrink-0" />
            <span className="truncate">Timeline</span>
          </h1>
          <p className="mt-1.5 text-text-secondary text-pretty leading-relaxed">
            Project milestones, deadlines, and key events
          </p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-sm text-text-muted whitespace-nowrap">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Event</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Event Type Filter */}
          <div className="relative">
            <label htmlFor="event-type-filter" className="sr-only">Filter by event type</label>
            <select
              id="event-type-filter"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value as TimelineEventType | 'all')}
              className="select-field !py-1.5 !text-sm min-w-[140px]"
              aria-label="Filter by event type"
            >
              {eventTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div className="relative">
            <label htmlFor="timeline-project-filter" className="sr-only">Filter by project</label>
            <select
              id="timeline-project-filter"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value as Project | 'all')}
              className="select-field !py-1.5 !text-sm min-w-[140px]"
              aria-label="Filter by project"
            >
              {projectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Show Past Toggle */}
          <label className="flex items-center gap-2 cursor-pointer" htmlFor="show-past-events">
            <input
              type="checkbox"
              id="show-past-events"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="w-4 h-4 rounded border-ocean-600 bg-surface-light text-coral-400 focus:ring-coral-400/50 focus:ring-offset-0"
            />
            <span className="text-sm text-text-secondary">Show past events</span>
          </label>
        </div>
      </Card>

      {/* Legend (top) */}
      <Card className="!p-4">
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-sm font-medium text-text-secondary">Event Types:</span>
          {Object.entries(eventTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${config.bgColor}/20 flex items-center justify-center`}>
                  <Icon className={`w-3 h-3 ${config.color}`} />
                </div>
                <span className="text-sm text-text-secondary capitalize">{type}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timeline */}
      {isLoading ? (
        <Card>
          <CardContent>
            <TimelineSkeleton />
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <EmptyState
            variant={
              eventTypeFilter !== 'all' || projectFilter !== 'all' || !showPast ? 'filter' : 'timeline'
            }
            onAction={eventTypeFilter === 'all' && projectFilter === 'all' && showPast ? openNewForm : undefined}
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {monthKeys.map((monthKey) => (
            <div key={monthKey} className="animate-slide-up">
              {/* Month Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-ocean-700 to-transparent" />
                <h2 className="font-heading text-lg font-semibold text-text-primary">{monthKey}</h2>
                <div className="h-px flex-1 bg-gradient-to-l from-ocean-700 to-transparent" />
              </div>

              {/* Events */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-ocean-700/50" />

                <div className="space-y-6">
                  {groupedEvents[monthKey].map((event) => {
                    const isPast = isPastEvent(event.event_date);
                    const isUpcoming = isUpcomingEvent(event.event_date);
                    const config = event.event_type
                      ? eventTypeConfig[event.event_type]
                      : { icon: Circle, color: 'text-text-muted', bgColor: 'bg-text-muted' };
                    const Icon = config.icon;

                    return (
                      <div
                        key={event.id}
                        className={`relative flex gap-6 ${isPast ? 'opacity-50' : ''}`}
                      >
                        {/* Timeline Node */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`
                              w-9 h-9 rounded-full flex items-center justify-center
                              ${isUpcoming ? config.bgColor + '/20' : 'bg-surface-lighter'}
                              ${isUpcoming ? 'ring-2 ring-offset-2 ring-offset-ocean-900' : ''}
                              ${isUpcoming ? config.bgColor.replace('bg-', 'ring-') + '/50' : ''}
                            `}
                          >
                            <Icon
                              className={`w-4 h-4 ${isUpcoming ? config.color : 'text-text-muted'}`}
                            />
                          </div>
                        </div>

                        {/* Event Card */}
                        <Card
                          className={`
                            flex-1 !p-4
                            ${isUpcoming ? 'glow-coral border-coral-400/20' : ''}
                          `}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                                <Calendar className="w-3 h-3" />
                                <span>{format(parseISO(event.event_date), 'EEEE, MMMM d, yyyy')}</span>
                              </div>
                              <h3 className="font-heading font-semibold text-text-primary">
                                {event.title}
                              </h3>
                              {event.description && (
                                <p className="mt-2 text-sm text-text-secondary">
                                  {event.description}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {event.event_type && (
                                <StatusBadge variant="event" value={event.event_type} />
                              )}
                              {event.project && (
                                <StatusBadge variant="project" value={event.project} />
                              )}
                              <button
                                onClick={() => handleEdit(event)}
                                className="p-1.5 text-text-muted hover:text-coral-400 hover:bg-surface-lighter rounded-lg transition-colors"
                                aria-label="Edit event"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingEvent(event)}
                                className="p-1.5 text-text-muted hover:text-red-400 hover:bg-surface-lighter rounded-lg transition-colors"
                                aria-label="Delete event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <Card className="!p-4">
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-sm font-medium text-text-secondary">Event Types:</span>
          {Object.entries(eventTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${config.bgColor}/20 flex items-center justify-center`}>
                  <Icon className={`w-3 h-3 ${config.color}`} />
                </div>
                <span className="text-sm text-text-secondary capitalize">{type}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingEvent ? 'Edit Event' : 'New Event'}
        size="lg"
      >
        <TimelineEventForm
          event={editingEvent || undefined}
          onSuccess={handleFormClose}
          onCancel={handleFormClose}
        />
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirm
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        description="Are you sure you want to delete this timeline event? This action cannot be undone."
        itemName={deletingEvent?.title}
        isDeleting={deleteEvent.isPending}
      />
    </div>
  );
}
