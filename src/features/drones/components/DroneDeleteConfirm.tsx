import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/components/Button';
import { useDeleteDrone } from '@/features/drones/hooks/useDrones';
import type { DroneResponseDTO } from '@shared/types/api.types';

interface DroneDeleteConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    drone: DroneResponseDTO;
}

export const DroneDeleteConfirm = ({ isOpen, onClose, drone }: DroneDeleteConfirmProps) => {
    const deleteDrone = useDeleteDrone();

    const handleDelete = async () => {
        try {
            await deleteDrone.mutateAsync(drone.id);
            toast.success('Drone eliminado exitosamente', {
                description: `El drone ${drone.vehicleId} ha sido dado de baja del sistema.`,
            });
            onClose();
        } catch (error) {
            console.error('Error deleting drone:', error);
            toast.error('Error al eliminar el drone', {
                description: 'No se pudo eliminar el drone. Por favor intenta nuevamente.',
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#0A1628] border border-red-300 dark:border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-500/20 rounded-full">
                            <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Eliminar Drone</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-4 space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        ¿Estás seguro que deseas eliminar el siguiente drone?
                    </p>
                    <div className="bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-[#004599]/30 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ID:</span>
                            <span className="text-gray-900 dark:text-white font-medium">{drone.vehicleId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Modelo:</span>
                            <span className="text-gray-900 dark:text-white font-medium">{drone.model}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Serie:</span>
                            <span className="text-gray-900 dark:text-white font-medium">{drone.serialNumber}</span>
                        </div>
                    </div>
                    <p className="text-red-600 dark:text-red-400 text-sm">
                        Esta acción no se puede deshacer.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={deleteDrone.isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleDelete}
                        isLoading={deleteDrone.isPending}
                        disabled={deleteDrone.isPending}
                    >
                        Eliminar
                    </Button>
                </div>

                {/* Error Display */}
                {deleteDrone.isError && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 text-sm">
                            Error al eliminar el drone. Por favor intenta nuevamente.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
