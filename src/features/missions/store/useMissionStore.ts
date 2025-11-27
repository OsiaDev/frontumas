import { create } from 'zustand';
import type { Mission, MissionMap } from '@shared/types/mission.types';

interface MissionStoreState {
    // Estado
    missions: MissionMap;
    isLoading: boolean;
    error: string | null;

    // Acciones
    setMissions: (missions: Mission[]) => void;
    addMission: (mission: Mission) => void;
    updateMission: (id: string, mission: Mission) => void;
    removeMission: (id: string) => void;
    getMission: (id: string) => Mission | undefined;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearMissions: () => void;
}

export const useMissionStore = create<MissionStoreState>((set, get) => ({
    // Estado inicial
    missions: {},
    isLoading: false,
    error: null,

    // Acciones
    setMissions: (missions: Mission[]) => {
        const missionsMap: MissionMap = {};
        missions.forEach(mission => {
            missionsMap[mission.id] = mission;
        });
        set({ missions: missionsMap, error: null });
    },

    addMission: (mission: Mission) => {
        set((state) => ({
            missions: {
                ...state.missions,
                [mission.id]: mission,
            },
            error: null,
        }));
    },

    updateMission: (id: string, mission: Mission) => {
        set((state) => ({
            missions: {
                ...state.missions,
                [id]: mission,
            },
            error: null,
        }));
    },

    removeMission: (id: string) => {
        set((state) => {
            const newMissions = { ...state.missions };
            delete newMissions[id];
            return { missions: newMissions, error: null };
        });
    },

    getMission: (id: string) => {
        return get().missions[id];
    },

    setLoading: (isLoading: boolean) => {
        set({ isLoading });
    },

    setError: (error: string | null) => {
        set({ error, isLoading: false });
    },

    clearMissions: () => {
        set({ missions: {}, error: null });
    },
}));
