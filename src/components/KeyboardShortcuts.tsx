import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['g', 'd'], description: 'Go to Dashboard' },
      { keys: ['g', 's'], description: 'Go to Scenarios' },
      { keys: ['g', 'a'], description: 'Go to Action Items' },
      { keys: ['g', 't'], description: 'Go to Timeline' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['n'], description: 'New item (context-aware)' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close modal / cancel' },
    ],
  },
];

interface KeyboardShortcutsProps {
  onNewItem?: () => void;
}

export default function KeyboardShortcuts({ onNewItem }: KeyboardShortcutsProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [pendingChord, setPendingChord] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Handle chord sequences (g + second key)
      if (pendingChord === 'g') {
        e.preventDefault();
        setPendingChord(null);

        switch (key) {
          case 'd':
            navigate('/dashboard');
            break;
          case 's':
            navigate('/scenarios');
            break;
          case 'a':
            navigate('/actions');
            break;
          case 't':
            navigate('/timeline');
            break;
        }
        return;
      }

      // Start chord sequence
      if (key === 'g') {
        e.preventDefault();
        setPendingChord('g');
        // Clear pending chord after 1 second
        setTimeout(() => setPendingChord(null), 1000);
        return;
      }

      // Single key shortcuts
      switch (key) {
        case '?':
          e.preventDefault();
          setIsHelpOpen(true);
          break;
        case 'n':
          e.preventDefault();
          onNewItem?.();
          break;
        case 'escape':
          setIsHelpOpen(false);
          break;
      }
    },
    [pendingChord, navigate, onNewItem]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Clear pending chord on route change
  useEffect(() => {
    setPendingChord(null);
  }, [location.pathname]);

  if (!isHelpOpen) {
    return (
      <>
        {/* Chord indicator */}
        {pendingChord && (
          <div className="fixed bottom-20 right-6 z-50 px-4 py-2 bg-ocean-800 rounded-lg shadow-lg animate-fade-in">
            <span className="text-sm text-white font-mono">
              <span className="text-coral-400">{pendingChord}</span> + ...
            </span>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ocean-900/80 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsHelpOpen(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-card/95 backdrop-blur-md border border-surface-border rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-coral-400/10 rounded-lg">
              <Keyboard className="w-5 h-5 text-coral-400" />
            </div>
            <h2 id="shortcuts-title" className="font-heading text-xl font-semibold text-text-primary">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-lighter rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-medium text-text-secondary mb-3">{group.title}</h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-lighter transition-colors"
                    >
                      <span className="text-sm text-text-primary">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            {keyIndex > 0 && <span className="text-text-muted text-xs">then</span>}
                            <kbd className="px-2 py-1 text-xs font-mono bg-ocean-100 text-text-primary rounded border border-ocean-200">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-border">
          <p className="text-xs text-text-muted text-center">
            Press <kbd className="px-1.5 py-0.5 bg-ocean-100 rounded text-text-secondary font-mono border border-ocean-200">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}
