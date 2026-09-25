export interface ItineraryEvent {
    id: number;
    title: string;
    start_time: string;
    lat: number;
    lng: number;
    created_at: string;
}

export interface UseLiveEventsProps {
    onEventAdded: (event: ItineraryEvent) => void;
    onEventUpdated: (event: ItineraryEvent) => void;
    onEventDeleted: (data: { id: number }) => void;
}
