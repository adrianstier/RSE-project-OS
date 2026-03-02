import { Sun, Moon, Cloud } from 'lucide-react';
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

export default function WelcomeHeader() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const displayName = getUserDisplayName(user?.email);

  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-coral-400/10 rounded-xl" aria-hidden="true">
        <GreetingIcon className={`w-5 h-5 ${greeting.color}`} />
      </div>
      <div className="min-w-0">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
          {greeting.text}, {displayName}
        </h1>
        <p className="text-text-secondary text-sm">
          RSE Coral Conservation Tracker
        </p>
      </div>
    </div>
  );
}
