// Configuración del API REST

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

export const API_ROUTES = {
    DRONES: {
        LIST: '/v1/drones',
        GET_BY_ID: (id: string) => `/v1/drones/${id}`,
    },
} as const;