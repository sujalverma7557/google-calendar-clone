import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCalendarStore } from '../store/calendarStore';
import { api } from '../services/api';

const EVENT_COLORS = [
  { name: 'Blue', value: '#1a73e8' },
  { name: 'Green', value: '#0b8043' },
  { name: 'Purple', value: '#8e24aa' },
  { name: 'Red', value: '#d32f2f' },
  { name: 'Orange', value: '#f57c00' },
  { name: 'Pink', value: '#e91e63' },
  { name: 'Teal', value: '#00796b' },
  { name: 'Gray', value: '#5f6368' },
];

export default function EventModal() {
  const {
    selectedEvent,
    isEventModalOpen,
    closeEventModal,
    addEvent,
    updateEvent,
    deleteEvent,
    clickedDate,
  } = useCalendarStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState(EVENT_COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (selectedEvent) {
      // Editing existing event
      setTitle(selectedEvent.title);
      setDescription(selectedEvent.description || '');
      setStartDate(format(selectedEvent.startTime, 'yyyy-MM-dd'));
      setStartTime(format(selectedEvent.startTime, 'HH:mm'));
      setEndDate(format(selectedEvent.endTime, 'yyyy-MM-dd'));
      setEndTime(format(selectedEvent.endTime, 'HH:mm'));
      setLocation(selectedEvent.location || '');
      setColor(selectedEvent.color);
      setIsEditMode(false); // Start in view mode when opening existing event
    } else {
      // Creating new event - use clicked date if available
      const dateToUse = clickedDate || new Date();
      setTitle('');
      setDescription('');
      setStartDate(format(dateToUse, 'yyyy-MM-dd'));
      // If clicked date was provided and has a specific time (not midnight), use it
      // Otherwise default to 9 AM (for month view clicks or no click)
      const clickedHour = dateToUse.getHours();
      const clickedMinutes = dateToUse.getMinutes();
      if (clickedDate && (clickedHour !== 0 || clickedMinutes !== 0)) {
        // Use the clicked time (from week/day view time slot clicks)
        setStartTime(format(dateToUse, 'HH:mm'));
        const endTime = new Date(dateToUse);
        endTime.setHours(endTime.getHours() + 1);
        setEndTime(format(endTime, 'HH:mm'));
      } else {
        // Default time if clicking from month view (midnight time = no specific time)
        setStartTime('09:00');
        setEndTime('10:00');
      }
      setEndDate(format(dateToUse, 'yyyy-MM-dd'));
      setLocation('');
      setColor(EVENT_COLORS[0].value);
      setIsEditMode(true); // Always start in edit mode for new events
    }
  }, [selectedEvent, clickedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create dates in local timezone explicitly
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const start = new Date(startYear, startMonth - 1, startDay, startHours, startMinutes);
      
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const end = new Date(endYear, endMonth - 1, endDay, endHours, endMinutes);

      if (start >= end) {
        alert('End time must be after start time');
        setLoading(false);
        return;
      }

      if (selectedEvent) {
        // Update existing event
        const updated = await api.updateEvent(selectedEvent.id, {
          title,
          description,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          location,
          color,
        });
        updateEvent(updated);
        setIsEditMode(false); // Return to view mode after saving
      } else {
        // Create new event
        const eventData = {
          title,
          description,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          location,
          color,
        };

        const created = await api.createEvent(eventData);
        // Convert date strings to Date objects before adding
        addEvent({
          ...created,
          startTime: new Date(created.startTime),
          endTime: new Date(created.endTime),
        });
        closeEventModal();
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await api.deleteEvent(selectedEvent.id);
      deleteEvent(selectedEvent.id);
      closeEventModal();
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };



  return (
    <AnimatePresence>
      {isEventModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeEventModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-normal text-gray-900">
                {selectedEvent ? (isEditMode ? 'Edit Event' : 'Event Details') : 'Create Event'}
              </h2>
              <div className="flex items-center gap-1">
                {selectedEvent && !isEditMode && (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </>
                )}
                <button
                  onClick={closeEventModal}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                  title="Close"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* View Mode - Show Event Details */}
            {selectedEvent && !isEditMode ? (
              <div className="px-6 py-5">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Title</div>
                    <div className="text-xl font-normal text-gray-900">{title}</div>
                  </div>

                  {/* Date and Time */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Time</div>
                    <div className="text-base text-gray-900">
                      <div className="font-normal">{format(new Date(`${startDate}T${startTime}`), 'EEEE, MMMM d, yyyy')}</div>
                      <div className="mt-1.5 text-gray-700">
                        {format(new Date(`${startDate}T${startTime}`), 'h:mm a')} - {format(new Date(`${endDate}T${endTime}`), 'h:mm a')}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {location && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Location</div>
                      <div className="text-base text-gray-900 flex items-start gap-2">
                        <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="flex-1 leading-relaxed">{location}</span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {description && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Description</div>
                      <div className="text-base text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {description}
                      </div>
                    </div>
                  )}

                  {/* Color */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Color</div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-600">{EVENT_COLORS.find(c => c.value === color)?.name || 'Custom'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode - Form */
              <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add title"
                    className="w-full border-0 border-b-2 border-transparent bg-transparent py-1.5 text-xl font-normal text-gray-900 focus:border-google-blue focus:outline-none placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Start</label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-google-blue focus:outline-none focus:ring-1 focus:ring-google-blue"
                        required
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-google-blue focus:outline-none focus:ring-1 focus:ring-google-blue"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">End</label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-google-blue focus:outline-none focus:ring-1 focus:ring-google-blue"
                        required
                      />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-google-blue focus:outline-none focus:ring-1 focus:ring-google-blue"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location"
                    className="flex-1 border-0 border-b border-transparent bg-transparent py-1.5 text-gray-900 focus:border-google-blue focus:outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Description */}
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add description"
                    rows={4}
                    className="flex-1 resize-none border-0 border-b border-transparent bg-transparent py-1.5 text-gray-900 focus:border-google-blue focus:outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Color picker */}
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <div className="flex gap-1.5">
                    {EVENT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`h-7 w-7 rounded-full transition-all ${
                          color === c.value 
                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                  {selectedEvent && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete event
                    </button>
                  )}
                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedEvent) {
                          setIsEditMode(false);
                        } else {
                          closeEventModal();
                        }
                      }}
                      className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {selectedEvent ? 'Cancel' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-md bg-google-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

