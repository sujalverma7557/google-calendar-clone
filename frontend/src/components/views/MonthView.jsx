import { format, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, isSameDay, isToday } from 'date-fns';
import { useCalendarStore } from '../../store/calendarStore';
import { getHolidaysForYear, holidaysToEvents } from '../../data/indianHolidays';

export default function MonthView() {
  const { currentDate, events, openEventModal, setSelectedEvent, showHolidays } = useCalendarStore();
  
  const handleDayClick = (day) => {
    setSelectedEvent(null);
    // Pass the clicked day to pre-fill the modal
    openEventModal(day);
  };
  
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    openEventModal();
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weeks = eachWeekOfInterval(
    { start: startOfWeek(monthStart, { weekStartsOn: 0 }), end: monthEnd },
    { weekStartsOn: 0 }
  );

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get holidays for the current year
  const year = currentDate.getFullYear();
  const allHolidays = getHolidaysForYear(year);
  const holidayEvents = holidaysToEvents(allHolidays, showHolidays);
  
  // Combine regular events and holidays
  const allEvents = [...events, ...holidayEvents];
  
  const getEventsForDay = (day) => {
    return allEvents.filter((event) => isSameDay(event.startTime, day));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-300 bg-white rounded-t-xl">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`border-r border-gray-300 py-3 flex items-center justify-center text-xs font-medium text-gray-600 ${
              index === 6 ? 'border-r-0' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto bg-white">
        {weeks.map((weekStart, weekIndex) => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
          const days = generateDaysInInterval(
            { start: weekStart, end: weekEnd }
          );

          return (
            <div
              key={weekIndex}
              className="grid min-h-[120px] grid-cols-7 border-b border-gray-300"
            >
              {days.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = format(day, 'yyyy-MM') === format(currentDate, 'yyyy-MM');
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={dayIndex}
                    className="relative border-r border-gray-300 px-2 py-2 last:border-r-0 hover:bg-gray-50 cursor-pointer select-none transition-colors flex flex-col"
                    onClick={() => handleDayClick(day)}
                  >
                    {/* Date number */}
                    <div
                      className={`mb-1 text-sm flex items-center justify-center ${
                        isCurrentDay
                          ? 'h-7 w-7 rounded-full bg-google-blue text-white font-medium mx-auto'
                          : isCurrentMonth
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>

                    {/* Events */}
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((event, idx) => {
                        const isHoliday = event.isHoliday;
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              if (!isHoliday) handleEventClick(event, e);
                            }}
                            className={`truncate rounded px-1.5 py-0.5 text-xs transition-all relative ${
                              isHoliday 
                                ? 'cursor-default' 
                                : 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:z-10'
                            }`}
                            style={isHoliday ? {
                              backgroundColor: event.color,
                              color: 'white',
                            } : {
                              backgroundColor: `${event.color}20`,
                              borderLeft: `3px solid ${event.color}`,
                              color: event.color,
                            }}
                            title={isHoliday ? event.title : `${format(event.startTime, 'h:mm a')} - ${event.title}${event.location ? ` • ${event.location}` : ''}`}
                          >
                            {!isHoliday && (
                              <span className="font-medium">
                                {format(event.startTime, 'h:mm a')}
                              </span>
                            )}
                            {!isHoliday && ' '}
                            {event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="px-1.5 text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to generate days of the week
function generateDaysInInterval({ start, end }) {
  const days = [];
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

