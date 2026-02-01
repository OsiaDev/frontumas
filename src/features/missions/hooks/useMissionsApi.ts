import { useCallback } from 'react';
import { useMissionStore } from '@features/missions/store/useMissionStore';
import { missionsApiService } from '@features/missions/services/missions.api.service';
import type { CreateMissionDTO, ApproveMissionDTO, ExecuteMissionDTO, UpdateMissionDTO, MissionStatus } from '@shared/types/mission.types';

export const useMissionsApi = () => {
    const {
        setMissions,
        addMission,
        updateMission: updateMissionInStore,
        removeMission,
        setLoading,
        setError,
    } = useMissionStore();

    const fetchMissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const missions = await missionsApiService.getMissions();
            setMissions(missions);
            return missions;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener misiones';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [setMissions, setLoading, setError]);

    const fetchMissionById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const mission = await missionsApiService.getMissionById(id);
            updateMissionInStore(id, mission);
            return mission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener misión';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [updateMissionInStore, setLoading, setError]);

    const createMission = useCallback(async (data: CreateMissionDTO) => {
        setLoading(true);
        setError(null);
        try {
            const mission = await missionsApiService.createMission(data);
            addMission(mission);
            return mission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear misión';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [addMission, setLoading, setError]);

    const updateMission = useCallback(async (id: string, data: UpdateMissionDTO) => {
        setLoading(true);
        setError(null);
        try {
            const mission = await missionsApiService.updateMission(id, data);
            updateMissionInStore(id, mission);
            return mission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar misión';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [updateMissionInStore, setLoading, setError]);

    const updateMissionStatus = useCallback(async (id: string, status: MissionStatus) => {
        setLoading(true);
        setError(null);
        try {
            const mission = await missionsApiService.updateMissionStatus(id, status);
            updateMissionInStore(id, mission);
            return mission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar estado';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [updateMissionInStore, setLoading, setError]);

    const startMission = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const mission = await missionsApiService.startMission(id);
            updateMissionInStore(id, mission);
            return mission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al iniciar misión';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [updateMissionInStore, setLoading, setError]);

    const completeMission = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const mission = await missionsApiService.completeMission(id);
            updateMissionInStore(id, mission);
            return mission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al completar misión';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [updateMissionInStore, setLoading, setError]);

    const cancelMission = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const mission = await missionsApiService.cancelMission(id);
            updateMissionInStore(id, mission);
            return mission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al cancelar misión';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [updateMissionInStore, setLoading, setError]);

    const deleteMission = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await missionsApiService.deleteMission(id);
            removeMission(id);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al eliminar misión';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [removeMission, setLoading, setError]);

    const approveMission = useCallback(async (id: string, data: ApproveMissionDTO) => {
        setLoading(true);
        setError(null);
        try {
            const mission = await missionsApiService.approveMission(id, data);
            updateMissionInStore(id, mission);
            return mission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al aprobar misión';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [updateMissionInStore, setLoading, setError]);

    const executeMission = useCallback(async (id: string, data: ExecuteMissionDTO) => {
        setLoading(true);
        setError(null);
        try {
            const mission = await missionsApiService.executeMission(id, data);
            updateMissionInStore(id, mission);
            return mission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al ejecutar misión';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [updateMissionInStore, setLoading, setError]);

    const finalizeMission = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const mission = await missionsApiService.finalizeMission(id);
            updateMissionInStore(id, mission);
            return mission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al finalizar misión';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [updateMissionInStore, setLoading, setError]);

    const analyzeVideoWithAI = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await missionsApiService.analyzeVideoWithAI(id);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al analizar video con IA';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError]);

    return {
        fetchMissions,
        fetchMissionById,
        createMission,
        updateMission,
        updateMissionStatus,
        startMission,
        completeMission,
        cancelMission,
        deleteMission,
        approveMission,
        executeMission,
        finalizeMission,
        analyzeVideoWithAI,
    };
};
