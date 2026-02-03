import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, GeoJSON, useMap } from 'react-leaflet';
import { Battery, Navigation, Clock, Compass, MapPin } from 'lucide-react';
import { DEFAULT_CITY, MAP_TILE_CONFIG, MAP_ZOOM_CONFIG } from '@config/map.config';
import type { TelemetryPoint } from '@features/mission/hooks/usePlaybackTelemetry';
import type { Route } from '@shared/types/route.types';
import type { LatLngExpression, LatLngBounds, Point } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PlaybackMapProps {
    currentTelemetry: TelemetryPoint | null;
    telemetryHistory: TelemetryPoint[];
    vehicleId: string;
    showTrail?: boolean;
    route?: Route | null;
}

interface MapCenterOnRouteProps {
    bounds: LatLngBounds | null;
    center: LatLngExpression | null;
}

// Componente para centrar el mapa en la ruta (solo una vez al cargar)
const MapCenterOnRoute = ({ bounds, center }: MapCenterOnRouteProps) => {
    const map = useMap();
    const hasCentered = useRef(false);

    useEffect(() => {
        if (!hasCentered.current && bounds && center) {
            // Esperar a que el mapa tenga dimensiones correctas
            const centerMap = () => {
                // Invalidar tamaño para que Leaflet recalcule las dimensiones
                map.invalidateSize();

                // Calcular el zoom óptimo basado en el tamaño de los bounds
                const zoom = map.getBoundsZoom(bounds, false, [60, 60]);
                // Limitar el zoom para que la ruta sea visible
                const optimalZoom = Math.min(Math.max(zoom, 14), 17);

                // Centrar el mapa en el centro de la ruta con el zoom calculado
                map.setView(center, optimalZoom);
                hasCentered.current = true;
            };

            // Pequeño delay para asegurar que el contenedor tenga dimensiones
            setTimeout(centerMap, 100);
        }
    }, [bounds, center, map]);

    return null;
};

export const PlaybackMap = ({
    currentTelemetry,
    telemetryHistory,
    vehicleId,
    showTrail = true,
    route
}: PlaybackMapProps) => {
    // Parsear GeoJSON de la ruta y calcular bounds
    const { routeGeoJson, routeBounds, routeCenter } = useMemo(() => {
        if (!route?.geojson) {
            return { routeGeoJson: null, routeBounds: null, routeCenter: null };
        }
        try {
            const geojson = JSON.parse(route.geojson);

            // Extraer coordenadas del GeoJSON para calcular bounds
            const coordinates: [number, number][] = [];

            const extractCoords = (feature: any) => {
                if (feature.geometry?.coordinates) {
                    if (feature.geometry.type === 'LineString') {
                        feature.geometry.coordinates.forEach((coord: number[]) => {
                            // GeoJSON es [lng, lat], Leaflet necesita [lat, lng]
                            coordinates.push([coord[1], coord[0]]);
                        });
                    } else if (feature.geometry.type === 'Point') {
                        coordinates.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
                    }
                }
            };

            if (geojson.type === 'FeatureCollection') {
                geojson.features.forEach(extractCoords);
            } else if (geojson.type === 'Feature') {
                extractCoords(geojson);
            }

            if (coordinates.length > 0) {
                const bounds = L.latLngBounds(coordinates);
                const center = bounds.getCenter();
                return {
                    routeGeoJson: geojson,
                    routeBounds: bounds,
                    routeCenter: [center.lat, center.lng] as LatLngExpression
                };
            }

            return { routeGeoJson: geojson, routeBounds: null, routeCenter: null };
        } catch (e) {
            console.error('Error parsing route GeoJSON:', e);
            return { routeGeoJson: null, routeBounds: null, routeCenter: null };
        }
    }, [route]);

    // Centro del mapa: preferir centro de la ruta, luego posición del dron, luego default
    const mapCenter: LatLngExpression = routeCenter
        ? routeCenter
        : currentTelemetry
            ? [currentTelemetry.latitude, currentTelemetry.longitude]
            : [DEFAULT_CITY.latitude, DEFAULT_CITY.longitude];

    // Crear trail de posiciones hasta el punto actual
    const trailPositions: LatLngExpression[] = telemetryHistory
        .filter(t => {
            if (!currentTelemetry) return false;
            return new Date(t.timestamp).getTime() <= new Date(currentTelemetry.timestamp).getTime();
        })
        .map(t => [t.latitude, t.longitude]);

    const formatTimestamp = (timestamp: string): string => {
        // El backend guarda timestamps en hora local de Colombia (sin timezone)
        // Simplemente extraer la hora del timestamp sin conversiones
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Posición - {vehicleId}
                    </h3>
                </div>
                {route && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {route.name}
                    </span>
                )}
            </div>

            {/* Telemetry Info */}
            {/*currentTelemetry && (
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                                <Battery size={14} />
                                <span className="text-sm font-semibold">
                                    {currentTelemetry.batteryLevel || '--'}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Batería</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                                <Navigation size={14} />
                                <span className="text-sm font-semibold">
                                    {currentTelemetry.altitude?.toFixed(0) || '--'}m
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Altitud</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
                                <Clock size={14} />
                                <span className="text-sm font-semibold">
                                    {currentTelemetry.speed?.toFixed(1) || '--'} m/s
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Velocidad</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400">
                                <Compass size={14} />
                                <span className="text-sm font-semibold">
                                    {currentTelemetry.heading?.toFixed(0) || '--'}°
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Rumbo</p>
                        </div>
                    </div>
                </div>
            )*/}

            {/* Map */}
            <div className="flex-1 relative min-h-0">
                <MapContainer
                    center={mapCenter}
                    zoom={17}
                    minZoom={MAP_ZOOM_CONFIG.min}
                    maxZoom={MAP_ZOOM_CONFIG.max}
                    className="w-full h-full"
                    zoomControl={true}
                >
                    {/* Centrar el mapa en la ruta al cargar */}
                    <MapCenterOnRoute bounds={routeBounds} center={routeCenter} />
                    <TileLayer
                        url={MAP_TILE_CONFIG.url}
                        attribution={MAP_TILE_CONFIG.attribution}
                        maxZoom={MAP_TILE_CONFIG.maxZoom}
                    />

                    {/* Ruta planificada (GeoJSON) */}
                    {routeGeoJson && (
                        <GeoJSON
                            key={route?.id}
                            data={routeGeoJson}
                            style={{
                                color: '#10b981',
                                weight: 4,
                                opacity: 0.6,
                                dashArray: '10, 5',
                            }}
                        />
                    )}

                    {/* Trail de posiciones (ruta real recorrida) */}
                    {showTrail && trailPositions.length > 1 && (
                        <Polyline
                            positions={trailPositions}
                            pathOptions={{
                                color: '#3b82f6',
                                weight: 3,
                                opacity: 0.8,
                            }}
                        />
                    )}

                    {/* Posición actual del dron */}
                    {currentTelemetry && (
                        <CircleMarker
                            center={[currentTelemetry.latitude, currentTelemetry.longitude]}
                            radius={12}
                            pathOptions={{
                                fillColor: '#3b82f6',
                                fillOpacity: 1,
                                color: '#ffffff',
                                weight: 3,
                            }}
                        >
                            <Popup>
                                <div className="text-sm min-w-[180px]">
                                    <p className="font-bold text-blue-600">{vehicleId}</p>
                                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Lat:</span>
                                            <span className="font-mono">
                                                {currentTelemetry.latitude.toFixed(6)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Lng:</span>
                                            <span className="font-mono">
                                                {currentTelemetry.longitude.toFixed(6)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Alt:</span>
                                            <span>{currentTelemetry.altitude?.toFixed(1) || 'N/A'}m</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Vel:</span>
                                            <span>{currentTelemetry.speed?.toFixed(1) || 'N/A'} m/s</span>
                                        </div>
                                        <div className="border-t pt-1 mt-1">
                                            <span className="text-gray-500">
                                                {formatTimestamp(currentTelemetry.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    )}
                </MapContainer>

                {/* No telemetry overlay */}
                {!currentTelemetry && (
                    <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                        <div className="text-center text-white">
                            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Sin datos de telemetría</p>
                            <p className="text-xs opacity-75">Reproduce el video para ver la posición</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with coordinates */}
            {currentTelemetry && (
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
                    <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-500 dark:text-gray-400">
                            {currentTelemetry.latitude.toFixed(6)}, {currentTelemetry.longitude.toFixed(6)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {formatTimestamp(currentTelemetry.timestamp)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
