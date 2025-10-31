// Configuración del API REST

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

export const API_ROUTES = {
    DRONES: {
        LIST: '/api/v1/drones',
        GET_BY_ID: (id: string) => `/api/v1/drones/${id}`,
        CREATE: '/api/v1/drones',
        UPDATE: (id: string) => `/api/v1/drones/${id}`,
        UPDATE_STATUS: (id: string) => `/api/v1/drones/${id}/status`,
        DELETE: (id: string) => `/api/v1/drones/${id}`,
        STATUSES: '/api/v1/drones/statuses',
    },
    GEOFENCES: {
        LIST: '/api/v1/geofences',
        UPLOAD: '/api/v1/geofences/upload',
        GET_BY_ID: (id: string) => `/api/v1/geofences/${id}`,
    },
    GEOFENCE_TYPES: {
        LIST: '/api/v1/geofence-types',
        GET_BY_ID: (id: string) => `/api/v1/geofence-types/${id}`,
    },
    ROUTES: {
        LIST: '/api/v1/routes',
        GET_BY_ID: (id: string) => `/api/v1/routes/${id}`,
    },
} as const;