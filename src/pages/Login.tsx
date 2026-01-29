import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Github, Waves } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOAuthSignIn } from '../hooks/useAuth';

// Custom coral icon for branding
function CoralBrandIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main coral branch */}
      <path
        d="M24 44V28M24 28C24 28 16 24 16 16C16 8 24 4 24 4C24 4 32 8 32 16C32 24 24 28 24 28Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Side branches */}
      <path d="M16 16C16 16 10 14 8 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 16C32 16 38 14 40 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 12C20 12 16 9 12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M28 12C28 12 32 9 36 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {/* Coral polyps */}
      <circle cx="24" cy="8" r="2" fill="currentColor" opacity="0.9" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="30" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="12" cy="8" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="36" cy="8" r="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// Animated underwater background
function UnderwaterBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-ocean-950 via-ocean-900 to-ocean-800" />

      {/* Animated coral reef silhouette */}
      <svg className="absolute bottom-0 left-0 right-0 h-64 opacity-10" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path
          d="M0 200 L0 150 Q100 130, 150 140 Q200 150, 220 130 Q250 100, 280 120 Q320 150, 350 140 Q400 120, 450 150 Q500 180, 550 160 Q600 130, 650 150 Q700 170, 750 140 Q800 100, 850 130 Q900 160, 950 140 Q1000 120, 1050 150 Q1100 180, 1150 160 L1200 140 L1200 200 Z"
          fill="#4ecdc4"
        />
        <path
          d="M0 200 L0 170 Q80 150, 120 165 Q180 180, 220 160 Q280 130, 340 155 Q400 180, 460 165 Q520 140, 580 160 Q640 185, 700 165 Q760 140, 820 165 Q880 190, 940 170 Q1000 145, 1060 170 Q1120 195, 1180 175 L1200 165 L1200 200 Z"
          fill="#ee7996"
          opacity="0.5"
        />
      </svg>

      {/* Floating bubbles */}
      <div className="absolute w-3 h-3 bg-coral-400/20 rounded-full left-[10%] animate-float" style={{ bottom: '20%', animationDelay: '0s', animationDuration: '6s' }} />
      <div className="absolute w-2 h-2 bg-coral-400/15 rounded-full left-[25%] animate-float" style={{ bottom: '30%', animationDelay: '1s', animationDuration: '7s' }} />
      <div className="absolute w-4 h-4 bg-gold-400/10 rounded-full left-[40%] animate-float" style={{ bottom: '15%', animationDelay: '2s', animationDuration: '8s' }} />
      <div className="absolute w-2 h-2 bg-coral-400/20 rounded-full left-[70%] animate-float" style={{ bottom: '25%', animationDelay: '0.5s', animationDuration: '5s' }} />
      <div className="absolute w-3 h-3 bg-gold-400/15 rounded-full left-[85%] animate-float" style={{ bottom: '35%', animationDelay: '1.5s', animationDuration: '7s' }} />

      {/* Light rays */}
      <div className="absolute top-0 left-1/4 w-px h-96 bg-gradient-to-b from-coral-400/10 to-transparent transform rotate-12" />
      <div className="absolute top-0 left-1/2 w-px h-80 bg-gradient-to-b from-coral-400/15 to-transparent transform -rotate-6" />
      <div className="absolute top-0 left-3/4 w-px h-64 bg-gradient-to-b from-gold-400/10 to-transparent transform rotate-3" />
    </div>
  );
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function Login() {
  const { signIn, signUp, resetPassword, loading } = useAuth();
  const { mutate: signInWithOAuth, isPending: oauthLoading } = useOAuthSignIn();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (mode !== 'forgot' && !password) {
      setError('Please enter your password');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check your email for the confirmation link!');
          setMode('signin');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Password reset email sent! Check your inbox.');
          setMode('signin');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin':
        return 'Welcome back';
      case 'signup':
        return 'Create account';
      case 'forgot':
        return 'Reset password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin':
        return 'Sign in to access your RSE dashboard';
      case 'signup':
        return 'Join the coral conservation effort';
      case 'forgot':
        return "Enter your email and we'll send a reset link";
    }
  };

  const getButtonText = () => {
    if (loading) return 'Please wait...';
    switch (mode) {
      case 'signin':
        return 'Sign in';
      case 'signup':
        return 'Create account';
      case 'forgot':
        return 'Send reset link';
    }
  };

  return (
    <div className="min-h-screen flex bg-ocean-950 relative">
      <UnderwaterBackground />

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-coral-400/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-mote-400/10 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-fundemar-400/5 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </div>

        {/* Logo */}
        <div className="relative">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative p-3.5 bg-gradient-to-br from-coral-400/20 to-coral-400/5 rounded-2xl border border-coral-400/20 group-hover:border-coral-400/40 transition-all duration-300">
              <CoralBrandIcon className="w-10 h-10 text-coral-400" />
              <div className="absolute inset-0 rounded-2xl bg-coral-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">RSE Tracker</h1>
              <p className="text-sm text-coral-400/70 font-medium">Coral Conservation</p>
            </div>
          </Link>
        </div>

        {/* Content */}
        <div className="relative space-y-10">
          <div className="space-y-4">
            <h2 className="font-heading text-5xl font-extrabold text-text-primary leading-tight tracking-tight">
              Restoration Strategy
              <br />
              <span className="text-gradient">Evaluation Tool</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-md leading-relaxed">
              Track scenarios, manage action items, and coordinate coral restoration efforts across Mote and Fundemar projects.
            </p>
          </div>

          {/* Feature list with enhanced styling */}
          <div className="space-y-5">
            {[
              { text: 'Real-time collaboration across teams', color: 'bg-coral-400' },
              { text: 'Scenario planning and tracking', color: 'bg-mote-400' },
              { text: 'Timeline management for key milestones', color: 'bg-fundemar-400' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-text-secondary group">
                <div className={`w-2.5 h-2.5 rounded-full ${feature.color} shadow-lg transition-transform duration-200 group-hover:scale-125`} />
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Project badges */}
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 text-sm font-semibold rounded-xl project-mote border backdrop-blur-sm">
              Mote Marine Lab
            </span>
            <span className="px-4 py-2 text-sm font-semibold rounded-xl project-fundemar border backdrop-blur-sm">
              Fundemar
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-3 text-sm text-text-muted">
          <Waves className="w-5 h-5 text-coral-400/50" />
          <p>Protecting coral reefs for future generations</p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative p-3 bg-gradient-to-br from-coral-400/20 to-coral-400/5 rounded-xl border border-coral-400/20">
                <CoralBrandIcon className="w-8 h-8 text-coral-400" />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-xl text-text-primary tracking-tight">RSE Tracker</h1>
                <p className="text-xs text-coral-400/70 font-medium">Coral Conservation</p>
              </div>
            </Link>
          </div>

          {/* Form card with glassmorphism */}
          <div className="glass-card p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl font-extrabold text-text-primary tracking-tight">
                {getTitle()}
              </h2>
              <p className="mt-2 text-text-secondary leading-relaxed">
                {getSubtitle()}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3" role="alert" aria-live="assertive">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3" role="status" aria-live="polite">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-emerald-300">{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-surface-darker border border-ocean-700/50 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-coral-400/50 focus:border-coral-400/50 transition-colors"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password input (not shown for forgot mode) */}
              {mode !== 'forgot' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                      className="w-full pl-11 pr-12 py-3 bg-surface-darker border border-ocean-700/50 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-coral-400/50 focus:border-coral-400/50 transition-colors"
                      disabled={loading}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-coral-400/50 rounded"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot password link (only for signin) */}
              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-sm text-coral-400 hover:text-coral-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {getButtonText()}
              </button>
            </form>

            {/* OAuth Section */}
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ocean-700/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-surface-card text-text-muted">Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => signInWithOAuth('google')}
                  disabled={oauthLoading}
                  className="w-full py-3 px-4 bg-surface-darker border border-ocean-700/50 hover:bg-ocean-800 hover:border-ocean-600/50 disabled:opacity-50 text-text-primary font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {oauthLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                {/* GitHub Button */}
                <button
                  type="button"
                  onClick={() => signInWithOAuth('github')}
                  disabled={oauthLoading}
                  className="w-full py-3 px-4 bg-surface-darker border border-ocean-700/50 hover:bg-ocean-800 hover:border-ocean-600/50 disabled:opacity-50 text-text-primary font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  <Github className="w-5 h-5" />
                  {oauthLoading ? 'Signing in...' : 'Continue with GitHub'}
                </button>
              </div>
            </div>

            {/* Mode switch */}
            <div className="mt-8 pt-6 border-t border-ocean-700/50 text-center">
              {mode === 'signin' && (
                <p className="text-text-secondary">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-coral-400 hover:text-coral-300 font-medium transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              )}
              {mode === 'signup' && (
                <p className="text-text-secondary">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-coral-400 hover:text-coral-300 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <p className="text-text-secondary">
                  Remember your password?{' '}
                  <button
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-coral-400 hover:text-coral-300 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-text-muted">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
