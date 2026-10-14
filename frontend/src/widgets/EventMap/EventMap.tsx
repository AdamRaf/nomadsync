import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents
} from "react-leaflet";
import type { ItineraryEvent } from "../../entities/event/types";

import 'leaflet/dist/leaflet.css'
import './EventMap.css'

import L from "leaflet";
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import { searchLocation } from "@/entities/event/api";
import { Search } from "lucide-react"

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

const MapPanner = ({ center }: { center: [number, number] | null}) => {
  const map = useMap();

  if (center) {
    map.flyTo(center, 11, { duration: 1.5 });
  }

  return null;
}

export const EventMap = ({ events, onLocationSelect }: EventMapProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [targetLocation, setTargetLocation] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const data = await searchLocation(searchQuery);
      setTargetLocation([data.lat, data.lng]);
    } catch (err) {
      console.error('Location not found:', err);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="map-wrapper">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-450 w-full max-w-md bg-white rounded-full shadow-md p-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Jump to a city"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isSearching}
          />
          <Button type="submit" disabled={isSearching} className="p-2">
            <Search className="" />
          </Button>
        </form>
      </div>
      
      <MapContainer
        center={[-6.2295695, 106.7471172]} // Jakarta's lat lng from Gmap
        zoom={11}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="Map data from &copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a>"
        />

        <MapPanner center={targetLocation} />

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