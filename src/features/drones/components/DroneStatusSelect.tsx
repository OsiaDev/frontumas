import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateDroneStatus, useDroneStatuses } from '@/features/drones/hooks/useDrones';
import type { DroneResponseDTO, DroneStatus } from '@shared/types/api.types';

interface DroneStatusSelectProps {
    drone: DroneResponseDTO;
}

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

export const DroneStatusSelect = ({ drone }: DroneStatusSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const updateStatus = useUpdateDroneStatus();
    const { data: statuses } = useDroneStatuses();

    const handleStatusChange = async (newStatus: DroneStatus) => {
        if (newStatus === drone.status) {
            setIsOpen(false);
            return;
        }

        try {
            await updateStatus.mutateAsync({
                id: drone.id,
                status: newStatus,
            });
            toast.success('Estado actualizado correctamente', {
                description: `El drone ${drone.vehicleId} ahora está en estado: ${STATUS_LABELS[newStatus]}`,
            });
            setIsOpen(false);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error al actualizar el estado', {
                description: 'No se pudo actualizar el estado del drone. Intenta nuevamente.',
            });
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={updateStatus.isPending}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[drone.status]} hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {updateStatus.isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                ) : null}
                {STATUS_LABELS[drone.status] || drone.status}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-[#0A1628] border border-[#004599]/30 rounded-lg shadow-xl z-20 py-1">
                        {statuses?.map((status) => (
                            <button
                                key={status.code}
                                onClick={() => handleStatusChange(status.code as DroneStatus)}
                                disabled={updateStatus.isPending}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-[#004599]/20 transition-colors flex items-center justify-between disabled:opacity-50 ${
                                    status.code === drone.status ? 'bg-[#004599]/10' : ''
                                }`}
                            >
                                <span className="text-gray-300">{status.description}</span>
                                {status.code === drone.status && (
                                    <Check size={16} className="text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
