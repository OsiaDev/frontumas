import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DroneMap, DroneState, DroneLocationMessage } from '@shared/types/drone.types';
import { MQTT_TIMEOUTS } from '@config/mqtt.config';

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
                console.log('[DroneStore] Updating drone location:', message.vehicleId, 'battery:', message.batteryLevel);
                set((state) => {
                    const updatedDrone: DroneState = {
                        vehicleId: message.vehicleId,
                        lastLocation: message,
                        lastUpdate: new Date(),
                        isActive: true,
                        connectionStatus: 'CONNECTED',
                    };

                    const newState = {
                        drones: {
                            ...state.drones,
                            [message.vehicleId]: updatedDrone,
                        },
                    };

                    console.log('[DroneStore] New state:', newState.drones[message.vehicleId]);
                    return newState;
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
                    const timeSinceUpdate = now - new Date(drone.lastUpdate).getTime();
                    return timeSinceUpdate < MQTT_TIMEOUTS.INACTIVE_DRONE_TIMEOUT;
                });
            },

            getTotalDrones: () => {
                return Object.keys(get().drones).length;
            },
        }),
        {
            name: 'drone-storage',
            partialize: (state) => ({ drones: state.drones }),
        }
    )
);
