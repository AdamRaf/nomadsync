import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { ItineraryEvent } from "../../entities/event/types";

import 'leaflet/dist/leaflet.css'

export const EventMap = ({ events }: { events: ItineraryEvent[] }) => {
  return (
    <div
      style={{
        height: '50vh',
        width: '80%',
        display: 'flex',
        justifySelf: 'center',
      }}
    >
      <MapContainer
        center={[-6.2295695, 106.7471172]} // Jakarta's lat lng from Gmap
        zoom={11}
        style={{ height: '100%', width: '100%', borderRadius: '10px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="Map data from &copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a>"
        />

        {events.map((event) => (
          event.lat && event.lng && (
            <Marker key={event.id} position={[event.lat, event.lng]}>
              <Popup>
                <p style={{ fontWeight: 'bold' }}>{event.title}</p>
                <p>{new Date(event.start_time).toLocaleString()}</p>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  )
}