import { useEffect, useState } from "react"
import axios from "axios"

interface ItineraryEvent {
  id: number;
  title: string;
}

export default function App() {
  const [events, setEvents] = useState<ItineraryEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/events', {
          signal: controller.signal
        })
        setEvents(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Error fetching events:', err);
        }
      }
    }

    fetchEvents();

    return () => {
      controller.abort();
    }
  }, [])

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/events', {
        title: newEventTitle
      });
      setEvents((prevEvents) => [...prevEvents, response.data]);
      setNewEventTitle('');
    } catch (err) {
      console.error('Error adding event:', err);
    } finally {
      setLoading(false);
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
          <li key={event.id}>{event.title}</li>
        ))}
      </ul>
    </div>
  )
}