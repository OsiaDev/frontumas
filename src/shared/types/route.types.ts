export interface Route {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    originalFilename: string;
    kmlContent: string;
    geojson: string;
    geom: string;
    sizeBytes: number;
    createdAt: string;
    updatedAt: string;
}

export type RouteMap = Record<string, Route>;
