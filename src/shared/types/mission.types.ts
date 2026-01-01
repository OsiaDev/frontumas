// Tipos para misiones

// Estados según el backend
export type MissionState =
    | 'PENDIENTE_APROBACION'
    | 'APROBADA'
    | 'EN_EJECUCION'
    | 'PAUSADA'
    | 'FINALIZADA'
    | 'ABORTADA'
    | 'FALLIDA'
    | 'ARCHIVADA';

export type MissionOrigin = 'MANUAL' | 'AUTOMATICA';

/**
 * Información de un dron asignado a una misión
 */
export interface DroneAssignment {
    assignmentId: string;
    droneId: string;
    droneName: string;
    vehicleId: string;
    model: string;
    description: string;
    serialNumber: string;
    droneStatus: string;
    flightHours: number;
    droneCreatedAt: string;
    droneUpdatedAt: string;
    routeId: string | null;
    hasRoute: boolean;
}

/**
 * Misión con múltiples drones asignados
 */
export interface Mission {
    id: string;
    name: string | null;
    operatorId: string;
    missionType: MissionOrigin;
    state: MissionState;
    estimatedDate: string;
    startDate: string | null;
    endDate: string | null;
    isAutomatic: boolean;
    assignedDrones: DroneAssignment[];
    createdAt: string;
    updatedAt: string;
    // Campos calculados desde el backend
    hasName: boolean;
    isScheduledForFuture: boolean;
    isManual: boolean;
    isPendingApproval: boolean;
    isInProgress: boolean;
    hasStarted: boolean;
    hasEnded: boolean;
    droneCount: number;
}

/**
 * Request para asignar un dron a una misión
 */
export interface DroneAssignmentRequest {
    droneId: string;
    routeId?: string | null;
    safeAltitude?: number;
    maxAltitude?: number;
}

/**
 * DTO para crear una misión
 */
export interface CreateMissionDTO {
    name?: string | null;
    operatorId: string;
    commanderName: string;
    estimatedDate: string;
    isAutomatic?: boolean;
    droneAssignments: DroneAssignmentRequest[];
}

export interface ApproveMissionDTO {
    commanderName: string;
}

export interface ExecuteMissionDTO {
    commanderName: string;
}

export interface UpdateMissionDTO {
    name?: string | null;
    operatorId?: string;
    commanderName?: string;
    estimatedDate?: string;
    isAutomatic?: boolean;
    droneAssignments?: DroneAssignmentRequest[];
}

export type MissionStatus = MissionState;

export type MissionMap = Record<string, Mission>;

// Información extendida para visualización
export interface MissionWithDetails extends Mission {
    operatorName?: string;
}

// Helper para obtener el primer dron (compatibilidad hacia atrás)
export function getFirstDrone(mission: Mission): DroneAssignment | null {
    return mission.assignedDrones.length > 0 ? mission.assignedDrones[0] : null;
}

// Helper para verificar si la misión tiene al menos un dron con ruta
export function hasAnyRoute(mission: Mission): boolean {
    return mission.assignedDrones.some(d => d.hasRoute);
}
