import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import type { ItineraryEvent } from "../../entities/event/types";

import 'leaflet/dist/leaflet.css'

type LocationSelectHelper = (lat: number, lng: number) => void

interface MapClickInterceptorProps {
  onLocationSelect: LocationSelectHelper;
}

interface EventMapProps {
  events: ItineraryEvent[];
  onLocationSelect: LocationSelectHelper;
}

const MapClickInterceptor = ({ onLocationSelect }: MapClickInterceptorProps) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  })

  return null
}

export const EventMap = ({ events, onLocationSelect }: EventMapProps) => {
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

        {onLocationSelect && <MapClickInterceptor onLocationSelect={onLocationSelect}/>}

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