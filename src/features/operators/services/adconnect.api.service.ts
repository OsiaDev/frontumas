import axios, { AxiosInstance } from 'axios';
import { authService } from '@features/auth/services/auth.service';
import { ADCONNECT_CONFIG } from '@/core/config/api.config';

/**
 * Servicio API específico para ADConnect
 * Usa una baseURL diferente al resto de la aplicación
 */
class ADConnectApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: ADCONNECT_CONFIG.BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor - Agregar token de autenticación
        this.api.interceptors.request.use(
            (config) => {
                const token = authService.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - Manejo de errores
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    authService.logout();
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string): Promise<T> {
        const response = await this.api.get<T>(url);
        return response.data;
    }

    async post<T>(url: string, data?: unknown): Promise<T> {
        const response = await this.api.post<T>(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response = await this.api.delete<T>(url);
        return response.data;
    }
}

export const adConnectApiService = new ADConnectApiService();
