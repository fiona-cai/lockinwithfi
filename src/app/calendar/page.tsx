'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns';
import Link from 'next/link';
import AddTaskModal from '../components/AddTaskModal';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7 AM to 11 PM

interface Task {
  id: string;
  title: string;
  startDate: string;
  duration: number;
  tags: Array<{ name: string }>;
  scheduledBlocks: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Calculate current time position
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const timePosition = ((currentHour - 7) * 80) + (currentMinute / 60) * 80;

  const handleAddTask = async (taskData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Sending task data:', taskData);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          startDate: taskData.startDate.toISOString(),
          deadline: taskData.deadline?.toISOString(),
        }),
      });

      const text = await response.text();
      console.log('Response text:', text);

      if (!response.ok) {
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: text,
        });
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(text);
          if (errorData.error) {
            errorMessage = errorData.error;
            if (errorData.details) {
              errorMessage += ': ' + JSON.stringify(errorData.details);
            } else if (errorData.message) {
              errorMessage += ': ' + errorData.message;
            }
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(text);
        console.log('Task created:', data);
      } catch (e) {
        console.error('Error parsing success response:', e);
        throw new Error('Invalid response from server: ' + text.substring(0, 100));
      }

      await fetchTasks();
      setIsAddTaskModalOpen(false);
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventStyle = (block: { startTime: string; endTime: string }) => {
    const start = parseISO(block.startTime);
    const end = parseISO(block.endTime);
    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    return {
      top: `${((startHour - 7) * 80) + (startMinute / 60) * 80}px`,
      height: `${(durationMinutes / 60) * 80}px`,
    };
  };

  const getRandomColor = () => {
    const colors = ['bg-[#B146C2]', 'bg-[#2E7DD1]', 'bg-[#4A5D4A]'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-min bg-gradient-to-b from-[#E2EFE2] to-white p-4 flex flex-col h-full">
        {/* Top section with logo and main nav */}
        <div className="flex flex-col gap-12">
          <Link href="/" className="font-serif italic text-2xl ml-1">
            lock in
            <br />
            with fi
          </Link>
          <nav className="space-y-2">
            <a href="#" className="flex flex-col items-center text-gray-900 font-medium p-2">
              <span className="text-l mb-1">📅</span>
              <span className="text-sm">Calendar</span>
            </a>
            <a href="#" className="flex flex-col items-center text-gray-600 hover:text-gray-900 transition-colors p-2">
              <span className="text-l mb-1">⭐</span>
              <span className="text-sm">Projects</span>
            </a>
            <a href="#" className="flex flex-col items-center text-gray-600 hover:text-gray-900 transition-colors p-2">
              <span className="text-l mb-1">⏱️</span>
              <span className="text-sm">Pomodoro</span>
            </a>
            <a href="#" className="flex flex-col items-center text-gray-600 hover:text-gray-900 transition-colors p-2">
              <span className="text-l mb-1">📊</span>
              <span className="text-sm">Analytics</span>
            </a>
          </nav>
        </div>

        {/* Bottom buttons */}
        <div className="mt-auto mb-4">
          <button className="w-full flex flex-col items-center text-gray-600 hover:text-gray-900 transition-colors p-2">
            <span className="text-xl">⚙️</span>
          </button>
          <button className="w-full flex flex-col items-center text-gray-600 hover:text-gray-900 transition-colors p-2">
            <span className="text-xl">🌙</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="text-4xl font-serif italic font-light">
              {format(currentDate, 'MMMM yyyy').toLowerCase()}
            </h1>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:text-gray-900">←</button>
              <button className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900">Today</button>
              <button className="p-2 text-gray-600 hover:text-gray-900">→</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg bg-gray-100">
              <button className="px-4 py-1.5 text-sm text-gray-600">Day</button>
              <button className="px-4 py-1.5 text-sm bg-[#4A5D4A] text-white rounded-lg">Week</button>
              <button className="px-4 py-1.5 text-sm text-gray-600">Month</button>
              <button className="px-4 py-1.5 text-sm text-gray-600">Year</button>
            </div>
            <button 
              onClick={() => setIsAddTaskModalOpen(true)}
              className="bg-[#4A5D4A] text-white rounded-full px-4 py-2 flex items-center gap-2 hover:bg-[#3E4E3E] transition-colors"
            >
              <span>+</span> Add Task
            </button>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A5D4A]"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-8 divide-x divide-gray-200 min-h-full">
                {/* Time column */}
                <div className="col-span-1 sticky left-0 bg-white">
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-20 text-right pr-4 text-sm text-gray-500 pt-2">
                      {hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`}
                    </div>
                  ))}
                </div>

                {/* Days columns */}
                {weekDays.map((day) => (
                  <div key={day.toString()} className="col-span-1 relative">
                    <div className="text-center py-3 border-b border-gray-200 sticky top-0 bg-white z-20">
                      <div className="text-sm text-gray-500">{format(day, 'EEE')}</div>
                      <div className="text-lg font-medium">{format(day, 'd')}</div>
                    </div>
                    {/* Time slots */}
                    {HOURS.map((hour) => (
                      <div key={hour} className="h-20 border-b border-gray-100"></div>
                    ))}
                    {/* Current time indicator */}
                    {format(day, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd') && (
                      <div 
                        className="absolute left-0 right-0 flex items-center z-10"
                        style={{ top: `${timePosition}px` }}
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                        <div className="flex-1 h-[2px] bg-red-500"></div>
                      </div>
                    )}
                    {/* Task blocks */}
                    {tasks.map((task) => (
                      task.scheduledBlocks
                        .filter(block => isSameDay(parseISO(block.startTime), day))
                        .map((block, blockIndex) => (
                          <div
                            key={`${task.id}-${blockIndex}`}
                            className={`absolute left-1 right-1 ${getRandomColor()} text-white rounded-lg p-2 text-sm shadow-sm hover:shadow-md transition-shadow`}
                            style={getEventStyle(block)}
                          >
                            <div className="font-medium">{task.title}</div>
                            <div className="text-xs opacity-90">
                              {format(parseISO(block.startTime), 'h:mm a')} - {format(parseISO(block.endTime), 'h:mm a')}
                            </div>
                          </div>
                        ))
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-64 border-l border-gray-200 p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="font-medium uppercase text-sm text-gray-900">TODAY</h2>
              <div className="text-sm text-gray-500 mt-1">{format(new Date(), 'M/d/yyyy')}</div>
            </div>
            {/* Upcoming tasks list */}
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4A5D4A]"></div>
              </div>
            ) : error ? (
              <div className="text-sm text-red-500 py-4">{error}</div>
            ) : tasks.length === 0 ? (
              <div className="text-sm text-gray-500 py-4">No tasks scheduled for today</div>
            ) : (
              <div className="space-y-6">
                {tasks
                  .filter(task => 
                    task.scheduledBlocks.some(block => 
                      isSameDay(parseISO(block.startTime), new Date())
                    )
                  )
                  .map((task) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${getRandomColor()}`}></div>
                      <div>
                        <div className="text-sm text-gray-500">
                          {format(parseISO(task.scheduledBlocks[0].startTime), 'h:mm a')} - 
                          {format(parseISO(task.scheduledBlocks[0].endTime), 'h:mm a')}
                        </div>
                        <div className="font-medium text-gray-900">{task.title}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onSave={handleAddTask}
        />
      </div>
    </div>
  );
} 