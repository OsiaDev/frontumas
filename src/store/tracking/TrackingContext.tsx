import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { DroneLocationMessage } from '@/types/drone.types';
import { useDrones } from '@store/drone/DroneContext';

interface DroneTrackingHistory {
    vehicleId: string;
    positions: DroneLocationMessage[];
}

interface TrackingContextType {
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

interface TrackingProviderProps {
    children: ReactNode;
}

const MAX_HISTORY_SIZE = 30;

export const TrackingProvider = ({ children }: TrackingProviderProps) => {
    const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
    const [histories, setHistories] = useState<Map<string, DroneLocationMessage[]>>(new Map());
    const { drones } = useDrones();

    const selectDrone = useCallback((vehicleId: string | null) => {
        setSelectedDroneId(vehicleId);
    }, []);

    const getDroneHistory = useCallback((vehicleId: string): DroneLocationMessage[] => {
        return histories.get(vehicleId) || [];
    }, [histories]);

    const clearHistory = useCallback((vehicleId: string) => {
        setHistories(prev => {
            const newHistories = new Map(prev);
            newHistories.delete(vehicleId);
            return newHistories;
        });
    }, []);

    const clearAllHistories = useCallback(() => {
        setHistories(new Map());
    }, []);

    useEffect(() => {
        Object.values(drones).forEach(drone => {
            if (drone.isActive) {
                setHistories(prev => {
                    const newHistories = new Map(prev);
                    const currentHistory = newHistories.get(drone.vehicleId) || [];

                    const lastPosition = currentHistory[currentHistory.length - 1];
                    const isDifferentPosition = !lastPosition ||
                        lastPosition.latitude !== drone.lastLocation.latitude ||
                        lastPosition.longitude !== drone.lastLocation.longitude;

                    if (isDifferentPosition) {
                        const updatedHistory = [...currentHistory, drone.lastLocation];

                        if (updatedHistory.length > MAX_HISTORY_SIZE) {
                            updatedHistory.shift();
                        }

                        newHistories.set(drone.vehicleId, updatedHistory);
                    }

                    return newHistories;
                });
            }
        });
    }, [drones]);

    const value: TrackingContextType = {
        selectedDroneId,
        selectDrone,
        getDroneHistory,
        clearHistory,
        clearAllHistories,
    };

    return (
        <TrackingContext.Provider value={value}>
            {children}
        </TrackingContext.Provider>
    );
};