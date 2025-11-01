import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useDroneStore } from '@features/drones';
import { MapPin, Navigation } from 'lucide-react';
import { DEFAULT_CITY, MAP_TILE_CONFIG, MAP_ZOOM_CONFIG } from '@config/map.config';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';

export const MissionDroneMap = () => {
    const drones = useDroneStore((state) => state.drones);
    const activeDrones = Object.values(drones).filter(d => d.isActive);

    const defaultCenter: LatLngExpression = [DEFAULT_CITY.latitude, DEFAULT_CITY.longitude];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin size={20} className="text-primary" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Posiciones de Drones
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {activeDrones.length} {activeDrones.length === 1 ? 'Drone' : 'Drones'}
                    </span>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                {activeDrones.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-b-lg">
                        <div className="text-center">
                            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400">
                                Sin datos de ubicación
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                Esperando mensajes MQTT...
                            </p>
                        </div>
                    </div>
                ) : (
                    <MapContainer
                        center={defaultCenter}
                        zoom={MAP_ZOOM_CONFIG.default}
                        minZoom={MAP_ZOOM_CONFIG.min}
                        maxZoom={MAP_ZOOM_CONFIG.max}
                        className="w-full h-full rounded-b-lg"
                        zoomControl={true}
                    >
                        <TileLayer
                            url={MAP_TILE_CONFIG.url}
                            attribution={MAP_TILE_CONFIG.attribution}
                            maxZoom={MAP_TILE_CONFIG.maxZoom}
                        />

                        {activeDrones.map((drone) => {
                            const position: LatLngExpression = [
                                drone.lastLocation.latitude,
                                drone.lastLocation.longitude,
                            ];

                            return (
                                <CircleMarker
                                    key={drone.vehicleId}
                                    center={position}
                                    radius={8}
                                    pathOptions={{
                                        fillColor: '#10b981',
                                        fillOpacity: 1,
                                        color: '#ffffff',
                                        weight: 2,
                                    }}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-bold text-gray-900">
                                                {drone.vehicleId}
                                            </p>
                                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                                <div>Alt: {drone.lastLocation.altitude?.toFixed(1) || 'N/A'}m</div>
                                                <div>Vel: {drone.lastLocation.speed?.toFixed(1) || 'N/A'} m/s</div>
                                                <div>Bat: {drone.batteryLevel || 'N/A'}%</div>
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                )}
            </div>

            {/* Drone List */}
            {activeDrones.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                    <div className="space-y-1">
                        {activeDrones.map((drone) => (
                            <div
                                key={drone.vehicleId}
                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {drone.vehicleId}
                                </span>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <span>Alt: {drone.lastLocation.altitude?.toFixed(0) || 'N/A'}m</span>
                                    <span>Bat: {drone.batteryLevel || 'N/A'}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
