'use client';

import { useState } from 'react';
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
}

export default function AddTaskModal({ isOpen, onClose, onSave }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [duration, setDuration] = useState('');
  const [maxTimePerSitting, setMaxTimePerSitting] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isAutoScheduled, setIsAutoScheduled] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    try {
      taskSchema.parse({
        title,
        startDate,
        deadline,
        duration: duration ? parseInt(duration) : 0,
        maxTimePerSitting: maxTimePerSitting ? parseInt(maxTimePerSitting) : undefined,
        description,
        tags,
        isAutoScheduled,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        title,
        startDate: startDate!,
        deadline: deadline || undefined,
        duration: parseInt(duration),
        maxTimePerSitting: maxTimePerSitting ? parseInt(maxTimePerSitting) : undefined,
        description,
        tags,
        isAutoScheduled,
      });
      onClose();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
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
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleAddTag('Collection')}
              className="px-3 py-1 border rounded-full text-sm hover:bg-gray-50"
            >
              Collection
            </button>
            <button
              onClick={() => handleAddTag('Chemistry')}
              className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm"
            >
              Chemistry
            </button>
            <button
              onClick={() => handleAddTag('School')}
              className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm"
            >
              School
            </button>
            <button
              onClick={() => handleAddTag('Organic Chemistry')}
              className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm"
            >
              Organic Chemistry
            </button>
          </div>
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

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-[#4A5D4A] text-white rounded-lg hover:bg-[#3E4E3E] transition-colors"
        >
          Add Task
        </button>
      </div>
    </div>
  );
} 