import { Battery, Navigation, Gauge, Satellite, Clock, MapPin } from 'lucide-react';
import type { DroneState } from '@features/drones/store/useDroneStore';

interface MissionTelemetryProps {
    drone: DroneState;
}

export const MissionTelemetry = ({ drone }: MissionTelemetryProps) => {
    const { lastLocation } = drone;

    const getBatteryColor = (level: number): string => {
        if (level > 60) return 'text-green-500 dark:text-green-400';
        if (level > 30) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-red-500 dark:text-red-400';
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

    const telemetryData = [
        {
            icon: Battery,
            label: 'Batería',
            value: `${lastLocation.batteryLevel}%`,
            color: getBatteryColor(lastLocation.batteryLevel),
        },
        {
            icon: Gauge,
            label: 'Altitud',
            value: `${lastLocation.altitude?.toFixed(1) || 'N/A'} m`,
            color: 'text-blue-500 dark:text-blue-400',
        },
        {
            icon: Navigation,
            label: 'Velocidad',
            value: `${lastLocation.speed?.toFixed(1) || 'N/A'} m/s`,
            color: 'text-purple-500 dark:text-purple-400',
        },
        {
            icon: Navigation,
            label: 'Rumbo',
            value: `${lastLocation.heading?.toFixed(0) || 'N/A'}°`,
            color: 'text-indigo-500 dark:text-indigo-400',
        },
        {
            icon: Satellite,
            label: 'Satélites',
            value: lastLocation.satelliteCount?.toString() || 'N/A',
            color: 'text-teal-500 dark:text-teal-400',
        },
    ];

    return (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {/* Header with Drone ID and timestamp */}
            <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {drone.vehicleId}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(lastLocation.timestamp)}</span>
                    </div>
                </div>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 mb-2">
                {telemetryData.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-2 rounded bg-white dark:bg-gray-800"
                        >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {item.label}
                                </div>
                                <div className={`text-sm font-bold ${item.color} truncate`}>
                                    {item.value}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* GPS Position */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Posición GPS
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Lat: </span>
                        <span className="font-mono text-gray-900 dark:text-white">
                            {lastLocation.latitude.toFixed(5)}°
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Lng: </span>
                        <span className="font-mono text-gray-900 dark:text-white">
                            {lastLocation.longitude.toFixed(5)}°
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
