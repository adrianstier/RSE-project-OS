import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Calendar, FileText, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from './ui/alert-dialog';
import StatusBadge from './StatusBadge';
import type { Scenario, Project } from '../types/database';

const projectDotColors: Record<Project, string> = {
  mote: 'bg-mote-400',
  fundemar: 'bg-fundemar-400',
};

const projectLabels: Record<Project, string> = {
  mote: 'Mote Marine',
  fundemar: 'Fundemar',
};

interface ScenarioSheetProps {
  scenario: Scenario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (scenario: Scenario) => void;
  onDelete: (scenarioId: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function ScenarioSheet({
  scenario,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isDeleting = false,
}: ScenarioSheetProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!scenario) return null;

  const handleDelete = async () => {
    await onDelete(scenario.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${projectDotColors[scenario.project]}`}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-muted-foreground">
                {projectLabels[scenario.project]}
              </span>
            </div>
            <SheetTitle>{scenario.title}</SheetTitle>
            <SheetDescription>
              Created {format(new Date(scenario.created_at), 'MMM d, yyyy')}
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 pb-6 space-y-6">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge type="scenario-status" value={scenario.status} />
              <StatusBadge type="priority" value={scenario.priority} />
              <StatusBadge type="data-status" value={scenario.data_status} />
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {scenario.description || 'No description provided.'}
              </p>
            </div>

            {/* Metadata */}
            <div className="border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Created</span>
                </div>
                <div className="text-foreground">
                  {format(new Date(scenario.created_at), 'MMM d, yyyy')}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Updated</span>
                </div>
                <div className="text-foreground">
                  {format(new Date(scenario.updated_at), 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-border pt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => onEdit(scenario)}
                className="flex-1"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scenario.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
