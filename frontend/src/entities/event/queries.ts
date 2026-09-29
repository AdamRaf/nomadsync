import { useMutation, useQuery } from "@tanstack/react-query"
import { createEvent, deleteEvent, fetchEvents, updateEvent } from "./api"

export const eventKeys = {
    all: ['events'] as const,
}

export function useEventsQuery() {
    return useQuery({
        queryKey: eventKeys.all,
        queryFn: ({ signal }) => fetchEvents(signal),
    })
}
export function useCreateEventMutation() {
    return useMutation({
        mutationFn: (
            data: {
                title: string,
                start_time: string,
                lat: number | null,
                lng: number | null,
            }
        ) => createEvent(data.title, data.start_time, data.lat, data.lng),
    })
}

export function useUpdateEventMutation() {
    return useMutation({
        mutationFn: (data: {id: number, title: string, start_time:string}) => 
            updateEvent(data.id, data.title, data.start_time),
    })
}

export function useDeleteEventMutation() {
    return useMutation({
        mutationFn: (id: number) => deleteEvent(id)
    })
}
