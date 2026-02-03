import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/features/auth/types/auth.types';
import { authService } from '@/features/auth/services/auth.service';

interface AuthState {
    // Estado
    user: User | null;
    isLoading: boolean;
    error: string | null;

    // Acciones
    login: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    setLoading: (isLoading: boolean) => void;
    setUser: (user: User | null) => void;
    initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => {
            // Configurar el callback de logout automático
            authService.setOnLogoutCallback(() => {
                console.log('[AuthStore] Logout automático detectado desde authService');
                set({ user: null, error: null });
            });

            return {
                // Estado inicial - isLoading: true para esperar la inicialización de Keycloak
                user: null,
                isLoading: true,
                error: null,

                // Acciones
                login: async () => {
                    set({ isLoading: true, error: null });

                    try {
                        const userData = await authService.login();
                        set({ user: userData, isLoading: false });
                    } catch (err) {
                        const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
                        set({ error: message, isLoading: false });
                        throw err;
                    }
                },

                logout: async () => {
                    try {
                        await authService.logout();
                        set({ user: null, error: null });
                    } catch (err) {
                        console.error('Error al cerrar sesión:', err);
                    }
                },

                clearError: () => {
                    set({ error: null });
                },

                setLoading: (isLoading: boolean) => {
                    set({ isLoading });
                },

                setUser: (user: User | null) => {
                    set({ user });
                },

                initAuth: async () => {
                    try {
                        // Inicializar Keycloak
                        const authenticated = await authService.initKeycloak();

                        if (authenticated) {
                            const userData = authService.getStoredUser();
                            if (userData) {
                                console.log('[AuthStore] Usuario autenticado con Keycloak:', userData.username);
                                set({ user: userData, isLoading: false });
                                return;
                            }
                        }

                        console.log('[AuthStore] No hay usuario autenticado');
                        set({ isLoading: false });
                    } catch (err) {
                        console.error('Error al inicializar autenticación:', err);
                        set({ error: 'Error al inicializar autenticación', isLoading: false });
                    }
                },
            };
        },
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);

// Selector helper para isAuthenticated
export const selectIsAuthenticated = (state: AuthState) => !!state.user;
