import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración global de TanStack Query
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Tiempo de espera antes de considerar los datos obsoletos (5 minutos)
            staleTime: 5 * 60 * 1000,

            // Tiempo de caché antes de eliminar los datos (10 minutos)
            gcTime: 10 * 60 * 1000,

            // Reintentos en caso de error
            retry: 2,

            // Reintento automático con backoff exponencial
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch automático al recuperar el foco de la ventana
            refetchOnWindowFocus: false,

            // Refetch automático al reconectar
            refetchOnReconnect: true,
        },
        mutations: {
            // Reintentos para mutaciones
            retry: 1,
        },
    },
});

/**
 * Query Keys constantes para mantener consistencia
 */
export const QUERY_KEYS = {
    DRONES: {
        ALL: ['drones'] as const,
        BY_ID: (id: string) => ['drones', id] as const,
        TELEMETRY: (id: string) => ['drones', id, 'telemetry'] as const,
    },
} as const;
