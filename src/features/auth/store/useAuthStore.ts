import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthState {
    // Estado
    user: User | null;
    isLoading: boolean;
    error: string | null;

    // Acciones
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    setLoading: (isLoading: boolean) => void;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Estado inicial
            user: null,
            isLoading: false,
            error: null,

            // Acciones
            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true, error: null });

                try {
                    const userData = await authService.login(credentials);
                    set({ user: userData, isLoading: false });
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
                    set({ error: message, isLoading: false });
                    throw err;
                }
            },

            logout: () => {
                authService.logout();
                set({ user: null, error: null });
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
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);

// Selector helper para isAuthenticated
export const selectIsAuthenticated = (state: AuthState) => !!state.user;
