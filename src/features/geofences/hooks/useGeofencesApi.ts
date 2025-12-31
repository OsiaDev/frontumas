import { useState, useEffect, useCallback } from 'react';
import { geofencesApiService } from '@features/geofences/services/geofences.api.service';
import type { ApiError } from '@shared/types/api.types';
import type { Geofence, GeofenceType } from '@/shared/types/geofence.types';

interface UseGeofencesApiReturn {
    geofences: Geofence[];
    geofenceTypes: GeofenceType[];
    loading: boolean;
    error: ApiError | null;
    refetch: () => Promise<void>;
}

export const useGeofencesApi = (): UseGeofencesApiReturn => {
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [geofenceTypes, setGeofenceTypes] = useState<GeofenceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    const fetchGeofences = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await geofencesApiService.getGeofences();
            setGeofences(data);

            const dataTypes = await geofencesApiService.getGeofenceTypes();
            setGeofenceTypes(dataTypes);
        } catch (err) {
            const apiError: ApiError = {
                message: err instanceof Error ? err.message : 'Error al cargar geofences',
                details: err,
            };
            setError(apiError);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGeofences();
    }, [fetchGeofences]);

    return {
        geofences,
        geofenceTypes,
        loading,
        error,
        refetch: fetchGeofences,
    };
};
