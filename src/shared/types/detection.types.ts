/**
 * Tipos para detecciones de video YOLO
 */

export interface VideoTrack {
    id: string;
    missionId: string;
    trackId: number;
    className: string;
    startFrame: number;
    endFrame: number;
    startTimeSeconds: number;
    endTimeSeconds: number;
    startTimestamp: string;
    endTimestamp: string;
    detections: number;
    durationSeconds: number;
    createdAt: string;
    updatedAt: string;
}

export interface VideoProcessing {
    id: string;
    missionId: string;
    status: 'processing' | 'completed' | 'failed';
    message: string;
    outputFolder: string;
    createdAt: string;
    updatedAt: string;
}
