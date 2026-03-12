import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  CheckSquare,
  Calendar,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Scenarios', href: '/scenarios', icon: Layers },
  { name: 'Action Items', href: '/actions', icon: CheckSquare },
  { name: 'Timeline', href: '/timeline', icon: Calendar },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobile = false,
  onClose,
}: SidebarProps) {
  const { user, displayName, avatarUrl, signOut, loading } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavClick = () => {
    if (mobile && onClose) {
      onClose();
    }
  };

  const initials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="flex flex-col h-full bg-white border-r border-border">
      {/* Header */}
      <div
        className={cn(
          'flex items-center h-14 border-b border-border',
          collapsed && !mobile ? 'justify-center px-2' : 'justify-between px-4',
        )}
      >
        {(!collapsed || mobile) && (
          <Link to="/" className="flex items-center gap-2.5" onClick={handleNavClick}>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white text-xs font-bold">
              R
            </div>
            <span className="font-semibold text-sm text-foreground tracking-tight">
              RSE Tracker
            </span>
          </Link>
        )}
        {collapsed && !mobile && (
          <Link to="/" className="flex items-center justify-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white text-xs font-bold">
              R
            </div>
          </Link>
        )}
        {!mobile && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              collapsed && 'absolute -right-3 top-4 z-10 bg-white border border-border shadow-sm rounded-full p-0.5',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-2.5 rounded-md text-sm transition-colors',
                collapsed && !mobile ? 'justify-center px-2 py-2' : 'px-2.5 py-1.5',
                isActive
                  ? 'bg-accent font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed && !mobile ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'shrink-0',
                  collapsed && !mobile ? 'h-5 w-5' : 'h-4 w-4',
                )}
                aria-hidden="true"
              />
              {(!collapsed || mobile) && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-2">
        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2.5 w-full rounded-md text-sm transition-colors hover:bg-accent',
                  collapsed && !mobile ? 'justify-center p-2' : 'px-2.5 py-2',
                )}
              >
                <Avatar className="h-7 w-7">
                  {avatarUrl && (
                    <AvatarImage
                      src={avatarUrl}
                      alt={displayName ?? ''}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {(!collapsed || mobile) && (
                  <div className="flex-1 min-w-0 text-left">
                    {displayName && (
                      <p className="text-sm font-medium text-foreground truncate">
                        {displayName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side={collapsed && !mobile ? 'right' : 'top'}
              align="start"
              className="w-56 p-1"
            >
              <Link
                to="/profile"
                onClick={handleNavClick}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                <span>Profile</span>
              </Link>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
