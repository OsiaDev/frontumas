import type { User } from '@/features/auth/types/auth.types';
import keycloak from '@config/keycloak.config';

const USER_KEY = 'umas_user_data';

/**
 * Mapeo de roles de Keycloak a roles internos del sistema
 * Keycloak usa nombres en inglés, el sistema usa nombres en español
 */
const KEYCLOAK_TO_INTERNAL_ROLE: Record<string, string> = {
    'admin': 'admin',
    'operator': 'operador',
    'commander': 'comandante',
    'playback': 'playback',
};

/**
 * Convierte roles de Keycloak a roles internos del sistema
 * Si el rol no está en el mapeo, se mantiene tal cual (excepto default-roles-*)
 */
const mapKeycloakRoles = (keycloakRoles: string[]): string[] => {
    return keycloakRoles
        .filter(role => !role.startsWith('default-roles-'))
        .map(role => {
            const lowercaseRole = role.toLowerCase();
            return KEYCLOAK_TO_INTERNAL_ROLE[lowercaseRole] || role;
        })
        .filter(role => role !== undefined && role.trim() !== '');
};

class AuthService {
    private keycloakInstance = keycloak;
    private isInitialized = false;
    private initializationPromise: Promise<boolean> | null = null;
    private onLogoutCallback: (() => void) | null = null;

    // Verificar si Web Crypto API está disponible (necesario para PKCE)
    private isWebCryptoAvailable(): boolean {
        return !!(window.crypto && window.crypto.subtle);
    }

    // Establecer callback que se ejecutará cuando ocurra un logout automático
    setOnLogoutCallback(callback: () => void): void {
        this.onLogoutCallback = callback;
    }

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

                const initOptions: Keycloak.KeycloakInitOptions = {
                    onLoad: 'check-sso',
                    checkLoginIframe: false,
                };

                if (this.isWebCryptoAvailable()) {
                    initOptions.pkceMethod = 'S256';
                }

                const authenticated = await this.keycloakInstance.init(initOptions);

                this.isInitialized = true;
                console.log('[Keycloak] Inicializado. Autenticado:', authenticated);

                if (authenticated && this.keycloakInstance.token) {
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

    async login(): Promise<User> {
        try {
            // Verificar si Keycloak ya fue inicializado
            const keycloakAlreadyInitialized = this.isInitialized ||
                this.keycloakInstance.authenticated !== undefined;

            if (!keycloakAlreadyInitialized) {
                console.log('[Keycloak] Inicializando antes de login...');
                await this.initKeycloak();
            } else if (!this.isInitialized) {
                console.log('[Keycloak] Ya inicializado externamente');
                this.isInitialized = true;
            }

            // Verificar si Web Crypto API está disponible (necesario para PKCE)
            if (!this.isWebCryptoAvailable()) {
                console.error('[Keycloak] Web Crypto API no disponible.');
                throw new Error('Web Crypto API no disponible. Usa un navegador moderno o accede via HTTPS.');
            }

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
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes('Web Crypto API')) {
                throw new Error('Para usar Keycloak, accede via HTTPS o localhost.');
            }

            console.error('Error en login:', error);
            throw new Error('Error al iniciar sesión');
        }
    }

    async logout(): Promise<void> {
        try {
            if (this.tokenRefreshInterval) {
                clearInterval(this.tokenRefreshInterval);
                this.tokenRefreshInterval = null;
            }

            localStorage.removeItem(USER_KEY);

            if (this.onLogoutCallback) {
                this.onLogoutCallback();
            }

            if (this.keycloakInstance.authenticated) {
                await this.keycloakInstance.logout();
            }
        } catch (error) {
            console.error('Error en logout:', error);
        }
    }

    getStoredUser(): User | null {
        if (this.keycloakInstance.authenticated) {
            return this.getUserFromKeycloak();
        }

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
            const refreshed = await this.keycloakInstance.updateToken(30);
            if (refreshed) {
                console.log('[Keycloak] Token refrescado exitosamente');
                const user = this.getUserFromKeycloak();
                if (user) {
                    this.storeAuthData(user);
                }
            } else {
                console.log('[Keycloak] Token aún válido, no necesita refresh');
            }

            return refreshed;
        } catch (error) {
            console.error('[Keycloak] Error al actualizar token:', error);
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

        // Log completo del token para debug
        console.log('[Keycloak] Token completo:', tokenParsed);

        console.log(tokenParsed)
        // Extraer roles de realm_access
        const realmRoles = tokenParsed.realm_access?.roles || [];
        console.log('[Keycloak] Realm roles:', realmRoles);

        // Extraer roles de resource_access (roles de cliente)
        const resourceAccess = tokenParsed.resource_access || {};
        console.log('[Keycloak] Resource access:', resourceAccess);

        // Combinar todos los roles de todos los clientes
        const clientRoles: string[] = [];
        Object.keys(resourceAccess).forEach(clientId => {
            const roles = resourceAccess[clientId]?.roles || [];
            console.log(`[Keycloak] Roles del cliente '${clientId}':`, roles);
            clientRoles.push(...roles);
        });

        // Combinar realm roles y client roles
        const allRoles = [...realmRoles, ...clientRoles];
        console.log('[Keycloak] Todos los roles:', allRoles);
        console.log('[Keycloak] Roles mapeados:', mapKeycloakRoles(allRoles));

        return {
            id: tokenParsed.sub || '',
            username: tokenParsed.preferred_username || '',
            email: tokenParsed.email || '',
            roles: mapKeycloakRoles(allRoles),
            token: this.keycloakInstance.token || '',
        };
    }

    private storeAuthData(user: User): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    private tokenRefreshInterval: number | null = null;

    private setupTokenRefresh(): void {
    if (this.tokenRefreshInterval) {
        return;
    }

    this.keycloakInstance.onTokenExpired = () => {
        console.log('[Keycloak] Token expirado, intentando refrescar...');
        this.updateToken().then((refreshed) => {
            if (!refreshed) {
                console.log('[Keycloak] No se pudo refrescar el token, cerrando sesión...');
                this.logout();
            }
        });
    };

    this.tokenRefreshInterval = window.setInterval(async () => {
        try {
            console.log('[Keycloak] Verificando y refrescando token...');
            await this.updateToken();
            if (this.keycloakInstance.isTokenExpired()) {
                console.log('[Keycloak] Token expirado y no se pudo refrescar, cerrando sesión...');
                clearInterval(this.tokenRefreshInterval!);
                this.tokenRefreshInterval = null;
                await this.logout();
            }
        } catch (error) {
            console.error('[Keycloak] Error al refrescar token:', error);
            clearInterval(this.tokenRefreshInterval!);
            this.tokenRefreshInterval = null;
            await this.logout();
        }
    }, 60000);
}
}

export const authService = new AuthService();
