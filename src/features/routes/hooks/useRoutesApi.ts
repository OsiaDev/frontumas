import { useState, useEffect, useCallback } from 'react';
import { routesApiService } from '../services/routes.api.service';
import type { ApiError } from '@shared/types/api.types';
import type { Route } from '@/shared/types/route.types';

interface UseRoutesApiReturn {
    routes: Route[];
    loading: boolean;
    error: ApiError | null;
    refetch: () => Promise<void>;
}

export const useRoutesApi = (): UseRoutesApiReturn => {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    const fetchRoutes = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await routesApiService.getRoutes();
            setRoutes(data);
        } catch (err) {
            const apiError: ApiError = {
                message: err instanceof Error ? err.message : 'Error al cargar rutas',
                details: err,
            };
            setError(apiError);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    return {
        routes,
        loading,
        error,
        refetch: fetchRoutes,
    };
};
