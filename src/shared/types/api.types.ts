// Tipos para el API REST de drones

export type DroneStatus = 'ACTIVE' | 'IN_MAINTENANCE' | 'REPAIRING' | 'OUT_OF_SERVICE' | 'DECOMMISSIONED';

export interface DroneResponseDTO {
    id: string;
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
    vehicleId: string;
    model: string;
    description: string;
    serialNumber: string;
    flightHours: number;
}

export interface UpdateDroneDTO {
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