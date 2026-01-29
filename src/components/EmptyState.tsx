import { ReactNode } from 'react';
import { Inbox, Search, FileQuestion, Calendar, CheckSquare, Layers, Plus, ArrowRight, Shell, Waves } from 'lucide-react';

type EmptyStateVariant = 'default' | 'search' | 'scenarios' | 'actions' | 'timeline' | 'filter' | 'welcome';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

// Coral reef SVG illustration
function CoralIllustration({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background bubbles */}
      <circle cx="30" cy="30" r="4" fill="#4ecdc4" fillOpacity="0.2">
        <animate attributeName="cy" values="30;20;30" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="170" cy="50" r="3" fill="#4ecdc4" fillOpacity="0.15">
        <animate attributeName="cy" values="50;40;50" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="60" r="2" fill="#fed766" fillOpacity="0.2">
        <animate attributeName="cy" values="60;50;60" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="150" cy="25" r="2.5" fill="#4ecdc4" fillOpacity="0.15">
        <animate attributeName="cy" values="25;15;25" dur="3.5s" repeatCount="indefinite" />
      </circle>

      {/* Ocean floor */}
      <path d="M0 140 Q50 130, 100 140 T200 140 V160 H0 Z" fill="#0f576f" fillOpacity="0.3" />

      {/* Main coral - branching */}
      <g transform="translate(80, 60)">
        <path d="M20 80 Q20 60, 10 40 Q5 30, 15 20 Q20 15, 15 5" stroke="#ee7996" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M20 80 Q25 55, 35 35 Q40 25, 35 15 Q30 8, 40 0" stroke="#ee7996" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M20 80 Q15 65, 5 50" stroke="#ee7996" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M20 80 Q30 70, 45 55" stroke="#ee7996" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Coral polyps */}
        <circle cx="15" cy="5" r="4" fill="#ee7996" fillOpacity="0.6" />
        <circle cx="40" cy="0" r="4" fill="#ee7996" fillOpacity="0.6" />
        <circle cx="5" cy="50" r="3" fill="#ee7996" fillOpacity="0.6" />
        <circle cx="45" cy="55" r="3" fill="#ee7996" fillOpacity="0.6" />
        <circle cx="10" cy="40" r="2" fill="#ee7996" fillOpacity="0.4" />
        <circle cx="35" cy="35" r="2" fill="#ee7996" fillOpacity="0.4" />
      </g>

      {/* Brain coral */}
      <g transform="translate(30, 100)">
        <ellipse cx="25" cy="25" rx="25" ry="20" fill="#4ecdc4" fillOpacity="0.3" />
        <path d="M10 20 Q25 15, 40 20" stroke="#4ecdc4" strokeWidth="2" fill="none" />
        <path d="M8 28 Q25 22, 42 28" stroke="#4ecdc4" strokeWidth="2" fill="none" />
        <path d="M12 35 Q25 30, 38 35" stroke="#4ecdc4" strokeWidth="2" fill="none" />
      </g>

      {/* Fan coral */}
      <g transform="translate(140, 80)">
        <path d="M15 50 Q15 35, 0 20 Q-5 15, 0 10" stroke="#fed766" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M15 50 Q18 30, 15 15 Q15 8, 20 5" stroke="#fed766" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M15 50 Q25 35, 35 20 Q40 12, 35 5" stroke="#fed766" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M15 50 Q10 40, 5 30" stroke="#fed766" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M15 50 Q20 40, 25 30" stroke="#fed766" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>

      {/* Small fish */}
      <g transform="translate(60, 45)">
        <ellipse cx="10" cy="5" rx="8" ry="4" fill="#4ecdc4" fillOpacity="0.4">
          <animateTransform attributeName="transform" type="translate" values="0,0; 10,-5; 20,0; 10,5; 0,0" dur="8s" repeatCount="indefinite" />
        </ellipse>
        <path d="M18 5 L25 2 L25 8 Z" fill="#4ecdc4" fillOpacity="0.4">
          <animateTransform attributeName="transform" type="translate" values="0,0; 10,-5; 20,0; 10,5; 0,0" dur="8s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Seaweed */}
      <path d="M170 140 Q165 120, 175 100 Q180 90, 170 80" stroke="#4ecdc4" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4">
        <animate attributeName="d" values="M170 140 Q165 120, 175 100 Q180 90, 170 80; M170 140 Q175 120, 165 100 Q160 90, 170 80; M170 140 Q165 120, 175 100 Q180 90, 170 80" dur="4s" repeatCount="indefinite" />
      </path>
      <path d="M180 140 Q185 125, 175 110 Q170 100, 180 90" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3">
        <animate attributeName="d" values="M180 140 Q185 125, 175 110 Q170 100, 180 90; M180 140 Q175 125, 185 110 Q190 100, 180 90; M180 140 Q185 125, 175 110 Q170 100, 180 90" dur="3.5s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

// Wave animation SVG
function WaveDecoration() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden opacity-20">
      <svg viewBox="0 0 1200 30" preserveAspectRatio="none" className="w-full h-full">
        <path
          d="M0 15 Q150 0, 300 15 T600 15 T900 15 T1200 15 V30 H0 Z"
          fill="url(#waveGradient)"
        >
          <animate
            attributeName="d"
            values="M0 15 Q150 0, 300 15 T600 15 T900 15 T1200 15 V30 H0 Z;
                    M0 15 Q150 30, 300 15 T600 15 T900 15 T1200 15 V30 H0 Z;
                    M0 15 Q150 0, 300 15 T600 15 T900 15 T1200 15 V30 H0 Z"
            dur="6s"
            repeatCount="indefinite"
          />
        </path>
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ecdc4" />
            <stop offset="50%" stopColor="#fed766" />
            <stop offset="100%" stopColor="#4ecdc4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

const variantConfig: Record<EmptyStateVariant, {
  icon: typeof Inbox;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: typeof Plus;
  showIllustration?: boolean;
}> = {
  default: {
    icon: Inbox,
    title: 'No data found',
    description: 'There is nothing to display here yet.',
    showIllustration: false,
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
    showIllustration: false,
  },
  scenarios: {
    icon: Layers,
    title: 'No scenarios yet',
    description: 'Create your first restoration scenario to start tracking coral conservation strategies.',
    actionLabel: 'Create First Scenario',
    actionIcon: Plus,
    showIllustration: true,
  },
  actions: {
    icon: CheckSquare,
    title: 'No action items',
    description: 'Action items help you track tasks and deliverables. Create one to get started!',
    actionLabel: 'Create Action Item',
    actionIcon: Plus,
    showIllustration: true,
  },
  timeline: {
    icon: Calendar,
    title: 'No upcoming events',
    description: 'Add milestones, deadlines, and meetings to keep your project on track.',
    actionLabel: 'Add First Event',
    actionIcon: Plus,
    showIllustration: true,
  },
  filter: {
    icon: FileQuestion,
    title: 'No matching items',
    description: 'Try adjusting your filters to see more results.',
    showIllustration: false,
  },
  welcome: {
    icon: Shell,
    title: 'Welcome to RSE Tracker!',
    description: 'Start by creating your first scenario, action item, or timeline event to begin tracking your coral conservation efforts.',
    actionLabel: 'Get Started',
    actionIcon: ArrowRight,
    showIllustration: true,
  },
};

export default function EmptyState({
  variant = 'default',
  title,
  description,
  action,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const showAction = action || (onAction && (actionLabel || config.actionLabel));

  return (
    <div className="relative flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in overflow-hidden">
      {/* Coral illustration for relevant states */}
      {config.showIllustration && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <CoralIllustration className="w-full max-w-md h-auto" />
        </div>
      )}

      {/* Icon container with ocean theme */}
      <div className="relative mb-8 z-10">
        <div className="relative">
          {/* Animated rings */}
          <div className="absolute inset-0 -m-2 rounded-2xl bg-coral-400/5 animate-pulse" />
          <div className="absolute inset-0 -m-4 rounded-3xl bg-coral-400/3" />

          {/* Main icon container */}
          <div className="relative p-6 bg-surface-lighter/80 backdrop-blur-sm rounded-2xl border border-ocean-700/30">
            <Icon className="w-12 h-12 text-coral-400" />
          </div>

          {/* Decorative bubbles */}
          {variant === 'welcome' && (
            <>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-coral-400 rounded-full animate-bounce-once" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gold-400/60 rounded-full animate-pulse" />
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md">
        <h3 className="font-heading font-bold text-2xl text-text-primary mb-3 tracking-tight text-balance">
          {title ?? config.title}
        </h3>
        <p className="text-base text-text-secondary leading-relaxed mb-8 text-pretty">
          {description ?? config.description}
        </p>

        {showAction && (
          <div>
            {action || (
              <button
                onClick={onAction}
                className={`
                  ${variant === 'welcome' ? 'btn-gold' : 'btn-primary'}
                  flex items-center gap-2 group mx-auto
                `}
              >
                {config.actionIcon && <config.actionIcon className="w-5 h-5" />}
                <span className="font-semibold">{actionLabel || config.actionLabel}</span>
                {variant === 'welcome' && (
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Helpful tips */}
      {(variant === 'scenarios' || variant === 'actions' || variant === 'timeline') && (
        <div className="relative z-10 mt-10 pt-6 border-t border-ocean-700/30 w-full max-w-md">
          <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
            <Waves className="w-4 h-4 text-coral-400/50" />
            <span>
              Tip: Press{' '}
              <kbd className="px-2 py-1 bg-ocean-700/50 rounded-lg text-xs font-mono text-coral-400 border border-ocean-600/50">n</kbd>{' '}
              to quickly create new items
            </span>
          </div>
        </div>
      )}

      {/* Wave decoration at bottom */}
      <WaveDecoration />
    </div>
  );
}
