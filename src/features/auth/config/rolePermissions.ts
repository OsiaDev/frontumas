/**
 * Configuración de permisos por rol
 * Define qué módulos y rutas puede acceder cada rol
 */

export type UserRole = 'admin' | 'operator' | 'commander' | 'playback';

export interface RolePermissions {
    routes: string[];
    modules: {
        dashboard: boolean;
        drones: boolean;
        routes: boolean;
        geofences: boolean;
        missions: boolean;
        users: boolean;
        reports: boolean;
        analytics: boolean;
        settings: boolean;
    };
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
    admin: {
        routes: ['*'], // Acceso a todas las rutas
        modules: {
            dashboard: true,
            drones: true,
            routes: true,
            geofences: true,
            missions: true,
            users: true,
            reports: true,
            analytics: true,
            settings: true,
        },
    },
    operator: {
        routes: [
            '/dashboard',
            '/missions',
            '/missions/new',
            '/missions/edit/:id',
            '/missions/:id/control',
            '/missions/:id/playback',
            '/users'
        ],
        modules: {
            dashboard: true,
            drones: false,
            routes: false,
            geofences: false,
            missions: true,
            users: true,
            reports: false,
            analytics: false,
            settings: false,
        },
    },
    commander: {
        routes: [
            '/dashboard',
            '/missions',
            '/missions/new',
            '/missions/edit/:id',
            '/missions/:id/control',
            '/missions/:id/playback',
        ],
        modules: {
            dashboard: true,
            drones: false,
            routes: false,
            geofences: false,
            missions: true,
            users: false,
            reports: false,
            analytics: false,
            settings: false,
        },
    },
    playback: {
        routes: [
            '/dashboard',
        ],
        modules: {
            dashboard: true,
            drones: false,
            routes: false,
            geofences: false,
            missions: false,
            users: false,
            reports: false,
            analytics: false,
            settings: false,
        },
    },
};

export const hasRouteAccess = (userRoles: string[], routePath: string): boolean => {
    if (!userRoles || userRoles.length === 0) {
        return false;
    }

    if (userRoles.includes('admin')) {
        return true;
    }

    for (const role of userRoles as UserRole[]) {
        const permissions = ROLE_PERMISSIONS[role];
        if (!permissions) continue;

        if (permissions.routes.includes('*')) {
            return true;
        }

        const hasAccess = permissions.routes.some(allowedRoute => {
            if (allowedRoute === routePath) {
                return true;
            }

            const routeRegex = new RegExp(
                '^' + allowedRoute.replace(/:[^/]+/g, '[^/]+') + '$'
            );
            return routeRegex.test(routePath);
        });

        if (hasAccess) {
            return true;
        }
    }

    return false;
};

export const hasModuleAccess = (userRoles: string[], module: keyof RolePermissions['modules']): boolean => {
    if (!userRoles || userRoles.length === 0) {
        return false;
    }

    if (userRoles.includes('admin')) {
        return true;
    }

    for (const role of userRoles as UserRole[]) {
        const permissions = ROLE_PERMISSIONS[role];
        if (permissions?.modules[module]) {
            return true;
        }
    }

    return false;
};

export const getPrimaryRole = (userRoles: string[]): UserRole | null => {
    const rolePriority: UserRole[] = ['admin', 'commander', 'operator', 'playback'];

    for (const role of rolePriority) {
        if (userRoles.includes(role)) {
            return role;
        }
    }

    return null;
};
