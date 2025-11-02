import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { useState, useEffect } from 'react';
import { useCalendarStore } from '../../store/calendarStore';
import { getHolidaysForYear, holidaysToEvents } from '../../data/indianHolidays';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function WeekView() {
  const { currentDate, events, openEventModal, setSelectedEvent, showHolidays } = useCalendarStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate current time position for a given day
  const getCurrentTimePosition = (day) => {
    if (!isToday(day)) return null;
    
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    
    const topPercent = ((currentMinutes + currentSeconds / 60) / 60) * 100;
    
    return { hour: currentHour, topPercent };
  };
  
  const handleTimeSlotClick = (day, hour) => {
    const clickedDateTime = new Date(day);
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

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get holidays for the current year
  const year = currentDate.getFullYear();
  const allHolidays = getHolidaysForYear(year);
  const holidayEvents = holidaysToEvents(allHolidays, showHolidays);
  
  // Combine regular events and holidays
  const allEvents = [...events, ...holidayEvents];

  return (
    <div className="flex h-full overflow-auto bg-white">
      {/* Time column */}
      <div 
        className="w-16 flex-shrink-0 border-r border-gray-300 bg-white transition-colors"
        style={{ minHeight: `${56 + (24 * 64)}px` }}
      >
        <div className="h-14 border-b border-gray-300"></div>
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
      <div className="flex-1">
        {/* Day headers with holidays - must match time column header height (h-14 = 56px) */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-7 h-14 transition-colors">
            {days.map((day, index) => {
              const isCurrentDay = isToday(day);
              const dayHolidays = allEvents.filter((event) => {
                if (!event.isHoliday) return false;
                const eventStart = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
                return isSameDay(eventStart, day);
              });
              return (
                <div
                  key={index}
                  className="border-r border-gray-200 flex flex-col justify-center items-center last:border-r-0"
                >
                  <div className="text-xs font-medium text-gray-600">
                    {weekDays[index]}
                  </div>
                  <div
                    className={`text-lg ${
                      isCurrentDay
                        ? 'flex h-7 w-7 items-center justify-center rounded-full bg-google-blue text-white mt-0.5'
                        : 'text-gray-900 mt-0.5'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Holidays row */}
          {showHolidays && (
            <div className="grid grid-cols-7 border-t border-gray-200 bg-gray-50/50">
              {days.map((day, index) => {
                const dayHolidays = allEvents.filter((event) => {
                  if (!event.isHoliday) return false;
                  const eventStart = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
                  return isSameDay(eventStart, day);
                });
                return (
                  <div
                    key={index}
                    className="border-r border-gray-200 last:border-r-0 px-1 py-0.5 min-h-[24px]"
                  >
                    {dayHolidays.map((holiday) => (
                      <div
                        key={holiday.id}
                        className="text-xs font-medium truncate rounded px-1.5 py-0.5"
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
                );
              })}
            </div>
          )}
        </div>

        {/* Time slots - must have min-height to render all 24 hours */}
        <div className="relative grid grid-cols-7" style={{ minHeight: `${24 * 64}px` }}>
          {days.map((day, dayIndex) => {
            // Get all non-holiday events for this day once
            const dayEvents = allEvents.filter((event) => {
              if (event.isHoliday) return false; // Holidays shown in header
              const eventStart = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
              return isSameDay(eventStart, day);
            });

            return (
              <div
                key={dayIndex}
                className={`relative border-r last:border-r-0 transition-colors ${
                  isToday(day) ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
                }`}
                style={{ minHeight: `${24 * 64}px` }}
              >
                {HOURS.map((hour) => {
                  const hourStart = new Date(day);
                  hourStart.setHours(hour, 0, 0, 0);
                  const hourEnd = new Date(day);
                  hourEnd.setHours(hour + 1, 0, 0, 0);

                  // Find events that overlap with this hour slot
                  const overlappingEvents = dayEvents.filter((event) => {
                    const eventStart = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
                    const eventEnd = event.endTime instanceof Date ? event.endTime : new Date(event.endTime);
                    return eventStart < hourEnd && eventEnd > hourStart;
                  });

                  // Only render events that start in this hour slot (to avoid duplicates across hours)
                  const eventsToRender = overlappingEvents.filter((event) => {
                    const eventStart = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
                    return eventStart.getHours() === hour;
                  });

                  // Check if current time is in this hour slot
                  const timePos = getCurrentTimePosition(day);
                  const showCurrentTime = timePos && timePos.hour === hour && isToday(day);

                  return (
                      <div
                        key={hour}
                        className={`relative h-16 border-b border-gray-300 hover:bg-gray-50 cursor-pointer select-none transition-colors ${
                          showCurrentTime ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleTimeSlotClick(day, hour)}
                      >
                      {eventsToRender.map((event) => {
                        const eventStart = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
                        const eventEnd = event.endTime instanceof Date ? event.endTime : new Date(event.endTime);
                        
                        // Calculate position within this hour slot
                        const startMinutes = eventStart.getMinutes();
                        const startSeconds = eventStart.getSeconds();
                        const minutesOffset = startMinutes + (startSeconds / 60);
                        const topPercent = (minutesOffset / 60) * 100;
                        
                        // Calculate duration
                        const durationMs = eventEnd.getTime() - eventStart.getTime();
                        const durationMinutes = durationMs / (1000 * 60);
                        const heightPercent = (durationMinutes / 60) * 100;

                        const isHoliday = event.isHoliday;
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              if (!isHoliday) handleEventClick(event, e);
                            }}
                            className={`absolute left-0 right-0 mx-1 rounded px-2 py-1 text-xs overflow-hidden z-10 transition-all ${
                              isHoliday 
                                ? 'text-gray-600 font-medium cursor-default' 
                                : 'text-white cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:z-20 hover:ring-2 hover:ring-white/50'
                            }`}
                            style={isHoliday ? {} : {
                              backgroundColor: event.color,
                              top: `${topPercent}%`,
                              height: `${heightPercent}%`,
                              minHeight: '24px',
                            }}
                            title={isHoliday ? event.title : `${event.title} • ${format(eventStart, 'h:mm a')}${event.location ? ` • ${event.location}` : ''}`}
                          >
                            {!isHoliday && (
                              <>
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="opacity-90 text-xs">
                                  {format(eventStart, 'h:mm a')}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Current time line within this hour slot */}
                      {showCurrentTime && timePos && (
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

