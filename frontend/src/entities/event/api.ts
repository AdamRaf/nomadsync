import { apiClient } from "../../shared/api/apiClient"
import { type ItineraryEvent } from './types'

export const fetchEvents = async (signal?: AbortSignal): Promise<ItineraryEvent[]> => {
    const response = await apiClient.get<ItineraryEvent[]>('/events', { signal });
    return response.data;
}

export const createEvent = async (title: string): Promise<ItineraryEvent> => {
    const response = await apiClient.post<ItineraryEvent>('/events', { title });
    return response.data;
}

export const deleteEvent = async (id: number): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
}

export const updateEvent = async (id: number, title: string): Promise<void> => {
    await apiClient.put(`/events/${id}`, { title });
}
