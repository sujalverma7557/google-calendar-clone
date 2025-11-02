import { useEffect } from 'react';
import Header from './components/Header';
import CalendarView from './components/CalendarView';
import EventModal from './components/EventModal';
import Sidebar from './components/Sidebar';
import { useCalendarStore } from './store/calendarStore';
import { api } from './services/api';

function App() {
  const { events, setEvents, view, currentDate, getCurrentRange, isSidebarOpen } = useCalendarStore();

  // Fetch events when view or date changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const range = getCurrentRange();
        // Expand range slightly to include events that span across boundaries
        const start = new Date(range.start);
        start.setDate(start.getDate() - 7);
        const end = new Date(range.end);
        end.setDate(end.getDate() + 7);
        
        const fetchedEvents = await api.getEvents(start, end);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();
  }, [view, currentDate]);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
        >
          <Sidebar />
        </div>
        <div className="flex-1 overflow-hidden bg-white rounded-xl m-2 shadow-sm">
          <CalendarView />
        </div>
      </div>
      <EventModal />
    </div>
  );
}

export default App;

