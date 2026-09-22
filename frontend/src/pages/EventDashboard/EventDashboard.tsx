import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import type { ItineraryEvent } from "../../entities/event/types";
import { createEvent, deleteEvent, fetchEvents, updateEvent } from "../../entities/event/api";
import { useLiveEvents } from "../../entities/event/useLiveEvents";

export const EventDashboard = () => {
  const [events, setEvents] = useState<ItineraryEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const safelyAppendEvent = useCallback((newEvent: ItineraryEvent) => {
    setEvents((prevEvents) => {
      const alreadyExists = prevEvents.some(event => event.id === newEvent.id);

      if (alreadyExists) return prevEvents;

      return [...prevEvents, newEvent]
    })
  }, [])

  const safelyUpdateEvent = useCallback((updatedEvent: ItineraryEvent) => {
    setEvents((prevEvents) => 
      prevEvents.map((event) => event.id === updatedEvent.id ? updatedEvent : event)
    )
  }, [])

  const safelyDeleteEvent = useCallback(({id}: {id: number}) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id))
  }, [])

  useLiveEvents({
    onEventAdded: safelyAppendEvent,
    onEventUpdated: safelyUpdateEvent,
    onEventDeleted: safelyDeleteEvent,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadEvents = async () => {
      try {
        const response = await fetchEvents(controller.signal);
        setEvents(response);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Error fetching events:', err);
        }
      }
    }

    loadEvents();

    return () => {
      controller.abort();
    }
  }, [])

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    setLoading(true);
    try {
      const response = await createEvent(newEventTitle);
      safelyAppendEvent(response);
      setNewEventTitle('');
    } catch (err) {
      console.error('Error adding event:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteEvent(id);
      setEvents(events.filter(event => event.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  }

  const handleUpdate = async (id: number) => {
    try {
      await updateEvent(id, editTitle);
      
      setEvents((prevEvents) => prevEvents.map((event) => (
        event.id === id ? { ...event, title: editTitle } : event
      )))
      
      setEditingId(null);
      setEditTitle("");
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  }

  return (
    <div>
      <h1>Nomadsync</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          placeholder="Flight to Mars"
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Event'}
        </button>
      </form>

      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {editingId === event.id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <button onClick={() => handleUpdate(event.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {event.title}
                <button
                  onClick={() => {
                    setEditingId(event.id);
                    setEditTitle(event.title);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(event.id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
