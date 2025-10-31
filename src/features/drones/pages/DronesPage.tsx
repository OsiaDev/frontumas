import { MqttStatus } from '../components/MqttStatus';
import { DroneStats } from '../components/DroneStats';
import { DroneTable } from '../components/DroneTable';

export const DronesPage = () => {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Gestión de Drones
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Administración y monitoreo en tiempo real - Fuerza Aeroespacial Colombiana
                </p>
            </div>

            {/* Estado de conexión MQTT */}
            <MqttStatus />

            {/* Estadísticas de drones */}
            <DroneStats />

            {/* Gestión de Drones - CRUD con monitoreo MQTT integrado */}
            <DroneTable />
        </div>
    );
};