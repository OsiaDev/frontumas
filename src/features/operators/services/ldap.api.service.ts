import { adConnectApiService } from './adconnect.api.service';
import type { LDAPResponse } from '../types/ldap.types';

/**
 * Servicio para operaciones LDAP/Active Directory
 */
class LDAPApiService {
    /**
     * Busca un usuario en LDAP por número de credencial
     */
    async findByCredentialNumber(credentialNumber: string): Promise<LDAPResponse> {
        try {
            const response = await adConnectApiService.get<LDAPResponse>(
                `/adconnect/api/v1/ad_users/findByCredentialNumber?value=${credentialNumber}`
            );
            return response;
        } catch (error) {
            console.error('Error buscando usuario en LDAP:', error);
            throw error;
        }
    }

    /**
     * Agrega un usuario al grupo Command & Control en AD
     */
    async joinCommandAndControlGroup(employeeId: string): Promise<void> {
        try {
            await adConnectApiService.get(
                `/adconnect/api/v1/ad_users/joinCommandAndControlGroup?value=${employeeId}`
            );
        } catch (error) {
            console.error('Error agregando usuario al grupo C2:', error);
            throw error;
        }
    }

    /**
     * Remueve un usuario del grupo Command & Control en AD
     */
    async leaveCommandAndControlGroup(employeeId: string): Promise<void> {
        try {
            await adConnectApiService.get(
                `/adconnect/api/v1/ad_users/disJoinCommandAndControlGroup?value=${employeeId}`
            );
        } catch (error) {
            console.error('Error removiendo usuario del grupo C2:', error);
            throw error;
        }
    }
}

export const ldapApiService = new LDAPApiService();
