# Google Calendar Clone

A high-fidelity fullstack clone of Google Calendar built with React, Node.js, and SQLite. Demonstrates core calendar functionality with smooth interactions and a polished UI.

## Features

- **Three Calendar Views**: Month, Week, and Day views
- **Event Management**: Create, edit, view, and delete events
- **Color-Coded Events**: 8 different colors to organize events
- **Indian Holidays**: Built-in support for Indian holidays (2024-2027), toggleable
- **Mini Calendar Sidebar**: Quick date navigation
- **Current Time Indicator**: Red line showing current time in time-based views

## Tech Stack

**Frontend:** React 19, Vite, JavaScript, Tailwind CSS, Zustand, Framer Motion, date-fns

**Backend:** Node.js, Express, Prisma ORM, SQLite

## Setup

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd google-calendar-clone
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   
   # Frontend
   cd ../frontend
   npm install
   ```

### Running

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## Architecture

### Database Schema
Simple Event model with: id, title, description, startTime, endTime, color, location. Times stored as UTC DateTime.

### Backend API
RESTful endpoints:
- `GET /api/events?start=YYYY-MM-DD&end=YYYY-MM-DD` - Fetch events in range
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Frontend State
Zustand store manages: current date, view type, events array, modal state, sidebar state, and holiday toggle.

### Technology Choices

- **React + Vite**: Fast development and modern React features
- **Zustand**: Simple state management without Redux boilerplate
- **Tailwind CSS**: Rapid UI development matching Google Calendar's design
- **Prisma**: Type-safe database queries and easy migrations
- **SQLite**: Zero-config for development (easily migrates to PostgreSQL)
- **Framer Motion**: Smooth animations for modals and transitions

## Business Logic & Edge Cases

### Timezone Handling
- All times stored in UTC in database
- Frontend constructs Date objects using local timezone values when creating events
- Display layer automatically converts to user's local timezone via date-fns

### Event Positioning
Events in Week/Day views positioned using:
- Hour slots are 64px each
- Position: `(minutes / 60) * 100%` within the hour slot
- Height: `(durationInMinutes / 60) * 100%`
- Minimum height of 6.25% (15 minutes) for visibility

### Date Range Queries
Frontend requests events only for the visible date range:
- Month view: Entire month
- Week view: Entire week
- Day view: Single day
- Backend filters with Prisma: `{ startTime: { gte: start, lte: end } }`

### Event Overlaps
Overlapping events are allowed (like Google Calendar). Events display side-by-side in Week/Day views.

### Holiday Integration
- Static holiday data for 2024-2027
- Holidays converted to event-like objects with `isHoliday: true` flag
- Displayed as solid green cards (vs transparent colored events)
- Non-clickable, toggleable via sidebar

### Current Time Indicator
- Updates every 60 seconds via `useEffect`
- Only shown when viewing today's date
- Position calculated: `((minutes + seconds/60) / 60) * 100%`

## Animations & Interactions

### Modal Animations (Framer Motion)
- Background overlay fades in (opacity 0 → 1)
- Modal content scales from 95% to 100% with fade
- 200ms duration for responsiveness
- Smooth exit animations

### View Transitions
Instant switching between views (matching Google Calendar's behavior). No transitions added for performance.

### User Interactions
- Click any date/time slot to create event (pre-fills with clicked time)
- Click any event to view/edit
- Hover effects: Events scale up slightly with shadow elevation
- Navigation: Previous/Next buttons, "Today" button, mini calendar

## Future Enhancements

### Features
- Drag and drop to reschedule events
- All-day events support
- Event search and filtering
- Recurring events (daily, weekly, monthly)
- Export to ICS format
- Google Calendar API integration
- Mobile responsive optimization

### Technical
- User authentication and multi-user support
- Real-time updates via WebSocket
- Offline support with service workers
- Unit and integration tests
- Migrate to PostgreSQL for production

## Development Notes

**Why JavaScript?** Project converted from TypeScript for faster iteration and simplicity.

**Why no recurring events?** Removed to focus on core functionality and UI polish within the assignment timeline. Can be added as enhancement.

**Known Limitations:**
- Single timezone (user's local timezone)
- No conflict detection for overlapping events
- Static holiday dates (no API)
- Large event counts (>1000) may impact performance

## License

Created for educational and evaluation purposes.
