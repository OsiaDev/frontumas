import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { routesApiService } from '@features/routes/services/routes.api.service';
import { DEFAULT_CITY, MAP_TILE_CONFIG } from '@core/config/map.config';
import type { Route } from '@shared/types/route.types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface RouteMapPreviewProps {
    routeId: string | null;
    className?: string;
}

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapFitBoundsProps {
    coordinates: [number, number][];
}

const MapFitBounds = ({ coordinates }: MapFitBoundsProps) => {
    const map = useMap();

    useEffect(() => {
        if (coordinates.length > 0) {
            const bounds = L.latLngBounds(coordinates.map(([lat, lng]) => [lat, lng]));
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15,
            });
        }
    }, [coordinates, map]);

    return null;
};

export const RouteMapPreview = ({ routeId, className = '' }: RouteMapPreviewProps) => {
    const [route, setRoute] = useState<Route | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<[number, number][]>([]);

    useEffect(() => {
        if (!routeId) {
            setRoute(null);
            setCoordinates([]);
            setError(null);
            return;
        }

        loadRoute(routeId);
    }, [routeId]);

    const loadRoute = async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const routeData = await routesApiService.getRouteById(id);
            setRoute(routeData);

            // Extraer coordenadas del GeoJSON
            if (routeData.geojson) {
                const geojsonObj = typeof routeData.geojson === 'string'
                    ? JSON.parse(routeData.geojson)
                    : routeData.geojson;

                if (geojsonObj && geojsonObj.features) {
                    const coords = extractCoordinatesFromGeoJSON(geojsonObj);
                    setCoordinates(coords);
                }
            }
        } catch (err) {
            console.error('Error cargando ruta:', err);
            setError('Error al cargar la ruta');
            setCoordinates([]);
        } finally {
            setIsLoading(false);
        }
    };

    const extractCoordinatesFromGeoJSON = (geojson: any): [number, number][] => {
        const coords: [number, number][] = [];

        geojson.features.forEach((feature: any) => {
            if (feature.geometry.type === 'LineString') {
                feature.geometry.coordinates.forEach((coord: number[]) => {
                    // GeoJSON usa [lng, lat], pero Leaflet usa [lat, lng]
                    coords.push([coord[1], coord[0]]);
                });
            } else if (feature.geometry.type === 'Point') {
                coords.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
            }
        });

        return coords;
    };

    if (!routeId) {
        return (
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-center p-8">
                    <MapPin className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Selecciona una ruta para ver el mapa
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cargando ruta...</p>
                </div>
            </div>
        );
    }

    if (error || !route) {
        return (
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-center p-8">
                    <p className="text-sm text-red-500 dark:text-red-400">{error || 'No se pudo cargar la ruta'}</p>
                </div>
            </div>
        );
    }

    const center: [number, number] = coordinates.length > 0
        ? coordinates[0]
        : [DEFAULT_CITY.latitude, DEFAULT_CITY.longitude];

    return (
        <div className={`rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vista previa de ruta: {route.name}
                </h4>
                {coordinates.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {coordinates.length} puntos de ruta
                    </p>
                )}
            </div>
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution={MAP_TILE_CONFIG.attribution}
                    url={MAP_TILE_CONFIG.url}
                />

                {coordinates.length > 0 && (
                    <>
                        <MapFitBounds coordinates={coordinates} />

                        {/* Línea de la ruta */}
                        <Polyline
                            positions={coordinates}
                            pathOptions={{
                                color: '#3B82F6',
                                weight: 4,
                                opacity: 0.8,
                            }}
                        />

                        {/* Marcador de inicio */}
                        <Marker position={coordinates[0]}>
                            <Popup>
                                <div className="text-sm">
                                    <strong>Inicio</strong>
                                    <br />
                                    Lat: {coordinates[0][0].toFixed(6)}
                                    <br />
                                    Lng: {coordinates[0][1].toFixed(6)}
                                </div>
                            </Popup>
                        </Marker>

                        {/* Marcador de fin */}
                        {coordinates.length > 1 && (
                            <Marker position={coordinates[coordinates.length - 1]}>
                                <Popup>
                                    <div className="text-sm">
                                        <strong>Fin</strong>
                                        <br />
                                        Lat: {coordinates[coordinates.length - 1][0].toFixed(6)}
                                        <br />
                                        Lng: {coordinates[coordinates.length - 1][1].toFixed(6)}
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </>
                )}
            </MapContainer>
        </div>
    );
};
