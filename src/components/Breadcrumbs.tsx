import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  scenarios: 'Scenarios',
  actions: 'Action Items',
  timeline: 'Timeline',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on dashboard (root)
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
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
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-text-muted" aria-hidden="true" />
            )}
            {item.href ? (
              <Link
                to={item.href}
                className="flex items-center gap-1 text-text-secondary hover:text-coral-400 transition-colors"
              >
                {index === 0 && <Home className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="text-text-primary font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
