import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DroneLocationMessage } from '@shared/types/drone.types';

const MAX_HISTORY_SIZE = 30;

interface HistoriesMap {
    [vehicleId: string]: DroneLocationMessage[];
}

interface TrackingStoreState {
    // Estado
    selectedDroneId: string | null;
    histories: HistoriesMap;

    // Acciones
    selectDrone: (vehicleId: string | null) => void;
    getDroneHistory: (vehicleId: string) => DroneLocationMessage[];
    clearHistory: (vehicleId: string) => void;
    clearAllHistories: () => void;
    addLocationToHistory: (vehicleId: string, location: DroneLocationMessage) => void;
}

export const useTrackingStore = create<TrackingStoreState>()(
    persist(
        (set, get) => ({
            // Estado inicial
            selectedDroneId: null,
            histories: {},

            // Acciones
            selectDrone: (vehicleId: string | null) => {
                set({ selectedDroneId: vehicleId });
            },

            getDroneHistory: (vehicleId: string) => {
                return get().histories[vehicleId] || [];
            },

            clearHistory: (vehicleId: string) => {
                set((state) => {
                    const newHistories = { ...state.histories };
                    delete newHistories[vehicleId];
                    return { histories: newHistories };
                });
            },

            clearAllHistories: () => {
                set({ histories: {} });
            },

            addLocationToHistory: (vehicleId: string, location: DroneLocationMessage) => {
                set((state) => {
                    const currentHistory = state.histories[vehicleId] || [];
                    const lastPosition = currentHistory[currentHistory.length - 1];

                    const isDifferentPosition =
                        !lastPosition ||
                        lastPosition.latitude !== location.latitude ||
                        lastPosition.longitude !== location.longitude;

                    if (isDifferentPosition) {
                        let updatedHistory = [...currentHistory, location];

                        if (updatedHistory.length > MAX_HISTORY_SIZE) {
                            updatedHistory.shift();
                        }

                        return {
                            histories: {
                                ...state.histories,
                                [vehicleId]: updatedHistory,
                            },
                        };
                    }

                    return state;
                });
            },
        }),
        {
            name: 'tracking-storage',
            partialize: (state) => ({
                selectedDroneId: state.selectedDroneId,
                histories: state.histories,
            }),
        }
    )
);
