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
    MISSIONS: '/missions',
    MISSIONS_NEW: '/missions/new',
    MISSIONS_EDIT: '/missions/edit/:id',
    MISSIONS_CONTROL: '/missions/:id/control',
    MISSIONS_PLAYBACK: '/missions/:id/playback',
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
