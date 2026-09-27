import type { ItineraryEvent } from "../../entities/event/types";
import './EventSidebar.css'

interface EventSidebarProps {
  events: ItineraryEvent[];
  handleSubmit: (e: React.SubmitEvent) => void;
  newEventTitle: string;
  setNewEventTitle: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  activeLat: number | '';
  activeLng: number | '';
  setActiveLat: React.Dispatch<React.SetStateAction<number | "">>;
  setActiveLng: React.Dispatch<React.SetStateAction<number | "">>;
  editngId: number | null;
  editTitle: string;
  setEditTitle: React.Dispatch<React.SetStateAction<string>>;
  handleUpdate: (id: number, start_time: string) => void;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  handleDelete: (id: number) => void;
}

export const EventSidebar = (props: EventSidebarProps) => {
  const sortedEvents = [...props.events].sort((a, b) => (
    a.start_time.localeCompare(b.start_time)
  ))

  return (
    <div className="event-sidebar">
      <h1>Nomadsync</h1>

      <form className="event-form" onSubmit={props.handleSubmit}>
        <label>Create New Event</label>
        <input
          type="text"
          value={props.newEventTitle}
          onChange={(e) => props.setNewEventTitle(e.target.value)}
          placeholder="Flight to Mars"
          disabled={props.loading}
        />

        <div>
          <input
            type="number"
            value={props.activeLat}
            onChange={(e) => props.setActiveLat(Number(e.target.value))}
            placeholder="Lat"
            disabled={props.loading}
            step="any"
          />
          <input
            type="number"
            value={props.activeLng}
            onChange={(e) => props.setActiveLng(Number(e.target.value))}
            placeholder="Lng"
            disabled={props.loading}
            step="any"
          />
        </div>

        <button type="submit" disabled={props.loading || !props.newEventTitle}>
          {props.loading ? 'Saving...' : 'Save'}
        </button>
      </form>

      <ul className="event-list">
        {sortedEvents.map((event) => (
          <li key={event.id} className="event-card">
            {props.editngId === event.id ? (
              <div>
                <input
                  type="text"
                  value={props.editTitle}
                  onChange={(e) => props.setEditTitle(e.target.value)}
                />
                <div className="event-card-actions">
                  <button onClick={() => props.handleUpdate(event.id, event.start_time)}>Save</button>
                  <button onClick={() => props.setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="event-card-header">
                  <div>
                    <h3 className="event-card-title">{event.title}</h3>
                    <span className="event-card-time">{new Date(event.start_time).toLocaleString()}</span>
                  </div>
                </div>
                <div className="event-card-actions">
                  <button onClick={() => {
                    props.setEditingId(event.id);
                    props.setEditTitle(event.title);
                  }}>Edit</button>
                  <button onClick={() => props.handleDelete(event.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
