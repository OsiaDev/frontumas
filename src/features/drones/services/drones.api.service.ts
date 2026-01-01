import type {
    DroneResponseDTO,
    CreateDroneDTO,
    UpdateDroneDTO,
    DroneStatus,
} from '@shared/types/api.types';
import { API_ROUTES } from '@config/api.config';
import {apiService} from "@shared/services/api.service.ts";

class DronesApiService {

    async getDrones(): Promise<DroneResponseDTO[]> {
        try {
            return await apiService.get<DroneResponseDTO[]>(API_ROUTES.DRONES.LIST);
        } catch (error) {
            console.error('Error obteniendo drones:', error);
            throw error;
        }
    }

    async getDroneById(id: string): Promise<DroneResponseDTO> {
        try {
            return await apiService.get<DroneResponseDTO>(API_ROUTES.DRONES.GET_BY_ID(id));
        } catch (error) {
            console.error(`Error obteniendo drone ${id}:`, error);
            throw error;
        }
    }

    async createDrone(data: CreateDroneDTO): Promise<DroneResponseDTO> {
        try {
            return await apiService.post<DroneResponseDTO>(API_ROUTES.DRONES.CREATE, data);
        } catch (error) {
            console.error('Error creando drone:', error);
            throw error;
        }
    }

    async updateDrone(id: string, data: UpdateDroneDTO): Promise<DroneResponseDTO> {
        try {
            return await apiService.put<DroneResponseDTO>(
                API_ROUTES.DRONES.UPDATE(id),
                data
            );
        } catch (error) {
            console.error(`Error actualizando drone ${id}:`, error);
            throw error;
        }
    }

    async updateDroneStatus(id: string, status: DroneStatus): Promise<DroneResponseDTO> {
        try {
            return await apiService.patch<DroneResponseDTO>(
                API_ROUTES.DRONES.UPDATE_STATUS(id),
                { status }
            );
        } catch (error) {
            console.error(`Error actualizando estado del drone ${id}:`, error);
            throw error;
        }
    }

    async deleteDrone(id: string): Promise<void> {
        try {
            await apiService.delete(API_ROUTES.DRONES.DELETE(id));
        } catch (error) {
            console.error(`Error eliminando drone ${id}:`, error);
            throw error;
        }
    }

}

export const dronesApiService = new DronesApiService();