import { useEffect } from "react";
import { socket } from "../../shared/api/socketClient";
import type { ItineraryEvent } from "./types";

export function useLiveEvents(onEventAdded: (event: ItineraryEvent) => void) {
    useEffect(() => {
        const handleEventAdded = (data: ItineraryEvent) => {
            onEventAdded(data);
        }

        socket.on('event_added', handleEventAdded);

        return () => {
            socket.off('event_added', handleEventAdded);
        }
    }, [onEventAdded])
}
