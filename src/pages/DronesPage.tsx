import { MqttStatus } from '@components/drone/MqttStatus';
import { DroneStats } from '@components/drone/DroneStats';
import { DroneList } from '@components/drone/DroneList';

export const DronesPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Gestión de Drones
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Monitoreo en tiempo real - Fuerza Aeroespacial Colombiana
                </p>
            </div>

            <MqttStatus />

            <DroneStats />

            <DroneList />
        </div>
    );
};