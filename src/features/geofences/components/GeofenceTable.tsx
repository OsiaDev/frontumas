import { useState } from 'react';
import { SquareDashed, Trash2, Loader2, Upload, FileText } from 'lucide-react';
import { useGeofencesApi } from '../hooks/useGeofencesApi';
import { GeofenceUpload } from './GeofenceUpload';
import { GeofenceDeleteConfirm } from './GeofenceDeleteConfirm';
import type { Geofence } from '@shared/types/geofence.types';

const TYPE_COLORS: Record<string, string> = {
    RESTRICTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    SAFE_ZONE: 'bg-green-500/20 text-green-400 border-green-500/30',
    POI: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    OTHER: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const GeofenceTable = () => {
    const { geofences, geofenceTypes, loading, error, refetch } = useGeofencesApi();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const getTypeName = (typeId: string) => {
        const type = geofenceTypes?.find(t => t.id === typeId);
        return type?.name || '—';
    };

    const getTypeCode = (typeId: string) => {
        const type = geofenceTypes?.find(t => t.id === typeId);
        return type?.code || 'OTHER';
    };

    const handleDelete = (geofence: Geofence) => {
        setSelectedGeofence(geofence);
        setShowDeleteConfirm(true);
    };

    const handleCloseDelete = () => {
        setShowDeleteConfirm(false);
        setSelectedGeofence(null);
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
                    <SquareDashed className="w-6 h-6 text-red-500 dark:text-red-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Gestión de Geocercas
                    </h3>
                </div>
                <div className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400">
                        Error al cargar las geocercas
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
                        <SquareDashed className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Gestión de Geocercas
                        </h3>
                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {geofences?.length || 0}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-lg"
                    >
                        <Upload size={20} />
                        <span className="font-medium">Subir Geocerca</span>
                    </button>
                </div>

                {!geofences || geofences.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">
                            No hay geocercas registradas
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            Sube tu primera geocerca para comenzar
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
                                        Tipo
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
                                {geofences.map((geofence) => {
                                    const typeCode = getTypeCode(geofence.geofenceTypeId);
                                    const colorClass = TYPE_COLORS[typeCode] || TYPE_COLORS.OTHER;

                                    return (
                                        <tr
                                            key={geofence.id}
                                            className="border-b border-gray-100 dark:border-[#004599]/10 hover:bg-gray-50 dark:hover:bg-[#004599]/5 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {geofence.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                                        ID: {geofence.id.substring(0, 8)}...
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                                                    {getTypeName(geofence.geofenceTypeId)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-gray-500 dark:text-gray-400" />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {geofence.originalFilename}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                {formatFileSize(geofence.sizeBytes)}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                {formatDate(geofence.createdAt)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDelete(geofence)}
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
            <GeofenceUpload
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                refetch={refetch}
                geofenceTypes={geofenceTypes}
            />

            {selectedGeofence && (
                <GeofenceDeleteConfirm
                    isOpen={showDeleteConfirm}
                    onClose={handleCloseDelete}
                    geofence={selectedGeofence}
                    refetch={refetch}
                />
            )}
        </>
    );
};
