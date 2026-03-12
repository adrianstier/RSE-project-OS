import { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  useScenarios,
  useActionItems,
  useDeleteScenario,
  useRealtimeScenarios,
} from '../hooks/useSupabase';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import ScenarioSheet from '../components/ScenarioSheet';
import { ScenarioForm } from '../components/forms';
import type { Project, Scenario, ScenarioStatus } from '../types/database';

// ============================================
// TYPES & CONSTANTS
// ============================================

type TabFilter = 'all' | Project;
type SortOption = 'updated' | 'created' | 'title';

const projectDotColors: Record<Project, string> = {
  mote: 'bg-mote-400',
  fundemar: 'bg-fundemar-400',
};

const projectLabels: Record<Project, string> = {
  mote: 'Mote',
  fundemar: 'Fundemar',
};

const tabs: { value: TabFilter; label: string; dotColor?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'mote', label: 'Mote', dotColor: 'bg-mote-400' },
  { value: 'fundemar', label: 'Fundemar', dotColor: 'bg-fundemar-400' },
];

const statusFilterOptions: { value: '' | ScenarioStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'updated', label: 'Last updated' },
  { value: 'created', label: 'Date created' },
  { value: 'title', label: 'Title A-Z' },
];

// ============================================
// SKELETON ROWS
// ============================================

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-6" />
      </TableCell>
    </TableRow>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function Scenarios() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'' | ScenarioStatus>('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');

  // Sheet state
  const [detailScenario, setDetailScenario] = useState<Scenario | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);

  // Data hooks
  const { data: scenarios, isLoading: scenariosLoading } = useScenarios();
  const { data: actionItems, isLoading: actionsLoading } = useActionItems();
  const deleteScenario = useDeleteScenario();

  // Enable realtime updates
  useRealtimeScenarios();

  // Handle keyboard shortcut for new item
  const openNewForm = useCallback(() => {
    setEditingScenario(null);
    setIsFormOpen(true);
  }, []);

  useEffect(() => {
    const handleNewItem = () => openNewForm();
    window.addEventListener('rse:new-item', handleNewItem);
    return () => window.removeEventListener('rse:new-item', handleNewItem);
  }, [openNewForm]);

  // Action items count per scenario
  const actionCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (actionItems) {
      for (const item of actionItems) {
        if (item.scenario_id) {
          map[item.scenario_id] = (map[item.scenario_id] || 0) + 1;
        }
      }
    }
    return map;
  }, [actionItems]);

  // Filter and sort
  const filteredScenarios = useMemo(() => {
    if (!scenarios) return [];
    let result = [...scenarios];

    // Project filter
    if (activeTab !== 'all') {
      result = result.filter((s) => s.project === activeTab);
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [scenarios, activeTab, statusFilter, sortBy]);

  // Handlers
  const handleRowClick = (scenario: Scenario) => {
    setDetailScenario(scenario);
    setIsDetailOpen(true);
  };

  const handleEdit = (scenario: Scenario) => {
    setIsDetailOpen(false);
    setEditingScenario(scenario);
    setIsFormOpen(true);
  };

  const handleDelete = async (scenarioId: string) => {
    try {
      await deleteScenario.mutateAsync(scenarioId);
      toast.success('Scenario deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete scenario');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingScenario(null);
  };

  const isLoading = scenariosLoading || actionsLoading;
  const totalCount = scenarios?.length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Scenarios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} scenario{totalCount !== 1 ? 's' : ''} across 2 projects
          </p>
        </div>
        <Button onClick={openNewForm}>
          <Plus className="w-4 h-4" />
          New Scenario
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Project tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1" role="tablist" aria-label="Filter by project">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              role="tab"
              aria-selected={activeTab === tab.value}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                ${
                  activeTab === tab.value
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {tab.dotColor && (
                <span className={`w-2 h-2 rounded-full ${tab.dotColor}`} aria-hidden="true" />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <Select
          value={statusFilter === '' ? '__all__' : statusFilter}
          onValueChange={(v) => setStatusFilter(v === '__all__' ? '' : v as ScenarioStatus)}
        >
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((opt) => (
              <SelectItem key={opt.value === '' ? '__all__' : opt.value} value={opt.value === '' ? '__all__' : opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger className="w-40" aria-label="Sort scenarios">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-lg" aria-busy="true" aria-label="Loading scenarios">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Scenario</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </TableBody>
          </Table>
        </div>
      ) : filteredScenarios.length > 0 ? (
        <div className="bg-card border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Scenario</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScenarios.map((scenario) => (
                <TableRow
                  key={scenario.id}
                  onClick={() => handleRowClick(scenario)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(scenario);
                    }
                  }}
                  aria-label={`View scenario: ${scenario.title}`}
                >
                  {/* Scenario title + description */}
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {scenario.title}
                      </p>
                      {scenario.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {scenario.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Project dot + label */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${projectDotColors[scenario.project]}`}
                        aria-hidden="true"
                      />
                      <span className="text-sm text-muted-foreground">
                        {projectLabels[scenario.project]}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge type="scenario-status" value={scenario.status} />
                  </TableCell>

                  {/* Data status */}
                  <TableCell>
                    <StatusBadge type="data-status" value={scenario.data_status} />
                  </TableCell>

                  {/* Action items count */}
                  <TableCell className="text-right">
                    <span className="text-sm text-muted-foreground">
                      {actionCountMap[scenario.id] ?? 0}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg">
          <EmptyState
            variant={activeTab === 'all' && !statusFilter ? 'scenarios' : 'filter'}
            title={
              activeTab === 'all' && !statusFilter
                ? undefined
                : 'No matching scenarios'
            }
            description={
              activeTab === 'all' && !statusFilter
                ? undefined
                : 'Try adjusting your filters to see more results.'
            }
            onAction={activeTab === 'all' && !statusFilter ? openNewForm : undefined}
          />
        </div>
      )}

      {/* Detail Sheet */}
      <ScenarioSheet
        scenario={detailScenario}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteScenario.isPending}
      />

      {/* Form Sheet for Create/Edit */}
      <Sheet open={isFormOpen} onOpenChange={handleFormClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingScenario ? 'Edit Scenario' : 'New Scenario'}</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <ScenarioForm
              scenario={editingScenario || undefined}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
