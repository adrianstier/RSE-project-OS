import { useState, useEffect } from 'react';
import { Loader2, HelpCircle } from 'lucide-react';
import { useCreateScenario, useUpdateScenario } from '../../hooks/useSupabase';
import { useToast } from '../Toast';
import CharacterCount from '../CharacterCount';
import Tooltip from '../Tooltip';
import type {
  Scenario,
  ScenarioInsert,
  ScenarioUpdate,
  Project,
  ScenarioStatus,
  ScenarioPriority,
  DataStatus,
} from '../../types/database';

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

interface ScenarioFormProps {
  scenario?: Scenario;
  onSuccess: () => void;
  onCancel: () => void;
}

const projectOptions: { value: Project; label: string }[] = [
  { value: 'mote', label: 'Mote Marine Laboratory' },
  { value: 'fundemar', label: 'Fundemar' },
];

const statusOptions: { value: ScenarioStatus; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];

const priorityOptions: { value: ScenarioPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const dataStatusOptions: { value: DataStatus; label: string }[] = [
  { value: 'data-ready', label: 'Data Ready' },
  { value: 'data-partial', label: 'Partial Data' },
  { value: 'data-pending', label: 'Pending' },
];

export default function ScenarioForm({ scenario, onSuccess, onCancel }: ScenarioFormProps) {
  const isEditing = !!scenario;
  const { success, error: showError } = useToast();

  const createScenario = useCreateScenario();
  const updateScenario = useUpdateScenario();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: 'mote' as Project,
    status: 'planning' as ScenarioStatus,
    priority: 'medium' as ScenarioPriority,
    data_status: 'data-pending' as DataStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form with existing scenario data
  useEffect(() => {
    if (scenario) {
      setFormData({
        title: scenario.title,
        description: scenario.description || '',
        project: scenario.project,
        status: scenario.status,
        priority: scenario.priority,
        data_status: scenario.data_status,
      });
    }
  }, [scenario]);

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

    if (!formData.project) {
      newErrors.project = 'Project is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEditing && scenario) {
        const updates: ScenarioUpdate = {
          title: formData.title,
          description: formData.description || null,
          project: formData.project,
          status: formData.status,
          priority: formData.priority,
          data_status: formData.data_status,
        };

        await updateScenario.mutateAsync({ id: scenario.id, updates });
        success('Scenario updated successfully');
      } else {
        const newScenario: ScenarioInsert = {
          title: formData.title,
          description: formData.description || null,
          project: formData.project,
          status: formData.status,
          priority: formData.priority,
          data_status: formData.data_status,
        };

        await createScenario.mutateAsync(newScenario);
        success('Scenario created successfully');
      }

      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save scenario');
    }
  };

  const isSubmitting = createScenario.isPending || updateScenario.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            Title <span className="text-red-400">*</span>
            <Tooltip content="A clear, descriptive name for this restoration scenario">
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
          placeholder="e.g., Staghorn Coral Outplanting - Summer 2024"
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
            <Tooltip content="Provide details about the restoration strategy, goals, and expected outcomes">
              <HelpCircle className="w-3.5 h-3.5 text-text-muted cursor-help" />
            </Tooltip>
          </label>
          <CharacterCount current={formData.description.length} max={DESCRIPTION_MAX_LENGTH} />
        </div>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className={`input-field resize-none ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
          placeholder="Describe the restoration scenario, including target species, location, methodology, and expected outcomes..."
          maxLength={DESCRIPTION_MAX_LENGTH + 50}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && <p id="description-error" className="mt-1 text-sm text-red-400">{errors.description}</p>}
      </div>

      {/* Project */}
      <div>
        <label htmlFor="project" className="block text-sm font-medium text-text-secondary mb-2">
          Project <span className="text-red-400">*</span>
        </label>
        <select
          id="project"
          value={formData.project}
          onChange={(e) => setFormData({ ...formData, project: e.target.value as Project })}
          className={`select-field ${errors.project ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
          aria-required="true"
          aria-invalid={!!errors.project}
        >
          {projectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.project && <p className="mt-1 text-sm text-red-400">{errors.project}</p>}
      </div>

      {/* Status and Priority Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ScenarioStatus })}
            className="select-field"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-text-secondary mb-2">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as ScenarioPriority })}
            className="select-field"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Status */}
      <div>
        <label htmlFor="data_status" className="block text-sm font-medium text-text-secondary mb-2">
          Data Status
        </label>
        <select
          id="data_status"
          value={formData.data_status}
          onChange={(e) => setFormData({ ...formData, data_status: e.target.value as DataStatus })}
          className="select-field"
        >
          {dataStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
            <>{isEditing ? 'Update Scenario' : 'Create Scenario'}</>
          )}
        </button>
      </div>
    </form>
  );
}
