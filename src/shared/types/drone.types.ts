// Tipos para mensajes MQTT de drones

export interface DroneLocationMessage {
    vehicleId: string;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    heading: number;
    batteryLevel: number;
    satelliteCount: number;
    timestamp: string;
    additionalFields?: {
        missionId?: string;
        flightMode?: string;
        signalStrength?: number;
        temperature?: number;
        accuracy?: number;
    };
}

export interface DroneGeoEventMessage {
    vehicleId: string;
    geofenceId: string;
    geofenceName: string;
    eventType: 'ENTRY' | 'EXIT';
    timestamp: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export interface DroneAlertMessage {
    vehicleId: string;
    alertType: 'UNAUTHORIZED_FLIGHT' | 'LOW_BATTERY' | 'SIGNAL_LOST' | 'EMERGENCY';
    message: string;
    timestamp: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    metadata?: Record<string, unknown>;
}

// Estado de un dron en la aplicación
export interface DroneState {
    vehicleId: string;
    lastLocation: DroneLocationMessage;
    lastPositions: DroneLocationMessage[]; // Últimas 30 posiciones del dron
    lastUpdate: string; // ISO timestamp string for persistence compatibility
    isActive: boolean;
    connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'UNKNOWN';
}

// Mapa de drones indexado por vehicleId
export type DroneMap = Record<string, DroneState>;

// Topics MQTT disponibles
export enum MqttTopics {
    LOCATION = 'drone/+/location',
    GEO_EVENT = 'drone/+/geofence',
    ALERT = 'drone/+/alert',
}

// Configuración de suscripción a topics
export interface TopicSubscription {
    topic: MqttTopics;
    qos: 0 | 1 | 2;
    enabled: boolean;
}