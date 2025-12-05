import { create } from 'zustand';
import type { DroneGeoEventMessage } from '@shared/types/drone.types';

const MAX_EVENTS_SIZE = 50;

interface GeofenceEventsStoreState {
    // Estado
    events: DroneGeoEventMessage[];
    unreadCount: number;
    totalEventsReceived: number;
    latestEvent: DroneGeoEventMessage | null;

    // Acciones
    addEvent: (event: DroneGeoEventMessage) => void;
    markAllAsRead: () => void;
    clearEvents: () => void;
    getEventsByVehicle: (vehicleId: string) => DroneGeoEventMessage[];
}

export const useGeofenceEventsStore = create<GeofenceEventsStoreState>()((set, get) => ({
    // Estado inicial
    events: [],
    unreadCount: 0,
    totalEventsReceived: 0,
    latestEvent: null,

    // Acciones
    addEvent: (event: DroneGeoEventMessage) => {
        set((state) => {
            const newEvents = [event, ...state.events];

            // Limitar el tamaño del historial
            if (newEvents.length > MAX_EVENTS_SIZE) {
                newEvents.pop();
            }

            return {
                events: newEvents,
                unreadCount: state.unreadCount + 1,
                totalEventsReceived: state.totalEventsReceived + 1,
                latestEvent: event,
            };
        });
    },

    markAllAsRead: () => {
        set({ unreadCount: 0 });
    },

    clearEvents: () => {
        set({ events: [], unreadCount: 0, totalEventsReceived: 0, latestEvent: null });
    },

    getEventsByVehicle: (vehicleId: string) => {
        return get().events.filter((event) => event.vehicleId === vehicleId);
    },
}));
