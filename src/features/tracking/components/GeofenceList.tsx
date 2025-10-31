import { useEffect, useState } from 'react';
import { SquareDashed, Eye, EyeOff, Navigation2, Loader2, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { geofencesApiService } from '@features/geofences/services/geofences.api.service';
import type { Geofence } from '@shared/types/geofence.types';

interface GeofenceListProps {
    visibleGeofences: Set<string>;
    onToggleGeofence: (id: string) => void;
    onCenterGeofence: (geofence: Geofence) => void;
}

export const GeofenceList = ({ visibleGeofences, onToggleGeofence, onCenterGeofence }: GeofenceListProps) => {
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGeofences();
    }, []);

    const fetchGeofences = async () => {
        try {
            setLoading(true);
            const data = await geofencesApiService.getGeofences();
            setGeofences(data);
        } catch (error) {
            console.error('Error loading geofences:', error);
            toast.error('Error al cargar geocercas', {
                description: 'No se pudieron cargar las geocercas del servidor.',
            });
        } finally {
            setLoading(false);
        }
    };

    const getGeofenceCenter = (geofence: Geofence): { lat: number; lng: number } | null => {
        try {
            const geojson = JSON.parse(geofence.geojson);
            if (geojson.type === 'FeatureCollection' && geojson.features.length > 0) {
                const feature = geojson.features[0];
                const geometry = feature.geometry;

                if (geometry.type === 'Polygon' && geometry.coordinates.length > 0) {
                    const coords = geometry.coordinates[0];
                    const latSum = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0);
                    const lngSum = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0);
                    return {
                        lat: latSum / coords.length,
                        lng: lngSum / coords.length,
                    };
                } else if (geometry.type === 'Point') {
                    return {
                        lng: geometry.coordinates[0],
                        lat: geometry.coordinates[1],
                    };
                }
            }
        } catch (error) {
            console.error('Error parsing geofence center:', error);
        }
        return null;
    };

    const handleCenter = (geofence: Geofence) => {
        const center = getGeofenceCenter(geofence);
        if (center) {
            onCenterGeofence(geofence);
        } else {
            toast.warning('No se pudo centrar', {
                description: 'No se encontraron coordenadas válidas para esta geocerca.',
            });
        }
    };

    const filteredGeofences = geofences.filter(geofence => {
        const searchLower = searchTerm.toLowerCase();
        return (
            geofence.name.toLowerCase().includes(searchLower) ||
            geofence.originalFilename.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex-shrink-0 py-8">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cargando geocercas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col flex-1 min-h-0 max-h-full overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <SquareDashed className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Geocercas
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {filteredGeofences.length}/{geofences.length}
                        </span>
                        <button
                            onClick={fetchGeofences}
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
                        placeholder="Buscar geocercas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                {filteredGeofences.length === 0 ? (
                    <div className="p-4 text-center">
                        <SquareDashed className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {searchTerm ? 'No se encontraron geocercas' : 'No hay geocercas disponibles'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredGeofences.map((geofence) => {
                            const isVisible = visibleGeofences.has(geofence.id);
                            return (
                                <div
                                    key={geofence.id}
                                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {geofence.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                {geofence.originalFilename}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleCenter(geofence)}
                                                className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 dark:text-gray-400 dark:hover:text-primary rounded transition-colors"
                                                title="Centrar en el mapa"
                                            >
                                                <Navigation2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onToggleGeofence(geofence.id)}
                                                className={`p-1.5 rounded transition-colors ${
                                                    isVisible
                                                        ? 'text-primary bg-primary/10'
                                                        : 'text-gray-500 hover:text-primary hover:bg-primary/10 dark:text-gray-400 dark:hover:text-primary'
                                                }`}
                                                title={isVisible ? 'Ocultar' : 'Mostrar'}
                                            >
                                                {isVisible ? (
                                                    <Eye className="w-4 h-4" />
                                                ) : (
                                                    <EyeOff className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
