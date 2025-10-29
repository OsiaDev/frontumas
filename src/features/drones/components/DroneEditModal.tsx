import { X } from 'lucide-react';
import { toast } from 'sonner';
import { DroneForm } from './DroneForm';
import { useUpdateDrone } from '../hooks/useDrones';
import type { CreateDroneDTO, DroneResponseDTO } from '@shared/types/api.types';

interface DroneEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    drone: DroneResponseDTO;
}

export const DroneEditModal = ({ isOpen, onClose, drone }: DroneEditModalProps) => {
    const updateDrone = useUpdateDrone();

    const handleSubmit = async (data: CreateDroneDTO) => {
        try {
            const updatedDrone = await updateDrone.mutateAsync({ id: drone.id, data });
            toast.success('Drone actualizado exitosamente', {
                description: `Los datos del drone ${updatedDrone.vehicleId} han sido actualizados correctamente.`,
            });
            onClose();
        } catch (error) {
            console.error('Error updating drone:', error);
            toast.error('Error al actualizar el drone', {
                description: 'No se pudieron actualizar los datos del drone. Por favor intenta nuevamente.',
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#0A1628] border border-[#004599]/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Editar Drone</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <DroneForm
                    mode="edit"
                    initialData={drone}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isLoading={updateDrone.isPending}
                />

                {/* Error Display */}
                {updateDrone.isError && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">
                            Error al actualizar el drone. Por favor intenta nuevamente.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
