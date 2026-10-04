import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import type { ItineraryEvent } from "../../entities/event/types";

import 'leaflet/dist/leaflet.css'
import './EventMap.css'

import L from "leaflet";
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// @ts-expect-error, Leaflet's typings omit `_getIconUrl`,
// but it must be removed for bundler-compatible marker assets
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

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
    <div className="map-wrapper">
      <MapContainer
        center={[-6.2295695, 106.7471172]} // Jakarta's lat lng from Gmap
        zoom={11}
        zoomControl={false}
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
                <p className="popup-title">{event.title}</p>
                <p>{new Date(event.start_time).toLocaleString()}</p>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  )
}