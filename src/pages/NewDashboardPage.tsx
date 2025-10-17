import { DroneCompactList } from '@components/dashboard/DroneCompactList';
import { DroneTrackingMap } from '@components/dashboard/DroneTrackingMap';
import { DroneDetailsPanel } from '@components/dashboard/DroneDetailsPanel';
import { MqttStatus } from '@components/drone/MqttStatus';

export const NewDashboardPage = () => {
    return (
        <div className="h-full flex flex-col gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Dashboard de Monitoreo
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Sistema de seguimiento en tiempo real
                </p>
            </div>

            <MqttStatus />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-24 gap-4 min-h-0">
                <div className="lg:col-span-3 h-[400px] lg:h-auto">
                    <DroneCompactList />
                </div>

                <div className="lg:col-span-17 h-[500px] lg:h-auto">
                    <DroneTrackingMap />
                </div>

                <div className="lg:col-span-4 h-[400px] lg:h-auto">
                    <DroneDetailsPanel />
                </div>
            </div>
        </div>
    );
};