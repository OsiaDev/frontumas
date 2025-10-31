import { useState } from 'react';
import { Plane, Edit, Trash2, Plus, Loader2, Activity, Radio } from 'lucide-react';
import { useDrones as useDronesQuery } from '../hooks/useDrones';
import { useDroneStore } from '../store/useDroneStore';
import { DroneCreateModal } from './DroneCreateModal';
import { DroneEditModal } from './DroneEditModal';
import { DroneDeleteConfirm } from './DroneDeleteConfirm';
import { DroneStatusSelect } from './DroneStatusSelect';
import { Button } from '@shared/components/Button';
import type { DroneResponseDTO } from '@shared/types/api.types';

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Activo',
    IN_MAINTENANCE: 'En Mantenimiento',
    REPAIRING: 'En Reparación',
    OUT_OF_SERVICE: 'Fuera de Servicio',
    DECOMMISSIONED: 'Dado de Baja',
};

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    IN_MAINTENANCE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    REPAIRING: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    OUT_OF_SERVICE: 'bg-red-500/20 text-red-400 border-red-500/30',
    DECOMMISSIONED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const DroneTable = () => {
    const { data: drones, isLoading, isError, error } = useDronesQuery();
    const getDrone = useDroneStore((state) => state.getDrone);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedDrone, setSelectedDrone] = useState<DroneResponseDTO | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Función para verificar si un drone está conectado vía MQTT
    const isDroneConnected = (vehicleId: string): boolean => {
        const mqttDrone = getDrone(vehicleId);
        return !!mqttDrone;
    };

    // Función para obtener telemetría del drone
    const getDroneTelemetry = (vehicleId: string) => {
        return getDrone(vehicleId);
    };

    const handleEdit = (drone: DroneResponseDTO) => {
        setSelectedDrone(drone);
        setShowEditModal(true);
    };

    const handleDelete = (drone: DroneResponseDTO) => {
        setSelectedDrone(drone);
        setShowDeleteConfirm(true);
    };

    const handleCloseEdit = () => {
        setShowEditModal(false);
        setSelectedDrone(null);
    };

    const handleCloseDelete = () => {
        setShowDeleteConfirm(false);
        setSelectedDrone(null);
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#004599]/30">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-red-300 dark:border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                    <Plane className="w-6 h-6 text-red-500 dark:text-red-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Gestión de Drones
                    </h3>
                </div>
                <div className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400">
                        Error al cargar los drones
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {error?.message || 'Intenta nuevamente más tarde'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#004599]/30">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Plane className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Gestión de Drones
                        </h3>
                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {drones?.length || 0}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-lg"
                    >
                        <Plus size={20} />
                        <span className="font-medium">Nuevo Drone</span>
                    </button>
                </div>

                {!drones || drones.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">
                            No hay drones registrados
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            Crea tu primer drone para comenzar
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[#004599]/30">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        ID Vehículo
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Modelo
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Número de Serie
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Conexión MQTT
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Estado
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {drones.map((drone) => {
                                    const isConnected = isDroneConnected(drone.vehicleId);
                                    const telemetry = getDroneTelemetry(drone.vehicleId);

                                    return (
                                        <tr
                                            key={drone.id}
                                            className="border-b border-gray-100 dark:border-[#004599]/10 hover:bg-gray-50 dark:hover:bg-[#004599]/5 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {drone.vehicleId}
                                                    </span>
                                                    {telemetry && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            Bat: {telemetry.lastLocation.batteryLevel}% |
                                                            Alt: {telemetry.lastLocation.altitude.toFixed(0)}m
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{drone.model}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                                        {drone.description} | {drone.flightHours.toFixed(2)}h vuelo
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                {drone.serialNumber}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center">
                                                    {isConnected ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Radio size={16} className="text-green-400 animate-pulse" />
                                                            <span className="text-xs text-green-400 font-medium">
                                                                Conectado
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5">
                                                            <Activity size={16} className="text-gray-500" />
                                                            <span className="text-xs text-gray-500">
                                                                Desconectado
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <DroneStatusSelect drone={drone} />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(drone)}
                                                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(drone)}
                                                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <DroneCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />

            {selectedDrone && (
                <>
                    <DroneEditModal
                        isOpen={showEditModal}
                        onClose={handleCloseEdit}
                        drone={selectedDrone}
                    />
                    <DroneDeleteConfirm
                        isOpen={showDeleteConfirm}
                        onClose={handleCloseDelete}
                        drone={selectedDrone}
                    />
                </>
            )}
        </>
    );
};
