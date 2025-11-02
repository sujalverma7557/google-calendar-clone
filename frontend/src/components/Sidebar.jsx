import { useState, useEffect } from 'react';
import React from 'react';
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, isSameDay, isToday, isSameMonth, addMonths, subMonths } from 'date-fns';
import { useCalendarStore } from '../store/calendarStore';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { currentDate, setCurrentDate, events, openEventModal, showHolidays, setShowHolidays } = useCalendarStore();
  
  // State for the mini calendar's displayed month - initialize with current date
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(() => startOfMonth(currentDate));
  const [isMyCalendarsOpen, setIsMyCalendarsOpen] = useState(true);
  const [isOtherCalendarsOpen, setIsOtherCalendarsOpen] = useState(true);

  // Sync mini calendar month when currentDate changes to a different month
  useEffect(() => {
    const currentMonth = startOfMonth(currentDate);
    const displayedMonth = startOfMonth(miniCalendarMonth);
    if (!isSameMonth(currentMonth, displayedMonth)) {
      setMiniCalendarMonth(currentMonth);
    }
  }, [currentDate]);

  const handleDateClick = (day) => {
    setCurrentDate(day);
  };

  const handlePrevMonth = () => {
    setMiniCalendarMonth(subMonths(miniCalendarMonth, 1));
  };

  const handleNextMonth = () => {
    setMiniCalendarMonth(addMonths(miniCalendarMonth, 1));
  };

  // Generate calendar grid
  const monthStart = startOfMonth(miniCalendarMonth);
  const monthEnd = endOfMonth(miniCalendarMonth);
  const weeks = eachWeekOfInterval(
    { start: startOfWeek(monthStart, { weekStartsOn: 0 }), end: monthEnd },
    { weekStartsOn: 0 }
  );

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Check if a date has events
  const hasEvents = (day) => {
    return events.some((event) => isSameDay(event.startTime, day));
  };

  // Generate days in a week
  const generateDaysInWeek = (weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const days = [];
    const currentDay = new Date(weekStart);
    
    while (currentDay <= weekEnd) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  return (
    <aside className="w-64 bg-gray-50 flex flex-col flex-shrink-0">
      {/* Create Button */}
      <div className="p-3">
        <button
          onClick={() => openEventModal()}
          className="w-1/2 rounded-lg bg-white border border-gray-300 shadow px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all flex items-center gap-2"
        >
          <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-gray-700">Create</span>
        </button>
      </div>

      {/* Mini Calendar */}
      <div className="px-3 pt-3 pb-2">
        {/* Month header with navigation */}
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            {format(miniCalendarMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="rounded p-1 hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded p-1 hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="text-center text-[11px] font-normal text-gray-600 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((weekStart, weekIndex) => {
            const days = generateDaysInWeek(weekStart);
            return (
              <React.Fragment key={weekIndex}>
                {days.map((day, dayIndex) => {
                  const isCurrentMonth = isSameMonth(day, miniCalendarMonth);
                  const isCurrentDay = isToday(day);
                  const isSelected = isSameDay(day, currentDate);
                  const dayHasEvents = hasEvents(day);

                  return (
                    <button
                      key={`${weekIndex}-${dayIndex}`}
                      onClick={() => handleDateClick(day)}
                      className={`
                        relative h-8 w-8 rounded-full text-xs
                        flex items-center justify-center
                        transition-all duration-150
                        ${
                          isCurrentDay
                            ? 'bg-[#1a73e8] text-white font-medium'
                            : isSelected
                            ? 'bg-blue-100 text-[#1a73e8] font-medium hover:bg-blue-200'
                            : isCurrentMonth
                            ? 'text-gray-900 hover:bg-gray-100'
                            : 'text-gray-400 hover:bg-gray-50'
                        }
                      `}
                      title={format(day, 'MMM d, yyyy')}
                    >
                      {format(day, 'd')}
                      {/* Small dot indicator for days with events */}
                      {dayHasEvents && !isSelected && !isCurrentDay && (
                        <span
                          className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[#1a73e8]"
                        />
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* My Calendars Section */}
      <div className="px-3 py-2 mt-4">
        <button
          onClick={() => setIsMyCalendarsOpen(!isMyCalendarsOpen)}
          className="w-full flex items-center justify-between mb-1 hover:bg-gray-200 rounded-lg px-2 py-1.5 -mx-1 transition-colors"
        >
          <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            My calendars
          </h3>
          <svg 
            className={`h-3 w-3 text-gray-500 transition-transform ${isMyCalendarsOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        {isMyCalendarsOpen && (
          <div className="space-y-0.5">
            <label 
              htmlFor="my-calendar-checkbox"
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1.5 -mx-1 transition-colors"
            >
              <input
                id="my-calendar-checkbox"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8] cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm text-gray-700">My Calendar</span>
            </label>
          </div>
        )}
      </div>

      {/* Other Calendars Section */}
      <div className="px-3 py-2 mt-4">
        <button
          onClick={() => setIsOtherCalendarsOpen(!isOtherCalendarsOpen)}
          className="w-full flex items-center justify-between mb-1 hover:bg-gray-200 rounded-lg px-2 py-1.5 -mx-1 transition-colors"
        >
          <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Other calendars
          </h3>
          <svg 
            className={`h-3 w-3 text-gray-500 transition-transform ${isOtherCalendarsOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        {isOtherCalendarsOpen && (
          <div className="space-y-0.5">
            <label 
              htmlFor="indian-holidays-checkbox"
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1.5 -mx-1 transition-colors"
            >
              <input
                id="indian-holidays-checkbox"
                type="checkbox"
                checked={showHolidays}
                onChange={(e) => setShowHolidays(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 focus:ring-[#0b8043] cursor-pointer"
                style={{ accentColor: '#0b8043' }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm text-gray-700">Indian Holidays</span>
            </label>
          </div>
        )}
      </div>

      {/* Today button */}
      <div className="px-3 pb-3 mt-auto">
        <button
          onClick={() => {
            const today = new Date();
            setCurrentDate(today);
            setMiniCalendarMonth(startOfMonth(today));
          }}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          Today
        </button>
      </div>
    </aside>
  );
}

