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

export interface Mission {
    id: string;
    name: string;
    droneId: string;
    routeId: string | null;
    operatorId: string;
    missionType: MissionOrigin;
    state: MissionState;
    startDate: string;
    createdAt: string;
    updatedAt: string;
    // Campos calculados desde el backend
    hasRoute: boolean;
    hasName: boolean;
    isScheduledForFuture: boolean;
    isManual: boolean;
    isPendingApproval: boolean;
}

export interface CreateMissionDTO {
    name: string;
    droneId: string;
    routeId: string | null;
    operatorId: string;
    commanderName: string;
    startDate: string;
}

export interface ApproveMissionDTO {
    commanderName: string;
}

export interface ExecuteMissionDTO {
    commanderName: string;
}

export interface UpdateMissionDTO {
    name?: string;
    droneId?: string;
    routeId?: string | null;
    operatorId?: string;
    startDate?: string;
}

export type MissionStatus = MissionState;

export type MissionMap = Record<string, Mission>;

// Información extendida para visualización
export interface MissionWithDetails extends Mission {
    droneName?: string;
    routeName?: string;
    operatorName?: string;
}
