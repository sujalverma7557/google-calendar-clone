import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

/**
 * GET /api/events?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Fetch events within a date range
 */
router.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Fetch all events in the range
    const events = await prisma.event.findMany({
      where: {
        AND: [
          { startTime: { lte: endDate } },
          { endTime: { gte: startDate } },
        ],
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    
    // Map events to response format
    const formattedEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      startTime: e.startTime,
      endTime: e.endTime,
      color: e.color,
      location: e.location,
    }));
    
    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * GET /api/events/:id
 * Get a single event by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/**
 * POST /api/events
 * Create a new event
 */
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.title || !data.startTime || !data.endTime) {
      return res.status(400).json({ error: 'Title, startTime, and endTime are required' });
    }
    
    // Validate dates
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (startTime >= endTime) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }
    
    // Create event
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        color: data.color || '#1a73e8',
        location: data.location,
      },
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * PUT /api/events/:id
 * Update an existing event
 */
router.put('/:id', async (req, res) => {
  try {
    const data = req.body;
    const eventId = req.params.id;
    
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Validate dates if provided
    let startTime = existingEvent.startTime;
    let endTime = existingEvent.endTime;
    
    if (data.startTime && data.endTime) {
      startTime = new Date(data.startTime);
      endTime = new Date(data.endTime);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      
      if (startTime >= endTime) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }
    }
    
    // Update event
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startTime && { startTime }),
        ...(data.endTime && { endTime }),
        ...(data.color && { color: data.color }),
        ...(data.location !== undefined && { location: data.location }),
      },
    });
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * DELETE /api/events/:id
 * Delete an event
 */
router.delete('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    await prisma.event.delete({
      where: { id: eventId },
    });
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;

