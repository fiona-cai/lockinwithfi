import { useState } from 'react';
import { format } from 'date-fns';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    startDate: string;
    duration: number;
    tags: Array<{ name: string }>;
    scheduledBlocks: Array<{
      startTime: string;
      endTime: string;
    }>;
  };
  onSave: (taskData: any) => Promise<void>;
}

export default function EditTaskModal({ isOpen, onClose, task, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [duration, setDuration] = useState(task.duration);
  const [tags, setTags] = useState(task.tags.map(tag => tag.name).join(', '));
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({
        id: task.id,
        title,
        duration,
        tags: tags.split(',').map(tag => ({ name: tag.trim() })),
      });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update task');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-serif mb-6">Edit Task</h2>
        
        {error && (
          <div className="mb-4 p-4 text-red-500 bg-red-50 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5D4A] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5D4A] focus:border-transparent"
              min="0.5"
              step="0.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5D4A] focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4A5D4A] text-white rounded-lg hover:bg-[#3E4E3E]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 