import mqtt from 'mqtt';
import type { MqttClient, IClientSubscribeOptions } from 'mqtt';
import { MQTT_BROKER_CONFIG, MQTT_CLIENT_OPTIONS, MQTT_DEBUG_ENABLED } from '@config/mqtt.config';
import type { MqttTopics } from '@shared/types/drone.types';

type MessageHandler = (topic: string, payload: Buffer) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Error) => void;

class MqttService {
    private client: MqttClient | null = null;
    private messageHandlers: Set<MessageHandler> = new Set();
    private connectionHandlers: Set<ConnectionHandler> = new Set();
    private disconnectionHandlers: Set<ConnectionHandler> = new Set();
    private errorHandlers: Set<ErrorHandler> = new Set();
    private isConnecting = false;

    // Conectar al broker MQTT
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.client?.connected) {
                this.log('Ya conectado al broker MQTT');
                resolve();
                return;
            }

            if (this.isConnecting) {
                this.log('Conexión en progreso...');
                return;
            }

            this.isConnecting = true;
            this.log('Conectando a:', MQTT_BROKER_CONFIG.url);

            try {
                this.client = mqtt.connect(MQTT_BROKER_CONFIG.url, MQTT_CLIENT_OPTIONS);

                this.client.on('connect', () => {
                    this.isConnecting = false;
                    this.log('Conectado exitosamente al broker MQTT');
                    this.notifyConnectionHandlers();
                    resolve();
                });

                this.client.on('message', (topic, payload) => {
                    this.notifyMessageHandlers(topic, payload);
                });

                this.client.on('error', (error) => {
                    this.isConnecting = false;
                    this.logError('Error de conexión MQTT:', error);
                    this.notifyErrorHandlers(error);
                    reject(error);
                });

                this.client.on('offline', () => {
                    this.log('Cliente MQTT offline');
                    this.notifyDisconnectionHandlers();
                });

                this.client.on('reconnect', () => {
                    this.log('Intentando reconectar...');
                });

                this.client.on('close', () => {
                    this.log('Conexión MQTT cerrada');
                });

            } catch (error) {
                this.isConnecting = false;
                this.logError('Error al crear cliente MQTT:', error);
                reject(error);
            }
        });
    }

    // Desconectar del broker
    disconnect(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.client) {
                resolve();
                return;
            }

            this.log('Desconectando del broker MQTT...');

            this.client.end(false, {}, () => {
                this.log('Desconectado exitosamente');
                this.client = null;
                this.notifyDisconnectionHandlers();
                resolve();
            });
        });
    }

    // Suscribirse a un topic
    subscribe(topic: MqttTopics, options?: IClientSubscribeOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            // Verificar que el cliente existe (puede estar en proceso de conexión)
            if (!this.client) {
                reject(new Error('Cliente MQTT no inicializado'));
                return;
            }

            const subscribeOptions: IClientSubscribeOptions = options || { qos: 1 };

            this.client.subscribe(topic, subscribeOptions, (error) => {
                if (error) {
                    this.logError(`Error al suscribirse a ${topic}:`, error);
                    reject(error);
                } else {
                    this.log(`Suscrito exitosamente a: ${topic}`);
                    resolve();
                }
            });
        });
    }

    // Desuscribirse de un topic
    unsubscribe(topic: MqttTopics): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client?.connected) {
                reject(new Error('Cliente MQTT no conectado'));
                return;
            }

            this.client.unsubscribe(topic, (error) => {
                if (error) {
                    this.logError(`Error al desuscribirse de ${topic}:`, error);
                    reject(error);
                } else {
                    this.log(`Desuscrito de: ${topic}`);
                    resolve();
                }
            });
        });
    }

    // Publicar mensaje en un topic
    publish(topic: string, message: string | object, qos: 0 | 1 | 2 = 1): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client?.connected) {
                reject(new Error('Cliente MQTT no conectado'));
                return;
            }

            const payload = typeof message === 'string' ? message : JSON.stringify(message);

            this.client.publish(topic, payload, { qos }, (error) => {
                if (error) {
                    this.logError(`Error al publicar en ${topic}:`, error);
                    reject(error);
                } else {
                    this.log(`Mensaje publicado en: ${topic}`);
                    resolve();
                }
            });
        });
    }

    // Registrar manejador de mensajes
    onMessage(handler: MessageHandler): () => void {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    // Registrar manejador de conexión
    onConnect(handler: ConnectionHandler): () => void {
        this.connectionHandlers.add(handler);
        return () => this.connectionHandlers.delete(handler);
    }

    // Registrar manejador de desconexión
    onDisconnect(handler: ConnectionHandler): () => void {
        this.disconnectionHandlers.add(handler);
        return () => this.disconnectionHandlers.delete(handler);
    }

    // Registrar manejador de errores
    onError(handler: ErrorHandler): () => void {
        this.errorHandlers.add(handler);
        return () => this.errorHandlers.delete(handler);
    }

    // Verificar si está conectado
    isConnected(): boolean {
        return this.client?.connected ?? false;
    }

    // Notificar a los manejadores de mensajes
    private notifyMessageHandlers(topic: string, payload: Buffer): void {
        this.messageHandlers.forEach(handler => {
            try {
                handler(topic, payload);
            } catch (error) {
                this.logError('Error en manejador de mensaje:', error);
            }
        });
    }

    // Notificar a los manejadores de conexión
    private notifyConnectionHandlers(): void {
        this.connectionHandlers.forEach(handler => {
            try {
                handler();
            } catch (error) {
                this.logError('Error en manejador de conexión:', error);
            }
        });
    }

    // Notificar a los manejadores de desconexión
    private notifyDisconnectionHandlers(): void {
        this.disconnectionHandlers.forEach(handler => {
            try {
                handler();
            } catch (error) {
                this.logError('Error en manejador de desconexión:', error);
            }
        });
    }

    // Notificar a los manejadores de errores
    private notifyErrorHandlers(error: Error): void {
        this.errorHandlers.forEach(handler => {
            try {
                handler(error);
            } catch (handlerError) {
                this.logError('Error en manejador de error:', handlerError);
            }
        });
    }

    // Logging en desarrollo
    private log(...args: unknown[]): void {
        if (MQTT_DEBUG_ENABLED) {
            console.log('[MQTT Service]', ...args);
        }
    }

    private logError(...args: unknown[]): void {
        if (MQTT_DEBUG_ENABLED) {
            console.error('[MQTT Service]', ...args);
        }
    }
}

export const mqttService = new MqttService();