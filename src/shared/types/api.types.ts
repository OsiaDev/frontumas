// Tipos para el API REST de drones

export type DroneStatus = 'ACTIVE' | 'IN_MAINTENANCE' | 'REPAIRING' | 'OUT_OF_SERVICE' | 'DECOMMISSIONED';

export interface DroneResponseDTO {
    id: string;
    name: string;
    vehicleId: string;
    model: string;
    description: string;
    serialNumber: string;
    status: DroneStatus;
    flightHours: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDroneDTO {
    name: string;
    vehicleId: string;
    model: string;
    description: string;
    serialNumber: string;
    flightHours: number;
}

export interface UpdateDroneDTO {
    name?: string;
    vehicleId?: string;
    model?: string;
    description?: string;
    serialNumber?: string;
}

export interface UpdateDroneStatusDTO {
    status: DroneStatus;
}

export interface DronesListResponse {
    drones: DroneResponseDTO[];
    total: number;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: unknown;
}

// Tipos para el API REST de operadores

export type OperatorStatus = 'ACTIVE' | 'INACTIVE' | 'ON_MISSION';

export interface OperatorResponseDTO {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    ugcsUserId?: string;
    status: OperatorStatus;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOperatorDTO {
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    ugcsUserId?: string;
}

export interface UpdateOperatorDTO {
    username?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    ugcsUserId?: string;
}