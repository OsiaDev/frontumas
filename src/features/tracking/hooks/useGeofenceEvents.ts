import { useEffect } from 'react';
import { mqttHandlers } from '@/features/tracking/services/mqtt/mqtt.handlers';
import { useGeofenceEventsStore } from '@/features/tracking/store/useGeofenceEventsStore';
import type { DroneGeoEventMessage } from '@shared/types/drone.types';

export const useGeofenceEvents = () => {
    const { events, unreadCount, totalEventsReceived, latestEvent, addEvent, markAllAsRead, clearEvents, getEventsByVehicle } =
        useGeofenceEventsStore();

    useEffect(() => {
        const handleGeoEvent = (event: DroneGeoEventMessage) => {
            console.log('[useGeofenceEvents] Nuevo geo-evento:', event);
            addEvent(event);
        };

        const unsubscribe = mqttHandlers.onGeoEvent(handleGeoEvent);

        return () => {
            unsubscribe();
        };
    }, [addEvent]);

    return {
        events,
        unreadCount,
        totalEventsReceived,
        latestEvent,
        markAllAsRead,
        clearEvents,
        getEventsByVehicle,
    };
};
