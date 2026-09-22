import { useEffect } from "react";
import { socket } from "../../shared/api/socketClient";
import type { UseLiveEventsProps } from "./types";

export function useLiveEvents({
    onEventAdded,
    onEventUpdated,
    onEventDeleted,
}: UseLiveEventsProps) {
    useEffect(() => {
        socket.on('event_added', onEventAdded);
        socket.on('event_updated', onEventUpdated);
        socket.on('event_deleted', onEventDeleted);

        return () => {
            socket.off('event_added', onEventAdded);
            socket.off('event_updated', onEventUpdated);
            socket.off('event_deleted', onEventDeleted);
        }
    }, [onEventAdded, onEventUpdated, onEventDeleted])
}
