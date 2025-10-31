import type { ApiError } from '@shared/types/api.types';
import { API_CONFIG, API_ROUTES } from '@config/api.config';
import type { Route } from '@/shared/types/route.types';

class RoutesApiService {
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

    async getRoutes(): Promise<Route[]> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.ROUTES.LIST}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<Route[]>(response);
        } catch (error) {
            console.error('Error obteniendo rutas:', error);
            throw error;
        }
    }

    async getRouteById(id: string): Promise<Route> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.ROUTES.GET_BY_ID(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<Route>(response);
        } catch (error) {
            console.error(`Error obteniendo ruta ${id}:`, error);
            throw error;
        }
    }

    async getRouteByName(name: string): Promise<Route> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.ROUTES.GET_BY_NAME(name)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<Route>(response);
        } catch (error) {
            console.error(`Error obteniendo ruta ${name}:`, error);
            throw error;
        }
    }

    async uploadRoute(file: File, name: string): Promise<Route> {

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const url = `${this.baseUrl}${API_ROUTES.ROUTES.UPLOAD}?name=${name}`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
                headers: undefined
            });

            clearTimeout(timeoutId);

            return this.handleResponse<Route>(response);
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Error subiendo ruta:', error);
            throw error;
        }
    }

    async activateRoute(id: string): Promise<Route> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.ROUTES.ACTIVATE(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'PATCH',
            });

            return this.handleResponse<Route>(response);
        } catch (error) {
            console.error(`Error activando ruta ${id}:`, error);
            throw error;
        }
    }

    async deactivateRoute(id: string): Promise<Route> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.ROUTES.DEACTIVATE(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'PATCH',
            });

            return this.handleResponse<Route>(response);
        } catch (error) {
            console.error(`Error desactivando ruta ${id}:`, error);
            throw error;
        }
    }

    async deleteRoute(id: string): Promise<void> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.ROUTES.DELETE(id)}`;
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
            console.error(`Error eliminando ruta ${id}:`, error);
            throw error;
        }
    }
}

export const routesApiService = new RoutesApiService();
