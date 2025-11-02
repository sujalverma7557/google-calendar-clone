import { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { useCalendarStore } from '../store/calendarStore';

export default function Header() {
  const {
    currentDate,
    view,
    setView,
    goToToday,
    goToNextMonth,
    goToPrevMonth,
    goToNextWeek,
    goToPrevWeek,
    goToNextDay,
    goToPrevDay,
    toggleSidebar,
  } = useCalendarStore();
  
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const viewLabels = {
    month: 'Month',
    week: 'Week',
    day: 'Day'
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsViewDropdownOpen(false);
      }
    };
    
    if (isViewDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isViewDropdownOpen]);

  const handlePrevious = () => {
    if (view === 'month') goToPrevMonth();
    else if (view === 'week') goToPrevWeek();
    else goToPrevDay();
  };

  const handleNext = () => {
    if (view === 'month') goToNextMonth();
    else if (view === 'week') goToNextWeek();
    else goToNextDay();
  };

  const getDisplayDate = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      default:
        return '';
    }
  };

  return (
    <header className="bg-gray-50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9"
              viewBox="0 0 48 48"
            >
              <rect width="22" height="22" x="13" y="13" fill="#fff"></rect>
              <polygon fill="#1e88e5" points="25.68,20.92 26.688,22.36 28.272,21.208 28.272,29.56 30,29.56 30,18.616 28.56,18.616"></polygon>
              <path fill="#1e88e5" d="M22.943,23.745c0.625-0.574,1.013-1.37,1.013-2.249c0-1.747-1.533-3.168-3.417-3.168 c-1.602,0-2.972,1.009-3.33,2.453l1.657,0.421c0.165-0.664,0.868-1.146,1.673-1.146c0.942,0,1.709,0.646,1.709,1.44 c0,0.794-0.767,1.44-1.709,1.44h-0.997v1.728h0.997c1.081,0,1.993,0.751,1.993,1.64c0,0.904-0.866,1.64-1.931,1.64 c-0.962,0-1.784-0.61-1.914-1.418L17,26.802c0.262,1.636,1.81,2.87,3.6,2.87c2.007,0,3.64-1.511,3.64-3.368 C24.24,25.281,23.736,24.363,22.943,23.745z"></path>
              <polygon fill="#fbc02d" points="34,42 14,42 13,38 14,34 34,34 35,38"></polygon>
              <polygon fill="#4caf50" points="38,35 42,34 42,14 38,13 34,14 34,34"></polygon>
              <path fill="#1e88e5" d="M34,14l1-4l-1-4H9C7.343,6,6,7.343,6,9v25l4,1l4-1V14H34z"></path>
              <polygon fill="#e53935" points="34,34 34,42 42,34"></polygon>
              <path fill="#1565c0" d="M39,6h-5v8h8V9C42,7.343,40.657,6,39,6z"></path>
              <path fill="#1565c0" d="M9,42h5v-8H6v5C6,40.657,7.343,42,9,42z"></path>
            </svg>
            <h1 className="text-2xl font-normal text-gray-700">Calendar</h1>
          </div>

          <button
            onClick={goToToday}
            className="rounded-full border border-gray-900 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              className="rounded-md p-1.5 hover:bg-gray-100 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              className="rounded-md p-1.5 hover:bg-gray-100 transition-colors"
              aria-label="Next"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <h2 className="text-xl font-normal text-gray-900 ml-2">{getDisplayDate()}</h2>
        </div>

        {/* View switcher dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-gray-900 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span>{viewLabels[view]}</span>
            <ChevronDownIcon className={`h-3 w-3 text-gray-700 transition-transform ${isViewDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isViewDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  setView('day');
                  setIsViewDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                  view === 'day' ? 'bg-gray-50 font-medium' : ''
                }`}
              >
                <span>Day</span>
                <span className="text-xs">D</span>
              </button>
              <button
                onClick={() => {
                  setView('week');
                  setIsViewDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                  view === 'week' ? 'bg-gray-50 font-medium' : ''
                }`}
              >
                <span>Week</span>
                <span className="text-xs">W</span>
              </button>
              <button
                onClick={() => {
                  setView('month');
                  setIsViewDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                  view === 'month' ? 'bg-gray-50 font-medium' : ''
                }`}
              >
                <span>Month</span>
                <span className="text-xs">M</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


