'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startDate: z.date(),
  deadline: z.date().optional(),
  duration: z.number().min(1, "Duration is required"),
  maxTimePerSitting: z.number().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  isAutoScheduled: z.boolean(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => void;
  initialTask?: TaskFormData;
  existingTags?: string[];
}

export default function AddTaskModal({ isOpen, onClose, onSave, initialTask, existingTags = [] }: AddTaskModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [startDate, setStartDate] = useState<Date | null>(initialTask?.startDate || new Date());
  const [deadline, setDeadline] = useState<Date | null>(initialTask?.deadline || null);
  const [duration, setDuration] = useState(initialTask?.duration?.toString() || '');
  const [maxTimePerSitting, setMaxTimePerSitting] = useState(initialTask?.maxTimePerSitting?.toString() || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [tags, setTags] = useState<string[]>(initialTask?.tags || []);
  const [isAutoScheduled, setIsAutoScheduled] = useState(initialTask?.isAutoScheduled ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Reset form when modal opens with initialTask
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTask?.title || '');
      setStartDate(initialTask?.startDate || new Date());
      setDeadline(initialTask?.deadline || null);
      setDuration(initialTask?.duration?.toString() || '');
      setMaxTimePerSitting(initialTask?.maxTimePerSitting?.toString() || '');
      setDescription(initialTask?.description || '');
      setTags(initialTask?.tags || []);
      setIsAutoScheduled(initialTask?.isAutoScheduled ?? true);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialTask]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrors({});

      const formData = {
        title,
        startDate: startDate!,
        deadline: deadline || undefined,
        duration: parseInt(duration),
        maxTimePerSitting: maxTimePerSitting ? parseInt(maxTimePerSitting) : undefined,
        description: description || undefined,
        tags,
        isAutoScheduled,
      };

      console.log('Submitting form data:', formData);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error in handleSave:', error);
      setErrors({ 
        submit: error instanceof Error 
          ? error.message 
          : 'Failed to save task. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    try {
      const validationResult = taskSchema.safeParse({
        title,
        startDate,
        deadline,
        duration: duration ? parseInt(duration) : 0,
        maxTimePerSitting: maxTimePerSitting ? parseInt(maxTimePerSitting) : undefined,
        description,
        tags,
        isAutoScheduled,
      });

      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        console.log('Validation errors:', newErrors);
        setErrors(newErrors);
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      console.error('Error in validateForm:', error);
      setErrors({ submit: 'Validation error occurred' });
      return false;
    }
  };

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag(newTag.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Title Input */}
        <input
          type="text"
          placeholder="Add Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full text-xl font-medium mb-6 p-2 border-b border-gray-200 focus:outline-none focus:border-[#4A5D4A] ${
            errors.title ? 'border-red-500' : ''
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4A]"
              dateFormat="MMMM d, yyyy"
              minDate={new Date()}
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Deadline</label>
            <DatePicker
              selected={deadline}
              onChange={(date) => setDeadline(date)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4A]"
              dateFormat="MMMM d, yyyy"
              minDate={startDate || new Date()}
              isClearable
              placeholderText="Optional"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Duration</label>
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4A] ${
                errors.duration ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select duration...</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
            </select>
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          </div>

          {/* Max Time Per Sitting */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Time Per Sitting</label>
            <select 
              value={maxTimePerSitting}
              onChange={(e) => setMaxTimePerSitting(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4A]"
            >
              <option value="">No limit</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <textarea
            placeholder="Add description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#4A5D4A]"
          />
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">Tags</label>
          
          {/* Current Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-[#4A5D4A] text-white rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-white hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Tag Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type and press enter to add a tag"
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4A]"
            />
            <button
              onClick={() => newTag.trim() && handleAddTag(newTag.trim())}
              className="px-4 py-2 bg-[#4A5D4A] text-white rounded-lg hover:bg-[#3E4E3E]"
            >
              Add
            </button>
          </div>

          {/* Available Tags - Only show if there are existing tags */}
          {existingTags.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Available Tags:</p>
              <div className="flex flex-wrap gap-2">
                {existingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      tags.includes(tag)
                        ? 'bg-[#4A5D4A] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Auto-Schedule Option */}
        <div className="flex items-start gap-3 mb-6">
          <input
            type="checkbox"
            checked={isAutoScheduled}
            onChange={(e) => setIsAutoScheduled(e.target.checked)}
            className="mt-1"
          />
          <div>
            <div className="font-medium">Auto-Scheduled</div>
            <div className="text-sm text-gray-600">
              lockinwithfi will AI-schedule your tasks for you based on your preferences.
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="text-red-500 text-sm mb-4">{errors.submit}</div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#4A5D4A] text-white rounded-lg hover:bg-[#3E4E3E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              initialTask ? 'Save Changes' : 'Save Task'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 