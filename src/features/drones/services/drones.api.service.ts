import type {
    DroneResponseDTO,
    DronesListResponse,
    ApiError,
    CreateDroneDTO,
    UpdateDroneDTO,
    UpdateDroneStatusDTO,
    DroneStatus,
} from '@shared/types/api.types';
import { API_CONFIG, API_ROUTES } from '@config/api.config';

class DronesApiService {
    private baseUrl: string;
    private timeout: number;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: 'Error desconocido',
            }));

            const error: ApiError = {
                message: errorData.message || `HTTP ${response.status}`,
                code: response.status.toString(),
                details: errorData,
            };

            throw error;
        }

        return response.json();
    }

    async getDrones(): Promise<DroneResponseDTO[]> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.DRONES.LIST}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<DroneResponseDTO[]>(response);
        } catch (error) {
            console.error('Error obteniendo drones:', error);
            throw error;
        }
    }

    async getDroneById(id: string): Promise<DroneResponseDTO> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.DRONES.GET_BY_ID(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<DroneResponseDTO>(response);
        } catch (error) {
            console.error(`Error obteniendo dron ${id}:`, error);
            throw error;
        }
    }

    async createDrone(data: CreateDroneDTO): Promise<DroneResponseDTO> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.DRONES.CREATE}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                body: JSON.stringify(data),
            });

            return this.handleResponse<DroneResponseDTO>(response);
        } catch (error) {
            console.error('Error creando dron:', error);
            throw error;
        }
    }

    async updateDrone(id: string, data: UpdateDroneDTO): Promise<DroneResponseDTO> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.DRONES.UPDATE(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'PUT',
                body: JSON.stringify(data),
            });

            return this.handleResponse<DroneResponseDTO>(response);
        } catch (error) {
            console.error(`Error actualizando dron ${id}:`, error);
            throw error;
        }
    }

    async updateDroneStatus(id: string, status: DroneStatus): Promise<DroneResponseDTO> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.DRONES.UPDATE_STATUS(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });

            return this.handleResponse<DroneResponseDTO>(response);
        } catch (error) {
            console.error(`Error actualizando estado del dron ${id}:`, error);
            throw error;
        }
    }

    async deleteDrone(id: string): Promise<void> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.DRONES.DELETE(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error(`Error eliminando dron ${id}:`, error);
            throw error;
        }
    }

    async getDroneStatuses(): Promise<Array<{ code: string; description: string }>> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.DRONES.STATUSES}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<Array<{ code: string; description: string }>>(response);
        } catch (error) {
            console.error('Error obteniendo estados de drones:', error);
            throw error;
        }
    }
}

export const dronesApiService = new DronesApiService();