import { useMqttStore } from '@features/tracking/store/useMqttStore';
import type { DroneLocationMessage } from '@shared/types/drone.types';

interface UseDroneLocationsReturn {
    isConnected: boolean;
    isLoading: boolean;
    error: Error | null;
    lastMessage: DroneLocationMessage | null;
    messageCount: number;
}

/**
 * useDroneLocations - Hook para acceder al estado de ubicaciones de drones
 *
 * Este hook ahora es solo un consumidor del estado global de MQTT.
 * La conexión y handlers se manejan en MqttInitializer a nivel de app.
 */
export const useDroneLocations = (): UseDroneLocationsReturn => {
    const status = useMqttStore((state) => state.status);
    const error = useMqttStore((state) => state.error);
    const lastMessage = useMqttStore((state) => state.lastMessage);
    const messageCount = useMqttStore((state) => state.messageCount);

    return {
        isConnected: status === 'CONNECTED',
        isLoading: status === 'CONNECTING',
        error,
        lastMessage,
        messageCount,
    };
};
