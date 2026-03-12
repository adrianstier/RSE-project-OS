import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { format, isBefore, isToday, isTomorrow } from 'date-fns';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Circle,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  GripVertical,
  UserCheck,
  Users,
  Kanban,
  List,
} from 'lucide-react';
import {
  useActionItems,
  useUpdateActionItem,
  useRealtimeActionItems,
} from '../hooks/useSupabase';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ActionItemSheet from '../components/ActionItemSheet';
import { ActionItemForm } from '../components/forms';
import type { ActionItem, ActionItemStatus, Project } from '../types/database';

// ============================================
// CONSTANTS
// ============================================

const STATUS_COLUMNS: {
  value: ActionItemStatus;
  label: string;
  icon: typeof Circle;
  dotColor: string;
}[] = [
  { value: 'todo', label: 'To Do', icon: Circle, dotColor: 'bg-slate-400' },
  { value: 'in_progress', label: 'In Progress', icon: Loader2, dotColor: 'bg-blue-500' },
  { value: 'done', label: 'Done', icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  { value: 'blocked', label: 'Blocked', icon: XCircle, dotColor: 'bg-red-500' },
];

const PROJECT_OPTIONS: { value: Project | 'all'; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'mote', label: 'Mote' },
  { value: 'fundemar', label: 'Fundemar' },
];

type ViewMode = 'board' | 'list';

// ============================================
// HELPERS
// ============================================

function getDueDateStatus(dueDate: string | null, status: ActionItemStatus) {
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
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// MAIN PAGE
// ============================================

export default function ActionItems() {
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [projectFilter, setProjectFilter] = useState<Project | 'all'>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { user, displayName } = useAuth();
  const queryClient = useQueryClient();
  const { data: actionItems, isLoading } = useActionItems();
  const updateActionItem = useUpdateActionItem();

  // Enable realtime updates
  useRealtimeActionItems();

  // Mobile: auto-switch to list view on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && viewMode === 'board') {
        setViewMode('list');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

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
      // My Tasks filter
      if (showMyTasks && user?.email) {
        const ownerValue = (item.owner || '').toLowerCase().trim();
        if (!ownerValue) return false;
        const userEmail = user.email.toLowerCase();
        const emailPrefix = userEmail.split('@')[0];
        const userName = displayName?.toLowerCase().trim() || '';
        const firstName = userName.split(' ')[0];
        const isMyTask =
          ownerValue === userEmail ||
          ownerValue === emailPrefix ||
          (userName && ownerValue === userName) ||
          (firstName && ownerValue === firstName);
        if (!isMyTask) return false;
      }
      if (projectFilter !== 'all' && item.project !== projectFilter) return false;
      if (ownerFilter !== 'all' && item.owner !== ownerFilter) return false;
      return true;
    });
  }, [actionItems, projectFilter, ownerFilter, showMyTasks, user, displayName]);

  // Count overdue items
  const overdueCount = useMemo(() => {
    return filteredItems.filter((item) => {
      const status = getDueDateStatus(item.due_date, item.status);
      return status?.type === 'overdue';
    }).length;
  }, [filteredItems]);

  // Group items by status for board view
  const itemsByStatus = useMemo(() => {
    const groups: Record<ActionItemStatus, ActionItem[]> = {
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

  // Active item for drag overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return filteredItems.find((item) => item.id === activeId) || null;
  }, [activeId, filteredItems]);

  // ============================================
  // DnD setup
  // ============================================

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    const rectCollisions = rectIntersection(args);
    const allCollisions = [...pointerCollisions, ...rectCollisions];
    const columnIds = ['todo', 'in_progress', 'done', 'blocked'];
    const columnCollision = allCollisions.find((c) => columnIds.includes(c.id as string));
    if (columnCollision) return [columnCollision];
    return allCollisions.length > 0 ? allCollisions : [];
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleStatusChange = useCallback(
    async (itemId: string, newStatus: ActionItemStatus) => {
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
        toast.success('Status updated');
      } catch {
        queryClient.setQueryData(['actionItems', undefined], previousData);
        toast.error('Failed to update status');
      }
    },
    [queryClient, updateActionItem]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const itemId = active.id as string;
      const targetId = over.id as string;
      const draggedItem = filteredItems.find((i) => i.id === itemId);
      if (!draggedItem) return;

      const columnIds: ActionItemStatus[] = ['todo', 'in_progress', 'done', 'blocked'];
      const previousStatus = draggedItem.status;

      if (columnIds.includes(targetId as ActionItemStatus)) {
        const newStatus = targetId as ActionItemStatus;
        if (previousStatus !== newStatus) handleStatusChange(itemId, newStatus);
        return;
      }

      const overItem = filteredItems.find((i) => i.id === targetId);
      if (overItem && previousStatus !== overItem.status) {
        handleStatusChange(itemId, overItem.status);
      }
    },
    [filteredItems, handleStatusChange]
  );

  const handleEdit = (item: ActionItem) => {
    setSelectedItem(null);
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const hasActiveFilters = projectFilter !== 'all' || ownerFilter !== 'all' || showMyTasks;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-semibold text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-primary flex-shrink-0" />
            Action Items
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            {overdueCount > 0 && (
              <span className="text-red-600 font-medium ml-1.5">
                ({overdueCount} overdue)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Board/List toggle */}
          <div className="inline-flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'board'
                  ? 'bg-primary text-white'
                  : 'bg-white text-muted-foreground hover:bg-muted'
              }`}
              aria-pressed={viewMode === 'board'}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-l border-border ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-white text-muted-foreground hover:bg-muted'
              }`}
              aria-pressed={viewMode === 'list'}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={openNewForm}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Item</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* My Items toggle */}
        {user && (
          <button
            onClick={() => setShowMyTasks(!showMyTasks)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              showMyTasks
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-white text-muted-foreground border-border hover:border-ocean-300'
            }`}
            aria-pressed={showMyTasks}
          >
            {showMyTasks ? <UserCheck className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            My Items
          </button>
        )}

        {/* Owner filter */}
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="select-field !py-1.5 !text-sm !w-auto min-w-[140px]"
          aria-label="Filter by owner"
        >
          <option value="all">All Owners</option>
          {owners.map((owner) => (
            <option key={owner} value={owner}>{owner}</option>
          ))}
        </select>

        {/* Project filter */}
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value as Project | 'all')}
          className="select-field !py-1.5 !text-sm !w-auto min-w-[140px]"
          aria-label="Filter by project"
        >
          {PROJECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : filteredItems.length === 0 ? (
        <div className="bg-card border border-border rounded-lg">
          <EmptyState
            variant={hasActiveFilters ? 'filter' : 'actions'}
            onAction={!hasActiveFilters ? openNewForm : undefined}
          />
        </div>
      ) : viewMode === 'board' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <KanbanBoard
            itemsByStatus={itemsByStatus}
            onSelect={setSelectedItem}
          />
          <DragOverlay>
            {activeItem ? <DragOverlayCard item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <ListView
          items={filteredItems}
          onSelect={setSelectedItem}
        />
      )}

      {/* Detail Sheet */}
      <ActionItemSheet
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={handleEdit}
      />

      {/* Create/Edit Sheet */}
      <Sheet open={isFormOpen} onOpenChange={(open) => { if (!open) handleFormClose(); }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingItem ? 'Edit Action Item' : 'New Action Item'}</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <ActionItemForm
              actionItem={editingItem || undefined}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ============================================
// LOADING SKELETON
// ============================================

function LoadingSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'board') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map(({ value, label, dotColor }) => (
          <div key={value} className="space-y-3">
            <div className="flex items-center gap-2 px-2 py-1">
              <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
            <div className="space-y-3 p-1">
              {[1, 2].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="flex gap-2">
                    <div className="skeleton h-6 w-6 rounded-full" />
                    <div className="skeleton h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="space-y-0 divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// KANBAN BOARD
// ============================================

interface KanbanBoardProps {
  itemsByStatus: Record<ActionItemStatus, ActionItem[]>;
  onSelect: (item: ActionItem) => void;
}

function KanbanBoard({ itemsByStatus, onSelect }: KanbanBoardProps) {
  const [focusedCol, setFocusedCol] = useState(0);
  const [focusedRow, setFocusedRow] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  const grid = useMemo(() => {
    return STATUS_COLUMNS.map(({ value }) => itemsByStatus[value]);
  }, [itemsByStatus]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!boardRef.current?.contains(document.activeElement)) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const currentColItems = grid[focusedCol];

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setFocusedRow(Math.min(focusedRow + 1, currentColItems.length - 1));
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setFocusedRow(Math.max(focusedRow - 1, 0));
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const nextCol = Math.min(focusedCol + 1, STATUS_COLUMNS.length - 1);
          setFocusedCol(nextCol);
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
        case 'Enter': {
          e.preventDefault();
          const item = currentColItems[focusedRow];
          if (item) onSelect(item);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedCol, focusedRow, grid, onSelect]);

  // Focus the correct card
  useEffect(() => {
    const item = grid[focusedCol]?.[focusedRow];
    if (item && boardRef.current) {
      const card = boardRef.current.querySelector(`[data-card-id="${item.id}"]`) as HTMLElement | null;
      card?.focus();
    }
  }, [focusedCol, focusedRow, grid]);

  return (
    <div ref={boardRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATUS_COLUMNS.map(({ value, label, dotColor }, colIndex) => (
        <KanbanColumn
          key={value}
          status={value}
          label={label}
          dotColor={dotColor}
          items={itemsByStatus[value]}
          onSelect={onSelect}
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

// ============================================
// KANBAN COLUMN
// ============================================

interface KanbanColumnProps {
  status: ActionItemStatus;
  label: string;
  dotColor: string;
  items: ActionItem[];
  onSelect: (item: ActionItem) => void;
  focusedItemIndex: number;
  onCardFocus: (rowIndex: number) => void;
}

function KanbanColumn({
  status,
  label,
  dotColor,
  items,
  onSelect,
  focusedItemIndex,
  onCardFocus,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg transition-colors ${
        isOver ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-transparent'
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-2 pt-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2.5 flex-1 min-h-[200px] p-1.5 max-h-[calc(100vh-320px)] overflow-y-auto">
        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-lg !p-4 text-center border-dashed">
            <p className="text-sm text-muted-foreground">No items</p>
          </div>
        ) : (
          items.map((item, index) => (
            <DraggableCard
              key={item.id}
              item={item}
              onSelect={onSelect}
              isFocused={focusedItemIndex === index}
              onFocus={() => onCardFocus(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// DRAGGABLE CARD
// ============================================

interface DraggableCardProps {
  item: ActionItem;
  onSelect: (item: ActionItem) => void;
  isFocused: boolean;
  onFocus: () => void;
}

function DraggableCard({ item, onSelect, isFocused, onFocus }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDateStatus = getDueDateStatus(item.due_date, item.status);
  const isBlocked = item.status === 'blocked';
  const isDone = item.status === 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-card-id={item.id}
      tabIndex={0}
      onFocus={onFocus}
      onClick={() => onSelect(item)}
      className={`
        bg-card border border-border rounded-lg !p-3.5 outline-none transition-all duration-150 cursor-pointer group
        ${isDragging ? 'shadow-lg ring-2 ring-primary/50' : ''}
        ${isFocused ? 'ring-2 ring-primary/60' : ''}
        ${isBlocked ? '!bg-red-50 !border-red-200' : ''}
        hover:border-primary/40
      `}
    >
      <div className="space-y-2.5">
        {/* Title row with drag handle */}
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="p-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
            aria-label="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <p
            className={`text-sm font-medium flex-1 line-clamp-2 ${
              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {item.title}
          </p>
        </div>

        {/* Blocked description */}
        {isBlocked && item.description && (
          <p className="text-xs text-red-600/80 line-clamp-2 pl-6">{item.description}</p>
        )}

        {/* Bottom metadata row */}
        <div className="flex items-center justify-between pl-6">
          <div className="flex items-center gap-2">
            {/* Owner avatar */}
            {item.owner && (
              <div
                className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0"
                title={item.owner}
              >
                <span className="text-[10px] font-medium text-primary">
                  {getInitials(item.owner)}
                </span>
              </div>
            )}

            {/* Project dot */}
            {item.project && (
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  item.project === 'mote' ? 'bg-mote-400' : 'bg-fundemar-400'
                }`}
                title={item.project === 'mote' ? 'Mote' : 'Fundemar'}
              />
            )}
          </div>

          {/* Due date */}
          {item.due_date && (
            <span
              className={`flex items-center gap-1 text-xs ${
                dueDateStatus?.type === 'overdue'
                  ? 'text-red-600 font-medium'
                  : dueDateStatus?.type === 'today'
                  ? 'text-amber-600'
                  : 'text-muted-foreground'
              }`}
            >
              {dueDateStatus?.type === 'overdue' && <AlertCircle className="w-3 h-3" />}
              <Clock className="w-3 h-3" />
              {format(new Date(item.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// DRAG OVERLAY CARD
// ============================================

function DragOverlayCard({ item }: { item: ActionItem }) {
  const dueDateStatus = getDueDateStatus(item.due_date, item.status);

  return (
    <div className="bg-card border border-border rounded-lg !p-3.5 shadow-xl ring-2 ring-primary/50 rotate-2 cursor-grabbing max-w-[280px]">
      <div className="space-y-2.5">
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-foreground line-clamp-2 flex-1">{item.title}</p>
        </div>
        <div className="flex items-center gap-2 pl-6">
          {item.owner && (
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-[10px] font-medium text-primary">
                {getInitials(item.owner)}
              </span>
            </div>
          )}
          {item.project && (
            <span
              className={`w-2 h-2 rounded-full ${
                item.project === 'mote' ? 'bg-mote-400' : 'bg-fundemar-400'
              }`}
            />
          )}
          {item.due_date && (
            <span
              className={`flex items-center gap-1 text-xs ml-auto ${
                dueDateStatus?.type === 'overdue' ? 'text-red-600' : 'text-muted-foreground'
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

// ============================================
// LIST VIEW
// ============================================

interface ListViewProps {
  items: ActionItem[];
  onSelect: (item: ActionItem) => void;
}

function ListView({ items, onSelect }: ListViewProps) {
  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Title
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Owner
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Project
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const dueDateStatus = getDueDateStatus(item.due_date, item.status);
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="border-b border-border last:border-0 hover:bg-accent transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <p
                      className={`text-sm font-medium ${
                        item.status === 'done'
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {item.owner ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-medium text-primary">
                            {getInitials(item.owner)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.owner}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge type="action-status" value={item.status} />
                  </td>
                  <td className="py-3 px-4">
                    {item.project ? (
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.project === 'mote' ? 'bg-mote-400' : 'bg-fundemar-400'
                          }`}
                        />
                        <span className="text-sm text-muted-foreground capitalize">
                          {item.project}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {item.due_date ? (
                      <span
                        className={`flex items-center gap-1 text-sm ${
                          dueDateStatus?.type === 'overdue'
                            ? 'text-red-600 font-medium'
                            : dueDateStatus?.type === 'today'
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {dueDateStatus?.type === 'overdue' && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {format(new Date(item.due_date), 'MMM d, yyyy')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">No date</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
