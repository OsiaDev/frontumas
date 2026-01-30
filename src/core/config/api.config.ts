// Configuración del API REST

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

// Configuración de ADConnect (API Gateway)
export const ADCONNECT_CONFIG = {
    BASE_URL: import.meta.env.VITE_ADCONNECT_BASE_URL || 'http://192.168.246.10:8080',
} as const;

export const API_ROUTES = {
    DRONES: {
        LIST: '/v1/drones',
        GET_BY_ID: (id: string) => `/v1/drones/${id}`,
        CREATE: '/v1/drones',
        UPDATE: (id: string) => `/v1/drones/${id}`,
        UPDATE_STATUS: (id: string) => `/v1/drones/${id}/status`,
        DELETE: (id: string) => `/v1/drones/${id}`,
        STATUSES: '/v1/drones/statuses',
    },
    GEOFENCES: {
        LIST: '/v1/geofences',
        UPLOAD: '/v1/geofences/upload',
        GET_BY_ID: (id: string) => `/v1/geofences/${id}`,
    },
    GEOFENCE_TYPES: {
        LIST: '/v1/geofence-types',
        GET_BY_ID: (id: string) => `/v1/geofence-types/${id}`,
    },
    ROUTES: {
        LIST: '/v1/routes',
        UPLOAD: '/v1/routes/upload',
        GET_BY_ID: (id: string) => `/v1/routes/${id}`,
        GET_BY_NAME: (name: string) => `/v1/routes/by-name/${name}`,
        CREATE: '/v1/routes',
        UPDATE: (id: string) => `/v1/routes/${id}`,
        ACTIVATE: (id: string) => `/v1/routes/${id}/activate`,
        DEACTIVATE: (id: string) => `/v1/routes/${id}/deactivate`,
        DELETE: (id: string) => `/v1/routes/${id}`,
    },
    MISSIONS: {
        LIST: '/v1/missions',
        AUTHORIZED: '/v1/missions/authorized',
        UNAUTHORIZED: '/v1/missions/unauthorized',
        HEALTH: '/v1/missions/health',
        GET_BY_ID: (id: string) => `/v1/missions/${id}`,
        CREATE: '/v1/missions',
        APPROVE: (id: string) => `/v1/missions/approve/${id}`,
        EXECUTE: (id: string) => `/v1/missions/execute/${id}`,
        FINALIZE: (id: string) => `/v1/missions/${id}/finalize`,
        ANALYZE_VIDEO: '/v1/playback/analyze',
        DELETE: (id: string) => `/v1/missions/${id}`,
    },
    OPERATORS: {
        LIST: '/v1/operators',
        GET_BY_ID: (id: string) => `/v1/operators/${id}`,
        CREATE: '/v1/operators',
        UPDATE: (id: string) => `/v1/operators/${id}`,
        DELETE: (id: string) => `/v1/operators/${id}`,
    },
} as const;