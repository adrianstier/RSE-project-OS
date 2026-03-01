import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Layers, CheckSquare, Calendar, X } from 'lucide-react';
import { useScenarios, useActionItems, useTimelineEvents } from '../hooks/useSupabase';

interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  category: 'scenario' | 'action_item' | 'timeline_event';
  href: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: scenarios } = useScenarios();
  const { data: actionItems } = useActionItems();
  const { data: timelineEvents } = useTimelineEvents();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the DOM render
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      setQuery('');
      setDebouncedQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search results
  const results = useMemo<SearchResult[]>(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    const matched: SearchResult[] = [];

    // Search scenarios
    scenarios?.forEach((s) => {
      if (
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      ) {
        matched.push({
          id: s.id,
          title: s.title,
          description: s.description,
          category: 'scenario',
          href: '/scenarios',
        });
      }
    });

    // Search action items
    actionItems?.forEach((a) => {
      if (
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
      ) {
        matched.push({
          id: a.id,
          title: a.title,
          description: a.description,
          category: 'action_item',
          href: '/actions',
        });
      }
    });

    // Search timeline events
    timelineEvents?.forEach((t) => {
      if (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      ) {
        matched.push({
          id: t.id,
          title: t.title,
          description: t.description,
          category: 'timeline_event',
          href: '/timeline',
        });
      }
    });

    return matched.slice(0, 20);
  }, [debouncedQuery, scenarios, actionItems, timelineEvents]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setIsOpen(false);
      navigate(result.href);
    },
    [navigate]
  );

  // Keyboard navigation inside search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.querySelector('[data-selected="true"]');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const categoryIcon = (cat: SearchResult['category']) => {
    switch (cat) {
      case 'scenario':
        return <Layers className="w-4 h-4 text-coral-400" />;
      case 'action_item':
        return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'timeline_event':
        return <Calendar className="w-4 h-4 text-purple-600" />;
    }
  };

  const categoryLabel = (cat: SearchResult['category']) => {
    switch (cat) {
      case 'scenario':
        return 'Scenario';
      case 'action_item':
        return 'Action Item';
      case 'timeline_event':
        return 'Event';
    }
  };

  // Group results by category
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    return groups;
  }, [results]);

  // Flat index mapping for keyboard nav
  const flatResults = results;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-text-secondary bg-surface-hover/50 hover:bg-surface-hover rounded-lg border border-surface-border transition-colors"
        aria-label="Search (Cmd+K)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-ocean-100 rounded border border-ocean-200 text-text-muted">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ocean-900/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Search dialog */}
      <div
        className="relative w-full max-w-lg mx-4 bg-surface-card/95 backdrop-blur-md border border-surface-border rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-surface-border">
          <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search scenarios, action items, events..."
            className="flex-1 py-4 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-sm"
            aria-label="Search query"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto">
          {debouncedQuery.trim() && results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-muted">No results found for "{debouncedQuery}"</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => {
              return (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wider bg-surface-hover/30">
                    {categoryLabel(category as SearchResult['category'])}s
                  </div>
                  {items.map((result) => {
                    const flatIndex = flatResults.indexOf(result);
                    const isSelected = flatIndex === selectedIndex;
                    return (
                      <button
                        key={result.id}
                        data-selected={isSelected}
                        onClick={() => handleSelect(result)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'bg-coral-400/10 text-text-primary'
                            : 'text-text-secondary hover:bg-surface-hover'
                        }`}
                      >
                        {categoryIcon(result.category)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.title}</p>
                          {result.description && (
                            <p className="text-xs text-text-muted truncate mt-0.5">
                              {result.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-surface-border flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-ocean-100 rounded font-mono border border-ocean-200">&#8593;&#8595;</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-ocean-100 rounded font-mono border border-ocean-200">&#8629;</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-ocean-100 rounded font-mono border border-ocean-200">esc</kbd>
              close
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
