import { useState, useEffect } from 'react';
import { Loader2, HelpCircle } from 'lucide-react';
import { useCreateTimelineEvent, useUpdateTimelineEvent } from '../../hooks/useSupabase';
import { useToast } from '../Toast';
import CharacterCount from '../CharacterCount';
import Tooltip from '../Tooltip';
import type {
  TimelineEvent,
  TimelineEventInsert,
  TimelineEventUpdate,
  TimelineEventType,
  Project,
} from '../../types/database';

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 300;

interface TimelineEventFormProps {
  event?: TimelineEvent;
  onSuccess: () => void;
  onCancel: () => void;
}

const projectOptions: { value: Project | ''; label: string }[] = [
  { value: '', label: 'No project' },
  { value: 'mote', label: 'Mote Marine Laboratory' },
  { value: 'fundemar', label: 'Fundemar' },
];

const eventTypeOptions: { value: TimelineEventType; label: string }[] = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'deliverable', label: 'Deliverable' },
];

export default function TimelineEventForm({ event, onSuccess, onCancel }: TimelineEventFormProps) {
  const isEditing = !!event;
  const { success, error: showError } = useToast();

  const createEvent = useCreateTimelineEvent();
  const updateEvent = useUpdateTimelineEvent();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_type: 'milestone' as TimelineEventType,
    project: '' as Project | '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form with existing event data
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: event.event_date.split('T')[0],
        event_type: event.event_type || 'milestone',
        project: event.project || '',
      });
    }
  }, [event]);

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

    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEditing && event) {
        const updates: TimelineEventUpdate = {
          title: formData.title,
          description: formData.description || null,
          event_date: formData.event_date,
          event_type: formData.event_type,
          project: formData.project || null,
        };

        await updateEvent.mutateAsync({ id: event.id, updates });
        success('Timeline event updated successfully');
      } else {
        const newEvent: TimelineEventInsert = {
          title: formData.title,
          description: formData.description || null,
          event_date: formData.event_date,
          event_type: formData.event_type,
          project: formData.project || null,
        };

        await createEvent.mutateAsync(newEvent);
        success('Timeline event created successfully');
      }

      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save timeline event');
    }
  };

  const isSubmitting = createEvent.isPending || updateEvent.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            Title <span className="text-red-600">*</span>
            <Tooltip content="A descriptive name for this timeline event">
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
          placeholder="e.g., Q3 Progress Review Meeting"
          maxLength={TITLE_MAX_LENGTH + 10}
          aria-describedby={errors.title ? 'title-error' : undefined}
          aria-required="true"
          aria-invalid={!!errors.title}
        />
        {errors.title && <p id="title-error" className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            Description
            <Tooltip content="Additional details about this event">
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
          placeholder="Add any additional context or agenda items..."
          maxLength={DESCRIPTION_MAX_LENGTH + 50}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && <p id="description-error" className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Event Date and Type Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Event Date */}
        <div>
          <label htmlFor="event_date" className="block text-sm font-medium text-text-secondary mb-2">
            Event Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            id="event_date"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            className={`input-field ${errors.event_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
            aria-required="true"
            aria-invalid={!!errors.event_date}
            aria-describedby={errors.event_date ? 'event-date-error' : undefined}
          />
          {errors.event_date && <p id="event-date-error" className="mt-1 text-sm text-red-600" role="alert">{errors.event_date}</p>}
        </div>

        {/* Event Type */}
        <div>
          <label htmlFor="event_type" className="block text-sm font-medium text-text-secondary mb-2">
            Event Type
          </label>
          <select
            id="event_type"
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value as TimelineEventType })}
            className="select-field"
          >
            {eventTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project */}
      <div>
        <label htmlFor="project" className="block text-sm font-medium text-text-secondary mb-2">
          Project
        </label>
        <select
          id="project"
          value={formData.project}
          onChange={(e) => setFormData({ ...formData, project: e.target.value as Project | '' })}
          className="select-field"
        >
          {projectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
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
            <>{isEditing ? 'Update Event' : 'Create Event'}</>
          )}
        </button>
      </div>
    </form>
  );
}
