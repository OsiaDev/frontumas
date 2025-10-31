export interface Geofence {
    id: string;
    name: string;
    status: string;
    geofenceTypeId: string;
    originalFilename: string;
    kmlContent: string;
    geojson: string;
    geom: string;
    sizeBytes: number;
    createdAt: string;
    updatedAt: string;
}

export interface GeofenceType {
    id: string;
    code: 'RESTRICTED' | 'SAFE_ZONE' | 'POI' | 'OTHER';
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export type GeofenceMap = Record<string, Geofence>;
