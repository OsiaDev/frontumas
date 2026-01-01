import { API_ROUTES } from '@core/config/api.config';
import type { Mission, CreateMissionDTO, ApproveMissionDTO, ExecuteMissionDTO, UpdateMissionDTO, MissionStatus } from '@shared/types/mission.types';
import {apiService} from "@shared/services/api.service.ts";

class MissionsApiService {
    async getMissions(): Promise<Mission[]> {
        try {
            return await apiService.get<Mission[]>(API_ROUTES.MISSIONS.LIST);
        } catch (error) {
            console.error('Error obteniendo misiones:', error);
            throw error;
        }
    }

    async getMissionById(id: string): Promise<Mission> {
        try {
            return await apiService.get<Mission>(API_ROUTES.MISSIONS.GET_BY_ID(id));
        } catch (error) {
            console.error(`Error obteniendo misión ${id}:`, error);
            throw error;
        }
    }

    async createMission(data: CreateMissionDTO): Promise<Mission> {
        try {
            return await apiService.post<Mission>(API_ROUTES.MISSIONS.CREATE, data);
        } catch (error) {
            console.error('Error creando misión:', error);
            throw error;
        }
    }

    async getAuthorizedMissions(): Promise<Mission[]> {
        try {
            return await apiService.get<Mission[]>(API_ROUTES.MISSIONS.AUTHORIZED);
        } catch (error) {
            console.error('Error obteniendo misiones autorizadas:', error);
            throw error;
        }
    }

    async getUnauthorizedMissions(): Promise<Mission[]> {
        try {
            return await apiService.get<Mission[]>(API_ROUTES.MISSIONS.UNAUTHORIZED);
        } catch (error) {
            console.error('Error obteniendo misiones no autorizadas:', error);
            throw error;
        }
    }

    async approveMission(id: string, data: ApproveMissionDTO): Promise<Mission> {
        try {
            return await apiService.post<Mission>(API_ROUTES.MISSIONS.APPROVE(id), data);
        } catch (error) {
            console.error(`Error aprobando misión ${id}:`, error);
            throw error;
        }
    }

    async executeMission(id: string, data: ExecuteMissionDTO): Promise<Mission> {
        try {
            return await apiService.post<Mission>(API_ROUTES.MISSIONS.EXECUTE(id), data);
        } catch (error) {
            console.error(`Error ejecutando misión ${id}:`, error);
            throw error;
        }
    }

    async updateMission(id: string, data: UpdateMissionDTO): Promise<Mission> {
        try {
            return await apiService.put<Mission>(`v1/missions/${id}`, data);
        } catch (error) {
            console.error(`Error actualizando misión ${id}:`, error);
            throw error;
        }
    }

    async updateMissionStatus(id: string, status: MissionStatus): Promise<Mission> {
        try {
            return await apiService.patch<Mission>(`v1/missions/${id}/status`, { status });
        } catch (error) {
            console.error(`Error actualizando estado de misión ${id}:`, error);
            throw error;
        }
    }

    async deleteMission(id: string): Promise<void> {
        try {
            await apiService.delete(API_ROUTES.MISSIONS.DELETE(id));
        } catch (error) {
            console.error(`Error eliminando misión ${id}:`, error);
            throw error;
        }
    }

    async checkHealth(): Promise<{ status: string; message: string }> {
        try {
            return await apiService.get<{ status: string; message: string }>(
                API_ROUTES.MISSIONS.HEALTH
            );
        } catch (error) {
            console.error('Error verificando health de misiones:', error);
            throw error;
        }
    }

    async startMission(id: string): Promise<Mission> {
        try {
            return await apiService.post<Mission>(`v1/missions/${id}/start`);
        } catch (error) {
            console.error(`Error iniciando misión ${id}:`, error);
            throw error;
        }
    }

    async completeMission(id: string): Promise<Mission> {
        try {
            return await apiService.post<Mission>(`v1/missions/${id}/complete`);
        } catch (error) {
            console.error(`Error completando misión ${id}:`, error);
            throw error;
        }
    }

    async cancelMission(id: string): Promise<Mission> {
        try {
            return await apiService.post<Mission>(`v1/missions/${id}/cancel`);
        } catch (error) {
            console.error(`Error cancelando misión ${id}:`, error);
            throw error;
        }
    }

}

export const missionsApiService = new MissionsApiService();
