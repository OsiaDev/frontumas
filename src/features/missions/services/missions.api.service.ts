import type { ApiError } from '@shared/types/api.types';
import { API_CONFIG, API_ROUTES } from '@core/config/api.config';
import type { Mission, CreateMissionDTO, ApproveMissionDTO, ExecuteMissionDTO } from '@shared/types/mission.types';

class MissionsApiService {
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

    async getMissions(): Promise<Mission[]> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.MISSIONS.LIST}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<Mission[]>(response);
        } catch (error) {
            console.error('Error obteniendo misiones:', error);
            throw error;
        }
    }

    async getMissionById(id: string): Promise<Mission> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.MISSIONS.GET_BY_ID(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<Mission>(response);
        } catch (error) {
            console.error(`Error obteniendo misión ${id}:`, error);
            throw error;
        }
    }

    async createMission(data: CreateMissionDTO): Promise<Mission> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.MISSIONS.CREATE}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                body: JSON.stringify(data),
            });

            return this.handleResponse<Mission>(response);
        } catch (error) {
            console.error('Error creando misión:', error);
            throw error;
        }
    }

    /**
     * Obtener misiones autorizadas (manuales)
     */
    async getAuthorizedMissions(): Promise<Mission[]> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.MISSIONS.AUTHORIZED}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<Mission[]>(response);
        } catch (error) {
            console.error('Error obteniendo misiones autorizadas:', error);
            throw error;
        }
    }

    /**
     * Obtener misiones no autorizadas (automáticas)
     */
    async getUnauthorizedMissions(): Promise<Mission[]> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.MISSIONS.UNAUTHORIZED}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<Mission[]>(response);
        } catch (error) {
            console.error('Error obteniendo misiones no autorizadas:', error);
            throw error;
        }
    }

    /**
     * Aprobar misión
     */
    async approveMission(id: string, data: ApproveMissionDTO): Promise<Mission> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.MISSIONS.APPROVE(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                body: JSON.stringify(data),
            });

            return this.handleResponse<Mission>(response);
        } catch (error) {
            console.error(`Error aprobando misión ${id}:`, error);
            throw error;
        }
    }

    /**
     * Ejecutar misión
     */
    async executeMission(id: string, data: ExecuteMissionDTO): Promise<Mission> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.MISSIONS.EXECUTE(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                body: JSON.stringify(data),
            });

            return this.handleResponse<Mission>(response);
        } catch (error) {
            console.error(`Error ejecutando misión ${id}:`, error);
            throw error;
        }
    }

    /**
     * Verificar health del servicio
     */
    async checkHealth(): Promise<{ status: string; message: string }> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.MISSIONS.HEALTH}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<{ status: string; message: string }>(response);
        } catch (error) {
            console.error('Error verificando health de misiones:', error);
            throw error;
        }
    }

    async deleteMission(id: string): Promise<void> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.MISSIONS.DELETE(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'DELETE',
            });

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
        } catch (error) {
            console.error(`Error eliminando misión ${id}:`, error);
            throw error;
        }
    }
}

export const missionsApiService = new MissionsApiService();
