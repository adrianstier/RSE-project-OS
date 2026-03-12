import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast, isAfter, addDays, parseISO } from 'date-fns';
import { useScenarios, useActionItems, useTimelineEvents, useRealtimeAll } from '../hooks/useSupabase';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import type { TimelineEventType } from '../types/database';

const EVENT_TYPE_COLORS: Record<string, string> = {
  milestone: '#7c3aed',
  deadline: '#dc2626',
  meeting: '#3b82f6',
  deliverable: '#f59e0b',
};

export default function Dashboard() {
  const { displayName } = useAuth();
  const { data: scenarios, isLoading: scenariosLoading } = useScenarios();
  const { data: actionItems, isLoading: actionsLoading } = useActionItems();
  const { data: timelineEvents, isLoading: eventsLoading } = useTimelineEvents();

  // Enable realtime updates for all data
  useRealtimeAll();

  const isLoading = scenariosLoading || actionsLoading || eventsLoading;

  const stats = useMemo(() => {
    if (!scenarios || !actionItems || !timelineEvents) return null;

    const now = new Date();
    const nextWeek = addDays(now, 7);

    const activeScenarios = scenarios.filter((s) => s.status === 'active');
    const inProgressActions = actionItems.filter((a) => a.status === 'in_progress');
    const overdueActions = actionItems.filter(
      (a) => a.due_date && isPast(parseISO(a.due_date)) && a.status !== 'done'
    );
    const upcomingEvents = timelineEvents.filter(
      (e) => isAfter(parseISO(e.event_date), now) && !isAfter(parseISO(e.event_date), nextWeek)
    );

    // Project breakdown
    const moteScenarios = scenarios.filter((s) => s.project === 'mote');
    const fundemarScenarios = scenarios.filter((s) => s.project === 'fundemar');
    const moteDone = actionItems.filter((a) => a.project === 'mote' && a.status === 'done').length;
    const moteTotal = actionItems.filter((a) => a.project === 'mote').length;
    const fundemarDone = actionItems.filter((a) => a.project === 'fundemar' && a.status === 'done').length;
    const fundemarTotal = actionItems.filter((a) => a.project === 'fundemar').length;

    return {
      totalScenarios: scenarios.length,
      activeCount: activeScenarios.length,
      totalActions: actionItems.length,
      inProgressCount: inProgressActions.length,
      overdueCount: overdueActions.length,
      upcomingEventsCount: upcomingEvents.length,
      // Project stats
      moteCount: moteScenarios.length,
      fundemarCount: fundemarScenarios.length,
      moteDone,
      moteTotal,
      fundemarDone,
      fundemarTotal,
      motePercent: moteTotal > 0 ? Math.round((moteDone / moteTotal) * 100) : 0,
      fundemarPercent: fundemarTotal > 0 ? Math.round((fundemarDone / fundemarTotal) * 100) : 0,
    };
  }, [scenarios, actionItems, timelineEvents]);

  // My action items: filter by signed-in user's displayName matching owner
  const myActions = useMemo(() => {
    if (!actionItems || !displayName) return [];
    const name = displayName.toLowerCase();
    return actionItems
      .filter(
        (a) =>
          a.status !== 'done' &&
          a.owner &&
          (a.owner.toLowerCase() === name ||
            a.owner.toLowerCase().startsWith(name.split(' ')[0].toLowerCase()))
      )
      .slice(0, 5);
  }, [actionItems, displayName]);

  // Upcoming events: future events, max 5
  const upcomingEvents = useMemo(() => {
    if (!timelineEvents) return [];
    const now = new Date();
    return timelineEvents
      .filter((e) => isAfter(parseISO(e.event_date), now))
      .slice(0, 5);
  }, [timelineEvents]);

  const isAllEmpty =
    !isLoading &&
    (!scenarios || scenarios.length === 0) &&
    (!actionItems || actionItems.length === 0) &&
    (!timelineEvents || timelineEvents.length === 0);

  if (isAllEmpty) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your coral restoration projects</p>
        </div>
        <EmptyState variant="default" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your coral restoration projects</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </>
        ) : stats ? (
          <>
            <StatCard
              label="Scenarios"
              value={stats.totalScenarios}
              detail={`${stats.activeCount} active`}
            />
            <StatCard
              label="Action Items"
              value={stats.totalActions}
              detail={`${stats.inProgressCount} in progress`}
            />
            <StatCard
              label="Overdue"
              value={stats.overdueCount}
              valueClassName="text-red-600"
              detail="needs attention"
            />
            <StatCard
              label="Upcoming"
              value={stats.upcomingEventsCount}
              detail="due in next 7 days"
            />
          </>
        ) : null}
      </div>

      {/* Two-column: My Action Items + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Action Items */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">My Action Items</h2>
            <Link
              to="/actions"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : myActions.length > 0 ? (
              myActions.map((action) => {
                const overdue =
                  action.due_date &&
                  isPast(parseISO(action.due_date)) &&
                  action.status !== 'done';
                return (
                  <div key={action.id} className="flex items-center gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={action.status === 'done'}
                      readOnly
                      className="h-4 w-4 rounded border-border text-primary focus:ring-coral-400/50"
                      aria-label={`Task: ${action.title}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{action.title}</p>
                      {action.due_date && (
                        <p
                          className={`text-xs mt-0.5 ${
                            overdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                          }`}
                        >
                          {format(parseISO(action.due_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No action items assigned to you
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Upcoming Events</h2>
            <Link
              to="/timeline"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-10 w-1 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const color =
                  EVENT_TYPE_COLORS[event.event_type as TimelineEventType] ?? '#9fb3c8';
                return (
                  <div key={event.id} className="flex items-stretch gap-3 px-4 py-3">
                    <div
                      className="w-[3px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{event.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(event.event_date), 'MMM d, yyyy')}
                        </span>
                        {event.event_type && (
                          <StatusBadge type="event-type" value={event.event_type} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No upcoming events
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project progress */}
      {stats && (stats.moteTotal > 0 || stats.fundemarTotal > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Mote */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-mote-400" />
                <span className="text-sm font-semibold text-foreground">Mote Marine Laboratory</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{stats.motePercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-mote-400 transition-all duration-500"
                style={{ width: `${stats.motePercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.moteDone} of {stats.moteTotal} action items complete &middot; {stats.moteCount} scenarios
            </p>
          </div>

          {/* Fundemar */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-fundemar-400" />
                <span className="text-sm font-semibold text-foreground">Fundemar</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{stats.fundemarPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-fundemar-400 transition-all duration-500"
                style={{ width: `${stats.fundemarPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.fundemarDone} of {stats.fundemarTotal} action items complete &middot; {stats.fundemarCount} scenarios
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
