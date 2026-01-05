/**
 * Servicio para gestión de operadores/usuarios en la base de datos local
 * Consume los endpoints de umas-resource-service a través del gateway
 */

import { apiService } from '@/shared/services/api.service';
import type {
    Operator,
    CreateOperatorDTO,
    UpdateOperatorDTO,
} from '@/features/operators/types/ldap.types';

class OperatorsApiService {
    private readonly BASE_PATH = '/v1/operators';

    /**
     * Obtiene todos los operadores de la base de datos local
     */
    async getAllOperators(): Promise<Operator[]> {
        try {
            const response = await apiService.get<Operator[]>(this.BASE_PATH);
            console.log('[OperatorsAPI] Operadores obtenidos:', response);
            return response;
        } catch (error) {
            console.error('[OperatorsAPI] Error al obtener operadores:', error);
            throw error;
        }
    }

    /**
     * Obtiene un operador por su ID
     */
    async getOperatorById(id: string): Promise<Operator> {
        try {
            const response = await apiService.get<Operator>(`${this.BASE_PATH}/${id}`);
            return response;
        } catch (error) {
            console.error(`[OperatorsAPI] Error al obtener operador ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crea un nuevo operador en la base de datos local
     */
    async createOperator(data: CreateOperatorDTO): Promise<Operator> {
        try {
            const response = await apiService.post<Operator>(this.BASE_PATH, data);
            console.log('[OperatorsAPI] Operador creado exitosamente:', response);
            return response;
        } catch (error) {
            console.error('[OperatorsAPI] Error al crear operador:', error);
            throw error;
        }
    }

    /**
     * Actualiza un operador existente
     */
    async updateOperator(id: string, data: UpdateOperatorDTO): Promise<Operator> {
        try {
            const response = await apiService.put<Operator>(`${this.BASE_PATH}/${id}`, data);
            console.log('[OperatorsAPI] Operador actualizado exitosamente:', response);
            return response;
        } catch (error) {
            console.error(`[OperatorsAPI] Error al actualizar operador ${id}:`, error);
            throw error;
        }
    }

    /**
     * Elimina un operador por su ID
     */
    async deleteOperator(id: string): Promise<void> {
        try {
            await apiService.delete(`${this.BASE_PATH}/${id}`);
            console.log('[OperatorsAPI] Operador eliminado exitosamente');
        } catch (error) {
            console.error(`[OperatorsAPI] Error al eliminar operador ${id}:`, error);
            throw error;
        }
    }
}

export const operatorsApiService = new OperatorsApiService();
