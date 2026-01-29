import type {
  ScenarioStatus,
  ScenarioPriority,
  DataStatus,
  ActionItemStatus,
  TimelineEventType,
  Project,
} from '../types/database';

type BadgeVariant = 'status' | 'priority' | 'data' | 'action' | 'event' | 'project';

interface StatusBadgeProps {
  variant: BadgeVariant;
  value: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const statusConfig: Record<ScenarioStatus, { label: string; className: string }> = {
  planning: { label: 'Planning', className: 'status-planning' },
  active: { label: 'Active', className: 'status-active' },
  completed: { label: 'Completed', className: 'status-completed' },
  on_hold: { label: 'On Hold', className: 'status-on_hold' },
};

const priorityConfig: Record<ScenarioPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'priority-low' },
  medium: { label: 'Medium', className: 'priority-medium' },
  high: { label: 'High', className: 'priority-high' },
  critical: { label: 'Critical', className: 'priority-critical' },
};

const dataStatusConfig: Record<DataStatus, { label: string; className: string }> = {
  'data-ready': { label: 'Data Ready', className: 'data-ready' },
  'data-partial': { label: 'Partial Data', className: 'data-partial' },
  'data-pending': { label: 'Pending', className: 'data-pending' },
};

const actionStatusConfig: Record<ActionItemStatus, { label: string; className: string }> = {
  todo: { label: 'To Do', className: 'action-todo' },
  in_progress: { label: 'In Progress', className: 'action-in_progress' },
  done: { label: 'Done', className: 'action-done' },
  blocked: { label: 'Blocked', className: 'action-blocked' },
};

const eventTypeConfig: Record<TimelineEventType, { label: string; className: string }> = {
  milestone: { label: 'Milestone', className: 'event-milestone' },
  deadline: { label: 'Deadline', className: 'event-deadline' },
  meeting: { label: 'Meeting', className: 'event-meeting' },
  deliverable: { label: 'Deliverable', className: 'event-deliverable' },
};

const projectConfig: Record<Project, { label: string; className: string; icon: string; fullName: string }> = {
  mote: { label: 'Mote', className: 'project-mote', icon: 'M', fullName: 'Mote Marine' },
  fundemar: { label: 'Fundemar', className: 'project-fundemar', icon: 'F', fullName: 'Fundemar' },
};

function getConfig(variant: BadgeVariant, value: string) {
  switch (variant) {
    case 'status':
      return statusConfig[value as ScenarioStatus] ?? { label: value, className: 'bg-slate-500/15 text-slate-400 border-slate-500/25' };
    case 'priority':
      return priorityConfig[value as ScenarioPriority] ?? { label: value, className: 'bg-slate-500/15 text-slate-400 border-slate-500/25' };
    case 'data':
      return dataStatusConfig[value as DataStatus] ?? { label: value, className: 'bg-slate-500/15 text-slate-400 border-slate-500/25' };
    case 'action':
      return actionStatusConfig[value as ActionItemStatus] ?? { label: value, className: 'bg-slate-500/15 text-slate-400 border-slate-500/25' };
    case 'event':
      return eventTypeConfig[value as TimelineEventType] ?? { label: value, className: 'bg-slate-500/15 text-slate-400 border-slate-500/25' };
    case 'project':
      return projectConfig[value as Project] ?? { label: value, className: 'bg-slate-500/15 text-slate-400 border-slate-500/25', icon: '?' };
    default:
      return { label: value, className: 'bg-slate-500/15 text-slate-400 border-slate-500/25' };
  }
}

export default function StatusBadge({ variant, value, size = 'sm', showDot = false }: StatusBadgeProps) {
  const config = getConfig(variant, value);
  const isProject = variant === 'project';
  const projectConf = isProject ? projectConfig[value as Project] : null;
  const isPriority = variant === 'priority';
  const isStatus = variant === 'status';
  const isAction = variant === 'action';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-sm',
  };

  // Enhanced status icons
  const shouldShowDot = showDot || isPriority || isStatus || isAction;

  // Generate accessible label based on variant
  const getAriaLabel = () => {
    switch (variant) {
      case 'status':
        return `Status: ${config.label}`;
      case 'priority':
        return `Priority: ${config.label}`;
      case 'data':
        return `Data status: ${config.label}`;
      case 'action':
        return `Action status: ${config.label}`;
      case 'event':
        return `Event type: ${config.label}`;
      case 'project':
        return `Project: ${config.label}`;
      default:
        return config.label;
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full border
        ${config.className}
        ${sizeClasses[size]}
        transition-all duration-200 hover:scale-[1.02]
        backdrop-blur-sm
        shadow-sm
      `}
      role="status"
      aria-label={getAriaLabel()}
    >
      {/* Status dot for priority, status, and action variants */}
      {shouldShowDot && !isProject && (
        <span
          className={`
            w-2 h-2 rounded-full bg-current
            ${value === 'critical' || value === 'blocked' ? 'animate-pulse' : ''}
          `}
          style={{ boxShadow: '0 0 4px currentColor' }}
          aria-hidden="true"
        />
      )}

      {/* Project icon for project badges */}
      {isProject && projectConf && (
        <span className="w-4 h-4 rounded bg-current/25 flex items-center justify-center text-[10px] font-bold shadow-inner" aria-hidden="true">
          {projectConf.icon}
        </span>
      )}

      {config.label}
    </span>
  );
}

// Larger project badge with more visual emphasis
interface ProjectBadgeLargeProps {
  project: Project;
  className?: string;
  showFullName?: boolean;
}

export function ProjectBadgeLarge({ project, className = '', showFullName = false }: ProjectBadgeLargeProps) {
  const config = projectConfig[project];

  return (
    <div
      className={`
        inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl
        ${config.className}
        border backdrop-blur-sm
        transition-all duration-200 hover:scale-[1.02]
        shadow-sm
        ${className}
      `}
    >
      <span className="w-7 h-7 rounded-lg bg-current/25 flex items-center justify-center text-sm font-bold shadow-inner">
        {config.icon}
      </span>
      <span className="font-semibold tracking-tight">{showFullName ? config.fullName : config.label}</span>
    </div>
  );
}

// Health indicator badge
interface HealthBadgeProps {
  status: 'healthy' | 'warning' | 'critical';
  label?: string;
  size?: 'sm' | 'md';
}

export function HealthBadge({ status, label, size = 'sm' }: HealthBadgeProps) {
  const statusClasses = {
    healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    critical: 'bg-red-500/15 text-red-400 border-red-500/25',
  };

  const dotClasses = {
    healthy: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    warning: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    critical: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const defaultLabels = {
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-2 font-medium rounded-full border
        ${statusClasses[status]}
        ${sizeClasses[size]}
        backdrop-blur-sm
      `}
    >
      <span className={`w-2 h-2 rounded-full ${dotClasses[status]}`} />
      {label ?? defaultLabels[status]}
    </span>
  );
}
