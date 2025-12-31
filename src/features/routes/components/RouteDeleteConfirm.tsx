import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/components/Button';
import { routesApiService } from '@features/routes/services/routes.api.service';
import type { Route } from '@shared/types/route.types';

interface RouteDeleteConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    route: Route;
    refetch: () => void;
}

export const RouteDeleteConfirm = ({ isOpen, onClose, route, refetch }: RouteDeleteConfirmProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await routesApiService.deleteRoute(route.id);
            toast.success('Ruta eliminada', {
                description: `La ruta "${route.name}" ha sido eliminada correctamente.`,
            });
            refetch();
            onClose();
        } catch (error) {
            console.error('Error deleting route:', error);
            toast.error('Error al eliminar la ruta', {
                description: 'No se pudo eliminar la ruta. Por favor intenta nuevamente.',
            });
        } finally {
            setIsDeleting(false);
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
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Eliminar Ruta</h2>
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
                        ¿Estás seguro que deseas eliminar la siguiente ruta?
                    </p>
                    <div className="bg-gray-100 dark:bg-black/30 border border-gray-300 dark:border-[#004599]/30 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                            <span className="text-gray-900 dark:text-white font-medium">{route.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                                {route.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Archivo:</span>
                            <span className="text-gray-900 dark:text-white font-medium">{route.originalFilename}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ID:</span>
                            <span className="text-gray-900 dark:text-white font-medium text-xs">{route.id.substring(0, 16)}...</span>
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
                        disabled={isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        isLoading={isDeleting}
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
