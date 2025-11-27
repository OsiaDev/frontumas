// Tipos para operadores

export type OperatorStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Operator {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    ugcsUserId: string | null;
    status: OperatorStatus;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOperatorDTO {
    username: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    ugcsUserId?: string;
    status?: OperatorStatus;
    isAvailable?: boolean;
}

export interface UpdateOperatorDTO {
    username?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    ugcsUserId?: string;
    status?: OperatorStatus;
    isAvailable?: boolean;
}

export type OperatorMap = Record<string, Operator>;
