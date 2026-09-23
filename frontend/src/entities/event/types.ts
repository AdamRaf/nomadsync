export interface ItineraryEvent {
    id: number;
    title: string;
    start_time: string;
    created_at: string;
}

export interface UseLiveEventsProps {
    onEventAdded: (event: ItineraryEvent) => void;
    onEventUpdated: (event: ItineraryEvent) => void;
    onEventDeleted: (data: { id: number }) => void;
}
