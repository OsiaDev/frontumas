import { authService } from '@/features/auth/services/auth.service';

/**
 * Hook personalizado para obtener y validar roles del usuario
 */
export const useUserRoles = () => {
    const keycloak = authService.getKeycloakInstance();

    // Si no hay token válido, retornar roles vacíos
    if (!keycloak.tokenParsed || !keycloak.authenticated) {
        return {
            roles: [],
            hasRole: () => false,
            hasAnyRole: () => false,
            hasAllRoles: () => false,
            isAdmin: false,
            isOperator: false,
            isCommander: false,
            isPlayback: false,
            hasCommanderAccess: false,
            primaryRole: 'Usuario',
        };
    }

    // Obtener roles del cliente 'commander'
    const clientRoles = keycloak.tokenParsed.resource_access?.commander?.roles || [];

    // Funciones para verificar roles específicos
    const hasRole = (role: string) => clientRoles.includes(role);
    const hasAnyRole = (roles: string[]) => roles.some(role => clientRoles.includes(role));
    const hasAllRoles = (roles: string[]) => roles.every(role => clientRoles.includes(role));

    // Verificaciones específicas
    const isAdmin = hasRole('admin');
    const isOperator = hasRole('operator');
    const isCommander = hasRole('commander');
    const isPlayback = hasRole('playback');

    // Verificar si tiene acceso al perfil de comandante (cualquiera de los 3 roles)
    const hasCommanderAccess = hasAnyRole(['admin', 'operator', 'commander']);

    // Obtener el rol principal (el primero o el más importante)
    const getPrimaryRole = (): string => {
        if (isAdmin) return 'Administrador';
        if (isCommander) return 'Comandante';
        if (isOperator) return 'Operador';
        if (isPlayback) return 'Playback';
        return 'Usuario';
    };

    return {
        roles: clientRoles,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        isAdmin,
        isOperator,
        isCommander,
        isPlayback,
        hasCommanderAccess,
        primaryRole: getPrimaryRole(),
    };
};
