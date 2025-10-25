import { Plane, Battery, Signal } from 'lucide-react';
import { useDrones } from '../context/DroneContext';

export const DroneList = () => {
    const { getActiveDrones, getTotalDrones } = useDrones();
    const activeDrones = getActiveDrones();
    const totalDrones = getTotalDrones();

    const getBatteryColor = (level: number): string => {
        if (level > 60) return 'text-green-500';
        if (level > 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    const formatTimestamp = (timestamp: string): string => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return timestamp;
        }
    };

    if (totalDrones === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <Plane className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Drones Activos
                    </h3>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                        No hay drones conectados
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        Esperando mensajes MQTT...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Plane className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Drones Activos
                    </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {activeDrones.length} / {totalDrones}
                </div>
            </div>

            <div className="space-y-3">
                {activeDrones.map((drone) => (
                    <div
                        key={drone.vehicleId}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {drone.vehicleId}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatTimestamp(drone.lastLocation.timestamp)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Battery className={`w-4 h-4 ${getBatteryColor(drone.lastLocation.batteryLevel)}`} />
                                    <span className={`text-xs font-medium ${getBatteryColor(drone.lastLocation.batteryLevel)}`}>
                                        {drone.lastLocation.batteryLevel}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Signal className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {drone.lastLocation.satelliteCount}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Altitud:</span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                    {drone.lastLocation.altitude.toFixed(1)}m
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Velocidad:</span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                    {drone.lastLocation.speed.toFixed(1)} m/s
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Lat:</span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                    {drone.lastLocation.latitude.toFixed(6)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Lng:</span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                    {drone.lastLocation.longitude.toFixed(6)}
                                </span>
                            </div>
                        </div>

                        {drone.lastLocation.additionalFields?.missionId && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Misión:</span>
                                <span className="ml-1 text-xs font-medium text-primary">
                                    {drone.lastLocation.additionalFields.missionId}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};