import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, Waves } from 'lucide-react';
import { useOAuthSignIn } from '../hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Custom coral icon for branding
function CoralBrandIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 44V28M24 28C24 28 16 24 16 16C16 8 24 4 24 4C24 4 32 8 32 16C32 24 24 28 24 28Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 16C16 16 10 14 8 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 16C32 16 38 14 40 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 12C20 12 16 9 12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M28 12C28 12 32 9 36 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <circle cx="24" cy="8" r="2" fill="currentColor" opacity="0.9" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="30" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="12" cy="8" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="36" cy="8" r="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export default function Login() {
  const { mutate: signInWithOAuth, isPending: oauthLoading } = useOAuthSignIn();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    setError(null);
    signInWithOAuth('google', {
      onError: () => setError('Failed to sign in with Google. Please try again.'),
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-muted text-foreground">
        {/* Logo */}
        <div className="relative">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="p-3.5 bg-background rounded-xl border border-border group-hover:border-foreground/30 transition-colors">
              <CoralBrandIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-2xl text-foreground tracking-tight">RSE Tracker</h1>
              <p className="text-sm text-muted-foreground">Coral Conservation</p>
            </div>
          </Link>
        </div>

        {/* Content */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold text-foreground leading-tight tracking-tight">
              Restoration Strategy
              <br />
              <span className="text-muted-foreground">Evaluation Tool</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Track scenarios, manage action items, and coordinate coral restoration efforts across Mote and Fundemar projects.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Real-time collaboration across teams',
              'Scenario planning and tracking',
              'Timeline management for key milestones',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-foreground/40" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 text-sm font-medium rounded-lg project-mote border">
              Mote Marine Lab
            </span>
            <span className="px-3 py-1.5 text-sm font-medium rounded-lg project-fundemar border">
              Fundemar
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-3 text-sm text-muted-foreground">
          <Waves className="w-5 h-5 text-muted-foreground/50" />
          <p>Protecting coral reefs for future generations</p>
        </div>
      </div>

      {/* Right side - Google Sign In */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-3 bg-muted rounded-xl border border-border">
                <CoralBrandIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-xl text-foreground tracking-tight">RSE Tracker</h1>
                <p className="text-xs text-muted-foreground">Coral Conservation</p>
              </div>
            </Link>
          </div>

          {/* Sign in card */}
          <Card className="p-8">
            <CardHeader className="p-0 pb-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  Welcome
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Sign in to access your RSE dashboard
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Error message */}
              {error && (
                <div className="mb-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 flex items-start gap-3" role="alert">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={oauthLoading}
                className="w-full py-3 h-auto text-base font-medium"
              >
                {oauthLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                {oauthLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
