import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DroneMap, DroneLocationMessage } from '@shared/types/drone.types';
import type { DroneState } from '@shared/types/drone.types';
import { MQTT_TIMEOUTS } from '@config/mqtt.config';

// Re-exportar DroneState para uso en otros componentes
export type { DroneState };

interface DroneStoreState {
    // Estado
    drones: DroneMap;

    // Acciones
    updateDroneLocation: (message: DroneLocationMessage) => void;
    removeDrone: (vehicleId: string) => void;
    clearAllDrones: () => void;
    getDrone: (vehicleId: string) => DroneState | undefined;
    getActiveDrones: () => DroneState[];
    getTotalDrones: () => number;
}

export const useDroneStore = create<DroneStoreState>()(
    persist(
        (set, get) => ({
            // Estado inicial
            drones: {},

            // Acciones
            updateDroneLocation: (message: DroneLocationMessage) => {
                set((state) => {
                    const updatedDrone: DroneState = {
                        vehicleId: message.vehicleId,
                        lastLocation: message,
                        lastUpdate: new Date().toISOString(),
                        isActive: true,
                        connectionStatus: 'CONNECTED',
                    };

                    return {
                        drones: {
                            ...state.drones,
                            [message.vehicleId]: updatedDrone,
                        },
                    };
                });
            },

            removeDrone: (vehicleId: string) => {
                set((state) => {
                    const newDrones = { ...state.drones };
                    delete newDrones[vehicleId];
                    return { drones: newDrones };
                });
            },

            clearAllDrones: () => {
                set({ drones: {} });
            },

            getDrone: (vehicleId: string) => {
                return get().drones[vehicleId];
            },

            getActiveDrones: () => {
                const drones = get().drones;
                const now = Date.now();
                return Object.values(drones).filter((drone) => {
                    const lastUpdateTime = new Date(drone.lastUpdate).getTime();
                    const timeSinceUpdate = now - lastUpdateTime;
                    return timeSinceUpdate < MQTT_TIMEOUTS.INACTIVE_DRONE_TIMEOUT;
                });
            },

            getTotalDrones: () => {
                return Object.keys(get().drones).length;
            },
        }),
        {
            name: 'drone-storage-v2', // Changed from v1 to force migration from Date to string
            partialize: (state) => ({ drones: state.drones }),
        }
    )
);
