import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/store/useAuthStore';
import { useUserRoles } from '@/features/auth/hooks/useUserRoles';
import { hasRouteAccess, getInitialRoute } from '@/features/auth/config/rolePermissions';
import { authService } from '@/features/auth/services/auth.service';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const logout = useAuthStore((state) => state.logout);
    const { roles } = useUserRoles();
    const location = useLocation();

    // Verificar si el estado de Keycloak coincide con el estado del store
    // Solo verificar una vez al montar, no en cada render
    const hasCheckedSyncRef = useRef(false);

    useEffect(() => {
        // Solo verificar una vez
        if (hasCheckedSyncRef.current) return;
        hasCheckedSyncRef.current = true;

        const authMode = authService.getAuthMode();

        // Solo verificar si usamos Keycloak Y el store dice que estamos autenticados
        if (authMode === 'keycloak' && isAuthenticated) {
            const keycloak = authService.getKeycloakInstance();

            // Si el store dice autenticado pero Keycloak dice lo contrario, limpiar estado
            if (!keycloak.authenticated || !keycloak.token) {
                console.log('[ProtectedRoute] Desincronización detectada: limpiando estado...');
                // Limpiar el estado del store para forzar re-login
                logout();
            }
        }
    }, [isAuthenticated, logout]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasPermission = allowedRoles.some(role => roles.includes(role));

        if (!hasPermission) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                    <div className="text-center max-w-md p-8">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Acceso Denegado
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            No tienes permisos para acceder a esta página.
                        </p>
                        <Navigate to="/dashboard" replace />
                    </div>
                </div>
            );
        }
    }

    if (!hasRouteAccess(roles, location.pathname)) {
        // Obtener la ruta inicial según el rol del usuario
        const initialRoute = getInitialRoute(roles);

        // Redirigir a la ruta inicial del rol
        console.log(`[ProtectedRoute] Usuario sin acceso a ${location.pathname}. Redirigiendo a ${initialRoute}...`);
        return <Navigate to={initialRoute} replace />;
    }

    return <>{children}</>;
};