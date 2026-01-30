import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { authService } from '@features/auth/services/auth.service';
import { createApiError, logError } from '@shared/utils/handleError';
import { ERROR_MESSAGES } from '@shared/utils/constants';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                const token = authService.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Agregar headers X-User-Id y X-User-Roles requeridos por el backend
                const user = authService.getStoredUser();
                if (user) {
                    config.headers['X-User-Id'] = user.id;
                    config.headers['X-User-Roles'] = user.roles.join(',');
                }

                if (config.data instanceof FormData) {
                    delete config.headers['Content-Type'];
                }
                return config;
            },
            (error) => {
                logError(error, 'Request Interceptor');
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response) {
                    const { status } = error.response;

                    // Handle specific status codes
                    switch (status) {
                        case 401:
                            await authService.logout();
                            window.location.href = '/login';
                            throw createApiError(401, ERROR_MESSAGES.SESSION_EXPIRED);

                        case 403:
                            throw createApiError(403, ERROR_MESSAGES.UNAUTHORIZED);

                        case 500:
                            throw createApiError(500, ERROR_MESSAGES.GENERIC_ERROR);

                        default:
                            throw createApiError(status, error.message);
                    }
                }

                if (error.request) {
                    throw createApiError(0, ERROR_MESSAGES.NETWORK_ERROR);
                }

                throw error;
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.put<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.delete<T>(url, config);
        return response.data;
    }

    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.patch<T>(url, data, config);
        return response.data;
    }

    /**
     * Upload de archivos con FormData
     * Axios maneja automáticamente el Content-Type para multipart/form-data
     */
    async uploadFile<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.post<T>(url, formData, config);
        return response.data;
    }

}

export const apiService = new ApiService();