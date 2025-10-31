import { create } from 'zustand';
import type { Geofence, GeofenceMap } from '@shared/types/geofence.types';

interface GeofenceStore {
    geofences: GeofenceMap;

    // Actions
    setGeofences: (geofences: Geofence[]) => void;
    addGeofence: (geofence: Geofence) => void;
    updateGeofence: (geofenceId: string, geofence: Partial<Geofence>) => void;
    removeGeofence: (geofenceId: string) => void;
    clearAllGeofences: () => void;

    // Selectors
    getGeofence: (geofenceId: string) => Geofence | undefined;
    getAllGeofences: () => Geofence[];
}

export const useGeofenceStore = create<GeofenceStore>((set, get) => ({
    geofences: {},

    // Actions
    setGeofences: (geofences: Geofence[]) => {
        const geofenceMap: GeofenceMap = {};
        geofences.forEach(geofence => {
            geofenceMap[geofence.id] = geofence;
        });
        set({ geofences: geofenceMap });
    },

    addGeofence: (geofence: Geofence) => {
        set((state) => ({
            geofences: {
                ...state.geofences,
                [geofence.id]: geofence,
            },
        }));
    },

    updateGeofence: (geofenceId: string, geofence: Partial<Geofence>) => {
        set((state) => {
            const existingGeofence = state.geofences[geofenceId];
            if (!existingGeofence) return state;

            return {
                geofences: {
                    ...state.geofences,
                    [geofenceId]: {
                        ...existingGeofence,
                        ...geofence,
                    },
                },
            };
        });
    },

    removeGeofence: (geofenceId: string) => {
        set((state) => {
            const newGeofences = { ...state.geofences };
            delete newGeofences[geofenceId];
            return { geofences: newGeofences };
        });
    },

    clearAllGeofences: () => {
        set({ geofences: {} });
    },

    // Selectors
    getGeofence: (geofenceId: string) => {
        return get().geofences[geofenceId];
    },

    getAllGeofences: () => {
        return Object.values(get().geofences);
    },
}));
