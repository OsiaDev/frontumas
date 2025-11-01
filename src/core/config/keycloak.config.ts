import Keycloak from 'keycloak-js';

// Configuración de Keycloak
const keycloak = new Keycloak({
    url: 'https://192.168.246.10',
    realm: 'umas',
    clientId: 'commander'
});

export default keycloak;