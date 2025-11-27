import type {
    OperatorResponseDTO,
    ApiError,
    CreateOperatorDTO,
    UpdateOperatorDTO,
} from '@shared/types/api.types';
import { API_CONFIG, API_ROUTES } from '@config/api.config';

class OperatorsApiService {
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

    async getOperators(): Promise<OperatorResponseDTO[]> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.OPERATORS.LIST}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<OperatorResponseDTO[]>(response);
        } catch (error) {
            console.error('Error obteniendo operadores:', error);
            throw error;
        }
    }

    async getOperatorById(id: string): Promise<OperatorResponseDTO> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.OPERATORS.GET_BY_ID(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<OperatorResponseDTO>(response);
        } catch (error) {
            console.error(`Error obteniendo operador ${id}:`, error);
            throw error;
        }
    }

    async createOperator(data: CreateOperatorDTO): Promise<OperatorResponseDTO> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.OPERATORS.CREATE}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                body: JSON.stringify(data),
            });

            return this.handleResponse<OperatorResponseDTO>(response);
        } catch (error) {
            console.error('Error creando operador:', error);
            throw error;
        }
    }

    async updateOperator(id: string, data: UpdateOperatorDTO): Promise<OperatorResponseDTO> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.OPERATORS.UPDATE(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'PUT',
                body: JSON.stringify(data),
            });

            return this.handleResponse<OperatorResponseDTO>(response);
        } catch (error) {
            console.error(`Error actualizando operador ${id}:`, error);
            throw error;
        }
    }

    async deleteOperator(id: string): Promise<void> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.OPERATORS.DELETE(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error(`Error eliminando operador ${id}:`, error);
            throw error;
        }
    }
}

export const operatorsApiService = new OperatorsApiService();
