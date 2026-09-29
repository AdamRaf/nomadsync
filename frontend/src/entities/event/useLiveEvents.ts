import { useEffect } from "react";
import { socket } from "../../shared/api/socketClient";
import type { ItineraryEvent } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import { eventKeys } from "./queries";

export function useLiveEvents() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const onEventAdded = (newEvent: ItineraryEvent) => {
            queryClient.setQueryData<ItineraryEvent[]>(eventKeys.all, (oldData) => {
                if (!oldData) return [newEvent];
                if (oldData.some(event => event.id === newEvent.id)) return oldData;

                return [...oldData, newEvent];
            })
        }

        const onEventUpdated = (updatedEvent: ItineraryEvent) => {
            queryClient.setQueryData<ItineraryEvent[]>(eventKeys.all, (oldData) => {
                if (!oldData) return oldData;

                return oldData.map((event) =>
                    event.id === updatedEvent.id ? {...event, ...updatedEvent} : event
                )
            })
        }

        const onEventDeleted = ({ id }: { id: number }) => {
            queryClient.setQueryData<ItineraryEvent[]>(eventKeys.all, (oldData) => {
                if (!oldData) return oldData;

                return oldData.filter((event) => event.id !== id);
            })
        }

        socket.on('event_added', onEventAdded);
        socket.on('event_updated', onEventUpdated);
        socket.on('event_deleted', onEventDeleted);

        return () => {
            socket.off('event_added', onEventAdded);
            socket.off('event_updated', onEventUpdated);
            socket.off('event_deleted', onEventDeleted);
        }
    }, [queryClient])
}
