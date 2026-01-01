import { API_ROUTES } from '@config/api.config';
import type { Geofence, GeofenceType } from '@/shared/types/geofence.types';
import {apiService} from "@shared/services/api.service.ts";

class GeofencesApiService {

    async getGeofences(): Promise<Geofence[]> {
        try {
            return await apiService.get<Geofence[]>(API_ROUTES.GEOFENCES.LIST);
        } catch (error) {
            console.error('Error obteniendo geocercas:', error);
            throw error;
        }
    }

    async getGeofenceById(id: string): Promise<Geofence> {
        try {
            return await apiService.get<Geofence>(API_ROUTES.GEOFENCES.GET_BY_ID(id));
        } catch (error) {
            console.error(`Error obteniendo geocerca ${id}:`, error);
            throw error;
        }
    }

    async getGeofenceTypes(): Promise<GeofenceType[]> {
        try {
            return await apiService.get<GeofenceType[]>(API_ROUTES.GEOFENCE_TYPES.LIST);
        } catch (error) {
            console.error('Error obteniendo tipos de geocercas:', error);
            throw error;
        }
    }

    async uploadGeofence(
        file: File,
        name: string,
        geofenceTypeId: string
    ): Promise<Geofence> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const url = `${API_ROUTES.GEOFENCES.UPLOAD}?name=${encodeURIComponent(name)}&geofenceTypeId=${encodeURIComponent(geofenceTypeId)}`;
            return await apiService.uploadFile<Geofence>(url, formData);
        } catch (error) {
            console.error('Error subiendo geocerca:', error);
            throw error;
        }
    }

    async deleteGeofence(id: string): Promise<void> {
        try {
            await apiService.delete(API_ROUTES.GEOFENCES.GET_BY_ID(id));
        } catch (error) {
            console.error(`Error eliminando geocerca ${id}:`, error);
            throw error;
        }
    }

}

export const geofencesApiService = new GeofencesApiService();