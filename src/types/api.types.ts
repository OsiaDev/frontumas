// Tipos para el API REST de drones

export type DroneStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE';

export interface DroneResponseDTO {
    id: string;
    vehicleId: string;
    model: string;
    description: string;
    serialNumber: string;
    status: DroneStatus;
    createdAt: string;
    updatedAt: string;
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