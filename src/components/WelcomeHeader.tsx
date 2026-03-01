import { Sun, Moon, Cloud, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function getGreeting(): { text: string; icon: typeof Sun; color: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { text: 'Good morning', icon: Sun, color: 'text-gold-400' };
  } else if (hour >= 12 && hour < 17) {
    return { text: 'Good afternoon', icon: Cloud, color: 'text-coral-400' };
  } else {
    return { text: 'Good evening', icon: Moon, color: 'text-blue-600' };
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
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-coral-400/10 rounded-xl" aria-hidden="true">
          <GreetingIcon className={`w-5 h-5 ${greeting.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            {greeting.text}, {displayName}
          </h1>
          <p className="mt-1 text-text-secondary text-sm">
            RSE Coral Conservation Tracker
          </p>
        </div>
      </div>

      {showTip && (
        <div className="mt-4 p-4 bg-surface-card border border-surface-border rounded-lg" role="complementary" aria-label="Pro tip">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-text-secondary">
                Press{' '}
                <kbd className="px-1.5 py-0.5 bg-ocean-100 rounded text-xs font-mono text-text-muted border border-ocean-200">?</kbd>{' '}
                for keyboard shortcuts or{' '}
                <kbd className="px-1.5 py-0.5 bg-ocean-100 rounded text-xs font-mono text-text-muted border border-ocean-200">n</kbd>{' '}
                to create new items.
              </p>
            </div>
            {onDismissTip && (
              <button
                onClick={onDismissTip}
                className="p-1.5 text-text-muted hover:text-text-secondary rounded-lg transition-colors"
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
