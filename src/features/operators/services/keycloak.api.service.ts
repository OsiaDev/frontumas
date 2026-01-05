import { adConnectApiService } from './adconnect.api.service';
import type {
    CreateKeycloakUserDTO,
    KeycloakGroup,
    KeycloakRole,
    CreateRoleDTO,
    KeycloakUser,
    KeycloakUserResponse
} from '../types/ldap.types';

/**
 * Servicio para operaciones con Keycloak
 */
class KeycloakApiService {
    /**
     * Intenta obtener todos los usuarios de Keycloak
     * Nota: Este endpoint puede no estar disponible, es un intento
     */
    async getAllUsers(): Promise<KeycloakUser[]> {
        try {
            console.log('[KeycloakAPI] Intentando obtener todos los usuarios...');
            const response = await adConnectApiService.get<{
                message?: string;
                description?: string;
                body?: KeycloakUser[] | KeycloakUser;
            }>(`/adconnect/api/v1/users`);

            console.log('[KeycloakAPI] Respuesta recibida:', response);

            // Puede venir en body como array o como objeto
            if (Array.isArray(response.body)) {
                console.log('[KeycloakAPI] Usuarios obtenidos:', response.body.length);
                return response.body;
            } else if (response.body) {
                return [response.body];
            } else if (Array.isArray(response)) {
                console.log('[KeycloakAPI] Respuesta directa es array:', response.length);
                return response as unknown as KeycloakUser[];
            }

            console.log('[KeycloakAPI] No se encontraron usuarios en la respuesta');
            return [];
        } catch (error) {
            console.error('[KeycloakAPI] Error obteniendo todos los usuarios de Keycloak:', error);
            console.log('[KeycloakAPI] El endpoint /adconnect/api/v1/users no está disponible o no retorna lista');
            return [];
        }
    }

    /**
     * Obtiene un usuario de Keycloak por username o email
     */
    async getUserByInput(input: string): Promise<KeycloakUser | null> {
        try {
            const response = await adConnectApiService.get<{
                message: string;
                description: string;
                body: KeycloakUser;
            }>(`/adconnect/api/v1/users/user?input=${encodeURIComponent(input)}`);

            return response.body || null;
        } catch (error) {
            console.error('Error obteniendo usuario de Keycloak:', error);
            return null;
        }
    }

    /**
     * Busca un usuario en Keycloak por credentialNumber
     * Usa el mismo endpoint que getUserByInput ya que acepta username o email
     */
    async getUserByCredentialNumber(credentialNumber: string): Promise<KeycloakUserResponse | null> {
        try {
            console.log('[KeycloakAPI] Buscando usuario por credentialNumber:', credentialNumber);
            const response = await adConnectApiService.get<{
                message: string;
                description: string;
                body: KeycloakUserResponse;
            }>(`/adconnect/api/v1/users/user?input=${encodeURIComponent(credentialNumber)}`);

            console.log('[KeycloakAPI] Usuario encontrado:', response.body);
            return response.body || null;
        } catch (error) {
            console.error('[KeycloakAPI] Usuario no encontrado en Keycloak:', error);
            return null;
        }
    }

    /**
     * Crea un usuario en Keycloak
     */
    async createUser(userData: CreateKeycloakUserDTO): Promise<void> {
        try {
            await adConnectApiService.post(`/adconnect/api/v1/users/register`, userData);
        } catch (error) {
            console.error('Error creando usuario en Keycloak:', error);
            throw error;
        }
    }

    /**
     * Elimina un usuario de Keycloak
     */
    async deleteUser(username: string): Promise<void> {
        try {
            await adConnectApiService.delete(`/adconnect/api/v1/users/delete?username=${username}`);
        } catch (error) {
            console.error('Error eliminando usuario de Keycloak:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los grupos de Command & Control
     */
    async getAllGroups(): Promise<KeycloakGroup[]> {
        try {
            const response = await adConnectApiService.get<{ 
                description: string;
                message: string;
                body: KeycloakGroup[] 
            }>(
                `/adconnect/api/v1/command_and_control_groups/all`
            );
            const groups = response.body || [];
            
            // Extraer todos los subgrupos de los grupos principales
            const allSubGroups: KeycloakGroup[] = [];
            groups.forEach(parentGroup => {
                if (parentGroup.subGroups && parentGroup.subGroups.length > 0) {
                    allSubGroups.push(...parentGroup.subGroups);
                }
            });

            console.log('Subgrupos extraídos:', allSubGroups);
            return allSubGroups;
        } catch (error) {
            console.error('Error obteniendo grupos:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los roles
     */
    async getAllRoles(): Promise<KeycloakRole[]> {
        try {
            const response = await adConnectApiService.get<{ data: KeycloakRole[] }>(
                `/adconnect/api/v1/roles/getAll`
            );
            return response.data || [];
        } catch (error) {
            console.error('Error obteniendo roles:', error);
            throw error;
        }
    }

    /**
     * Crea un nuevo rol
     */
    async createRole(roleData: CreateRoleDTO): Promise<void> {
        try {
            await adConnectApiService.post(`/adconnect/api/v1/roles/create`, roleData);
        } catch (error) {
            console.error('Error creando rol:', error);
            throw error;
        }
    }

    /**
     * Elimina un rol
     */
    async deleteRole(roleId: string): Promise<void> {
        try {
            await adConnectApiService.delete(`/adconnect/api/v1/roles/delete?roleId=${roleId}`);
        } catch (error) {
            console.error('Error eliminando rol:', error);
            throw error;
        }
    }

    /**
     * Asigna un rol a un usuario
     */
    async assignRoleToUser(userId: string, roleName: string): Promise<void> {
        try {
            await adConnectApiService.post(
                `/adconnect/api/v1/roles/assignToUser?userId=${userId}&roleName=${roleName}`
            );
        } catch (error) {
            console.error('Error asignando rol a usuario:', error);
            throw error;
        }
    }

    /**
     * Asigna un rol a un grupo
     */
    async assignRoleToGroup(path: string, roleName: string): Promise<void> {
        try {
            await adConnectApiService.post(
                `/adconnect/api/v1/roles/assignToGroup?path=${path}&roleName=${roleName}`
            );
        } catch (error) {
            console.error('Error asignando rol a grupo:', error);
            throw error;
        }
    }
}

export const keycloakApiService = new KeycloakApiService();
