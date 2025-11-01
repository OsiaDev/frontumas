/**
 * Definición centralizada de rutas de la aplicación
 */

export const ROUTES = {
    // Rutas públicas
    LOGIN: '/login',

    // Rutas protegidas
    DASHBOARD: '/dashboard',
    DRONES: '/drones',
    GEOFENCES: '/geofences',
    ROUTES: '/routes',
    MISSION: '/mission',
    OPERATORS: '/operators',
    USERS: '/users',
    REPORTS: '/reports',
    ANALYTICS: '/analytics',
    SETTINGS: '/settings',

    // Rutas especiales
    ROOT: '/',
    WILDCARD: '*',
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKeys];
