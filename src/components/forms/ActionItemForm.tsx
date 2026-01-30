import { useState, useEffect } from 'react';
import { Loader2, HelpCircle } from 'lucide-react';
import {
  useCreateActionItem,
  useUpdateActionItem,
  useScenarios,
} from '../../hooks/useSupabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';
import CharacterCount from '../CharacterCount';
import Tooltip from '../Tooltip';
import type {
  ActionItem,
  ActionItemInsert,
  ActionItemUpdate,
  ActionItemStatus,
  Project,
} from '../../types/database';

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 300;

interface ActionItemFormProps {
  actionItem?: ActionItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const projectOptions: { value: Project | ''; label: string }[] = [
  { value: '', label: 'No project' },
  { value: 'mote', label: 'Mote Marine Laboratory' },
  { value: 'fundemar', label: 'Fundemar' },
];

const statusOptions: { value: ActionItemStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
];

export default function ActionItemForm({ actionItem, onSuccess, onCancel }: ActionItemFormProps) {
  const isEditing = !!actionItem;
  const { success, error: showError } = useToast();
  const { displayName } = useAuth();

  const createActionItem = useCreateActionItem();
  const updateActionItem = useUpdateActionItem();
  const { data: scenarios } = useScenarios();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner: displayName || '',
    status: 'todo' as ActionItemStatus,
    due_date: '',
    project: '' as Project | '',
    scenario_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form with existing action item data
  useEffect(() => {
    if (actionItem) {
      setFormData({
        title: actionItem.title,
        description: actionItem.description || '',
        owner: actionItem.owner || '',
        status: actionItem.status,
        due_date: actionItem.due_date ? actionItem.due_date.split('T')[0] : '',
        project: actionItem.project || '',
        scenario_id: actionItem.scenario_id || '',
      });
    }
  }, [actionItem]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > TITLE_MAX_LENGTH) {
      newErrors.title = `Title must be ${TITLE_MAX_LENGTH} characters or less`;
    }

    if (formData.description.length > DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEditing && actionItem) {
        const updates: ActionItemUpdate = {
          title: formData.title,
          description: formData.description || null,
          owner: formData.owner || null,
          status: formData.status,
          due_date: formData.due_date || null,
          project: formData.project || null,
          scenario_id: formData.scenario_id || null,
        };

        await updateActionItem.mutateAsync({ id: actionItem.id, updates });
        success('Action item updated successfully');
      } else {
        const newItem: ActionItemInsert = {
          title: formData.title,
          description: formData.description || null,
          owner: formData.owner || null,
          status: formData.status,
          due_date: formData.due_date || null,
          project: formData.project || null,
          scenario_id: formData.scenario_id || null,
        };

        await createActionItem.mutateAsync(newItem);
        success('Action item created successfully');
      }

      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save action item');
    }
  };

  const isSubmitting = createActionItem.isPending || updateActionItem.isPending;

  // Filter scenarios by selected project
  const filteredScenarios = scenarios?.filter(
    (s) => !formData.project || s.project === formData.project
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            Title <span className="text-red-400">*</span>
            <Tooltip content="A clear, actionable task description">
              <HelpCircle className="w-3.5 h-3.5 text-text-muted cursor-help" />
            </Tooltip>
          </label>
          <CharacterCount current={formData.title.length} max={TITLE_MAX_LENGTH} />
        </div>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`input-field ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
          placeholder="e.g., Review water quality data for Q2"
          maxLength={TITLE_MAX_LENGTH + 10}
          aria-describedby={errors.title ? 'title-error' : undefined}
          aria-required="true"
          aria-invalid={!!errors.title}
        />
        {errors.title && <p id="title-error" className="mt-1 text-sm text-red-400" role="alert">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            Description
            <Tooltip content="Additional context or requirements for this task">
              <HelpCircle className="w-3.5 h-3.5 text-text-muted cursor-help" />
            </Tooltip>
          </label>
          <CharacterCount current={formData.description.length} max={DESCRIPTION_MAX_LENGTH} />
        </div>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className={`input-field resize-none ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
          placeholder="Add any additional details, requirements, or context..."
          maxLength={DESCRIPTION_MAX_LENGTH + 50}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && <p id="description-error" className="mt-1 text-sm text-red-400">{errors.description}</p>}
      </div>

      {/* Owner and Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Owner */}
        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-text-secondary mb-2">
            Owner
          </label>
          <input
            type="text"
            id="owner"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            className="input-field"
            placeholder="Assign to someone"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ActionItemStatus })}
            className="select-field"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date and Project Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Due Date */}
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-text-secondary mb-2">
            Due Date
          </label>
          <input
            type="date"
            id="due_date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="input-field"
          />
        </div>

        {/* Project */}
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-text-secondary mb-2">
            Project
          </label>
          <select
            id="project"
            value={formData.project}
            onChange={(e) => {
              const newProject = e.target.value as Project | '';
              setFormData({
                ...formData,
                project: newProject,
                // Reset scenario if it doesn't match new project
                scenario_id:
                  scenarios?.find((s) => s.id === formData.scenario_id)?.project === newProject
                    ? formData.scenario_id
                    : '',
              });
            }}
            className="select-field"
          >
            {projectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Linked Scenario */}
      <div>
        <label htmlFor="scenario_id" className="block text-sm font-medium text-text-secondary mb-2">
          Linked Scenario
        </label>
        <select
          id="scenario_id"
          value={formData.scenario_id}
          onChange={(e) => setFormData({ ...formData, scenario_id: e.target.value })}
          className="select-field"
        >
          <option value="">No linked scenario</option>
          {filteredScenarios?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.project})
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-ocean-700/50">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEditing ? 'Update Action Item' : 'Create Action Item'}</>
          )}
        </button>
      </div>
    </form>
  );
}
