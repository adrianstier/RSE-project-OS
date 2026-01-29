import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shell, Loader2 } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface ProtectedRouteProps {
  children: ReactNode;
  /** Redirect path for unauthenticated users (default: /login) */
  redirectTo?: string;
  /** Custom loading component */
  loadingComponent?: ReactNode;
}

// ============================================
// LOADING COMPONENT
// ============================================

function DefaultLoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-ocean-950 via-ocean-900 to-ocean-950">
      <div className="text-center">
        {/* Animated logo */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-coral-400/10 animate-ping" />
          </div>
          <div className="relative p-4 bg-surface-card rounded-full border border-ocean-700/50">
            <Shell className="w-12 h-12 text-coral-400" />
          </div>
        </div>

        {/* Loading text */}
        <div className="flex items-center justify-center gap-3 text-text-secondary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Authenticating...</span>
        </div>

        {/* Subtitle */}
        <p className="mt-4 text-sm text-text-muted">
          RSE Tracker - Coral Conservation
        </p>
      </div>
    </div>
  );
}

// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  loadingComponent,
}: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (!initialized || loading) {
    return loadingComponent ?? <DefaultLoadingComponent />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Save the attempted location for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

// ============================================
// PUBLIC ROUTE COMPONENT
// ============================================
// Redirects authenticated users away from login/signup pages

interface PublicRouteProps {
  children: ReactNode;
  /** Redirect path for authenticated users (default: /dashboard) */
  redirectTo?: string;
}

export function PublicRoute({
  children,
  redirectTo = '/dashboard',
}: PublicRouteProps) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (!initialized || loading) {
    return <DefaultLoadingComponent />;
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    // Check if there's a saved location to redirect to
    const from = (location.state as { from?: Location })?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // User is not authenticated, render children (login/signup page)
  return <>{children}</>;
}
