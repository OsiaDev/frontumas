import { X } from 'lucide-react';
import { toast } from 'sonner';
import { DroneForm } from '@/features/drones/components/DroneForm';
import { useCreateDrone } from '@/features/drones/hooks/useDrones';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#0A1628] border border-gray-300 dark:border-[#004599]/30 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crear Nuevo Drone</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* Form */}
                    <DroneForm
                        mode="create"
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={createDrone.isPending}
                    />

                    {/* Error Display */}
                    {createDrone.isError && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
                            <p className="text-red-600 dark:text-red-400 text-sm">
                                Error al crear el drone. Por favor intenta nuevamente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
