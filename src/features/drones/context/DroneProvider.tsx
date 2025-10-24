import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DroneMap, DroneState, DroneLocationMessage } from '@shared/types/drone.types';
import { MQTT_TIMEOUTS } from '@config/mqtt.config';
import DroneContext, { type DroneContextType } from './DroneContext';

interface DroneProviderProps {
    children: ReactNode;
}

export const DroneProvider = ({ children }: DroneProviderProps) => {
    const [drones, setDrones] = useState<DroneMap>({});

    // Actualizar ubicación de un dron
    const updateDroneLocation = useCallback((message: DroneLocationMessage) => {
        setDrones(prev => {
            const existingDrone = prev[message.vehicleId];

            // Crear o actualizar el estado del dron
            const updatedDrone: DroneState = {
                vehicleId: message.vehicleId,
                lastLocation: message,
                lastUpdate: new Date(),
                isActive: true,
                connectionStatus: 'CONNECTED',
            };

            return {
                ...prev,
                [message.vehicleId]: updatedDrone,
            };
        });
    }, []);

    // Remover un dron específico
    const removeDrone = useCallback((vehicleId: string) => {
        setDrones(prev => {
            const newDrones = { ...prev };
            delete newDrones[vehicleId];
            return newDrones;
        });
    }, []);

    // Limpiar todos los drones
    const clearAllDrones = useCallback(() => {
        setDrones({});
    }, []);

    // Obtener un dron específico
    const getDrone = useCallback((vehicleId: string): DroneState | undefined => {
        return drones[vehicleId];
    }, [drones]);

    // Obtener drones activos
    const getActiveDrones = useCallback((): DroneState[] => {
        const now = Date.now();
        return Object.values(drones).filter(drone => {
            const timeSinceUpdate = now - drone.lastUpdate.getTime();
            return timeSinceUpdate < MQTT_TIMEOUTS.INACTIVE_DRONE_TIMEOUT;
        });
    }, [drones]);

    // Obtener total de drones
    const getTotalDrones = useCallback((): number => {
        return Object.keys(drones).length;
    }, [drones]);

    const value: DroneContextType = {
        drones,
        updateDroneLocation,
        removeDrone,
        clearAllDrones,
        getDrone,
        getActiveDrones,
        getTotalDrones,
    };

    return <DroneContext.Provider value={value}>{children}</DroneContext.Provider>;
};
