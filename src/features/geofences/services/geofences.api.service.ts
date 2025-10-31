import type { ApiError } from '@shared/types/api.types';
import { API_CONFIG, API_ROUTES } from '@config/api.config';
import type { Geofence, GeofenceType } from '@/shared/types/geofence.types';

class GeofencesApiService {
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

    async getGeofences(): Promise<Geofence[]> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.GEOFENCES.LIST}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<Geofence[]>(response);
        } catch (error) {
            console.error('Error obteniendo geofences:', error);
            throw error;
        }
    }

    async getGeofenceTypes(): Promise<GeofenceType[]> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.GEOFENCE_TYPES.LIST}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<GeofenceType[]>(response);
        } catch (error) {
            console.error('Error obteniendo geofences:', error);
            throw error;
        }
    }

    async getGeofenceById(id: string): Promise<Geofence> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.GEOFENCES.GET_BY_ID(id)}`;
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
            });

            return this.handleResponse<Geofence>(response);
        } catch (error) {
            console.error(`Error obteniendo dron ${id}:`, error);
            throw error;
        }
    }

    async uploadGeofence(file: File, name: string, geofenceTypeId: string): Promise<Geofence> {

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const url = `${this.baseUrl}${API_ROUTES.GEOFENCES.UPLOAD}?name=${name}&geofenceTypeId=${geofenceTypeId}`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
                headers: undefined
            });

            clearTimeout(timeoutId);

            return this.handleResponse<Geofence>(response);
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Error subiendo geocerca:', error);
            throw error;
        }
    }

    async deleteGeofence(id: string): Promise<void> {
        try {
            const url = `${this.baseUrl}${API_ROUTES.GEOFENCES.GET_BY_ID(id)}`;
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
            console.error(`Error eliminando geocerca ${id}:`, error);
            throw error;
        }
    }
}

export const geofencesApiService = new GeofencesApiService();