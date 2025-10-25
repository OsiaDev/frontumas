import type { DroneResponseDTO, DronesListResponse, ApiError } from '@shared/types/api.types';
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
}

export const dronesApiService = new DronesApiService();