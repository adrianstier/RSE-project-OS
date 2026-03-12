import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  CheckSquare,
  Calendar,
  User,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { useScenarios, useActionItems, useTimelineEvents } from '@/hooks/useSupabase';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const { data: scenarios } = useScenarios();
  const { data: actionItems } = useActionItems();
  const { data: timelineEvents } = useTimelineEvents();

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const topScenarios = scenarios?.slice(0, 5) ?? [];
  const topActionItems = actionItems?.slice(0, 5) ?? [];
  const topTimelineEvents = timelineEvents?.slice(0, 5) ?? [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/scenarios')}>
            <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Scenarios</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/actions')}>
            <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Action Items</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/timeline')}>
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Timeline</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/profile')}>
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Profile</span>
          </CommandItem>
        </CommandGroup>

        {/* Scenarios */}
        {topScenarios.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Scenarios">
              {topScenarios.map((s) => (
                <CommandItem
                  key={s.id}
                  onSelect={() => handleSelect('/scenarios')}
                >
                  <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{s.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground capitalize">
                    {s.project}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Action Items */}
        {topActionItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Action Items">
              {topActionItems.map((a) => (
                <CommandItem
                  key={a.id}
                  onSelect={() => handleSelect('/actions')}
                >
                  <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{a.title}</span>
                  {a.owner && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {a.owner}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Timeline Events */}
        {topTimelineEvents.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Timeline Events">
              {topTimelineEvents.map((t) => (
                <CommandItem
                  key={t.id}
                  onSelect={() => handleSelect('/timeline')}
                >
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{t.title}</span>
                  {t.event_type && (
                    <span className="ml-2 text-xs text-muted-foreground capitalize">
                      {t.event_type}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
