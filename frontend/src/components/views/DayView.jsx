import { format, isSameDay, isToday, startOfDay } from 'date-fns';
import { useState, useEffect } from 'react';
import { useCalendarStore } from '../../store/calendarStore';
import { getHolidaysForYear, holidaysToEvents } from '../../data/indianHolidays';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function DayView() {
  const { currentDate, events, openEventModal, setSelectedEvent, showHolidays } = useCalendarStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate current time position if it's today
  const getCurrentTimePosition = () => {
    if (!isToday(currentDate)) return null;
    
    const now = currentTime;
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const minutesFromStart = (now.getTime() - dayStart.getTime()) / (1000 * 60);
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    
    // Calculate which hour slot we're in and the position within that slot
    const topPixels = (currentHour * 64) + ((currentMinutes + currentSeconds / 60) / 60 * 64);
    const topPercent = ((currentMinutes + currentSeconds / 60) / 60) * 100;
    
    return { hour: currentHour, topPercent, topPixels };
  };
  
  const handleTimeSlotClick = (hour) => {
    const clickedDateTime = new Date(currentDate);
    clickedDateTime.setHours(hour, 0, 0, 0);
    setSelectedEvent(null);
    // Pass the clicked date/time to pre-fill the modal
    openEventModal(clickedDateTime);
  };
  
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    openEventModal();
  };

  // Get holidays for the current year
  const year = currentDate.getFullYear();
  const allHolidays = getHolidaysForYear(year);
  const holidayEvents = holidaysToEvents(allHolidays, showHolidays);
  
  // Get holidays for current day
  const dayHolidays = holidayEvents.filter((event) => {
    const eventDate = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
    return isSameDay(eventDate, currentDate);
  });
  
  // Filter non-holiday events for the current day - ensure we're comparing dates correctly
  const dayEvents = events.filter((event) => {
    const eventDate = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
    return isSameDay(eventDate, currentDate);
  });

  const getEventsForHour = (hour) => {
    const hourStart = new Date(currentDate);
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date(currentDate);
    hourEnd.setHours(hour + 1, 0, 0, 0);

    return dayEvents.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return eventStart < hourEnd && eventEnd > hourStart;
    });
  };

  const getEventPosition = (event) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    // Calculate position relative to the entire day (not just the hour slot)
    const minutesFromDayStart = (eventStart.getTime() - dayStart.getTime()) / (1000 * 60);
    const duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);
    
    // Each hour slot is 64px (h-16 = 4rem = 64px), so total day height is 24 * 64 = 1536px
    const topPixels = (minutesFromDayStart / 60) * 64;
    const heightPixels = (duration / 60) * 64;
    
    // Find which hour slot this event starts in
    const startHour = eventStart.getHours();
    const startMinutes = eventStart.getMinutes();
    
    // Position within the hour slot (0-100%)
    const topPercent = (startMinutes / 60) * 100;
    
    // But we need to position it relative to the hour slot's position in the day
    // Calculate offset from the hour slot's top
    const hourSlotTop = startHour * 64;
    const offsetFromHourTop = (startMinutes / 60) * 64;
    
    return {
      top: topPercent,
      height: Math.max((duration / 60) * 100, 6.25), // Minimum 15 minutes (6.25% of hour)
    };
  };

  return (
    <div className="flex h-full overflow-auto bg-white">
      {/* Time column */}
      <div 
        className="w-20 flex-shrink-0 border-r border-gray-300 bg-white transition-colors"
        style={{ minHeight: `${80 + (24 * 64)}px` }}
      >
        <div className="h-20 border-b border-gray-300 pt-2 text-center">
          <div className="text-xs font-medium text-gray-600">
            {format(currentDate, 'EEE')}
          </div>
          <div className="text-2xl font-normal text-gray-900">
            {format(currentDate, 'd')}
          </div>
        </div>
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-16 border-b border-gray-300 pr-2 text-right text-xs text-gray-500"
          >
            {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`flex-1 relative transition-colors ${isToday(currentDate) ? 'bg-blue-50/20' : ''}`} style={{ minHeight: `${80 + (24 * 64)}px` }}>
        {/* Header row with holidays */}
        <div className={`border-b transition-colors ${isToday(currentDate) ? 'border-blue-200' : 'border-gray-200'}`}>
          <div className={`h-20 ${isToday(currentDate) ? 'border-b border-blue-200' : 'border-b border-gray-200'}`}></div>
          {/* Holidays row */}
          {showHolidays && dayHolidays.length > 0 && (
            <div className="bg-gray-50/50 px-2 py-1.5 border-b border-gray-200">
              {dayHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="text-sm font-medium rounded px-2 py-1 inline-block mb-1"
                  style={{
                    backgroundColor: holiday.color,
                    color: 'white',
                  }}
                  title={holiday.title}
                >
                  {holiday.title}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Time slots - must align perfectly with time column */}
        {HOURS.map((hour) => {
          const timePos = getCurrentTimePosition();
          const showCurrentTimeInThisHour = timePos && timePos.hour === hour && isToday(currentDate);
          
          return (
          <div
            key={hour}
            className={`relative h-16 border-b border-gray-100 hover:bg-gray-50 cursor-pointer select-none transition-colors ${
              showCurrentTimeInThisHour ? 'bg-blue-50' : ''
            }`}
            onClick={() => handleTimeSlotClick(hour)}
          >
            {/* Render events that appear in this hour slot */}
            {dayEvents.map((event) => {
              // Event times should already be Date objects from the store (converted from UTC to local)
              const eventStart = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
              const eventEnd = event.endTime instanceof Date ? event.endTime : new Date(event.endTime);
              
              // Check if event overlaps with this hour slot
              const hourStart = new Date(currentDate);
              hourStart.setHours(hour, 0, 0, 0);
              const hourEnd = new Date(currentDate);
              hourEnd.setHours(hour + 1, 0, 0, 0);
              
              // Skip if event doesn't overlap with this hour
              if (eventStart >= hourEnd || eventEnd <= hourStart) {
                return null;
              }
              
              // Get event hour and minutes in local timezone
              const eventHour = eventStart.getHours();
              const eventMinutes = eventStart.getMinutes();
              const eventSeconds = eventStart.getSeconds();
              const eventEndHour = eventEnd.getHours();
              const eventEndMinutes = eventEnd.getMinutes();
              const eventEndSeconds = eventEnd.getSeconds();
              
              // Only render events that start in this hour slot (to avoid duplicate rendering)
              if (eventHour !== hour) {
                return null;
              }
              
              // Calculate position within this hour slot (0-100%)
              const minutesOffset = eventMinutes + (eventSeconds / 60);
              const topPercent = (minutesOffset / 60) * 100;
              
              // Calculate duration in minutes
              const durationMs = eventEnd.getTime() - eventStart.getTime();
              const durationMinutes = durationMs / (1000 * 60);
              
              // Height as percentage of the hour slot
              // For multi-hour events, this can exceed 100% - they'll overflow into next slots
              const heightPercent = (durationMinutes / 60) * 100;
              
              return (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className="absolute left-0 right-0 mx-2 rounded px-3 py-2 cursor-pointer z-10 transition-all hover:shadow-xl hover:scale-[1.02] hover:z-20 hover:ring-2 hover:ring-white/50"
                  style={{
                    backgroundColor: event.color,
                    color: 'white',
                    top: `${topPercent}%`,
                    height: `${Math.max(heightPercent, 6.25)}%`, // Minimum 15 minutes (6.25% of hour)
                    minHeight: '40px',
                  }}
                  title={`${event.title} • ${format(eventStart, 'h:mm a')} - ${format(eventEnd, 'h:mm a')}${event.location ? ` • ${event.location}` : ''}`}
                >
                  <div className="font-medium text-sm truncate">{event.title}</div>
                  <div className="text-xs opacity-90 mt-1">
                    {format(eventStart, 'h:mm a')} - {format(eventEnd, 'h:mm a')}
                  </div>
                  {event.location && (
                    <div className="text-xs opacity-75 mt-1 truncate flex items-center gap-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {event.location}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Current time line within this hour slot */}
            {showCurrentTimeInThisHour && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{
                  top: `${timePos.topPercent}%`,
                }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                  <div className="flex-1 h-0.5 bg-red-500"></div>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

