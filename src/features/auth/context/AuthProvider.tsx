import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType, LoginCredentials, User } from '@/features/auth/types/auth.types';
import { authService } from '@/features/auth/services/auth.service';
import AuthContext from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Inicializar Keycloak al cargar la app
        const initAuth = async () => {
            try {
                const authenticated = await authService.initKeycloak();

                if (authenticated) {
                    const userData = authService.getStoredUser();
                    if (userData) {
                        setUser(userData);
                    }
                }
            } catch (err) {
                console.error('Error al inicializar autenticación:', err);
                setError('Error al inicializar autenticación');
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);

        try {
            const userData = await authService.login(credentials);
            setUser(userData);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
        }
    };

    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
