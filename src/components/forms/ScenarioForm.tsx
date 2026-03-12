import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateScenario, useUpdateScenario } from '../../hooks/useSupabase';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import CharacterCount from '../CharacterCount';
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
        toast.success('Scenario updated successfully');
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
        toast.success('Scenario created successfully');
      }

      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save scenario');
    }
  };

  const isSubmitting = createScenario.isPending || updateScenario.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            Title <span className="text-red-600">*</span>
          </Label>
          <CharacterCount current={formData.title.length} max={TITLE_MAX_LENGTH} />
        </div>
        <Input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={errors.title ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/50' : ''}
          placeholder="e.g., Staghorn Coral Outplanting - Summer 2024"
          maxLength={TITLE_MAX_LENGTH + 10}
          aria-describedby={errors.title ? 'title-error' : undefined}
          aria-required="true"
          aria-invalid={!!errors.title}
        />
        {errors.title && <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            Description
          </Label>
          <CharacterCount current={formData.description.length} max={DESCRIPTION_MAX_LENGTH} />
        </div>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className={`
            w-full px-3 py-2 rounded-lg
            bg-white border border-border
            text-foreground placeholder-text-muted text-sm
            transition-colors duration-150
            hover:border-ocean-400
            focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-400/50
            focus-visible:ring-offset-2 focus-visible:ring-offset-white focus:border-coral-400/50
            resize-none
            ${errors.description ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/50' : ''}
          `}
          placeholder="Describe the restoration scenario, including target species, location, methodology, and expected outcomes..."
          maxLength={DESCRIPTION_MAX_LENGTH + 50}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && <p id="description-error" className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Project */}
      <div>
        <Label htmlFor="project-trigger" className="block mb-2">
          Project <span className="text-red-600">*</span>
        </Label>
        <Select
          value={formData.project}
          onValueChange={(v) => setFormData({ ...formData, project: v as Project })}
        >
          <SelectTrigger
            id="project-trigger"
            className={errors.project ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/50' : ''}
            aria-required="true"
            aria-invalid={!!errors.project}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projectOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.project && <p className="mt-1 text-sm text-red-600">{errors.project}</p>}
      </div>

      {/* Status and Priority Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <Label htmlFor="status-trigger" className="block mb-2">
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v as ScenarioStatus })}
          >
            <SelectTrigger id="status-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div>
          <Label htmlFor="priority-trigger" className="block mb-2">
            Priority
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(v) => setFormData({ ...formData, priority: v as ScenarioPriority })}
          >
            <SelectTrigger id="priority-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Status */}
      <div>
        <Label htmlFor="data-status-trigger" className="block mb-2">
          Data Status
        </Label>
        <Select
          value={formData.data_status}
          onValueChange={(v) => setFormData({ ...formData, data_status: v as DataStatus })}
        >
          <SelectTrigger id="data-status-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dataStatusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEditing ? 'Update Scenario' : 'Create Scenario'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
