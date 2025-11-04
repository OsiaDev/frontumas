export type MissionStatus =
    | 'PLANNED'
    | 'IN_PROGRESS'
    | 'PENDING_FINALIZATION'
    | 'COMPLETED_SUCCESSFULLY'
    | 'COMPLETED_WITH_INCIDENTS'
    | 'CANCELLED';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MissionIncident {
    id: string;
    description: string;
    severity: IncidentSeverity;
    timestamp: string;
}

export interface Mission {
    id: string;
    name: string;
    droneId: string;
    droneName: string;
    routeId: string;
    routeName: string;
    status: MissionStatus;
    startDate: string;
    endDate?: string;
    flightHours?: number; // Calculado automáticamente desde startDate y endDate
    operatorName: string;
    objectives: string;
    notes?: string;
    incidents?: MissionIncident[];
    createdAt: string;
    updatedAt: string;
}

export type MissionMap = Record<string, Mission>;

export interface FinalizeMissionData {
    missionId: string;
    completionType: 'SUCCESSFUL' | 'WITH_INCIDENTS';
    incidents?: MissionIncident[];
    notes?: string;
}
