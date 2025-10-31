import { useState } from 'react';
import { Plane, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { useDronesApi, useDroneStore } from '@features/drones';
import { useTrackingStore } from '../store/useTrackingStore';
import type { DroneStatus } from '@shared/types/api.types';

export const DroneCompactList = () => {
    const { drones, loading, error, refetch } = useDronesApi();
    const selectedDroneId = useTrackingStore((state) => state.selectedDroneId);
    const selectDrone = useTrackingStore((state) => state.selectDrone);
    const getDrone = useDroneStore((state) => state.getDrone);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredDrones = drones.filter(drone => {
        const searchLower = searchTerm.toLowerCase();
        return (
            drone.vehicleId.toLowerCase().includes(searchLower) ||
            drone.model.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex-shrink-0">
                <div className="flex items-center justify-center py-8">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex-shrink-0">
                <div className="flex items-center justify-center py-8">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col flex-1 min-h-0 max-h-full overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Drones
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {filteredDrones.length}/{drones.length}
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
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar drones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scroll-smooth">
                {filteredDrones.length === 0 ? (
                    <div className="p-4 text-center">
                        <Plane className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {searchTerm ? 'No se encontraron drones' : 'No hay drones disponibles'}
                        </p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {filteredDrones.map((drone) => (
                            <button
                                key={drone.id}
                                onClick={() => {
                                    // Toggle: si el dron ya está seleccionado, deseleccionarlo
                                    if (selectedDroneId === drone.vehicleId) {
                                        selectDrone(null);
                                    } else {
                                        selectDrone(drone.vehicleId);
                                    }
                                }}
                                className={`w-full text-left p-2 rounded-lg transition-all ${
                                    selectedDroneId === drone.vehicleId
                                        ? 'bg-primary text-white shadow-md'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="dark:text-white text-xs font-semibold truncate">
                                                {drone.vehicleId}
                                            </span>
                                            {isConnected(drone.vehicleId) && (
                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <p className="dark:text-gray-400  text-[10px] opacity-80 truncate">
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
                )}
            </div>
        </div>
    );
};