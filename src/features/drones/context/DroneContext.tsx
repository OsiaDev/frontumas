import { createContext, useContext } from 'react';
import type { DroneMap, DroneState, DroneLocationMessage } from '@shared/types/drone.types';

export interface DroneContextType {
    drones: DroneMap;
    updateDroneLocation: (message: DroneLocationMessage) => void;
    removeDrone: (vehicleId: string) => void;
    clearAllDrones: () => void;
    getDrone: (vehicleId: string) => DroneState | undefined;
    getActiveDrones: () => DroneState[];
    getTotalDrones: () => number;
}

const DroneContext = createContext<DroneContextType | undefined>(undefined);

export const useDrones = () => {
    const context = useContext(DroneContext);
    if (!context) {
        throw new Error('useDrones debe usarse dentro de DroneProvider');
    }
    return context;
};

export default DroneContext;
