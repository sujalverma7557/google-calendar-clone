import { create } from 'zustand';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, startOfDay } from 'date-fns';

export const useCalendarStore = create((set, get) => ({
  currentDate: new Date(),
  view: 'month',
  events: [],
  selectedEvent: null,
  isEventModalOpen: false,
  clickedDate: null,
  isSidebarOpen: true,
  showHolidays: true,
  
  setCurrentDate: (date) => set({ currentDate: date }),
  
  setView: (view) => set({ view }),
  
  setEvents: (events) => set({ 
    events: events.map(e => ({
      ...e,
      startTime: new Date(e.startTime),
      endTime: new Date(e.endTime),
    }))
  }),
  
  addEvent: (event) => set((state) => ({
    events: [...state.events, {
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    }]
  })),
  
  updateEvent: (event) => set((state) => ({
    events: state.events.map((e) => 
      e.id === event.id ? {
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      } : e
    )
  })),
  
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id)
  })),
  
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  
  openEventModal: (clickedDate = null) => set({ 
    isEventModalOpen: true,
    clickedDate: clickedDate ? new Date(clickedDate) : null
  }),
  
  closeEventModal: () => set({ 
    isEventModalOpen: false, 
    selectedEvent: null,
    clickedDate: null
  }),
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  
  toggleHolidays: () => set((state) => ({ showHolidays: !state.showHolidays })),
  
  setShowHolidays: (show) => set({ showHolidays: show }),
  
  goToToday: () => set({ currentDate: new Date() }),
  
  goToNextMonth: () => set((state) => ({ currentDate: addMonths(state.currentDate, 1) })),
  goToPrevMonth: () => set((state) => ({ currentDate: subMonths(state.currentDate, 1) })),
  
  goToNextWeek: () => set((state) => {
    const nextWeek = new Date(state.currentDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return { currentDate: nextWeek };
  }),
  goToPrevWeek: () => set((state) => {
    const prevWeek = new Date(state.currentDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    return { currentDate: prevWeek };
  }),
  
  goToNextDay: () => set((state) => {
    const nextDay = new Date(state.currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return { currentDate: nextDay };
  }),
  goToPrevDay: () => set((state) => {
    const prevDay = new Date(state.currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    return { currentDate: prevDay };
  }),
  
  getMonthRange: () => {
    const currentDate = get().currentDate;
    return {
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    };
  },
  
  getWeekRange: () => {
    const currentDate = get().currentDate;
    return {
      start: startOfWeek(currentDate, { weekStartsOn: 0 }),
      end: endOfWeek(currentDate, { weekStartsOn: 0 }),
    };
  },
  
  getDayRange: () => {
    const currentDate = get().currentDate;
    return {
      start: startOfDay(currentDate),
      end: startOfDay(currentDate),
    };
  },
  
  getCurrentRange: () => {
    const { view, getMonthRange, getWeekRange, getDayRange } = get();
    switch (view) {
      case 'month':
        return getMonthRange();
      case 'week':
        return getWeekRange();
      case 'day':
        return getDayRange();
    }
  },
}));

