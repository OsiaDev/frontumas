import { Plane, RefreshCw, AlertCircle } from 'lucide-react';
import { useDronesApi } from '@hooks/useDronesApi';
import { useTracking } from '@store/tracking/TrackingContext';
import { useDrones } from '@store/drone/DroneContext';
import type { DroneStatus } from '@/types/api.types';

export const DroneCompactList = () => {
    const { drones, loading, error, refetch } = useDronesApi();
    const { selectedDroneId, selectDrone } = useTracking();
    const { getDrone } = useDrones();

    const getStatusColor = (status: DroneStatus): string => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-500';
            case 'INACTIVE':
                return 'bg-gray-500';
            case 'MAINTENANCE':
                return 'bg-yellow-500';
            case 'OFFLINE':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    };

    const getStatusText = (status: DroneStatus): string => {
        switch (status) {
            case 'ACTIVE':
                return 'Activo';
            case 'INACTIVE':
                return 'Inactivo';
            case 'MAINTENANCE':
                return 'Mantenimiento';
            case 'OFFLINE':
                return 'Offline';
            default:
                return status;
        }
    };

    const isConnected = (vehicleId: string): boolean => {
        const mqttDrone = getDrone(vehicleId);
        return mqttDrone?.connectionStatus === 'CONNECTED';
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cargando drones...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                            {error.message}
                        </p>
                        <button
                            onClick={refetch}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Drones
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {drones.length}
                    </span>
                    <button
                        onClick={refetch}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Actualizar"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {drones.map((drone) => (
                    <button
                        key={drone.id}
                        onClick={() => selectDrone(drone.vehicleId)}
                        className={`w-full text-left p-2 rounded-lg transition-all ${
                            selectedDroneId === drone.vehicleId
                                ? 'bg-primary text-white shadow-md'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold truncate">
                                        {drone.vehicleId}
                                    </span>
                                    {isConnected(drone.vehicleId) && (
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    )}
                                </div>
                                <p className="text-[10px] opacity-80 truncate">
                                    {drone.model}
                                </p>
                            </div>
                            <div
                                className={`w-2 h-2 rounded-full ${getStatusColor(drone.status)}`}
                                title={getStatusText(drone.status)}
                            />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};