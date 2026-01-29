import { useState, useMemo, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  CheckSquare,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  useScenarios,
  useActionItems,
  useDeleteScenario,
  useRealtimeScenarios,
} from '../hooks/useSupabase';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import Modal from '../components/Modal';
import DeleteConfirm from '../components/DeleteConfirm';
import { ScenarioForm } from '../components/forms';
import { useToast } from '../components/Toast';
import type { Project, Scenario } from '../types/database';

type TabFilter = 'all' | Project;

const tabs: { value: TabFilter; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'mote', label: 'Mote Marine' },
  { value: 'fundemar', label: 'Fundemar' },
];

export default function Scenarios() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [deletingScenario, setDeletingScenario] = useState<Scenario | null>(null);

  const { data: scenarios, isLoading: scenariosLoading } = useScenarios();
  const { data: actionItems, isLoading: actionsLoading } = useActionItems();
  const deleteScenario = useDeleteScenario();
  const { success, error: showError } = useToast();

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

  const filteredScenarios = useMemo(() => {
    if (!scenarios) return [];
    if (activeTab === 'all') return scenarios;
    return scenarios.filter((s) => s.project === activeTab);
  }, [scenarios, activeTab]);

  const getScenarioActions = (scenarioId: string) => {
    if (!actionItems) return [];
    return actionItems.filter((a) => a.scenario_id === scenarioId);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEdit = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingScenario(null);
  };

  const handleDelete = async () => {
    if (!deletingScenario) return;

    try {
      await deleteScenario.mutateAsync(deletingScenario.id);
      success('Scenario deleted successfully');
      setDeletingScenario(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete scenario');
    }
  };

  const isLoading = scenariosLoading || actionsLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Layers className="w-7 h-7 md:w-8 md:h-8 text-coral-400 flex-shrink-0" />
            <span className="truncate">Scenarios</span>
          </h1>
          <p className="mt-1.5 text-text-secondary text-pretty leading-relaxed">
            Restoration strategy scenarios for coral conservation
          </p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-sm text-text-muted whitespace-nowrap">
            {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Scenario</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Tab Filter */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter scenarios by project">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            role="tab"
            aria-selected={activeTab === tab.value}
            aria-controls="scenarios-panel"
            id={`tab-${tab.value}`}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${
                activeTab === tab.value
                  ? 'bg-coral-400/20 text-coral-400 border border-coral-400/40'
                  : 'bg-surface-lighter text-text-secondary hover:text-text-primary hover:bg-ocean-700 border border-transparent'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div
        id="scenarios-panel"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        aria-live="polite"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6" aria-busy="true" aria-label="Loading scenarios">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredScenarios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6" role="list" aria-label={`${filteredScenarios.length} scenarios`}>
            {filteredScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                actions={getScenarioActions(scenario.id)}
                isExpanded={expandedId === scenario.id}
                onToggleExpand={() => toggleExpand(scenario.id)}
                onEdit={() => handleEdit(scenario)}
                onDelete={() => setDeletingScenario(scenario)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              variant={activeTab === 'all' ? 'scenarios' : 'filter'}
              title={activeTab === 'all' ? undefined : `No ${activeTab === 'mote' ? 'Mote' : 'Fundemar'} scenarios`}
              description={
                activeTab === 'all'
                  ? undefined
                  : `There are no scenarios for the ${activeTab === 'mote' ? 'Mote Marine Laboratory' : 'Fundemar'} project yet.`
              }
              onAction={activeTab === 'all' ? openNewForm : undefined}
            />
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingScenario ? 'Edit Scenario' : 'New Scenario'}
        size="lg"
      >
        <ScenarioForm
          scenario={editingScenario || undefined}
          onSuccess={handleFormClose}
          onCancel={handleFormClose}
        />
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirm
        isOpen={!!deletingScenario}
        onClose={() => setDeletingScenario(null)}
        onConfirm={handleDelete}
        title="Delete Scenario"
        description="Are you sure you want to delete this scenario? This action cannot be undone."
        itemName={deletingScenario?.title}
        isDeleting={deleteScenario.isPending}
      />
    </div>
  );
}

interface ScenarioCardProps {
  scenario: Scenario;
  actions: { id: string; title: string; status: string }[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ScenarioCard({ scenario, actions, isExpanded, onToggleExpand, onEdit, onDelete }: ScenarioCardProps) {
  return (
    <Card hover onClick={onToggleExpand} className="flex flex-col" role="listitem">
      <CardHeader className="flex-shrink-0">
        <div className="flex-1 min-w-0">
          <CardTitle className="truncate">{scenario.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant="project" value={scenario.project} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-text-muted hover:text-coral-400 hover:bg-surface-lighter rounded-lg transition-colors"
            aria-label="Edit scenario"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-surface-lighter rounded-lg transition-colors"
            aria-label="Delete scenario"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <CardDescription lines={isExpanded ? undefined : 2}>
          {scenario.description ?? 'No description provided.'}
        </CardDescription>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <StatusBadge variant="status" value={scenario.status} />
          <StatusBadge variant="priority" value={scenario.priority} />
          <StatusBadge variant="data" value={scenario.data_status} />
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-6 pt-4 border-t border-ocean-700/50 space-y-4 animate-fade-in">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar className="w-4 h-4" />
                <span>Created</span>
              </div>
              <div className="text-text-primary">
                {format(new Date(scenario.created_at), 'MMM d, yyyy')}
              </div>

              <div className="flex items-center gap-2 text-text-secondary">
                <FileText className="w-4 h-4" />
                <span>Updated</span>
              </div>
              <div className="text-text-primary">
                {format(new Date(scenario.updated_at), 'MMM d, yyyy')}
              </div>
            </div>

            {/* Linked Action Items */}
            {actions.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-text-primary mb-3">
                  <CheckSquare className="w-4 h-4 text-coral-400" />
                  Linked Action Items ({actions.length})
                </h4>
                <div className="space-y-2">
                  {actions.slice(0, 5).map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-2 bg-surface-lighter rounded-lg"
                    >
                      <span className="text-sm text-text-secondary truncate flex-1 mr-2">
                        {action.title}
                      </span>
                      <StatusBadge variant="action" value={action.status} />
                    </div>
                  ))}
                  {actions.length > 5 && (
                    <p className="text-xs text-text-muted text-center py-1">
                      +{actions.length - 5} more items
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="flex items-center justify-center gap-2 w-full text-sm text-text-secondary hover:text-coral-400 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Show less</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Show details</span>
            </>
          )}
        </button>
      </CardFooter>
    </Card>
  );
}
