import { Plane, MapPin, Battery, Navigation, Clock, ChevronRight } from 'lucide-react';
import type { Mission, DroneAssignment } from '@shared/types/mission.types';
import { useDroneStore } from '@features/drones';

interface MissionDronesListProps {
    mission: Mission;
    selectedDroneId: string | null;
    onDroneSelect: (drone: DroneAssignment) => void;
}

export const MissionDronesList = ({ mission, selectedDroneId, onDroneSelect }: MissionDronesListProps) => {
    const liveDrones = useDroneStore((state) => state.drones);

    const getDroneStatus = (droneId: string) => {
        const liveDrone = liveDrones[droneId];
        if (liveDrone?.isActive) {
            return {
                status: 'online',
                label: 'En línea',
                color: 'bg-green-500',
                battery: liveDrone.lastLocation.batteryLevel,
                speed: liveDrone.lastLocation.speed,
                altitude: liveDrone.lastLocation.altitude,
            };
        }
        return {
            status: 'offline',
            label: 'Sin conexión',
            color: 'bg-gray-400',
            battery: null,
            speed: null,
            altitude: null,
        };
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Plane size={18} className="text-primary" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Drones Asignados
                        </h3>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        {mission.droneCount}
                    </span>
                </div>
            </div>

            {/* Drone List */}
            <div className="flex-1 overflow-y-auto">
                {mission.assignedDrones.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p>No hay drones asignados</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {mission.assignedDrones.map((drone) => {
                            const liveStatus = getDroneStatus(drone.droneId);
                            const isSelected = selectedDroneId === drone.droneId;

                            return (
                                <button
                                    key={drone.assignmentId}
                                    onClick={() => onDroneSelect(drone)}
                                    className={`w-full px-4 py-3 text-left transition-colors ${
                                        isSelected
                                            ? 'bg-primary/10 border-l-4 border-primary'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            {/* Drone Name & Status */}
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${liveStatus.color}`}></span>
                                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                                    {drone.droneName || drone.vehicleId}
                                                </span>
                                            </div>

                                            {/* Drone Info */}
                                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span>{drone.model}</span>
                                                {drone.serialNumber && (
                                                    <span className="ml-2">SN: {drone.serialNumber}</span>
                                                )}
                                            </div>

                                            {/* Live Telemetry */}
                                            {liveStatus.status === 'online' && (
                                                <div className="flex items-center gap-3 mt-2 text-xs">
                                                    {liveStatus.battery !== null && (
                                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <Battery size={12} />
                                                            <span>{liveStatus.battery}%</span>
                                                        </div>
                                                    )}
                                                    {liveStatus.altitude !== null && (
                                                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                            <Navigation size={12} />
                                                            <span>{liveStatus.altitude.toFixed(0)}m</span>
                                                        </div>
                                                    )}
                                                    {liveStatus.speed !== null && (
                                                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                                            <Clock size={12} />
                                                            <span>{liveStatus.speed.toFixed(1)} m/s</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Route Info */}
                                            {drone.hasRoute && (
                                                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                                                    <MapPin size={12} />
                                                    <span>Ruta asignada</span>
                                                </div>
                                            )}
                                        </div>

                                        <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 ${isSelected ? 'text-primary' : ''}`} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
