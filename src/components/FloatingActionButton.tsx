import { useState, useEffect, useRef } from 'react';
import { Plus, Layers, CheckSquare, Calendar } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface FABAction {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  color: string;
}

interface FloatingActionButtonProps {
  onNewScenario?: () => void;
  onNewAction?: () => void;
  onNewEvent?: () => void;
}

export default function FloatingActionButton({
  onNewScenario,
  onNewAction,
  onNewEvent,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Define actions based on current page
  const getActions = (): FABAction[] => {
    const currentPath = location.pathname;

    // Context-aware primary action
    if (currentPath.includes('/scenarios') && onNewScenario) {
      return [{ icon: Layers, label: 'New Scenario', onClick: onNewScenario, color: 'bg-coral-400' }];
    }
    if (currentPath.includes('/actions') && onNewAction) {
      return [{ icon: CheckSquare, label: 'New Action', onClick: onNewAction, color: 'bg-blue-500' }];
    }
    if (currentPath.includes('/timeline') && onNewEvent) {
      return [{ icon: Calendar, label: 'New Event', onClick: onNewEvent, color: 'bg-purple-500' }];
    }

    // Default: show all options
    return [
      {
        icon: Layers,
        label: 'New Scenario',
        onClick: () => {
          navigate('/scenarios');
          onNewScenario?.();
        },
        color: 'bg-coral-400',
      },
      {
        icon: CheckSquare,
        label: 'New Action',
        onClick: () => {
          navigate('/actions');
          onNewAction?.();
        },
        color: 'bg-blue-500',
      },
      {
        icon: Calendar,
        label: 'New Event',
        onClick: () => {
          navigate('/timeline');
          onNewEvent?.();
        },
        color: 'bg-purple-500',
      },
    ];
  };

  const actions = getActions();
  const isSingleAction = actions.length === 1;

  const handleMainClick = () => {
    if (isSingleAction) {
      actions[0].onClick();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-center gap-3" role="group" aria-label="Quick actions">
      {/* Action buttons */}
      {isOpen && !isSingleAction && (
        <div className="flex flex-col-reverse gap-2 animate-slide-up" role="menu" aria-orientation="vertical">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              role="menuitem"
              className={`
                flex items-center gap-3 px-4 py-3 rounded-full shadow-lg
                ${action.color} text-white font-medium
                hover:scale-105 active:scale-95
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-white/50
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <action.icon className="w-5 h-5" aria-hidden="true" />
              <span className="whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={handleMainClick}
        aria-label={isSingleAction ? actions[0].label : isOpen ? 'Close quick actions menu' : 'Open quick actions menu'}
        aria-expanded={!isSingleAction ? isOpen : undefined}
        aria-haspopup={!isSingleAction ? 'menu' : undefined}
        className={`
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          ${isSingleAction ? actions[0].color : 'bg-coral-400'}
          text-ocean-900
          hover:scale-110 active:scale-95
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-coral-400/50 focus:ring-offset-2 focus:ring-offset-ocean-900
        `}
      >
        {isSingleAction ? (
          (() => {
            const Icon = actions[0].icon;
            return <Icon className="w-6 h-6" aria-hidden="true" />;
          })()
        ) : (
          <Plus
            className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
}
