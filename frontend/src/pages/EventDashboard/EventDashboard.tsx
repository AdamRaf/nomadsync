import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import type { ItineraryEvent } from "../../entities/event/types";
import { createEvent, deleteEvent, fetchEvents, updateEvent } from "../../entities/event/api";
import { useLiveEvents } from "../../entities/event/useLiveEvents";
import { EventMap } from "../../widgets/EventMap";
import { EventSidebar } from "../../widgets/EventSidebar";

import './EventDashboard.css'

export const EventDashboard = () => {
  const [events, setEvents] = useState<ItineraryEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeLat, setActiveLat] = useState<number | ''>('');
  const [activeLng, setActiveLng] = useState<number | ''>('');

  const safelyAppendEvent = useCallback((newEvent: ItineraryEvent) => {
    setEvents((prevEvents) => {
      const alreadyExists = prevEvents.some(event => event.id === newEvent.id);

      if (alreadyExists) return prevEvents;

      return [...prevEvents, newEvent]
    })
  }, [])

  const safelyUpdateEvent = useCallback((updatedEvent: ItineraryEvent) => {
    setEvents((prevEvents) => 
      prevEvents.map((event) =>
        event.id === updatedEvent.id
          ? {...event, ...updatedEvent}
          : event
      )
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
      const response = await createEvent(
        newEventTitle,
        new Date().toISOString(),
        activeLat === '' ? null : activeLat,
        activeLng === '' ? null : activeLng,
      );
      safelyAppendEvent(response);
      setNewEventTitle('');
      setActiveLat('');
      setActiveLng('');
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

  const handleUpdate = async (id: number, start_time: string) => {
    try {
      await updateEvent(id, editTitle, start_time);
      
      setEvents((prevEvents) => prevEvents.map((event) => (
        event.id === id ? { ...event, title: editTitle } : event
      )))
      
      setEditingId(null);
      setEditTitle("");
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  }

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setActiveLat(Number(lat.toFixed(6)))
    setActiveLng(Number(lng.toFixed(6)))
  }, [])

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-sidebar-container">
        <EventSidebar
          events={events}
          handleSubmit={handleSubmit}
          newEventTitle={newEventTitle}
          setNewEventTitle={setNewEventTitle}
          loading={loading}
          activeLat={activeLat}
          activeLng={activeLng}
          setActiveLat={setActiveLat}
          setActiveLng={setActiveLng}
          editngId={editingId}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          handleUpdate={handleUpdate}
          setEditingId={setEditingId}
          handleDelete={handleDelete}
        />
      </div>

      <div className="dashboard-map-container">
        <EventMap events={events} onLocationSelect={handleMapClick}/>
      </div>
    </div>
  )
}
