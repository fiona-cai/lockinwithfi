import { useState } from 'react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
}

export default function AddTaskModal({ isOpen, onClose, onSave }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [duration, setDuration] = useState('');
  const [maxTimePerSitting, setMaxTimePerSitting] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isAutoScheduled, setIsAutoScheduled] = useState(true);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      title,
      startDate,
      deadline,
      duration,
      maxTimePerSitting,
      description,
      tags,
      isAutoScheduled,
    });
    onClose();
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
          className="w-full text-xl font-medium mb-6 p-2 border-b border-gray-200 focus:outline-none focus:border-[#4A5D4A]"
        />

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <select 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4A]"
            >
              <option value="">Select start date...</option>
              {/* Add date options */}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Deadline</label>
            <select 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4A]"
            >
              <option value="">Select deadline...</option>
              {/* Add date options */}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Duration</label>
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4A]"
            >
              <option value="">Select duration...</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* Max Time Per Sitting */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Time Per Sitting</label>
            <select 
              value={maxTimePerSitting}
              onChange={(e) => setMaxTimePerSitting(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4A]"
            >
              <option value="">Select max time...</option>
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
          <div className="flex gap-2">
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
          className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
} 