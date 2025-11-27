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
        UPLOAD: '/api/v1/routes/upload',
        GET_BY_ID: (id: string) => `/api/v1/routes/${id}`,
        GET_BY_NAME: (name: string) => `/api/v1/routes/by-name/${name}`,
        CREATE: '/api/v1/routes',
        UPDATE: (id: string) => `/api/v1/routes/${id}`,
        ACTIVATE: (id: string) => `/api/v1/routes/${id}/activate`,
        DEACTIVATE: (id: string) => `/api/v1/routes/${id}/deactivate`,
        DELETE: (id: string) => `/api/v1/routes/${id}`,
    },
    MISSIONS: {
        LIST: '/api/v1/missions',
        AUTHORIZED: '/api/v1/missions/authorized',
        UNAUTHORIZED: '/api/v1/missions/unauthorized',
        HEALTH: '/api/v1/missions/health',
        GET_BY_ID: (id: string) => `/api/v1/missions/${id}`,
        CREATE: '/api/v1/missions',
        APPROVE: (id: string) => `/api/v1/missions/approve/${id}`,
        EXECUTE: (id: string) => `/api/v1/missions/execute/${id}`,
        DELETE: (id: string) => `/api/v1/missions/${id}`,
    },
    OPERATORS: {
        LIST: '/api/v1/operators',
        GET_BY_ID: (id: string) => `/api/v1/operators/${id}`,
        CREATE: '/api/v1/operators',
        UPDATE: (id: string) => `/api/v1/operators/${id}`,
        DELETE: (id: string) => `/api/v1/operators/${id}`,
    },
} as const;