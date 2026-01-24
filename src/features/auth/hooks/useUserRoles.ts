import { authService } from '@/features/auth/services/auth.service';
import type { UserRole } from '@/features/auth/config/rolePermissions';

/**
 * Mapeo de roles de Keycloak a roles internos del sistema
 * Keycloak usa nombres en inglés, el sistema usa nombres en español
 */
const KEYCLOAK_TO_INTERNAL_ROLE: Record<string, UserRole> = {
    'admin': 'admin',
    'operator': 'operador',
    'commander': 'comandante',
    'playback': 'playback',
};

/**
 * Convierte roles de Keycloak a roles internos del sistema
 */
const mapKeycloakRoles = (keycloakRoles: string[]): UserRole[] => {
    return keycloakRoles
        .map(role => KEYCLOAK_TO_INTERNAL_ROLE[role])
        .filter((role): role is UserRole => role !== undefined);
};

/**
 * Hook personalizado para obtener y validar roles del usuario
 */
export const useUserRoles = () => {
    const keycloak = authService.getKeycloakInstance();

    // Si no hay token válido, retornar roles vacíos
    if (!keycloak.tokenParsed || !keycloak.authenticated) {
        return {
            roles: [] as UserRole[],
            hasRole: () => false,
            hasAnyRole: () => false,
            hasAllRoles: () => false,
            isAdmin: false,
            isOperador: false,
            isComandante: false,
            isPlayback: false,
            primaryRole: 'Usuario',
        };
    }

    // Obtener roles del cliente 'commander' y mapearlos a roles internos
    const keycloakRoles = keycloak.tokenParsed.resource_access?.commander?.roles || [];
    const internalRoles = mapKeycloakRoles(keycloakRoles);

    // Funciones para verificar roles específicos (usando roles internos)
    const hasRole = (role: UserRole) => internalRoles.includes(role);
    const hasAnyRole = (roles: UserRole[]) => roles.some(role => internalRoles.includes(role));
    const hasAllRoles = (roles: UserRole[]) => roles.every(role => internalRoles.includes(role));

    // Verificaciones específicas (usando roles internos en español)
    const isAdmin = hasRole('admin');
    const isOperador = hasRole('operador');
    const isComandante = hasRole('comandante');
    const isPlayback = hasRole('playback');

    // Obtener el rol principal (el primero o el más importante)
    const getPrimaryRole = (): string => {
        if (isAdmin) return 'Administrador';
        if (isComandante) return 'Comandante';
        if (isOperador) return 'Operador';
        if (isPlayback) return 'Playback';
        return 'Usuario';
    };

    return {
        roles: internalRoles,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        isAdmin,
        isOperador,
        isComandante,
        isPlayback,
        primaryRole: getPrimaryRole(),
    };
};
