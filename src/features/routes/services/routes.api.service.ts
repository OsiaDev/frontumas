import { API_ROUTES } from '@config/api.config';
import type { Route } from '@/shared/types/route.types';
import {apiService} from "@shared/services/api.service.ts";

class RoutesApiService {

    async getRoutes(): Promise<Route[]> {
        try {
            return await apiService.get<Route[]>(API_ROUTES.ROUTES.LIST);
        } catch (error) {
            console.error('Error obteniendo rutas:', error);
            throw error;
        }
    }

    async getRouteById(id: string): Promise<Route> {
        try {
            return await apiService.get<Route>(API_ROUTES.ROUTES.GET_BY_ID(id));
        } catch (error) {
            console.error(`Error obteniendo ruta ${id}:`, error);
            throw error;
        }
    }

    async getRouteByName(name: string): Promise<Route> {
        try {
            return await apiService.get<Route>(API_ROUTES.ROUTES.GET_BY_NAME(name));
        } catch (error) {
            console.error(`Error obteniendo ruta ${name}:`, error);
            throw error;
        }
    }

    async uploadRoute(file: File, name: string): Promise<Route> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const url = `${API_ROUTES.ROUTES.UPLOAD}?name=${encodeURIComponent(name)}`;
            return await apiService.uploadFile<Route>(url, formData);
        } catch (error) {
            console.error('Error subiendo ruta:', error);
            throw error;
        }
    }

    async activateRoute(id: string): Promise<Route> {
        try {
            return await apiService.patch<Route>(API_ROUTES.ROUTES.ACTIVATE(id));
        } catch (error) {
            console.error(`Error activando ruta ${id}:`, error);
            throw error;
        }
    }

    async deactivateRoute(id: string): Promise<Route> {
        try {
            return await apiService.patch<Route>(API_ROUTES.ROUTES.DEACTIVATE(id));
        } catch (error) {
            console.error(`Error desactivando ruta ${id}:`, error);
            throw error;
        }
    }

    async deleteRoute(id: string): Promise<void> {
        try {
            await apiService.delete(API_ROUTES.ROUTES.DELETE(id));
        } catch (error) {
            console.error(`Error eliminando ruta ${id}:`, error);
            throw error;
        }
    }

}

export const routesApiService = new RoutesApiService();
