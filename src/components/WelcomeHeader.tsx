import { Sun, Moon, Cloud, X, Waves } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function getGreeting(): { text: string; icon: typeof Sun; color: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { text: 'Good morning', icon: Sun, color: 'text-gold-400' };
  } else if (hour >= 12 && hour < 17) {
    return { text: 'Good afternoon', icon: Cloud, color: 'text-coral-400' };
  } else {
    return { text: 'Good evening', icon: Moon, color: 'text-blue-400' };
  }
}

function getUserDisplayName(email: string | undefined): string {
  if (!email) return 'Researcher';

  // Extract name from email (before @)
  const namePart = email.split('@')[0];

  // Capitalize and format (handle common patterns like first.last)
  return namePart
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

interface WelcomeHeaderProps {
  showTip?: boolean;
  onDismissTip?: () => void;
}

export default function WelcomeHeader({ showTip = true, onDismissTip }: WelcomeHeaderProps) {
  const { user } = useAuth();
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const displayName = getUserDisplayName(user?.email);

  return (
    <div className="mb-8">
      <div className="flex items-start gap-4">
        {/* Icon with gradient background */}
        <div className="relative p-3 bg-gradient-to-br from-coral-400/15 to-gold-400/10 rounded-2xl border border-ocean-700/20" aria-hidden="true">
          <GreetingIcon className={`w-6 h-6 ${greeting.color}`} />
          {/* Subtle glow */}
          <div className="absolute inset-0 rounded-2xl bg-coral-400/10 blur-xl opacity-50" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
            {greeting.text},{' '}
            <span className="text-gradient text-balance">{displayName}</span>
          </h1>
          <p className="mt-2 text-text-secondary flex items-center gap-2 text-sm sm:text-base">
            <Waves className="w-4 h-4 text-coral-400/60 flex-shrink-0" aria-hidden="true" />
            <span className="text-pretty">Welcome to the RSE Coral Conservation Tracker</span>
          </p>
        </div>
      </div>

      {showTip && (
        <div className="mt-6 p-5 bg-gradient-to-r from-coral-400/5 to-gold-400/5 border border-coral-400/20 rounded-2xl animate-fade-in" role="complementary" aria-label="Pro tip">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-coral-400/10 rounded-xl" aria-hidden="true">
              <Waves className="w-5 h-5 text-coral-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-primary font-medium mb-1">
                Pro tip for faster navigation
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Press{' '}
                <kbd className="px-2 py-1 bg-ocean-700/50 rounded-lg text-xs font-mono text-coral-400 border border-ocean-600/50">?</kbd>{' '}
                to view keyboard shortcuts, or{' '}
                <kbd className="px-2 py-1 bg-ocean-700/50 rounded-lg text-xs font-mono text-coral-400 border border-ocean-600/50">n</kbd>{' '}
                to quickly create new items from anywhere.
              </p>
            </div>
            {onDismissTip && (
              <button
                onClick={onDismissTip}
                className="p-2 text-text-muted hover:text-text-secondary hover:bg-surface-lighter rounded-xl transition-all duration-200"
                aria-label="Dismiss tip"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
