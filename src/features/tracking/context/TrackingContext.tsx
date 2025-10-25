import { createContext, useContext } from 'react';
import type { DroneLocationMessage } from '@shared/types/drone.types';

export interface TrackingContextType {
    selectedDroneId: string | null;
    selectDrone: (vehicleId: string | null) => void;
    getDroneHistory: (vehicleId: string) => DroneLocationMessage[];
    clearHistory: (vehicleId: string) => void;
    clearAllHistories: () => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const useTracking = () => {
    const context = useContext(TrackingContext);
    if (!context) {
        throw new Error('useTracking debe usarse dentro de TrackingProvider');
    }
    return context;
};

export default TrackingContext;
