import { GeoJSON, Popup } from 'react-leaflet';
import type { Geofence, GeofenceType } from '@shared/types/geofence.types';
import type { PathOptions } from 'leaflet';

interface GeofenceLayerProps {
    geofences: Geofence[];
    geofenceTypes: GeofenceType[];
    visibleGeofences: Set<string>;
}

// Mapeo de colores por tipo de geocerca
const GEOFENCE_COLORS: Record<string, { color: string; fillColor: string }> = {
    RESTRICTED: {
        color: '#ef4444',      // rojo para zonas restringidas
        fillColor: '#ef4444',
    },
    SAFE_ZONE: {
        color: '#22c55e',      // verde para zonas seguras
        fillColor: '#22c55e',
    },
    POI: {
        color: '#3b82f6',      // azul para puntos de interés
        fillColor: '#3b82f6',
    },
    OTHER: {
        color: '#f59e0b',      // naranja para otros
        fillColor: '#f59e0b',
    },
};

export const GeofenceLayer = ({ geofences, geofenceTypes, visibleGeofences }: GeofenceLayerProps) => {
    const visibleGeofencesList = geofences.filter(g => visibleGeofences.has(g.id));

    if (visibleGeofencesList.length === 0) {
        return null;
    }

    // Crear un mapa de ID de tipo a código de tipo
    const typeMap = new Map(geofenceTypes.map(type => [type.id, type.code]));

    // Función para obtener el estilo de una geocerca según su tipo
    const getGeofenceStyle = (geofence: Geofence): PathOptions => {
        const typeCode = typeMap.get(geofence.geofenceTypeId);
        const colors = typeCode ? GEOFENCE_COLORS[typeCode] : GEOFENCE_COLORS.OTHER;

        return {
            color: colors.color,
            weight: 2,
            opacity: 0.8,
            fillColor: colors.fillColor,
            fillOpacity: 0.1,
        };
    };

    return (
        <>
            {visibleGeofencesList.map((geofence) => {
                try {
                    const geojson = JSON.parse(geofence.geojson);
                    const geofenceType = geofenceTypes.find(t => t.id === geofence.geofenceTypeId);

                    return (
                        <GeoJSON
                            key={geofence.id}
                            data={geojson}
                            style={getGeofenceStyle(geofence)}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <p className="font-bold text-gray-900">
                                        {geofence.name}
                                    </p>
                                    {geofenceType && (
                                        <p className="text-xs text-gray-700 mt-1">
                                            Tipo: {geofenceType.name}
                                        </p>
                                    )}
                                    <p className="text-gray-600 text-xs mt-1">
                                        {geofence.originalFilename}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Tamaño: {(geofence.sizeBytes / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </Popup>
                        </GeoJSON>
                    );
                } catch (error) {
                    console.error(`Error rendering geofence ${geofence.id}:`, error);
                    return null;
                }
            })}
        </>
    );
};
