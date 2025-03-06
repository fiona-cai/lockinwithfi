'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get all days in the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-serif">{format(currentDate, 'MMMM yyyy')}</h1>
            <div className="flex gap-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm bg-sage-100 text-sage-700 rounded-full hover:bg-sage-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day) => (
              <div
                key={day.toString()}
                className={`
                  aspect-square p-2 border border-gray-100 rounded-lg
                  ${isToday(day) ? 'bg-sage-50 border-sage-200' : 'hover:bg-gray-50'}
                  ${!isSameMonth(day, currentDate) ? 'text-gray-300' : ''}
                `}
              >
                <span className="text-sm">{format(day, 'd')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 