import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  compact?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'mote' | 'fundemar' | 'highlight';
  role?: string;
  'aria-label'?: string;
}

export default function Card({ children, className = '', hover = false, compact = false, onClick, variant = 'default', role: customRole, 'aria-label': ariaLabel }: CardProps) {
  const variantClasses = {
    default: '',
    mote: 'border-mote-400/20',
    fundemar: 'border-fundemar-400/20',
    highlight: 'border-coral-400/30',
  };

  const computedRole = customRole || (onClick ? 'button' : undefined);

  return (
    <div
      onClick={onClick}
      role={computedRole}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={`
        glass-card ${compact ? 'p-4' : 'p-5 lg:p-6'}
        transition-colors duration-150
        ${hover ? 'hover:border-ocean-300 cursor-pointer' : ''}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-5 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, className = '', as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component className={`font-heading font-bold text-lg text-text-primary tracking-tight ${className}`}>
      {children}
    </Component>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
  lines?: number;
}

export function CardDescription({ children, className = '', lines = 2 }: CardDescriptionProps) {
  const lineClamp = lines === 2 ? 'line-clamp-2' : lines === 3 ? 'line-clamp-3' : '';
  return (
    <p className={`text-sm text-text-secondary leading-relaxed text-pretty ${lineClamp} ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-5 pt-4 border-t border-surface-border ${className}`}>
      {children}
    </div>
  );
}

// New: Stat Card for dashboard metrics
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'mote' | 'fundemar';
  className?: string;
}

export function StatCard({ label, value, icon, trend, variant = 'default', className = '' }: StatCardProps) {
  const accentColors = {
    default: 'text-coral-400 bg-coral-400/10',
    mote: 'text-mote-400 bg-mote-400/10',
    fundemar: 'text-fundemar-400 bg-fundemar-400/10',
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-text-secondary font-medium">{label}</p>
          <p className="font-heading text-4xl font-extrabold text-text-primary tracking-tight">
            {value}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <svg
                className={`w-3 h-3 ${trend.value < 0 ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${accentColors[variant]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
