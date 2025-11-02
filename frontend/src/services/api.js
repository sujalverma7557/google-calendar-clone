const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async getEvents(start, end) {
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    const events = await this.request(
      `/events?start=${startStr}&end=${endStr}`
    );
    
    return events.map((event) => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    }));
  }

  async getEvent(id) {
    const event = await this.request(`/events/${id}`);
    return {
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    };
  }

  async createEvent(input) {
    const event = await this.request('/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return {
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    };
  }

  async updateEvent(id, input) {
    const event = await this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return {
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    };
  }

  async deleteEvent(id) {
    await this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();

