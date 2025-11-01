import { Battery, Navigation, Gauge, Satellite, Clock, ThermometerSun, X } from 'lucide-react';
import { useTrackingStore } from '../store/useTrackingStore';
import { useDroneStore } from '@features/drones';

export const DroneDetailsPanel = () => {
    const selectedDroneId = useTrackingStore((state) => state.selectedDroneId);
    const selectDrone = useTrackingStore((state) => state.selectDrone);
    const drone = useDroneStore((state) =>
        selectedDroneId ? state.drones[selectedDroneId] : null
    );

    if (!selectedDroneId) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full flex items-center justify-center">
                <div className="text-center">
                    <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                        Selecciona un dron
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Haz clic en un dron del mapa o la lista
                    </p>
                </div>
            </div>
        );
    }

    if (!drone) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Dron no encontrado
                    </p>
                </div>
            </div>
        );
    }

    const { lastLocation } = drone;
    const additionalFields = lastLocation.additionalFields || {};

    const getBatteryColor = (level: number): string => {
        if (level > 60) return 'text-green-500';
        if (level > 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    const formatTimestamp = (timestamp: string): string => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString('es-CO', {
                dateStyle: 'short',
                timeStyle: 'medium',
            });
        } catch {
            return timestamp;
        }
    };

    const detailItems = [
        {
            icon: Battery,
            label: 'Batería',
            value: `${lastLocation.batteryLevel}%`,
            color: getBatteryColor(lastLocation.batteryLevel),
        },
        {
            icon: Gauge,
            label: 'Altitud',
            value: `${lastLocation.altitude.toFixed(1)} m`,
            color: 'text-blue-500',
        },
        {
            icon: Navigation,
            label: 'Velocidad',
            value: `${lastLocation.speed.toFixed(1)} m/s`,
            color: 'text-purple-500',
        },
        {
            icon: Navigation,
            label: 'Rumbo',
            value: `${lastLocation.heading.toFixed(0)}°`,
            color: 'text-indigo-500',
        },
        {
            icon: Satellite,
            label: 'Satélites',
            value: lastLocation.satelliteCount.toString(),
            color: 'text-teal-500',
        },
    ];

    if (additionalFields.temperature !== undefined) {
        detailItems.push({
            icon: ThermometerSun,
            label: 'Temperatura',
            value: `${additionalFields.temperature}°C`,
            color: 'text-orange-500',
        });
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {drone.vehicleId}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(lastLocation.timestamp)}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => selectDrone(null)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Cerrar detalles"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                    {detailItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 ${item.color}`} />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.label}
                                        </span>
                                    </div>
                                    <span className={`text-lg font-bold ${item.color}`}>
                                        {item.value}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Posición GPS
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Latitud:</span>
                            <span className="font-mono text-gray-900 dark:text-white">
                                {lastLocation.latitude.toFixed(6)}°
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Longitud:</span>
                            <span className="font-mono text-gray-900 dark:text-white">
                                {lastLocation.longitude.toFixed(6)}°
                            </span>
                        </div>
                    </div>
                </div>

                {additionalFields.flightMode && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Información Adicional
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Modo de Vuelo:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {additionalFields.flightMode}
                                </span>
                            </div>
                            {additionalFields.missionId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Misión:
                                    </span>
                                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                                        {additionalFields.missionId}
                                    </span>
                                </div>
                            )}
                            {additionalFields.signalStrength !== undefined && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Señal:
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {additionalFields.signalStrength}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};