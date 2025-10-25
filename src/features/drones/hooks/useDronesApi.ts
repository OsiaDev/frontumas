import { useState, useEffect, useCallback } from 'react';
import { dronesApiService } from '../services/drones.api.service';
import type { DroneResponseDTO, ApiError } from '@shared/types/api.types';

interface UseDronesApiReturn {
    drones: DroneResponseDTO[];
    loading: boolean;
    error: ApiError | null;
    refetch: () => Promise<void>;
}

export const useDronesApi = (): UseDronesApiReturn => {
    const [drones, setDrones] = useState<DroneResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    const fetchDrones = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await dronesApiService.getDrones();
            setDrones(data);
        } catch (err) {
            const apiError: ApiError = {
                message: err instanceof Error ? err.message : 'Error al cargar drones',
                details: err,
            };
            setError(apiError);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDrones();
    }, [fetchDrones]);

    return {
        drones,
        loading,
        error,
        refetch: fetchDrones,
    };
};
