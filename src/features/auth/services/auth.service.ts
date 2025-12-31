import type { LoginCredentials, User } from '@/features/auth/types/auth.types';
import keycloak from '@config/keycloak.config';

const USER_KEY = 'umas_user_data';
const AUTH_MODE_KEY = 'umas_auth_mode';

export type AuthMode = 'keycloak' | 'traditional';

class AuthService {
    private keycloakInstance = keycloak;
    private isInitialized = false;
    private initializationPromise: Promise<boolean> | null = null;

    // Verificar si estamos en un contexto seguro (HTTPS o localhost)
    private isSecureContext(): boolean {
        return window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    // Obtener el modo de autenticación actual
    getAuthMode(): AuthMode {
        return (localStorage.getItem(AUTH_MODE_KEY) as AuthMode) || 'traditional';
    }

    // Establecer el modo de autenticación
    setAuthMode(mode: AuthMode): void {
        localStorage.setItem(AUTH_MODE_KEY, mode);
    }

    async initKeycloak(): Promise<boolean> {
        // Solo inicializar Keycloak si el modo es keycloak
        if (this.getAuthMode() !== 'keycloak') {
            return false;
        }

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

                // Solo usar PKCE si estamos en contexto seguro (HTTPS o localhost)
                const initOptions: Keycloak.KeycloakInitOptions = {
                    onLoad: 'check-sso',
                    checkLoginIframe: false, // Deshabilitar iframe check para evitar problemas de CORS
                };

                if (this.isSecureContext()) {
                    initOptions.pkceMethod = 'S256';
                }

                const authenticated = await this.keycloakInstance.init(initOptions);

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
        const authMode = this.getAuthMode();

        if (authMode === 'traditional') {
            // Login tradicional con admin/admin
            return this.loginTraditional(credentials);
        } else {
            // Login con Keycloak
            return this.loginKeycloak();
        }
    }

    private async loginTraditional(credentials?: LoginCredentials): Promise<User> {
        if (!credentials) {
            throw new Error('Credenciales requeridas');
        }

        // Validar credenciales (admin/admin)
        if (credentials.username === 'admin' && credentials.password === 'admin') {
            const user: User = {
                id: 'admin-001',
                username: 'admin',
                email: 'admin@umas.com',
                roles: ['admin', 'operador', 'comandante', 'playback'],
                token: 'mock-token-' + Date.now(),
            };

            this.storeAuthData(user);
            return user;
        }

        throw new Error('Credenciales inválidas');
    }

    private async loginKeycloak(): Promise<User> {
        try {
            // Verificar si Keycloak ya fue inicializado (internamente o por nosotros)
            // keycloak-js establece 'authenticated' (true/false) después de init()
            // Si es undefined, significa que nunca se inicializó
            const keycloakAlreadyInitialized = this.isInitialized ||
                this.keycloakInstance.authenticated !== undefined;

            if (!keycloakAlreadyInitialized) {
                console.log('[Keycloak] Inicializando antes de login...');
                await this.initKeycloakForLogin();
            } else if (!this.isInitialized) {
                // Marcar como inicializado si Keycloak ya lo estaba internamente
                console.log('[Keycloak] Ya inicializado externamente');
                this.isInitialized = true;
            }

            // Verificar si estamos en contexto seguro (HTTPS o localhost)
            // Si no, mostrar error explicativo porque PKCE requiere Web Crypto API
            if (!this.isSecureContext()) {
                console.warn('[Keycloak] No estamos en contexto seguro (HTTPS). Keycloak PKCE requiere Web Crypto API.');
                console.warn('[Keycloak] Opciones: 1) Usar HTTPS, 2) Acceder via localhost, 3) Deshabilitar PKCE en Keycloak Admin Console');

                // Intentar login sin PKCE usando redirect directo al endpoint de Keycloak
                const keycloakUrl = 'http://192.168.246.10';
                const realm = 'umas';
                const clientId = 'commander';
                const redirectUri = encodeURIComponent(window.location.origin + '/dashboard');

                // Construir URL de autorización sin PKCE
                const authUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?` +
                    `client_id=${clientId}&` +
                    `redirect_uri=${redirectUri}&` +
                    `response_type=code&` +
                    `scope=openid`;

                window.location.href = authUrl;

                // Esta promesa nunca se resolverá porque redirigimos
                return new Promise(() => {});
            }

            // Redirigir al login de Keycloak (contexto seguro - usa PKCE)
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

            // Si el error es por Web Crypto API, dar instrucciones claras
            if (errorMessage.includes('Web Crypto API')) {
                console.error('[Keycloak] Web Crypto API no disponible. Debes acceder via HTTPS o localhost.');
                throw new Error('Para usar Keycloak, accede via HTTPS o localhost. Alternativamente, deshabilita PKCE en la configuración del cliente Keycloak.');
            }

            console.error('Error en login:', error);
            throw new Error('Error al iniciar sesión');
        }
    }

    // Inicialización específica para login (sin verificar el modo)
    private async initKeycloakForLogin(): Promise<boolean> {
        // Verificar si ya está inicializado (por nosotros o internamente)
        if (this.isInitialized || this.keycloakInstance.authenticated !== undefined) {
            this.isInitialized = true;
            return this.keycloakInstance.authenticated || false;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = (async () => {
            try {
                console.log('[Keycloak] Iniciando para login...');

                // Solo usar PKCE si estamos en contexto seguro (HTTPS o localhost)
                const initOptions: Keycloak.KeycloakInitOptions = {
                    onLoad: 'check-sso',
                    checkLoginIframe: false,
                };

                if (this.isSecureContext()) {
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
                // Si el error es "ya inicializado", marcar como inicializado y continuar
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (errorMessage.includes('initialized once')) {
                    console.log('[Keycloak] Ya estaba inicializado, continuando...');
                    this.isInitialized = true;
                    return this.keycloakInstance.authenticated || false;
                }

                console.error('[Keycloak] Error al inicializar:', error);
                this.isInitialized = false;
                this.initializationPromise = null;
                return false;
            }
        })();

        return this.initializationPromise;
    }

    async logout(): Promise<void> {
        try {
            localStorage.removeItem(USER_KEY);

            const authMode = this.getAuthMode();

            if (authMode === 'keycloak' && this.keycloakInstance.authenticated) {
                // Logout de Keycloak
                await this.keycloakInstance.logout();
            }
            // Para traditional, solo limpiar localStorage (ya hecho arriba)
        } catch (error) {
            console.error('Error en logout:', error);
        }
    }

    getStoredUser(): User | null {
        const authMode = this.getAuthMode();

        if (authMode === 'keycloak') {
            // Si Keycloak está autenticado, obtener datos actuales
            if (this.keycloakInstance.authenticated) {
                return this.getUserFromKeycloak();
            }
        }

        // Intentar obtener de localStorage (para traditional o keycloak fallback)
        try {
            const userData = localStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    }

    getToken(): string | null {
        const authMode = this.getAuthMode();

        if (authMode === 'keycloak') {
            return this.keycloakInstance.token || null;
        } else {
            // Para traditional, obtener token del localStorage
            const user = this.getStoredUser();
            return user?.token || null;
        }
    }

    isAuthenticated(): boolean {
        const authMode = this.getAuthMode();

        if (authMode === 'keycloak') {
            return this.keycloakInstance.authenticated || false;
        } else {
            // Para traditional, verificar si hay usuario en localStorage
            return this.getStoredUser() !== null;
        }
    }

    async updateToken(): Promise<boolean> {
        const authMode = this.getAuthMode();

        if (authMode === 'keycloak') {
            try {
                // Refrescar token si está por expirar en los próximos 30 segundos
                const refreshed = await this.keycloakInstance.updateToken(30);
                return refreshed;
            } catch (error) {
                console.error('Error al actualizar token:', error);
                return false;
            }
        }

        // Para traditional, no hay refresh de token
        return true;
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
