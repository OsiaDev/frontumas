import type {
    OperatorResponseDTO,
    CreateOperatorDTO,
    UpdateOperatorDTO,
} from '@shared/types/api.types';
import { API_ROUTES } from '@config/api.config';
import {apiService} from "@shared/services/api.service.ts";

class OperatorsApiService {
    async getOperators(): Promise<OperatorResponseDTO[]> {
        try {
            return await apiService.get<OperatorResponseDTO[]>(API_ROUTES.OPERATORS.LIST);
        } catch (error) {
            console.error('Error obteniendo operadores:', error);
            throw error;
        }
    }

    async getOperatorById(id: string): Promise<OperatorResponseDTO> {
        try {
            return await apiService.get<OperatorResponseDTO>(API_ROUTES.OPERATORS.GET_BY_ID(id));
        } catch (error) {
            console.error(`Error obteniendo operador ${id}:`, error);
            throw error;
        }
    }

    async createOperator(data: CreateOperatorDTO): Promise<OperatorResponseDTO> {
        try {
            return await apiService.post<OperatorResponseDTO>(API_ROUTES.OPERATORS.CREATE, data);
        } catch (error) {
            console.error('Error creando operador:', error);
            throw error;
        }
    }

    async updateOperator(id: string, data: UpdateOperatorDTO): Promise<OperatorResponseDTO> {
        try {
            return await apiService.put<OperatorResponseDTO>(
                API_ROUTES.OPERATORS.UPDATE(id),
                data
            );
        } catch (error) {
            console.error(`Error actualizando operador ${id}:`, error);
            throw error;
        }
    }

    async deleteOperator(id: string): Promise<void> {
        try {
            await apiService.delete(API_ROUTES.OPERATORS.DELETE(id));
        } catch (error) {
            console.error(`Error eliminando operador ${id}:`, error);
            throw error;
        }
    }

}

export const operatorsApiService = new OperatorsApiService();
