import type { DroneLocationMessage, DroneGeoEventMessage, DroneAlertMessage } from '@shared/types/drone.types';

// Tipo para callback de ubicación
export type LocationCallback = (message: DroneLocationMessage) => void;
export type GeoEventCallback = (message: DroneGeoEventMessage) => void;
export type AlertCallback = (message: DroneAlertMessage) => void;

class MqttHandlers {
    private locationCallbacks: Set<LocationCallback> = new Set();
    private geoEventCallbacks: Set<GeoEventCallback> = new Set();
    private alertCallbacks: Set<AlertCallback> = new Set();

    // Procesar mensaje recibido según el topic
    handleMessage(topic: string, payload: Buffer): void {
        try {
            const message = this.parsePayload(payload);

            if (!message) {
                this.logError('Payload inválido o vacío');
                return;
            }

            // Determinar el tipo de mensaje según el topic
            if (topic.includes('/location')) {
                this.handleLocationMessage(message);
            } else if (topic.includes('/geoevent')) {
                this.handleGeoEventMessage(message);
            } else if (topic.includes('/alert')) {
                this.handleAlertMessage(message);
            } else {
                this.logError('Topic desconocido:', topic);
            }

        } catch (error) {
            this.logError('Error al procesar mensaje:', error);
        }
    }

    // Procesar mensaje de ubicación
    private handleLocationMessage(data: unknown): void {
        if (!this.isValidLocationMessage(data)) {
            this.logError('Mensaje de ubicación inválido:', data);
            return;
        }

        // this.log('Ubicación recibida:', data.vehicleId);
        this.notifyLocationCallbacks(data);
    }

    // Procesar mensaje de geo-evento
    private handleGeoEventMessage(data: unknown): void {
        if (!this.isValidGeoEventMessage(data)) {
            this.logError('Mensaje de geo-evento inválido:', data);
            return;
        }

        // this.log('Geo-evento recibido:', data.vehicleId, data.eventType);
        this.notifyGeoEventCallbacks(data);
    }

    // Procesar mensaje de alerta
    private handleAlertMessage(data: unknown): void {
        if (!this.isValidAlertMessage(data)) {
            this.logError('Mensaje de alerta inválido:', data);
            return;
        }

        // this.log('Alerta recibida:', data.vehicleId, data.alertType);
        this.notifyAlertCallbacks(data);
    }

    // Parsear payload del mensaje
    private parsePayload(payload: Buffer): unknown {
        try {
            const text = payload.toString('utf-8');
            return JSON.parse(text);
        } catch (error) {
            this.logError('Error al parsear JSON:', error);
            return null;
        }
    }

    // Validar mensaje de ubicación
    private isValidLocationMessage(data: unknown): data is DroneLocationMessage {
        if (typeof data !== 'object' || data === null) return false;

        const msg = data as Record<string, unknown>;

        return (
            typeof msg.vehicleId === 'string' &&
            typeof msg.latitude === 'number' &&
            typeof msg.longitude === 'number' &&
            typeof msg.altitude === 'number' &&
            typeof msg.speed === 'number' &&
            typeof msg.heading === 'number' &&
            typeof msg.batteryLevel === 'number' &&
            typeof msg.satelliteCount === 'number' &&
            typeof msg.timestamp === 'string'
        );
    }

    // Validar mensaje de geo-evento
    private isValidGeoEventMessage(data: unknown): data is DroneGeoEventMessage {
        if (typeof data !== 'object' || data === null) return false;

        const msg = data as Record<string, unknown>;

        return (
            typeof msg.vehicleId === 'string' &&
            typeof msg.eventType === 'string' &&
            typeof msg.latitude === 'number' &&
            typeof msg.longitude === 'number' &&
            typeof msg.timestamp === 'string'
        );
    }

    // Validar mensaje de alerta
    private isValidAlertMessage(data: unknown): data is DroneAlertMessage {
        if (typeof data !== 'object' || data === null) return false;

        const msg = data as Record<string, unknown>;

        return (
            typeof msg.vehicleId === 'string' &&
            typeof msg.alertType === 'string' &&
            typeof msg.message === 'string' &&
            typeof msg.timestamp === 'string' &&
            typeof msg.priority === 'string'
        );
    }

    // Registrar callback de ubicación
    onLocation(callback: LocationCallback): () => void {
        this.locationCallbacks.add(callback);
        return () => this.locationCallbacks.delete(callback);
    }

    // Registrar callback de geo-evento
    onGeoEvent(callback: GeoEventCallback): () => void {
        this.geoEventCallbacks.add(callback);
        return () => this.geoEventCallbacks.delete(callback);
    }

    // Registrar callback de alerta
    onAlert(callback: AlertCallback): () => void {
        this.alertCallbacks.add(callback);
        return () => this.alertCallbacks.delete(callback);
    }

    // Notificar callbacks de ubicación
    private notifyLocationCallbacks(message: DroneLocationMessage): void {
        this.locationCallbacks.forEach(callback => {
            try {
                callback(message);
            } catch (error) {
                this.logError('Error en callback de ubicación:', error);
            }
        });
    }

    // Notificar callbacks de geo-evento
    private notifyGeoEventCallbacks(message: DroneGeoEventMessage): void {
        this.geoEventCallbacks.forEach(callback => {
            try {
                callback(message);
            } catch (error) {
                this.logError('Error en callback de geo-evento:', error);
            }
        });
    }

    // Notificar callbacks de alerta
    private notifyAlertCallbacks(message: DroneAlertMessage): void {
        this.alertCallbacks.forEach(callback => {
            try {
                callback(message);
            } catch (error) {
                this.logError('Error en callback de alerta:', error);
            }
        });
    }

    // Limpiar todos los callbacks
    clear(): void {
        this.locationCallbacks.clear();
        this.geoEventCallbacks.clear();
        this.alertCallbacks.clear();
    }

    // Logging en desarrollo
    private logError(...args: unknown[]): void {
        console.error('[MQTT Handlers]', ...args);
    }
}

export const mqttHandlers = new MqttHandlers();