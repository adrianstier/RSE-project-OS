import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface Step {
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface ProgressIndicatorProps {
  steps: Step[];
  className?: string;
}

export default function ProgressIndicator({ steps, className = '' }: ProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex((step) => step.status === 'in_progress');
  const completedCount = steps.filter((step) => step.status === 'completed').length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className={`space-y-4 ${className}`} role="group" aria-label="Progress indicator">
      {/* Progress bar */}
      <div className="relative">
        <div
          className="h-2 bg-surface-lighter rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-label={`${completedCount} of ${steps.length} steps completed`}
        >
          <div
            className="h-full bg-gradient-to-r from-coral-400 to-coral-300 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-text-muted text-right" aria-hidden="true">
          {completedCount} of {steps.length} completed
        </p>
      </div>

      {/* Steps */}
      <ol className="space-y-2" aria-label="Progress steps">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = step.status === 'completed';

          return (
            <li
              key={index}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-colors
                ${isActive ? 'bg-coral-400/10 border border-coral-400/30' : 'bg-surface-lighter/50'}
              `}
              aria-current={isActive ? 'step' : undefined}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 text-coral-400 flex-shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                <Circle className="w-5 h-5 text-text-muted flex-shrink-0" aria-hidden="true" />
              )}
              <span
                className={`text-sm ${
                  isCompleted
                    ? 'text-emerald-400'
                    : isActive
                    ? 'text-coral-400 font-medium'
                    : 'text-text-muted'
                }`}
              >
                {step.label}
                <span className="sr-only">
                  {isCompleted ? ' - completed' : isActive ? ' - in progress' : ' - pending'}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
