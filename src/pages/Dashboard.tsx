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
import Tooltip from '../components/Tooltip';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: typeof Layers;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
  href?: string;
  trend?: { value: number; label: string };
  accentColor?: string;
}

// Progress ring component for visual stats
function ProgressRing({ progress, size = 48, strokeWidth = 4, color = '#4ecdc4' }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-ocean-700/50"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        style={{
          strokeDasharray: circumference,
          strokeDashoffset,
          transition: 'stroke-dashoffset 0.5s ease-out',
        }}
      />
    </svg>
  );
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, subtitle, href, trend, accentColor }: StatCardProps) {
  const content = (
    <Card className={`relative overflow-hidden group ${href ? 'cursor-pointer' : ''}`} hover={!!href}>
      {/* Decorative gradient blob */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-30"
        style={{ background: accentColor || '#4ecdc4' }}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="font-heading text-4xl font-extrabold text-text-primary tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-text-muted flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-current opacity-50" />
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp className={`w-3.5 h-3.5 ${trend.value < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl ${iconBg} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>

      {href && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
          <div className="flex items-center gap-1 text-xs font-medium text-coral-400">
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
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
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-surface-lighter/50 backdrop-blur-sm rounded-xl border border-ocean-700/20">
            <div className="p-1.5 bg-coral-400/10 rounded-lg">
              <Activity className="w-4 h-4 text-coral-400" />
            </div>
            <span className="text-text-secondary">
              <span className="font-semibold text-text-primary">{stats.activeCount}</span> active scenarios
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-surface-lighter/50 backdrop-blur-sm rounded-xl border border-ocean-700/20">
            <div className="p-1.5 bg-blue-400/10 rounded-lg">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-text-secondary">
              <span className="font-semibold text-text-primary">{stats.pendingActions}</span> pending tasks
            </span>
          </div>
          {stats.overdueCount > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20">
              <div className="p-1.5 bg-red-400/10 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-red-400 font-medium">
                <span className="font-semibold">{stats.overdueCount}</span> overdue
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid - With staggered animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-stagger">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <div className="animate-stagger-1">
              <Tooltip content="Click to view all scenarios">
                <StatCard
                  title="Total Scenarios"
                  value={stats.totalScenarios}
                  icon={Layers}
                  iconBg="bg-coral-400/15"
                  iconColor="text-coral-400"
                  subtitle={`${stats.activeCount} active`}
                  href="/scenarios"
                  accentColor="#4ecdc4"
                />
              </Tooltip>
            </div>
            <div className="animate-stagger-2">
              <Tooltip content="Click to manage action items">
                <StatCard
                  title="Pending Actions"
                  value={stats.pendingActions}
                  icon={CheckSquare}
                  iconBg="bg-blue-500/15"
                  iconColor="text-blue-400"
                  subtitle={stats.blockedActions > 0 ? `${stats.blockedActions} blocked` : 'On track'}
                  href="/actions"
                  accentColor="#3b82f6"
                />
              </Tooltip>
            </div>
            <div className="animate-stagger-3">
              <Tooltip content="Click to view timeline">
                <StatCard
                  title="Upcoming Events"
                  value={stats.upcomingEventsCount}
                  icon={Calendar}
                  iconBg="bg-purple-500/15"
                  iconColor="text-purple-400"
                  subtitle="Next 7 days"
                  href="/timeline"
                  accentColor="#a855f7"
                />
              </Tooltip>
            </div>
            <div className="animate-stagger-4">
              <StatCard
                title="Needs Attention"
                value={stats.overdueCount}
                icon={AlertTriangle}
                iconBg={stats.overdueCount > 0 ? 'bg-red-500/15' : 'bg-emerald-500/15'}
                iconColor={stats.overdueCount > 0 ? 'text-red-400' : 'text-emerald-400'}
                subtitle={stats.overdueCount > 0 ? 'Overdue items' : 'All on track'}
                accentColor={stats.overdueCount > 0 ? '#ef4444' : '#10b981'}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* Feature 4: Progress Overview */}
      {!isFirstTimeUser && stats && stats.totalItems > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <CardTitle>Progress Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Donut chart */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-surface-hover"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - stats.completionPercent / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-text-primary">{stats.completionPercent}%</span>
                    <span className="text-xs text-text-muted">complete</span>
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
                <div className="h-4 rounded-full overflow-hidden flex bg-surface-hover">
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
                    <span className="w-3 h-3 rounded-sm bg-slate-400 flex-shrink-0" />
                    <span className="text-xs text-text-secondary">To Do ({stats.todoCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-blue-400 flex-shrink-0" />
                    <span className="text-xs text-text-secondary">In Progress ({stats.inProgressCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-400 flex-shrink-0" />
                    <span className="text-xs text-text-secondary">Done ({stats.doneCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-red-400 flex-shrink-0" />
                    <span className="text-xs text-text-secondary">Blocked ({stats.blockedCount})</span>
                  </div>
                </div>
              </div>

              {/* Overdue indicator */}
              <div className="flex flex-col items-center justify-center gap-3">
                {stats.overdueCount > 0 ? (
                  <>
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-400">{stats.overdueCount}</p>
                      <p className="text-sm text-red-400/80">overdue item{stats.overdueCount !== 1 ? 's' : ''}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckSquare className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-emerald-400">All on track</p>
                      <p className="text-xs text-text-muted mt-0.5">No overdue items</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Breakdown - Enhanced with progress rings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card variant="mote" className="relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-mote-400/10 rounded-full blur-3xl" />

          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-mote-400/20 to-mote-400/5 rounded-xl border border-mote-400/20">
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
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Total Scenarios</span>
                      <span className="text-text-primary font-semibold">{stats?.moteCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Active Projects</span>
                      <span className="text-mote-400 font-semibold">
                        {scenarios?.filter((s) => s.project === 'mote' && s.status === 'active').length ?? 0}
                      </span>
                    </div>
                  </div>
                  {stats?.totalScenarios ? (
                    <div className="relative ml-4">
                      <ProgressRing
                        progress={(stats.moteCount / stats.totalScenarios) * 100}
                        size={56}
                        strokeWidth={5}
                        color="#ee7996"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-mote-400">
                          {Math.round((stats.moteCount / stats.totalScenarios) * 100)}%
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="h-2 bg-surface-lighter rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mote-400 to-mote-300 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${stats?.totalScenarios ? (stats.moteCount / stats.totalScenarios) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="fundemar" className="relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-fundemar-400/10 rounded-full blur-3xl" />

          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-fundemar-400/20 to-fundemar-400/5 rounded-xl border border-fundemar-400/20">
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
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Total Scenarios</span>
                      <span className="text-text-primary font-semibold">{stats?.fundemarCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Active Projects</span>
                      <span className="text-fundemar-400 font-semibold">
                        {scenarios?.filter((s) => s.project === 'fundemar' && s.status === 'active').length ?? 0}
                      </span>
                    </div>
                  </div>
                  {stats?.totalScenarios ? (
                    <div className="relative ml-4">
                      <ProgressRing
                        progress={(stats.fundemarCount / stats.totalScenarios) * 100}
                        size={56}
                        strokeWidth={5}
                        color="#2cc4ff"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-fundemar-400">
                          {Math.round((stats.fundemarCount / stats.totalScenarios) * 100)}%
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="h-2 bg-surface-lighter rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fundemar-400 to-fundemar-300 rounded-full transition-all duration-700 ease-out"
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CheckSquare className="w-5 h-5 text-blue-400" />
              </div>
              <CardTitle>Recent Action Items</CardTitle>
            </div>
            <Link
              to="/actions"
              className="flex items-center gap-1 text-sm text-coral-400 hover:text-coral-300 transition-colors"
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
                    className="flex items-center gap-4 px-4 py-3 border-b border-ocean-700/30 last:border-0 hover:bg-surface-lighter/50 transition-colors"
                  >
                    {action.owner ? (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-coral-400/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-coral-400">
                          {action.owner.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-lighter flex items-center justify-center">
                        <span className="text-sm text-text-muted">?</span>
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
                                ? 'text-red-400'
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <CardTitle>Upcoming Events</CardTitle>
            </div>
            <Link
              to="/timeline"
              className="flex items-center gap-1 text-sm text-coral-400 hover:text-coral-300 transition-colors"
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
                    className="flex items-center gap-4 px-4 py-3 border-b border-ocean-700/30 last:border-0 hover:bg-surface-lighter/50 transition-colors"
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
