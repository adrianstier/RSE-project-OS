import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { format, isBefore, isToday, isTomorrow } from 'date-fns';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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
  GripVertical,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  useActionItems,
  useUpdateActionItem,
  useDeleteActionItem,
  useRealtimeActionItems,
} from '../hooks/useSupabase';
import { useAuth } from '../contexts/AuthContext';
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
  const [activeId, setActiveId] = useState<string | null>(null);

  // Feature 1: My Tasks toggle
  const { user } = useAuth();
  const [showMyTasks, setShowMyTasks] = useState<boolean>(() => {
    const stored = localStorage.getItem('rse-my-tasks-preference');
    if (stored !== null) return stored === 'true';
    return false; // default to All Tasks
  });

  // Persist preference
  useEffect(() => {
    localStorage.setItem('rse-my-tasks-preference', String(showMyTasks));
  }, [showMyTasks]);

  const queryClient = useQueryClient();
  const { data: actionItems, isLoading } = useActionItems();
  const updateActionItem = useUpdateActionItem();
  const deleteActionItem = useDeleteActionItem();
  const { success, error: showError } = useToast();

  // Enable realtime updates
  useRealtimeActionItems();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

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

  // Filter items (with My Tasks support)
  const filteredItems = useMemo(() => {
    if (!actionItems) return [];
    return actionItems.filter((item) => {
      // My Tasks filter
      if (showMyTasks && user?.email) {
        const userEmail = user.email.toLowerCase();
        const ownerValue = (item.owner || '').toLowerCase();
        // Match by email or by display name (part before @)
        const displayName = userEmail.split('@')[0];
        if (ownerValue !== userEmail && ownerValue !== displayName) {
          return false;
        }
      }
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (projectFilter !== 'all' && item.project !== projectFilter) return false;
      if (ownerFilter !== 'all' && item.owner !== ownerFilter) return false;
      return true;
    });
  }, [actionItems, statusFilter, projectFilter, ownerFilter, showMyTasks, user]);

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

  // Get the active item for drag overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return filteredItems.find((item) => item.id === activeId) || null;
  }, [activeId, filteredItems]);

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

  // Feature 2: Quick toggle done
  const handleQuickToggleDone = useCallback(
    (item: ActionItem) => {
      const newStatus: ActionItemStatus = item.status === 'done' ? 'todo' : 'done';
      handleStatusChange(item.id, newStatus);
    },
    [handleStatusChange]
  );

  // DnD handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const itemId = active.id as string;
      const newStatus = over.id as ActionItemStatus;

      // Find the item to check its current status
      const item = filteredItems.find((i) => i.id === itemId);
      if (!item || item.status === newStatus) return;

      handleStatusChange(itemId, newStatus);
    },
    [filteredItems, handleStatusChange]
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
      } catch {
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
          {/* Feature 1: My Tasks / All Tasks toggle */}
          {user && (
            <div className="flex items-center gap-1.5 bg-surface-hover p-1 rounded-lg">
              <button
                onClick={() => setShowMyTasks(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  showMyTasks
                    ? 'bg-coral-400/20 text-coral-400'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                aria-pressed={showMyTasks}
              >
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">My Tasks</span>
              </button>
              <button
                onClick={() => setShowMyTasks(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  !showMyTasks
                    ? 'bg-coral-400/20 text-coral-400'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                aria-pressed={!showMyTasks}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">All Tasks</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-surface-hover p-1 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'kanban'
                  ? 'bg-coral-400/20 text-coral-400'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-coral-400/20 text-coral-400'
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
            variant={statusFilter !== 'all' || projectFilter !== 'all' || ownerFilter !== 'all' || showMyTasks ? 'filter' : 'actions'}
            onAction={statusFilter === 'all' && projectFilter === 'all' && ownerFilter === 'all' && !showMyTasks ? openNewForm : undefined}
          />
        </Card>
      ) : viewMode === 'kanban' ? (
        // Kanban View with Drag and Drop
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <KanbanBoard
            itemsByStatus={itemsByStatus}
            onEdit={handleEdit}
            onDelete={setDeletingItem}
            onOwnerChange={handleOwnerChange}
            onStatusChange={handleStatusChange}
            onQuickToggleDone={handleQuickToggleDone}
            getDueDateStatus={getDueDateStatus}
          />

          {/* Drag Overlay */}
          <DragOverlay>
            {activeItem ? (
              <DragOverlayCard
                item={activeItem}
                getDueDateStatus={getDueDateStatus}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        // List View
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
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
                      className="border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className={`text-sm font-medium text-text-primary ${item.status === 'done' ? 'line-through opacity-60' : ''}`}>
                          {item.title}
                        </p>
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
                            className="p-1.5 text-text-muted hover:text-coral-400 hover:bg-surface-hover rounded-lg transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-surface-hover rounded-lg transition-colors"
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

// Feature 5: Kanban Board with keyboard navigation
interface KanbanBoardProps {
  itemsByStatus: Record<ActionItemStatus, ActionItem[]>;
  onEdit: (item: ActionItem) => void;
  onDelete: (item: ActionItem) => void;
  onOwnerChange: (itemId: string, newOwner: string) => void;
  onStatusChange: (itemId: string, newStatus: ActionItemStatus) => void;
  onQuickToggleDone: (item: ActionItem) => void;
  getDueDateStatus: (dueDate: string | null, status: ActionItemStatus) => { type: 'overdue' | 'today' | 'tomorrow'; label: string } | null;
}

const STATUS_ORDER: ActionItemStatus[] = ['todo', 'in_progress', 'done', 'blocked'];

function KanbanBoard({
  itemsByStatus,
  onEdit,
  onDelete,
  onOwnerChange,
  onStatusChange,
  onQuickToggleDone,
  getDueDateStatus,
}: KanbanBoardProps) {
  const [focusedCol, setFocusedCol] = useState(0);
  const [focusedRow, setFocusedRow] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  // Build a 2D grid of item IDs for keyboard nav
  const grid = useMemo(() => {
    return STATUS_ORDER.map((status) => itemsByStatus[status]);
  }, [itemsByStatus]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is within the board
      if (!boardRef.current?.contains(document.activeElement)) return;

      const target = e.target as HTMLElement;
      // Skip if in input/select
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      const currentColItems = grid[focusedCol];

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const nextRow = Math.min(focusedRow + 1, currentColItems.length - 1);
          setFocusedRow(nextRow);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prevRow = Math.max(focusedRow - 1, 0);
          setFocusedRow(prevRow);
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const nextCol = Math.min(focusedCol + 1, STATUS_ORDER.length - 1);
          setFocusedCol(nextCol);
          // Clamp row to new column
          const nextColItems = grid[nextCol];
          if (focusedRow >= nextColItems.length) {
            setFocusedRow(Math.max(nextColItems.length - 1, 0));
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const prevCol = Math.max(focusedCol - 1, 0);
          setFocusedCol(prevCol);
          const prevColItems = grid[prevCol];
          if (focusedRow >= prevColItems.length) {
            setFocusedRow(Math.max(prevColItems.length - 1, 0));
          }
          break;
        }
        case ' ': {
          // Space to toggle done
          e.preventDefault();
          const item = currentColItems[focusedRow];
          if (item) {
            onQuickToggleDone(item);
          }
          break;
        }
        case 'Enter': {
          // Enter to open edit
          e.preventDefault();
          const editItem = currentColItems[focusedRow];
          if (editItem) {
            onEdit(editItem);
          }
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedCol, focusedRow, grid, onEdit, onQuickToggleDone]);

  // Focus the correct card when focusedCol/focusedRow changes
  useEffect(() => {
    const item = grid[focusedCol]?.[focusedRow];
    if (item && boardRef.current) {
      const card = boardRef.current.querySelector(`[data-card-id="${item.id}"]`) as HTMLElement | null;
      card?.focus();
    }
  }, [focusedCol, focusedRow, grid]);

  return (
    <div ref={boardRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusOptions.map(({ value, label, icon: Icon }, colIndex) => (
        <KanbanColumn
          key={value}
          status={value}
          label={label}
          icon={Icon}
          items={itemsByStatus[value]}
          onEdit={onEdit}
          onDelete={onDelete}
          onOwnerChange={onOwnerChange}
          onStatusChange={onStatusChange}
          onQuickToggleDone={onQuickToggleDone}
          getDueDateStatus={getDueDateStatus}
          focusedItemIndex={focusedCol === colIndex ? focusedRow : -1}
          onCardFocus={(rowIndex) => {
            setFocusedCol(colIndex);
            setFocusedRow(rowIndex);
          }}
        />
      ))}
    </div>
  );
}

// Kanban Column Component
interface KanbanColumnProps {
  status: ActionItemStatus;
  label: string;
  icon: typeof Circle;
  items: ActionItem[];
  onEdit: (item: ActionItem) => void;
  onDelete: (item: ActionItem) => void;
  onOwnerChange: (itemId: string, newOwner: string) => void;
  onStatusChange: (itemId: string, newStatus: ActionItemStatus) => void;
  onQuickToggleDone: (item: ActionItem) => void;
  getDueDateStatus: (dueDate: string | null, status: ActionItemStatus) => { type: 'overdue' | 'today' | 'tomorrow'; label: string } | null;
  focusedItemIndex: number;
  onCardFocus: (rowIndex: number) => void;
}

function KanbanColumn({
  status,
  label,
  icon: Icon,
  items,
  onEdit,
  onDelete,
  onOwnerChange,
  onStatusChange,
  onQuickToggleDone,
  getDueDateStatus,
  focusedItemIndex,
  onCardFocus,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Icon
            className={`w-4 h-4 ${
              status === 'todo'
                ? 'text-slate-400'
                : status === 'in_progress'
                ? 'text-blue-400'
                : status === 'done'
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          />
          <span className="text-sm font-medium text-text-primary">{label}</span>
        </div>
        <span className="text-xs text-text-muted bg-surface-hover px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-3 flex-1 min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? 'bg-coral-400/10 ring-2 ring-coral-400/30' : 'bg-transparent'
        }`}
      >
        {items.length === 0 ? (
          <div className="glass-card !p-4 text-center">
            <p className="text-sm text-text-muted">No items</p>
          </div>
        ) : (
          items.map((item, index) => (
            <DraggableCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onOwnerChange={onOwnerChange}
              onStatusChange={onStatusChange}
              onQuickToggleDone={onQuickToggleDone}
              getDueDateStatus={getDueDateStatus}
              isFocused={focusedItemIndex === index}
              onFocus={() => onCardFocus(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Draggable Card Component
interface DraggableCardProps {
  item: ActionItem;
  onEdit: (item: ActionItem) => void;
  onDelete: (item: ActionItem) => void;
  onOwnerChange: (itemId: string, newOwner: string) => void;
  onStatusChange: (itemId: string, newStatus: ActionItemStatus) => void;
  onQuickToggleDone: (item: ActionItem) => void;
  getDueDateStatus: (dueDate: string | null, status: ActionItemStatus) => { type: 'overdue' | 'today' | 'tomorrow'; label: string } | null;
  isFocused: boolean;
  onFocus: () => void;
}

function DraggableCard({
  item,
  onEdit,
  onDelete,
  onOwnerChange,
  onStatusChange,
  onQuickToggleDone,
  getDueDateStatus,
  isFocused,
  onFocus,
}: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDateStatus = getDueDateStatus(item.due_date, item.status);
  const isDone = item.status === 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-card-id={item.id}
      tabIndex={0}
      onFocus={onFocus}
      className={`glass-card !p-4 outline-none transition-all duration-150 ${
        isDragging ? 'shadow-lg ring-2 ring-coral-400/50' : ''
      } ${
        isFocused ? 'ring-2 ring-coral-400/60 bg-surface-hover/50' : ''
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          {/* Feature 2: Quick action checkbox */}
          <button
            onClick={() => onQuickToggleDone(item)}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 ${
              isDone
                ? 'bg-emerald-400/20 border-emerald-400 text-emerald-400'
                : 'border-text-muted/40 hover:border-coral-400 text-transparent hover:text-coral-400/50'
            }`}
            aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
          >
            {isDone && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 -ml-1 text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <p className={`text-sm font-medium flex-1 line-clamp-2 transition-all duration-150 ${
            isDone ? 'line-through text-text-muted' : 'text-text-primary'
          }`}>
            {item.title}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 text-text-muted hover:text-coral-400 hover:bg-surface-hover rounded-lg transition-colors"
              aria-label="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item)}
              className="p-1.5 text-text-muted hover:text-red-400 hover:bg-surface-hover rounded-lg transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {item.description && (
          <p className={`text-xs line-clamp-2 ${isDone ? 'text-text-muted/50' : 'text-text-muted'}`}>
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

        <div className="flex items-center justify-between pt-2 border-t border-surface-border">
          {/* Inline Owner Editing */}
          <InlineOwnerEdit
            owner={item.owner}
            onSave={(newOwner) => onOwnerChange(item.id, newOwner)}
          />

          {/* Status dropdown */}
          <div className="relative">
            <label htmlFor={`status-${item.id}`} className="sr-only">Change status for {item.title}</label>
            <select
              id={`status-${item.id}`}
              value={item.status}
              onChange={(e) =>
                onStatusChange(item.id, e.target.value as ActionItemStatus)
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
    </div>
  );
}

// Drag Overlay Card (shown while dragging)
interface DragOverlayCardProps {
  item: ActionItem;
  getDueDateStatus: (dueDate: string | null, status: ActionItemStatus) => { type: 'overdue' | 'today' | 'tomorrow'; label: string } | null;
}

function DragOverlayCard({ item, getDueDateStatus }: DragOverlayCardProps) {
  const dueDateStatus = getDueDateStatus(item.due_date, item.status);

  return (
    <div className="glass-card !p-4 shadow-xl ring-2 ring-coral-400/50 rotate-2 cursor-grabbing">
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-coral-400" />
          <p className="text-sm font-medium text-text-primary line-clamp-2 flex-1">
            {item.title}
          </p>
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
              <Clock className="w-3 h-3" />
              {format(new Date(item.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
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
        className="w-24 px-2 py-1 text-xs bg-surface-card border border-surface-border rounded focus:outline-none focus:ring-2 focus:ring-coral-400/50"
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
