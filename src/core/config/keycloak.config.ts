import Keycloak from 'keycloak-js';

// Configuración de Keycloak
const keycloak = new Keycloak({
    url: 'http://192.168.246.10',
    realm: 'umas',
    clientId: 'umas-web'
});

export default keycloak;
export const keycloakConfig = keycloak;