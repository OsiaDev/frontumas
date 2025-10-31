import { useEffect, useState } from 'react';
import { useDroneStore } from '@features/drones';
import { useMqttConnection } from './useMqttConnection';
import { mqttHandlers } from '../services/mqtt/mqtt.handlers';
import type { DroneLocationMessage } from '@shared/types/drone.types';

interface UseDroneLocationsReturn {
    isConnected: boolean;
    isLoading: boolean;
    error: Error | null;
    lastMessage: DroneLocationMessage | null;
    messageCount: number;
}

export const useDroneLocations = (): UseDroneLocationsReturn => {
    const updateDroneLocation = useDroneStore((state) => state.updateDroneLocation);
    const { status, error, connect } = useMqttConnection();
    const [lastMessage, setLastMessage] = useState<DroneLocationMessage | null>(null);
    const [messageCount, setMessageCount] = useState(0);

    // Conectar automáticamente al montar (solo una vez)
    useEffect(() => {
        connect().catch((err) => {
            console.error('Error al conectar MQTT:', err);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo ejecutar al montar el componente

    // Registrar callback para mensajes de ubicación
    useEffect(() => {
        const unsubscribe = mqttHandlers.onLocation((message) => {
            // Actualizar estado global de drones
            updateDroneLocation(message);

            // Actualizar estado local para feedback
            setLastMessage(message);
            setMessageCount(prev => prev + 1);
        });

        return () => {
            unsubscribe();
        };
    }, [updateDroneLocation]);

    return {
        isConnected: status === 'CONNECTED',
        isLoading: status === 'CONNECTING',
        error,
        lastMessage,
        messageCount,
    };
};
