import type { LoginCredentials, User } from '../types/auth.types';
import keycloak from '@config/keycloak.config';

const USER_KEY = 'umas_user_data';

class AuthService {
    private keycloakInstance = keycloak;
    private isInitialized = false;
    private initializationPromise: Promise<boolean> | null = null;

    async initKeycloak(): Promise<boolean> {
        // Si ya está inicializado, retornar el estado actual
        if (this.isInitialized) {
            return this.keycloakInstance.authenticated || false;
        }

        // Si ya hay una inicialización en curso, retornar esa promesa
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        // Inicializar Keycloak
        this.initializationPromise = (async () => {
            try {
                console.log('[Keycloak] Iniciando...');

                const authenticated = await this.keycloakInstance.init({
                    onLoad: 'check-sso',
                    checkLoginIframe: false, // Deshabilitar iframe check para evitar problemas de CORS
                    pkceMethod: 'S256',
                });

                this.isInitialized = true;
                console.log('[Keycloak] Inicializado. Autenticado:', authenticated);

                if (authenticated && this.keycloakInstance.token) {
                    // Actualizar el token automáticamente
                    this.setupTokenRefresh();
                }

                return authenticated;
            } catch (error) {
                console.error('[Keycloak] Error al inicializar:', error);
                this.isInitialized = false;
                this.initializationPromise = null;
                return false;
            }
        })();

        return this.initializationPromise;
    }

    async login(credentials?: LoginCredentials): Promise<User> {
        try {
            // Redirigir al login de Keycloak
            await this.keycloakInstance.login();

            // Después del login, obtener datos del usuario
            const user = this.getUserFromKeycloak();
            if (user) {
                this.storeAuthData(user);
                return user;
            }

            throw new Error('No se pudo obtener información del usuario');
        } catch (error) {
            console.error('Error en login:', error);
            throw new Error('Error al iniciar sesión');
        }
    }

    async logout(): Promise<void> {
        try {
            localStorage.removeItem(USER_KEY);
            // No pasar redirectUri para usar la configuración por defecto de Keycloak
            await this.keycloakInstance.logout();
        } catch (error) {
            console.error('Error en logout:', error);
        }
    }

    getStoredUser(): User | null {
        // Si Keycloak está autenticado, obtener datos actuales
        if (this.keycloakInstance.authenticated) {
            return this.getUserFromKeycloak();
        }

        // Si no, intentar obtener de localStorage
        try {
            const userData = localStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    }

    getToken(): string | null {
        return this.keycloakInstance.token || null;
    }

    isAuthenticated(): boolean {
        return this.keycloakInstance.authenticated || false;
    }

    async updateToken(): Promise<boolean> {
        try {
            // Refrescar token si está por expirar en los próximos 30 segundos
            const refreshed = await this.keycloakInstance.updateToken(30);
            return refreshed;
        } catch (error) {
            console.error('Error al actualizar token:', error);
            return false;
        }
    }

    getKeycloakInstance() {
        return this.keycloakInstance;
    }

    private getUserFromKeycloak(): User | null {
        if (!this.keycloakInstance.tokenParsed) {
            return null;
        }

        const tokenParsed = this.keycloakInstance.tokenParsed;

        return {
            id: tokenParsed.sub || '',
            username: tokenParsed.preferred_username || '',
            email: tokenParsed.email || '',
            roles: tokenParsed.realm_access?.roles || [],
            token: this.keycloakInstance.token || '',
        };
    }

    private storeAuthData(user: User): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    private tokenRefreshInterval: number | null = null;

    private setupTokenRefresh(): void {
        // Evitar múltiples intervalos
        if (this.tokenRefreshInterval) {
            return;
        }

        // Refrescar token cada 60 segundos
        this.tokenRefreshInterval = window.setInterval(async () => {
            try {
                await this.updateToken();
            } catch (error) {
                console.error('Error al refrescar token:', error);
            }
        }, 60000);
    }
}

export const authService = new AuthService();