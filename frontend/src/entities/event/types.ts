export interface ItineraryEvent {
    id: number;
    title: string;
}

export interface UseLiveEventsProps {
    onEventAdded: (event: ItineraryEvent) => void;
    onEventUpdated: (event: ItineraryEvent) => void;
    onEventDeleted: (data: { id: number }) => void;
}
