/**
 * Tipos para integración con LDAP/Active Directory y Keycloak
 */

/**
 * Usuario encontrado en LDAP/Active Directory
 */

// En tu archivo ldap.types.ts o donde tengas definidos los tipos

export interface LDAPResponse {
    description: string;
    message: string;
    body: LDAPUser;
}

export interface LDAPResponseUser {
    description: string;
    message: string;
    body: KeycloakUserResponse;
}

export interface LDAPUser {
    grade: string;
    fullName: string;
    credentialType: string;
    credentialNumber: string;
    email: string;
    userName: string;
    company: string;
    department: string;
    jobTitle: string;
    jobStatus: string;
    firstName: string;
    commandAndControlUser: boolean;
}

/**
 * Datos para crear un usuario en Keycloak
 */
export interface CreateKeycloakUserDTO {
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    enable: boolean;
    groups?: Array<{ path: string }>;
    attributes?: {
        credentialNumber?: string[];
        department?: string[];
        grade?: string[];
        jobTitle?: string[];
    };
}

/**
 * Grupo de Keycloak
 */
export interface KeycloakGroup {
    id: string;
    groupName: string;
    subGroups?: KeycloakGroup[];
}

/**
 * Rol de Keycloak
 */
export interface KeycloakRole {
    id: string;
    name: string;
    description?: string;
}

/**
 * Datos para crear un rol
 */
export interface CreateRoleDTO {
    name: string;
    description: string;
}

/**
 * Path de grupo procesado para mostrar en UI
 */
export interface GroupPath {
    path: string;
    name: string;
    level: number;
}

/**
 * Estados de un operador/usuario en la base de datos local
 */
export enum OperatorStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

/**
 * Usuario/Operador almacenado en la base de datos local (umas-resource-service)
 */
export interface Operator {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    ugcsUserId: string | null;
    keycloakUserId: string | null; // credentialNumber de LDAP
    status: OperatorStatus;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * DTO para crear un operador en la base de datos local
 * Incluye TODOS los campos del LDAP según integration.pdf
 */
export interface CreateOperatorDTO {
    username: string;           // userName de LDAP
    fullName: string;          // fullName de LDAP
    email: string;             // email de LDAP
    phoneNumber?: string;      // credentialNumber de LDAP
    ugcsUserId?: string;       // Opcional
    keycloakUserId?: string;   // credentialNumber (ID de Keycloak)
    status?: OperatorStatus;
    isAvailable?: boolean;
}

/**
 * DTO para actualizar un operador
 */
export interface UpdateOperatorDTO {
    username: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    ugcsUserId?: string;
    keycloakUserId?: string;
    status?: OperatorStatus;
    isAvailable?: boolean;
}

/**
 * Usuario de Keycloak (respuesta del endpoint /adconnect/api/v1/users/user)
 */
export interface KeycloakUser {
    id: string;              // UUID de Keycloak
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
    emailVerified: boolean;
    attributes?: {
        credentialNumber?: string[];
        department?: string[];
        grade?: string[];
        jobTitle?: string[];
        company?: string[];
    };
}

export interface KeycloakUserResponse {
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
}

/**
 * Usuario combinado de Keycloak + DB Local
 * Para mostrar en la lista con indicador de dónde está
 */
export interface CombinedUser {
    // Datos básicos (de Keycloak o DB)
    username: string;
    fullName: string;
    email: string;

    // Fuente de datos
    inKeycloak: boolean;     // Existe en Keycloak
    inDatabase: boolean;     // Existe en DB local

    // Datos de Keycloak (si existe)
    keycloakId?: string;
    keycloakEnabled?: boolean;
    credentialNumber?: string;
    department?: string;
    grade?: string;
    jobTitle?: string;
    company?: string;

    // Datos de DB (si existe)
    databaseId?: string;
    status?: OperatorStatus;
    isAvailable?: boolean;
    phoneNumber?: string;
    createdAt?: string;
    updatedAt?: string;
}
