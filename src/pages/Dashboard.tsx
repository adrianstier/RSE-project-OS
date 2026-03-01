import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import {
  Layers,
  CheckSquare,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity,
  Target,
  Waves,
} from 'lucide-react';
import { useScenarios, useActionItems, useTimelineEvents, useRealtimeAll } from '../hooks/useSupabase';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { StatCardSkeleton, ListItemSkeleton } from '../components/Skeleton';
import WelcomeHeader from '../components/WelcomeHeader';


const THEME_COLORS = {
  coral: 'var(--color-coral-400, #1e3a5f)',
  mote: 'var(--color-mote-400, #d4507a)',
  fundemar: 'var(--color-fundemar-400, #2d8ab8)',
  blue: 'var(--color-blue, #3b82f6)',
  purple: 'var(--color-purple, #a855f7)',
  red: 'var(--color-red, #ef4444)',
  gold: 'var(--color-gold-400, #c99a2e)',
  emerald: 'var(--color-emerald, #10b981)',
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: typeof Layers;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
  href?: string;
  trend?: { value: number; label: string };
}


function StatCard({ title, value, icon: Icon, iconBg, iconColor, subtitle, href, trend }: StatCardProps) {
  const content = (
    <Card hover={!!href}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="font-heading text-3xl font-bold text-text-primary tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-text-muted">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3.5 h-3.5 ${trend.value < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );

  if (href) {
    return <Link to={href} className="block">{content}</Link>;
  }

  return content;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: scenarios, isLoading: scenariosLoading } = useScenarios();
  const { data: actionItems, isLoading: actionsLoading } = useActionItems();
  const { data: timelineEvents, isLoading: eventsLoading } = useTimelineEvents();

  // Check if this is a first-time user (no data)
  const [showWelcomeTip, setShowWelcomeTip] = useState(true);

  // Enable realtime updates for all data
  useRealtimeAll();

  // Check localStorage for first visit
  useEffect(() => {
    const hasSeenTip = localStorage.getItem('rse-dashboard-tip-seen');
    if (hasSeenTip) {
      setShowWelcomeTip(false);
    }
  }, []);

  const dismissWelcomeTip = () => {
    localStorage.setItem('rse-dashboard-tip-seen', 'true');
    setShowWelcomeTip(false);
  };

  const isFirstTimeUser = !scenariosLoading && !actionsLoading && !eventsLoading &&
    (!scenarios || scenarios.length === 0) &&
    (!actionItems || actionItems.length === 0) &&
    (!timelineEvents || timelineEvents.length === 0);

  const stats = useMemo(() => {
    if (!scenarios || !actionItems || !timelineEvents) {
      return null;
    }

    const now = new Date();
    const nextWeek = addDays(now, 7);

    const moteScenarios = scenarios.filter((s) => s.project === 'mote');
    const fundemarScenarios = scenarios.filter((s) => s.project === 'fundemar');
    const activeScenarios = scenarios.filter((s) => s.status === 'active');
    const pendingActions = actionItems.filter((a) => a.status === 'todo' || a.status === 'in_progress');
    const blockedActions = actionItems.filter((a) => a.status === 'blocked');
    const overdueActions = actionItems.filter(
      (a) => a.due_date && isBefore(new Date(a.due_date), now) && a.status !== 'done'
    );
    const upcomingEvents = timelineEvents.filter(
      (e) => isAfter(new Date(e.event_date), now) && isBefore(new Date(e.event_date), nextWeek)
    );

    // Status breakdown for progress visualization
    const todoCount = actionItems.filter((a) => a.status === 'todo').length;
    const inProgressCount = actionItems.filter((a) => a.status === 'in_progress').length;
    const doneCount = actionItems.filter((a) => a.status === 'done').length;
    const blockedCount = blockedActions.length;
    const totalItems = actionItems.length;

    return {
      totalScenarios: scenarios.length,
      moteCount: moteScenarios.length,
      fundemarCount: fundemarScenarios.length,
      activeCount: activeScenarios.length,
      pendingActions: pendingActions.length,
      blockedActions: blockedActions.length,
      overdueCount: overdueActions.length,
      upcomingEventsCount: upcomingEvents.length,
      // Progress breakdown
      todoCount,
      inProgressCount,
      doneCount,
      blockedCount,
      totalItems,
      completionPercent: totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0,
    };
  }, [scenarios, actionItems, timelineEvents]);

  const recentActions = useMemo(() => {
    if (!actionItems) return [];
    return actionItems
      .filter((a) => a.status !== 'done')
      .slice(0, 5);
  }, [actionItems]);

  const upcomingEvents = useMemo(() => {
    if (!timelineEvents) return [];
    const now = new Date();
    return timelineEvents
      .filter((e) => isAfter(new Date(e.event_date), now))
      .slice(0, 5);
  }, [timelineEvents]);

  const isLoading = scenariosLoading || actionsLoading || eventsLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Screen reader loading announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading ? 'Loading dashboard data...' : 'Dashboard loaded'}
      </div>

      {/* Welcome Header */}
      <WelcomeHeader showTip={showWelcomeTip && !isFirstTimeUser} onDismissTip={dismissWelcomeTip} />

      {/* First-time user empty state */}
      {isFirstTimeUser && (
        <Card className="!p-8">
          <EmptyState
            variant="welcome"
            onAction={() => navigate('/scenarios')}
          />
        </Card>
      )}

      {/* Quick Stats Summary - Enhanced with better visual treatment */}
      {!isFirstTimeUser && stats && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-lg border border-surface-border">
            <Activity className="w-3.5 h-3.5 text-coral-400" />
            <span className="text-text-secondary">
              <span className="font-medium text-text-primary">{stats.activeCount}</span> active
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-lg border border-surface-border">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-text-secondary">
              <span className="font-medium text-text-primary">{stats.pendingActions}</span> pending
            </span>
          </div>
          {stats.overdueCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span className="text-red-600 font-medium">{stats.overdueCount} overdue</span>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid - With staggered animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Total Scenarios"
              value={stats.totalScenarios}
              icon={Layers}
              iconBg="bg-coral-400/15"
              iconColor="text-coral-400"
              subtitle={`${stats.activeCount} active`}
              href="/scenarios"
            />
            <StatCard
              title="Pending Actions"
              value={stats.pendingActions}
              icon={CheckSquare}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtitle={stats.blockedActions > 0 ? `${stats.blockedActions} blocked` : 'On track'}
              href="/actions"
            />
            <StatCard
              title="Upcoming Events"
              value={stats.upcomingEventsCount}
              icon={Calendar}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              subtitle="Next 7 days"
              href="/timeline"
            />
            <StatCard
              title="Needs Attention"
              value={stats.overdueCount}
              icon={AlertTriangle}
              iconBg={stats.overdueCount > 0 ? 'bg-red-50' : 'bg-emerald-50'}
              iconColor={stats.overdueCount > 0 ? 'text-red-600' : 'text-emerald-600'}
              subtitle={stats.overdueCount > 0 ? 'Overdue items' : 'All on track'}
            />
          </>
        ) : null}
      </div>

      {/* Feature 4: Progress Overview */}
      {!isFirstTimeUser && stats && stats.totalItems > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-text-muted" />
              <CardTitle>Progress Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Donut chart */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-surface-hover"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={THEME_COLORS.emerald}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.completionPercent / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-text-primary">{stats.completionPercent}%</span>
                    <span className="text-xs text-text-muted">done</span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">
                  {stats.doneCount} of {stats.totalItems} items done
                </p>
              </div>

              {/* Status breakdown bar */}
              <div className="flex flex-col justify-center gap-4">
                <p className="text-sm font-medium text-text-secondary">Status Breakdown</p>
                {/* Stacked bar */}
                <div className="h-2 rounded-full overflow-hidden flex bg-surface-hover">
                  {stats.todoCount > 0 && (
                    <div
                      className="bg-slate-400 transition-all duration-500"
                      style={{ width: `${(stats.todoCount / stats.totalItems) * 100}%` }}
                      title={`To Do: ${stats.todoCount}`}
                    />
                  )}
                  {stats.inProgressCount > 0 && (
                    <div
                      className="bg-blue-400 transition-all duration-500"
                      style={{ width: `${(stats.inProgressCount / stats.totalItems) * 100}%` }}
                      title={`In Progress: ${stats.inProgressCount}`}
                    />
                  )}
                  {stats.doneCount > 0 && (
                    <div
                      className="bg-emerald-400 transition-all duration-500"
                      style={{ width: `${(stats.doneCount / stats.totalItems) * 100}%` }}
                      title={`Done: ${stats.doneCount}`}
                    />
                  )}
                  {stats.blockedCount > 0 && (
                    <div
                      className="bg-red-400 transition-all duration-500"
                      style={{ width: `${(stats.blockedCount / stats.totalItems) * 100}%` }}
                      title={`Blocked: ${stats.blockedCount}`}
                    />
                  )}
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-slate-400 flex-shrink-0" />
                    <span className="text-xs text-text-secondary">To Do ({stats.todoCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-blue-400 flex-shrink-0" />
                    <span className="text-xs text-text-secondary">In Progress ({stats.inProgressCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-emerald-400 flex-shrink-0" />
                    <span className="text-xs text-text-secondary">Done ({stats.doneCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-red-400 flex-shrink-0" />
                    <span className="text-xs text-text-secondary">Blocked ({stats.blockedCount})</span>
                  </div>
                </div>
              </div>

              {/* Overdue indicator */}
              <div className="flex flex-col items-center justify-center gap-2">
                {stats.overdueCount > 0 ? (
                  <>
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p>
                    <p className="text-xs text-text-muted">overdue</p>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-6 h-6 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-600">All on track</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card variant="mote">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mote-400/10 rounded-lg">
                <Waves className="w-5 h-5 text-mote-400" />
              </div>
              <div>
                <CardTitle>Mote Marine Laboratory</CardTitle>
                <p className="text-xs text-text-muted mt-0.5">Florida, USA</p>
              </div>
            </div>
            <StatusBadge variant="project" value="mote" size="md" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-2 w-full rounded-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Total Scenarios</span>
                    <span className="text-text-primary font-medium">{stats?.moteCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Active</span>
                    <span className="text-mote-400 font-medium">
                      {scenarios?.filter((s) => s.project === 'mote' && s.status === 'active').length ?? 0}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden">
                  <div
                    className="h-full bg-mote-400 rounded-full"
                    style={{
                      width: `${stats?.totalScenarios ? (stats.moteCount / stats.totalScenarios) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="fundemar">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-fundemar-400/10 rounded-lg">
                <Waves className="w-5 h-5 text-fundemar-400" />
              </div>
              <div>
                <CardTitle>Fundemar</CardTitle>
                <p className="text-xs text-text-muted mt-0.5">Dominican Republic</p>
              </div>
            </div>
            <StatusBadge variant="project" value="fundemar" size="md" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-2 w-full rounded-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Total Scenarios</span>
                    <span className="text-text-primary font-medium">{stats?.fundemarCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Active</span>
                    <span className="text-fundemar-400 font-medium">
                      {scenarios?.filter((s) => s.project === 'fundemar' && s.status === 'active').length ?? 0}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden">
                  <div
                    className="h-full bg-fundemar-400 rounded-full"
                    style={{
                      width: `${stats?.totalScenarios ? (stats.fundemarCount / stats.totalScenarios) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Action Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-text-muted" />
              <CardTitle>Recent Action Items</CardTitle>
            </div>
            <Link
              to="/actions"
              className="flex items-center gap-1 text-sm text-coral-400 hover:text-coral-500 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-0 -mx-4">
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            ) : recentActions.length > 0 ? (
              <div className="space-y-0 -mx-4">
                {recentActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-4 px-4 py-3 border-b border-surface-border last:border-0 hover:bg-surface-lighter/50 transition-colors"
                  >
                    {action.owner ? (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-surface-lighter flex items-center justify-center">
                        <span className="text-xs font-medium text-text-secondary">
                          {action.owner.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-surface-lighter flex items-center justify-center">
                        <span className="text-xs text-text-muted">?</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {action.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {action.due_date && (
                          <span
                            className={`text-xs ${
                              isBefore(new Date(action.due_date), new Date()) && action.status !== 'done'
                                ? 'text-red-600'
                                : 'text-text-muted'
                            }`}
                          >
                            <Clock className="w-3 h-3 inline mr-1" />
                            {format(new Date(action.due_date), 'MMM d')}
                          </span>
                        )}
                        {action.project && (
                          <StatusBadge variant="project" value={action.project} />
                        )}
                      </div>
                    </div>
                    <StatusBadge variant="action" value={action.status} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState variant="actions" />
            )}
          </CardContent>
        </Card>

        {/* Upcoming Timeline Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-muted" />
              <CardTitle>Upcoming Events</CardTitle>
            </div>
            <Link
              to="/timeline"
              className="flex items-center gap-1 text-sm text-coral-400 hover:text-coral-500 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-0 -mx-4">
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-0 -mx-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 px-4 py-3 border-b border-surface-border last:border-0 hover:bg-surface-lighter/50 transition-colors"
                  >
                    <div className="flex-shrink-0 text-center">
                      <div className="text-lg font-bold text-text-primary">
                        {format(new Date(event.event_date), 'd')}
                      </div>
                      <div className="text-xs text-text-muted uppercase">
                        {format(new Date(event.event_date), 'MMM')}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {event.event_type && (
                          <StatusBadge variant="event" value={event.event_type} />
                        )}
                        {event.project && (
                          <StatusBadge variant="project" value={event.project} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState variant="timeline" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
