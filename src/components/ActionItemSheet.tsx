import { useEffect, useRef, useCallback, useState } from 'react';
import { format, isBefore, isToday } from 'date-fns';
import {
  X,
  User,
  Clock,
  Calendar,
  FileText,
  Layers,
  Pencil,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from './StatusBadge';
import { useScenarios, useDeleteActionItem } from '../hooks/useSupabase';
import type { ActionItem, Scenario } from '../types/database';

interface ActionItemSheetProps {
  item: ActionItem | null;
  open: boolean;
  onClose: () => void;
  onEdit: (item: ActionItem) => void;
}

function getDueDateInfo(dueDate: string | null, status: string) {
  if (!dueDate || status === 'done') return null;
  const date = new Date(dueDate);
  const now = new Date();
  if (isBefore(date, now) && !isToday(date)) {
    return { type: 'overdue' as const, label: 'Overdue' };
  }
  if (isToday(date)) {
    return { type: 'today' as const, label: 'Due today' };
  }
  return null;
}

export default function ActionItemSheet({ item, open, onClose, onEdit }: ActionItemSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const { data: scenarios } = useScenarios();
  const deleteActionItem = useDeleteActionItem();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const scenario: Scenario | null =
    item?.scenario_id && scenarios
      ? scenarios.find((s) => s.id === item.scenario_id) || null
      : null;

  const dueDateInfo = item ? getDueDateInfo(item.due_date, item.status) : null;

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    previousActiveElement.current = document.activeElement as HTMLElement;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    };
  }, [open, handleKeyDown]);

  // Focus trap
  useEffect(() => {
    if (open && sheetRef.current) {
      const timer = setTimeout(() => sheetRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleDelete = async () => {
    if (!item) return;
    try {
      await deleteActionItem.mutateAsync(item.id);
      toast.success('Action item deleted');
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Details for: ${item.title}`}
        className="relative w-full max-w-lg bg-card border-l border-border shadow-2xl animate-slide-in-right overflow-y-auto focus:outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-lg font-bold text-foreground tracking-tight line-clamp-2">
              {item.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StatusBadge type="action-status" value={item.status} />
              {item.project && <StatusBadge type="project" value={item.project} />}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
            {item.description ? (
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {item.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description provided.</p>
            )}
          </div>

          {/* Blocked warning */}
          {item.status === 'blocked' && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                This item is currently blocked.{' '}
                {item.description ? '' : 'Add a description to explain what is blocking progress.'}
              </p>
            </div>
          )}

          {/* Metadata grid */}
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
              {/* Owner */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Owner</span>
              </div>
              <div className="text-foreground flex items-center gap-2">
                {item.owner ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {item.owner.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    {item.owner}
                  </>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Due Date</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  dueDateInfo?.type === 'overdue'
                    ? 'text-red-600 font-medium'
                    : dueDateInfo?.type === 'today'
                    ? 'text-amber-600'
                    : 'text-foreground'
                }`}
              >
                {item.due_date ? (
                  <>
                    {dueDateInfo?.type === 'overdue' && <AlertCircle className="w-3.5 h-3.5" />}
                    {format(new Date(item.due_date), 'MMM d, yyyy')}
                    {dueDateInfo && (
                      <span className="text-xs opacity-75">({dueDateInfo.label})</span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">No due date</span>
                )}
              </div>

              {/* Created */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Created</span>
              </div>
              <div className="text-foreground">
                {format(new Date(item.created_at), 'MMM d, yyyy')}
              </div>

              {/* Updated */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Updated</span>
              </div>
              <div className="text-foreground">
                {format(new Date(item.updated_at), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Linked Scenario */}
          <div className="border-t border-border pt-4">
            <h3 className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              <Layers className="w-3.5 h-3.5" />
              Linked Scenario
            </h3>
            {scenario ? (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <Layers className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{scenario.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge type="project" value={scenario.project} />
                  <StatusBadge type="scenario-status" value={scenario.status} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No linked scenario.</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-between gap-3">
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => onEdit(item)}
                className="btn-primary flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-amber-600 flex-1">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Delete this item?</span>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary text-sm"
                disabled={deleteActionItem.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteActionItem.isPending}
                className="btn-danger flex items-center gap-2 text-sm"
              >
                {deleteActionItem.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
