import { useState, useMemo, useCallback, useEffect } from 'react';
import { format, isBefore, isToday, isTomorrow } from 'date-fns';
import {
  CheckSquare,
  Filter,
  Clock,
  User,
  AlertCircle,
  Circle,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  useActionItems,
  useUpdateActionItem,
  useDeleteActionItem,
  useRealtimeActionItems,
} from '../hooks/useSupabase';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { ListItemSkeleton } from '../components/Skeleton';
import Modal from '../components/Modal';
import DeleteConfirm from '../components/DeleteConfirm';
import { ActionItemForm } from '../components/forms';
import { useToast } from '../components/Toast';
import type { ActionItem, ActionItemStatus, Project } from '../types/database';

const statusOptions: { value: ActionItemStatus; label: string; icon: typeof Circle }[] = [
  { value: 'todo', label: 'To Do', icon: Circle },
  { value: 'in_progress', label: 'In Progress', icon: Loader2 },
  { value: 'done', label: 'Done', icon: CheckCircle2 },
  { value: 'blocked', label: 'Blocked', icon: XCircle },
];

const projectOptions: { value: Project | 'all'; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'mote', label: 'Mote' },
  { value: 'fundemar', label: 'Fundemar' },
];

type ViewMode = 'list' | 'kanban';

export default function ActionItems() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [statusFilter, setStatusFilter] = useState<ActionItemStatus | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<Project | 'all'>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ActionItem | null>(null);

  const queryClient = useQueryClient();
  const { data: actionItems, isLoading } = useActionItems();
  const updateActionItem = useUpdateActionItem();
  const deleteActionItem = useDeleteActionItem();
  const { success, error: showError } = useToast();

  // Enable realtime updates
  useRealtimeActionItems();

  // Handle keyboard shortcut for new item
  const openNewForm = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  useEffect(() => {
    const handleNewItem = () => openNewForm();
    window.addEventListener('rse:new-item', handleNewItem);
    return () => window.removeEventListener('rse:new-item', handleNewItem);
  }, [openNewForm]);

  // Get unique owners for filter
  const owners = useMemo(() => {
    if (!actionItems) return [];
    const ownerSet = new Set<string>();
    actionItems.forEach((item) => {
      if (item.owner) ownerSet.add(item.owner);
    });
    return Array.from(ownerSet).sort();
  }, [actionItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!actionItems) return [];
    return actionItems.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (projectFilter !== 'all' && item.project !== projectFilter) return false;
      if (ownerFilter !== 'all' && item.owner !== ownerFilter) return false;
      return true;
    });
  }, [actionItems, statusFilter, projectFilter, ownerFilter]);

  // Group items by status for Kanban view
  const itemsByStatus = useMemo(() => {
    const groups: Record<ActionItemStatus, typeof filteredItems> = {
      todo: [],
      in_progress: [],
      done: [],
      blocked: [],
    };
    filteredItems.forEach((item) => {
      groups[item.status].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Optimistic status update
  const handleStatusChange = useCallback(
    async (itemId: string, newStatus: ActionItemStatus) => {
      // Get current data for rollback
      const previousData = queryClient.getQueryData(['actionItems', undefined]) as ActionItem[] | undefined;

      // Optimistic update
      queryClient.setQueryData(['actionItems', undefined], (old: ActionItem[] | undefined) => {
        if (!old) return old;
        return old.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        );
      });

      try {
        await updateActionItem.mutateAsync({ id: itemId, updates: { status: newStatus } });
        success('Status updated');
      } catch {
        // Rollback on error
        queryClient.setQueryData(['actionItems', undefined], previousData);
        showError('Failed to update status');
      }
    },
    [queryClient, updateActionItem, success, showError]
  );

  // Inline owner editing
  const handleOwnerChange = useCallback(
    async (itemId: string, newOwner: string) => {
      const previousData = queryClient.getQueryData(['actionItems', undefined]) as ActionItem[] | undefined;

      queryClient.setQueryData(['actionItems', undefined], (old: ActionItem[] | undefined) => {
        if (!old) return old;
        return old.map((item) =>
          item.id === itemId ? { ...item, owner: newOwner || null } : item
        );
      });

      try {
        await updateActionItem.mutateAsync({ id: itemId, updates: { owner: newOwner || null } });
        success('Owner updated');
      } catch (error) {
        queryClient.setQueryData(['actionItems', undefined], previousData);
        showError('Failed to update owner');
      }
    },
    [queryClient, updateActionItem, success, showError]
  );

  const handleEdit = (item: ActionItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteActionItem.mutateAsync(deletingItem.id);
      success('Action item deleted successfully');
      setDeletingItem(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete action item');
    }
  };

  const getDueDateStatus = (dueDate: string | null, status: ActionItemStatus) => {
    if (!dueDate || status === 'done') return null;
    const date = new Date(dueDate);
    const now = new Date();

    if (isBefore(date, now) && !isToday(date)) {
      return { type: 'overdue' as const, label: 'Overdue' };
    }
    if (isToday(date)) {
      return { type: 'today' as const, label: 'Due today' };
    }
    if (isTomorrow(date)) {
      return { type: 'tomorrow' as const, label: 'Due tomorrow' };
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <CheckSquare className="w-7 h-7 md:w-8 md:h-8 text-coral-400 flex-shrink-0" />
            <span className="truncate">Action Items</span>
          </h1>
          <p className="mt-1.5 text-text-secondary text-pretty leading-relaxed">
            Track and manage project tasks and deliverables
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-surface-lighter/50 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'kanban'
                  ? 'bg-coral-400/20 text-coral-400 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-coral-400/20 text-coral-400 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Action Item</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ActionItemStatus | 'all')}
              className="select-field !py-1.5 !text-sm min-w-[140px]"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div className="relative">
            <label htmlFor="project-filter" className="sr-only">Filter by project</label>
            <select
              id="project-filter"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value as Project | 'all')}
              className="select-field !py-1.5 !text-sm min-w-[140px]"
              aria-label="Filter by project"
            >
              {projectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Owner Filter */}
          <div className="relative">
            <label htmlFor="owner-filter" className="sr-only">Filter by owner</label>
            <select
              id="owner-filter"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="select-field !py-1.5 !text-sm min-w-[140px]"
              aria-label="Filter by owner"
            >
              <option value="all">All Owners</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>

          {/* Item count */}
          <div className="ml-auto text-sm text-text-muted">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Card>
          <div className="space-y-0">
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
          </div>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card>
          <EmptyState
            variant={statusFilter !== 'all' || projectFilter !== 'all' || ownerFilter !== 'all' ? 'filter' : 'actions'}
            onAction={statusFilter === 'all' && projectFilter === 'all' && ownerFilter === 'all' ? openNewForm : undefined}
          />
        </Card>
      ) : viewMode === 'kanban' ? (
        // Kanban View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusOptions.map(({ value, label, icon: Icon }) => (
            <div key={value} className="flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-4 h-4 ${
                      value === 'todo'
                        ? 'text-slate-400'
                        : value === 'in_progress'
                        ? 'text-blue-400'
                        : value === 'done'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  />
                  <span className="text-sm font-medium text-text-primary">{label}</span>
                </div>
                <span className="text-xs text-text-muted bg-surface-lighter px-2 py-0.5 rounded-full">
                  {itemsByStatus[value].length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {itemsByStatus[value].length === 0 ? (
                  <div className="glass-card !p-4 text-center">
                    <p className="text-sm text-text-muted">No items</p>
                  </div>
                ) : (
                  itemsByStatus[value].map((item) => {
                    const dueDateStatus = getDueDateStatus(item.due_date, item.status);
                    return (
                      <Card key={item.id} hover className="!p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-text-primary line-clamp-2 flex-1">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 text-text-muted hover:text-coral-400 hover:bg-surface-lighter rounded-lg transition-colors"
                                aria-label="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingItem(item)}
                                className="p-1.5 text-text-muted hover:text-red-400 hover:bg-surface-lighter rounded-lg transition-colors"
                                aria-label="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {item.description && (
                            <p className="text-xs text-text-muted line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            {item.project && <StatusBadge variant="project" value={item.project} />}

                            {item.due_date && (
                              <span
                                className={`flex items-center gap-1 text-xs ${
                                  dueDateStatus?.type === 'overdue'
                                    ? 'text-red-400'
                                    : dueDateStatus?.type === 'today'
                                    ? 'text-amber-400'
                                    : 'text-text-muted'
                                }`}
                              >
                                {dueDateStatus?.type === 'overdue' && <AlertCircle className="w-3 h-3" />}
                                <Clock className="w-3 h-3" />
                                {format(new Date(item.due_date), 'MMM d')}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-ocean-700/30">
                            {/* Inline Owner Editing */}
                            <InlineOwnerEdit
                              owner={item.owner}
                              onSave={(newOwner) => handleOwnerChange(item.id, newOwner)}
                            />

                            {/* Status dropdown */}
                            <div className="relative">
                              <label htmlFor={`status-${item.id}`} className="sr-only">Change status for {item.title}</label>
                              <select
                                id={`status-${item.id}`}
                                value={item.status}
                                onChange={(e) =>
                                  handleStatusChange(item.id, e.target.value as ActionItemStatus)
                                }
                                className="appearance-none bg-transparent text-xs text-text-secondary hover:text-text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-coral-400/50 rounded pr-4"
                                aria-label={`Change status for ${item.title}`}
                              >
                                {statusOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" aria-hidden="true" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ocean-700/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Project</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Due Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const dueDateStatus = getDueDateStatus(item.due_date, item.status);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-ocean-700/30 last:border-0 hover:bg-surface-lighter/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-text-primary">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <InlineOwnerEdit
                          owner={item.owner}
                          onSave={(newOwner) => handleOwnerChange(item.id, newOwner)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        {item.project ? (
                          <StatusBadge variant="project" value={item.project} />
                        ) : (
                          <span className="text-sm text-text-muted">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {item.due_date ? (
                          <span
                            className={`flex items-center gap-1 text-sm ${
                              dueDateStatus?.type === 'overdue'
                                ? 'text-red-400'
                                : dueDateStatus?.type === 'today'
                                ? 'text-amber-400'
                                : 'text-text-secondary'
                            }`}
                          >
                            {dueDateStatus?.type === 'overdue' && <AlertCircle className="w-3 h-3" />}
                            {format(new Date(item.due_date), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-sm text-text-muted">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(item.id, e.target.value as ActionItemStatus)
                          }
                          className="select-field !py-1 !text-xs !px-2 !pr-6 w-auto"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-text-muted hover:text-coral-400 hover:bg-surface-lighter rounded-lg transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-surface-lighter rounded-lg transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingItem ? 'Edit Action Item' : 'New Action Item'}
        size="lg"
      >
        <ActionItemForm
          actionItem={editingItem || undefined}
          onSuccess={handleFormClose}
          onCancel={handleFormClose}
        />
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirm
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Action Item"
        description="Are you sure you want to delete this action item? This action cannot be undone."
        itemName={deletingItem?.title}
        isDeleting={deleteActionItem.isPending}
      />
    </div>
  );
}

// Inline Owner Edit Component
interface InlineOwnerEditProps {
  owner: string | null;
  onSave: (owner: string) => void;
}

function InlineOwnerEdit({ owner, onSave }: InlineOwnerEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(owner || '');

  const handleSave = () => {
    if (value !== (owner || '')) {
      onSave(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(owner || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-24 px-2 py-1 text-xs bg-surface-light border border-ocean-600 rounded focus:outline-none focus:ring-2 focus:ring-coral-400/50"
        placeholder="Owner name"
        aria-label="Owner name"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-2 group"
      aria-label={owner ? `Assigned to ${owner}. Click to change owner` : 'Click to assign owner'}
    >
      {owner ? (
        <>
          <div className="w-6 h-6 rounded-full bg-coral-400/20 flex items-center justify-center" aria-hidden="true">
            <span className="text-xs font-medium text-coral-400">
              {owner.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-text-secondary group-hover:text-coral-400 transition-colors">
            {owner}
          </span>
        </>
      ) : (
        <span className="flex items-center gap-2 text-text-muted group-hover:text-coral-400 transition-colors">
          <User className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs">Assign</span>
        </span>
      )}
    </button>
  );
}
