import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, GeoJSON, useMap } from 'react-leaflet';
import { Battery, Navigation, Clock, Compass, Signal, Route, X, Maximize2 } from 'lucide-react';
import type { DroneAssignment } from '@shared/types/mission.types';
import { useDroneStore } from '@features/drones';
import { routesApiService } from '@features/routes/services/routes.api.service';
import { DEFAULT_CITY, MAP_TILE_CONFIG, MAP_ZOOM_CONFIG } from '@config/map.config';
import type { Route as RouteType } from '@shared/types/route.types';
import type { LatLngExpression, LatLngBounds } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DroneDetailPanelProps {
    drone: DroneAssignment;
    onClose: () => void;
}

interface MapCenterUpdaterProps {
    center: LatLngExpression;
    bounds?: LatLngBounds | null;
}

const MapUpdater = ({ center, bounds }: MapCenterUpdaterProps) => {
    const map = useMap();

    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [20, 20] });
        } else {
            map.setView(center, 15);
        }
    }, [center, bounds, map]);

    return null;
};

export const DroneDetailPanel = ({ drone, onClose }: DroneDetailPanelProps) => {
    const liveDrones = useDroneStore((state) => state.drones);
    const liveDrone = liveDrones[drone.droneId];
    const [route, setRoute] = useState<RouteType | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (drone.routeId) {
            loadRoute(drone.routeId);
        } else {
            setRoute(null);
        }
    }, [drone.routeId]);

    const loadRoute = async (routeId: string) => {
        setIsLoadingRoute(true);
        try {
            const routeData = await routesApiService.getRouteById(routeId);
            setRoute(routeData);
        } catch (error) {
            console.error('Error loading route:', error);
        } finally {
            setIsLoadingRoute(false);
        }
    };

    const isOnline = liveDrone?.isActive || false;
    const telemetry = liveDrone?.lastLocation;

    const defaultCenter: LatLngExpression = telemetry
        ? [telemetry.latitude, telemetry.longitude]
        : [DEFAULT_CITY.latitude, DEFAULT_CITY.longitude];

    // Parsear geojson string a objeto
    const getGeoJsonData = () => {
        if (!route?.geojson) return null;
        try {
            return typeof route.geojson === 'string' ? JSON.parse(route.geojson) : route.geojson;
        } catch {
            return null;
        }
    };

    // Calcular bounds para la ruta si existe
    const getRouteBounds = (): LatLngBounds | null => {
        const geoJsonData = getGeoJsonData();
        if (!geoJsonData) return null;
        try {
            const geoJsonLayer = L.geoJSON(geoJsonData);
            return geoJsonLayer.getBounds();
        } catch {
            return null;
        }
    };

    const routeBounds = route ? getRouteBounds() : null;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col ${isExpanded ? 'fixed inset-4 z-50' : 'h-full max-h-full'}`}>
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {drone.droneName || drone.vehicleId}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {drone.model} - {isOnline ? 'En línea' : 'Sin conexión'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        <Maximize2 size={16} className="text-gray-500" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Telemetry Grid */}
            {isOnline && telemetry && (
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                                <Battery size={14} />
                                <span className="text-sm font-semibold">{telemetry.batteryLevel || '--'}%</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Batería</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                                <Navigation size={14} />
                                <span className="text-sm font-semibold">{telemetry.altitude?.toFixed(0) || '--'}m</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Altitud</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
                                <Clock size={14} />
                                <span className="text-sm font-semibold">{telemetry.speed?.toFixed(1) || '--'} m/s</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Velocidad</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400">
                                <Compass size={14} />
                                <span className="text-sm font-semibold">{telemetry.heading?.toFixed(0) || '--'}°</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Rumbo</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Route Info */}
            {drone.hasRoute && (
                <div className="px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20 flex-shrink-0">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Route size={14} />
                        <span className="text-xs font-medium">
                            {isLoadingRoute ? 'Cargando ruta...' : route?.name || 'Ruta asignada'}
                        </span>
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="flex-1 relative min-h-0">
                <MapContainer
                    center={defaultCenter}
                    zoom={15}
                    minZoom={MAP_ZOOM_CONFIG.min}
                    maxZoom={MAP_ZOOM_CONFIG.max}
                    className="w-full h-full"
                    zoomControl={true}
                >
                    <MapUpdater center={defaultCenter} bounds={routeBounds} />
                    <TileLayer
                        url={MAP_TILE_CONFIG.url}
                        attribution={MAP_TILE_CONFIG.attribution}
                        maxZoom={MAP_TILE_CONFIG.maxZoom}
                    />

                    {/* Route GeoJSON */}
                    {route?.geojson && getGeoJsonData() && (
                        <GeoJSON
                            data={getGeoJsonData()}
                            style={{
                                color: '#6366f1',
                                weight: 3,
                                opacity: 0.8,
                                fillOpacity: 0.1,
                            }}
                        />
                    )}

                    {/* Drone Trail */}
                    {liveDrone?.lastPositions && liveDrone.lastPositions.length > 1 && (
                        <Polyline
                            positions={liveDrone.lastPositions.map(pos => [pos.latitude, pos.longitude])}
                            pathOptions={{
                                color: '#3b82f6',
                                weight: 3,
                                opacity: 0.7,
                            }}
                        />
                    )}

                    {/* Drone Position */}
                    {isOnline && telemetry && (
                        <CircleMarker
                            center={[telemetry.latitude, telemetry.longitude]}
                            radius={10}
                            pathOptions={{
                                fillColor: '#3b82f6',
                                fillOpacity: 1,
                                color: '#ffffff',
                                weight: 3,
                            }}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <p className="font-bold">{drone.droneName || drone.vehicleId}</p>
                                    <div className="text-xs text-gray-600 mt-1">
                                        <div>Lat: {telemetry.latitude.toFixed(6)}</div>
                                        <div>Lng: {telemetry.longitude.toFixed(6)}</div>
                                        <div>Alt: {telemetry.altitude?.toFixed(1) || 'N/A'}m</div>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    )}
                </MapContainer>

                {/* Offline Overlay */}
                {!isOnline && (
                    <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                        <div className="text-center text-white">
                            <Signal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Dron sin conexión</p>
                            <p className="text-xs opacity-75">Esperando datos de telemetría</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Drone Details - Compact footer */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                        {drone.model} • {drone.serialNumber || drone.vehicleId}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        {drone.flightHours?.toFixed(1) || '0'}h vuelo
                    </span>
                </div>
            </div>
        </div>
    );
};
