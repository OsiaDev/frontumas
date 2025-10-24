// Configuración de Keycloak para futura integración

interface KeycloakConfig {
    url: string;
    realm: string;
    clientId: string;
}

export const keycloakConfig: KeycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080/auth',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'umas',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'umas-frontend',
};

// Función para inicializar Keycloak (implementar cuando se integre)
export const initKeycloak = async () => {
    // TODO: Implementar inicialización de Keycloak
    console.log('Keycloak config:', keycloakConfig);
    return Promise.resolve();
};