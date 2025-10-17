// Configuración de mapas y ciudades
export interface CityCoordinates {
    name: string;
    latitude: number;
    longitude: number;
    zoom: number;
}

// Ciudades principales de Colombia
export const CITIES: Record<string, CityCoordinates> = {
    BOGOTA: {
        name: 'Bogotá',
        latitude: 4.7110,
        longitude: -74.0721,
        zoom: 12,
    },
    MEDELLIN: {
        name: 'Medellín',
        latitude: 6.2442,
        longitude: -75.5812,
        zoom: 12,
    },
    CALI: {
        name: 'Cali',
        latitude: 3.4516,
        longitude: -76.5320,
        zoom: 12,
    },
    BARRANQUILLA: {
        name: 'Barranquilla',
        latitude: 10.9685,
        longitude: -74.7813,
        zoom: 12,
    },
    CARTAGENA: {
        name: 'Cartagena',
        latitude: 10.3910,
        longitude: -75.4794,
        zoom: 12,
    },
} as const;

// Ciudad por defecto (configurable)
export const DEFAULT_CITY: CityCoordinates = CITIES.BOGOTA;

// Configuración de OpenStreetMap tiles
export const MAP_TILE_CONFIG = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 3,
} as const;

// Configuración de zoom
export const MAP_ZOOM_CONFIG = {
    default: DEFAULT_CITY.zoom,
    min: 3,
    max: 19,
    maxNativeZoom: 19,
} as const;