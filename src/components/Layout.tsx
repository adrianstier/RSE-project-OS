import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import CommandPalette from '@/components/CommandPalette';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Skip to content link for a11y */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-72 transform transition-transform duration-200 ease-in-out lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        role="complementary"
        aria-label="Mobile navigation"
      >
        <Sidebar
          collapsed={false}
          onToggleCollapse={() => {}}
          mobile
          onClose={() => setSidebarOpen(false)}
        />
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'relative hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-200 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-60',
        )}
        role="complementary"
        aria-label="Main navigation"
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between h-14 bg-white/80 backdrop-blur-sm border-b border-border px-4 lg:px-6"
          role="banner"
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Breadcrumbs (hidden on dashboard) */}
            {!isDashboard && <Breadcrumbs />}
          </div>

          {/* Search trigger */}
          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-muted-foreground bg-muted hover:bg-accent rounded-md border border-border transition-colors"
            aria-label="Search (Cmd+K)"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-border text-muted-foreground">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </button>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-auto"
          tabIndex={-1}
        >
          <div className="animate-fade-in p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

    </div>
  );
}
