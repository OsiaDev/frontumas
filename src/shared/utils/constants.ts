// Constantes globales de la aplicación

export const APP_NAME = 'UMAS';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'umas_auth_token',
    USER_DATA: 'umas_user_data',
    THEME: 'umas_theme',
    SIDEBAR_STATE: 'umas_sidebar_state',
} as const;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
    },
    USERS: {
        LIST: '/users',
        GET: (id: string) => `/users/${id}`,
        CREATE: '/users',
        UPDATE: (id: string) => `/users/${id}`,
        DELETE: (id: string) => `/users/${id}`,
    },
} as const;

export const ROUTES = {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    USERS: '/users',
    REPORTS: '/reports',
    ANALYTICS: '/analytics',
    SETTINGS: '/settings',
} as const;

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Por favor verifica tu internet.',
    UNAUTHORIZED: 'No tienes autorización para realizar esta acción.',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
    GENERIC_ERROR: 'Ha ocurrido un error. Por favor intenta nuevamente.',
} as const;