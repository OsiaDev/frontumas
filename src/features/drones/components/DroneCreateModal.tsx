import { X } from 'lucide-react';
import { toast } from 'sonner';
import { DroneForm } from './DroneForm';
import { useCreateDrone } from '../hooks/useDrones';
import type { CreateDroneDTO } from '@shared/types/api.types';

interface DroneCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DroneCreateModal = ({ isOpen, onClose }: DroneCreateModalProps) => {
    const createDrone = useCreateDrone();

    const handleSubmit = async (data: CreateDroneDTO) => {
        try {
            const newDrone = await createDrone.mutateAsync(data);
            toast.success('Drone creado exitosamente', {
                description: `El drone ${newDrone.vehicleId} ha sido registrado correctamente en el sistema.`,
            });
            onClose();
        } catch (error) {
            console.error('Error creating drone:', error);
            toast.error('Error al crear el drone', {
                description: 'No se pudo crear el drone. Por favor verifica los datos e intenta nuevamente.',
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
                    <h2 className="text-2xl font-bold text-white">Crear Nuevo Drone</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <DroneForm
                    mode="create"
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isLoading={createDrone.isPending}
                />

                {/* Error Display */}
                {createDrone.isError && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">
                            Error al crear el drone. Por favor intenta nuevamente.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
