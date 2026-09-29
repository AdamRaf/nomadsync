import { useCallback, useState } from "react"
import { useLiveEvents } from "../../entities/event/useLiveEvents";
import { EventMap } from "../../widgets/EventMap";
import { EventSidebar } from "../../widgets/EventSidebar";

import './EventDashboard.css'
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useEventsQuery,
  useUpdateEventMutation
} from "../../entities/event/queries";

export const EventDashboard = () => {
  const [newEventTitle, setNewEventTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeLat, setActiveLat] = useState<number | ''>('');
  const [activeLng, setActiveLng] = useState<number | ''>('');

  const { data: events = [], isLoading } = useEventsQuery();
  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation();
  const deleteMutation = useDeleteEventMutation();

  useLiveEvents();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    createMutation.mutate(
      {
        title: newEventTitle,
        start_time: new Date().toISOString(),
        lat: activeLat === '' ? null : activeLat,
        lng: activeLng === '' ? null : activeLng,
      },
      {
        onSuccess: () => {
          setNewEventTitle('');
          setActiveLat('');
          setActiveLng('');
        }
      }
    )
  }

  const handleDelete = async (id: number) => {
    deleteMutation.mutate(id);
  }

  const handleUpdate = async (id: number, start_time: string) => {
    updateMutation.mutate(
      { id, title: editTitle, start_time},
      {
        onSuccess: () => {
          setEditingId(null);
          setEditTitle('');
        }
      }
    )
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
          loading={isLoading || createMutation.isPending}
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
