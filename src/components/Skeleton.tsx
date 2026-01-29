interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ className = '', variant = 'default' }: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-lg',
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`skeleton ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-ocean-700/30 flex justify-center">
        <Skeleton className="h-4 w-24 rounded" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-10 w-16 rounded-lg" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <Skeleton className="h-14 w-14 rounded-xl" />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-ocean-700/30 last:border-0">
      <Skeleton className="h-10 w-10 rounded-full" variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-8">
      {/* Month header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-ocean-700/50" />
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="h-px flex-1 bg-ocean-700/50" />
      </div>

      {/* Timeline items */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-6" style={{ animationDelay: `${i * 0.1}s` }}>
          {/* Timeline node */}
          <div className="flex flex-col items-center">
            <Skeleton className="w-9 h-9 rounded-full" variant="circular" />
            <Skeleton className="w-0.5 h-20 rounded-full mt-2" />
          </div>

          {/* Event card */}
          <div className="flex-1 glass-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
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

// Dashboard project card skeleton
export function ProjectCardSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4 mb-5">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-8 rounded" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-8 rounded" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <Skeleton className="h-11 w-24 rounded-xl" />
        <Skeleton className="h-11 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

// Bubble loading indicator
export function BubbleLoader({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'w-1.5 h-1.5',
    default: 'w-2 h-2',
    large: 'w-3 h-3',
  };

  return (
    <div className="bubble-loader" role="status" aria-label="Loading">
      <span className={sizeClasses[size]} />
      <span className={sizeClasses[size]} />
      <span className={sizeClasses[size]} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Oceanic spinner
export function OceanSpinner({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-10 h-10',
    large: 'w-14 h-14',
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]}`} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full page loading state
export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <OceanSpinner size="large" />
      <div className="text-center space-y-2">
        <p className="text-text-secondary font-medium">Loading data...</p>
        <p className="text-sm text-text-muted">Connecting to the reef</p>
      </div>
    </div>
  );
}
