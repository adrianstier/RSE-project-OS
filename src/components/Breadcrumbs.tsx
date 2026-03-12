import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  scenarios: 'Scenarios',
  actions: 'Action Items',
  timeline: 'Timeline',
  profile: 'Profile',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on dashboard
  if (
    pathnames.length === 0 ||
    (pathnames.length === 1 && pathnames[0] === 'dashboard')
  ) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/dashboard' },
    ...pathnames.map((segment, index) => {
      const href = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      return {
        label: routeLabels[segment] || segment,
        href: isLast ? undefined : href,
      };
    }),
  ];

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            {item.href ? (
              <Link
                to={item.href}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {index === 0 && <Home className="h-3.5 w-3.5" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={cn('font-medium text-foreground')}
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
