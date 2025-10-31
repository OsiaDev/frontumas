import { useState } from 'react';
import { Route as RouteIcon, Trash2, Loader2, Upload, FileText, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRoutesApi } from '../hooks/useRoutesApi';
import { RouteUpload } from './RouteUpload';
import { RouteDeleteConfirm } from './RouteDeleteConfirm';
import { routesApiService } from '../services/routes.api.service';
import type { Route } from '@shared/types/route.types';

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    INACTIVE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const RouteTable = () => {
    const { routes, loading, error, refetch } = useRoutesApi();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

    const handleDelete = (route: Route) => {
        setSelectedRoute(route);
        setShowDeleteConfirm(true);
    };

    const handleCloseDelete = () => {
        setShowDeleteConfirm(false);
        setSelectedRoute(null);
    };

    const handleToggleStatus = async (route: Route) => {
        setTogglingStatus(route.id);
        try {
            if (route.status === 'ACTIVE') {
                await routesApiService.deactivateRoute(route.id);
                toast.success('Ruta desactivada', {
                    description: `La ruta "${route.name}" ha sido desactivada.`,
                });
            } else {
                await routesApiService.activateRoute(route.id);
                toast.success('Ruta activada', {
                    description: `La ruta "${route.name}" ha sido activada.`,
                });
            }
            refetch();
        } catch (error) {
            console.error('Error toggling route status:', error);
            toast.error('Error al cambiar estado', {
                description: 'No se pudo cambiar el estado de la ruta.',
            });
        } finally {
            setTogglingStatus(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#004599]/30">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-red-300 dark:border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                    <RouteIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Gestión de Rutas
                    </h3>
                </div>
                <div className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400">
                        Error al cargar las rutas
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {error.message || 'Intenta nuevamente más tarde'}
                    </p>
                    <button
                        onClick={refetch}
                        className="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#004599]/30">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <RouteIcon className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Gestión de Rutas
                        </h3>
                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {routes?.length || 0}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-lg"
                    >
                        <Upload size={20} />
                        <span className="font-medium">Subir Ruta</span>
                    </button>
                </div>

                {!routes || routes.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">
                            No hay rutas registradas
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            Sube tu primera ruta para comenzar
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[#004599]/30">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Nombre
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Estado
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Archivo
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Tamaño
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Fecha de Creación
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {routes.map((route) => {
                                    const colorClass = STATUS_COLORS[route.status] || STATUS_COLORS.INACTIVE;

                                    return (
                                        <tr
                                            key={route.id}
                                            className="border-b border-gray-100 dark:border-[#004599]/10 hover:bg-gray-50 dark:hover:bg-[#004599]/5 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {route.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                                        ID: {route.id.substring(0, 8)}...
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                                                    {route.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-gray-500 dark:text-gray-400" />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {route.originalFilename}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                {formatFileSize(route.sizeBytes)}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                {formatDate(route.createdAt)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(route)}
                                                        disabled={togglingStatus === route.id}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            route.status === 'ACTIVE'
                                                                ? 'text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-500/10'
                                                                : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-500/10'
                                                        } disabled:opacity-50`}
                                                        title={route.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {togglingStatus === route.id ? (
                                                            <Loader2 size={18} className="animate-spin" />
                                                        ) : route.status === 'ACTIVE' ? (
                                                            <PowerOff size={18} />
                                                        ) : (
                                                            <Power size={18} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(route)}
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
            <RouteUpload
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                refetch={refetch}
            />

            {selectedRoute && (
                <RouteDeleteConfirm
                    isOpen={showDeleteConfirm}
                    onClose={handleCloseDelete}
                    route={selectedRoute}
                    refetch={refetch}
                />
            )}
        </>
    );
};
