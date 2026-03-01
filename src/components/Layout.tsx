import { useState, useCallback } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  CheckSquare,
  Calendar,
  Menu,
  X,
  LogOut,
  User,
  Keyboard,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumbs from './Breadcrumbs';
import KeyboardShortcuts from './KeyboardShortcuts';
import GlobalSearch from './GlobalSearch';
import Tooltip from './Tooltip';

// Custom coral shell icon SVG
function CoralIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Coral branch pattern */}
      <path
        d="M12 22V14M12 14C12 14 8 12 8 8C8 4 12 2 12 2C12 2 16 4 16 8C16 12 12 14 12 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8C8 8 5 7 4 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 8C16 8 19 7 20 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 6C10 6 8 4.5 6 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M14 6C14 6 16 4.5 18 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Coral polyp dots */}
      <circle cx="12" cy="4" r="1" fill="currentColor" opacity="0.8" />
      <circle cx="9" cy="6" r="0.75" fill="currentColor" opacity="0.6" />
      <circle cx="15" cy="6" r="0.75" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Scenarios', href: '/scenarios', icon: Layers },
  { name: 'Action Items', href: '/actions', icon: CheckSquare },
  { name: 'Timeline', href: '/timeline', icon: Calendar },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, displayName, avatarUrl, signOut, loading } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  // This will be passed to pages that need it via context or callback
  const handleNewItem = useCallback(() => {
    // Dispatch a custom event that pages can listen to
    window.dispatchEvent(new CustomEvent('rse:new-item'));
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        role="complementary"
        aria-label="Main sidebar"
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-0
          w-72 h-screen
          bg-surface-card/95 backdrop-blur-md
          border-r border-surface-border
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-5 border-b border-surface-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2.5 bg-coral-400/10 rounded-xl border border-coral-400/15">
                <CoralIcon className="w-6 h-6 text-coral-400" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-lg text-text-primary tracking-tight">
                  RSE Tracker
                </h1>
                <p className="text-xs text-text-muted font-medium">
                  Coral Conservation
                </p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-lighter transition-all duration-200"
              aria-label="Close sidebar menu"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5" aria-label="Main navigation">
            {navigation.map((item, index) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `nav-link group ${isActive ? 'active' : ''}`
                }
                style={{ animationDelay: `${index * 0.05}s` }}
                aria-current={location.pathname === item.href ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
                <span className="font-medium">{item.name}</span>
                {location.pathname === item.href && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-coral-400" aria-hidden="true" />
                )}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-surface-border space-y-3">
            {/* User info */}
            {user && (
              <Link
                to="/profile"
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-lighter/50 border border-surface-border hover:bg-surface-hover hover:border-ocean-300 transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="p-2 bg-coral-400/10 rounded-full">
                    <User className="w-4 h-4 text-coral-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {displayName && (
                    <p className="text-sm font-medium text-text-primary truncate">
                      {displayName}
                    </p>
                  )}
                  <p className={`text-text-muted truncate ${displayName ? 'text-xs' : 'text-sm font-medium text-text-primary'}`}>
                    {user.email}
                  </p>
                </div>
              </Link>
            )}

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-lighter rounded-xl transition-all duration-200"
              aria-label="Sign out of your account"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="font-medium">Sign out</span>
            </button>

            {/* Keyboard shortcuts hint */}
            <Tooltip content="Press ? to view keyboard shortcuts" position="right">
              <button
                onClick={() => {
                  const event = new KeyboardEvent('keydown', { key: '?' });
                  document.dispatchEvent(event);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-text-muted hover:text-text-secondary hover:bg-surface-lighter rounded-xl transition-all duration-200"
              >
                <Keyboard className="w-4 h-4" />
                <span>Keyboard shortcuts</span>
                <kbd className="ml-auto px-1.5 py-0.5 bg-ocean-100 rounded text-[10px] font-mono text-text-muted border border-ocean-200">?</kbd>
              </button>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-surface-card/80 backdrop-blur-md border-b border-surface-border" role="banner">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-lighter transition-all duration-200"
              aria-label="Open sidebar menu"
              aria-expanded={sidebarOpen}
              aria-controls="main-sidebar"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>

            <div className="flex-1 flex items-center justify-center lg:justify-start">
              <GlobalSearch />
            </div>

            {/* Project indicators */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md project-mote border">
                Mote
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md project-fundemar border">
                Fundemar
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto" tabIndex={-1}>
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts onNewItem={handleNewItem} />
    </div>
  );
}
