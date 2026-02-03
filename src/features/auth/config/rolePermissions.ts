/**
 * Configuración de permisos por rol
 * Define qué módulos y rutas puede acceder cada rol
 *
 * Matriz de Vistas por Rol:
 * -------------------------------------------------------------------------
 * Vista                    | Operador | Comandante | Administrador | Playback
 * -------------------------------------------------------------------------
 * Dashboard                |    Sí    |     Sí     |      No       |    No
 * Misiones - Ejecutar      |    Sí    |     No     |      Sí       |    No
 * Misiones - Aprobar       |    No    |     Sí     |      Sí       |    No
 * Misiones - Monitoreo     |    Sí    |     Sí     |      Sí       |    No
 * Misiones - Playback      |    No    |     No     |      No       |    Sí
 * Usuarios                 |    No    |     No     |      Sí       |    No
 * Rutas                    |    No    |     No     |      Sí       |    No
 * Drones                   |    No    |     No     |      Sí       |    No
 * Configuración            |    No    |     No     |      Sí       |    No
 * Geocercas                |    No    |     No     |      Sí       |    No
 * Reporte y Analítica      |    No    |     No     |   No (oculta) |    No
 * Monitoreo                |    No    |     Sí     |      No       |    No
 * -------------------------------------------------------------------------
 */

export type UserRole = 'admin' | 'operador' | 'comandante' | 'playback';

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
        monitoring: boolean;
    };
    // Permisos específicos dentro de misiones
    missionActions: {
        execute: boolean;      // Ejecutar misiones
        approve: boolean;      // Aprobar misiones
        monitor: boolean;      // Monitorear misiones en curso
        playback: boolean;     // Ver histórico/playback
        create: boolean;       // Crear misiones
        close: boolean;        // Cerrar misiones
    };
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
    // Administrador: Gestión completa del sistema (sin dashboard ni monitoreo)
    admin: {
        routes: [
            '/users',
            '/missions',
            '/missions/new',
            '/missions/edit/:id',
            '/missions/:id/control',
            '/routes',
            '/drones',
            '/settings',
            '/geofences',
            '/monitoring'
        ],
        modules: {
            dashboard: false,      // No tiene acceso al dashboard
            drones: true,
            routes: true,
            geofences: true,
            missions: true,
            users: true,
            reports: false,        // Oculta por ahora
            analytics: false,      // Oculta por ahora
            monitoring: true,     // No tiene acceso a monitoreo de video
            settings: true,
        },
        missionActions: {
            execute: true,
            approve: true,
            monitor: true,
            playback: false,
            create: true,
            close: true,
        },
    },

    // Operador: Ejecutar y monitorear misiones
    operador: {
        routes: [
            '/dashboard',
            '/missions',
            '/missions/:id/control',
        ],
        modules: {
            dashboard: true,
            drones: false,
            routes: false,
            geofences: false,
            missions: true,
            monitoring: false,     // No tiene vista de monitoreo separada
            users: false,
            reports: false,
            analytics: false,
            settings: false,
        },
        missionActions: {
            execute: true,         // Puede ejecutar misiones
            approve: false,        // No puede aprobar
            monitor: true,         // Puede monitorear (control de misión)
            playback: false,       // No tiene acceso a playback
            create: false,         // No puede crear misiones
            close: true,           // Puede cerrar misiones
        },
    },

    // Comandante: Aprobar misiones y monitorear
    comandante: {
        routes: [
            '/dashboard',
            '/missions',
            '/missions/:id/control',
            '/monitoring',
        ],
        modules: {
            dashboard: true,
            drones: false,
            routes: false,
            monitoring: true,      // Tiene acceso a vista de monitoreo
            geofences: false,
            missions: true,        // Solo aprobación y vista
            users: false,
            reports: false,
            analytics: false,
            settings: false,
        },
        missionActions: {
            execute: false,        // No puede ejecutar
            approve: true,         // Puede aprobar misiones
            monitor: true,         // Puede monitorear
            playback: false,       // No tiene acceso a playback
            create: false,         // No puede crear misiones
            close: false,          // No puede cerrar misiones
        },
    },

    // Playback: Solo visualización histórica
    playback: {
        routes: [
            '/missions',
            '/missions/:id/playback',
        ],
        modules: {
            dashboard: false,
            drones: false,
            routes: false,
            geofences: false,
            monitoring: false,
            missions: true,        // Acceso solo a playback de misiones
            users: false,
            reports: false,
            analytics: false,
            settings: false,
        },
        missionActions: {
            execute: false,
            approve: false,
            monitor: false,
            playback: true,        // Único rol con acceso a playback
            create: false,
            close: false,
        },
    },
};

export const hasRouteAccess = (userRoles: string[], routePath: string): boolean => {
    if (!userRoles || userRoles.length === 0) {
        return false;
    }

    // Verificar permisos de cada rol (incluyendo admin)
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

    // Verificar cada rol que tiene el usuario
    for (const role of userRoles as UserRole[]) {
        const permissions = ROLE_PERMISSIONS[role];
        if (permissions?.modules[module]) {
            return true;
        }
    }

    return false;
};

export const getPrimaryRole = (userRoles: string[]): UserRole | null => {
    const rolePriority: UserRole[] = ['admin', 'comandante', 'operador', 'playback'];

    for (const role of rolePriority) {
        if (userRoles.includes(role)) {
            return role;
        }
    }

    return null;
};

/**
 * Verifica si el usuario tiene acceso a una acción específica de misiones
 */
export const hasMissionActionAccess = (
    userRoles: string[],
    action: keyof RolePermissions['missionActions']
): boolean => {
    if (!userRoles || userRoles.length === 0) {
        return false;
    }

    for (const role of userRoles as UserRole[]) {
        const permissions = ROLE_PERMISSIONS[role];
        if (permissions?.missionActions[action]) {
            return true;
        }
    }

    return false;
};

/**
 * Obtiene la ruta inicial según el rol del usuario
 * Se usa para redirigir después del login o cuando se accede a rutas no permitidas
 */
export const getInitialRoute = (userRoles: string[]): string => {
    const primaryRole = getPrimaryRole(userRoles);

    if (!primaryRole) {
        return '/login';
    }

    const permissions = ROLE_PERMISSIONS[primaryRole];

    // Retornar la primera ruta permitida para el rol
    if (permissions.routes.length > 0) {
        return permissions.routes[0];
    }

    return '/login';
};
