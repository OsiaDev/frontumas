import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDroneTracking } from '@features/tracking/hooks/useDroneTracking';
import { MapPin, Navigation } from 'lucide-react';

// Token de Mapbox - Reemplazar con el token de tu proyecto
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const MissionDroneMap = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
    const { drones } = useDroneTracking();
    const [mapLoaded, setMapLoaded] = useState(false);

    // Inicializar mapa
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [-74.0721, 4.7110], // Bogotá, Colombia
            zoom: 11,
            pitch: 45,
            bearing: 0,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            setMapLoaded(true);
        });

        return () => {
            markers.current.forEach(marker => marker.remove());
            markers.current.clear();
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Actualizar marcadores de drones
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Remover marcadores de drones que ya no existen
        markers.current.forEach((marker, vehicleId) => {
            if (!drones.some(d => d.vehicleId === vehicleId)) {
                marker.remove();
                markers.current.delete(vehicleId);
            }
        });

        // Actualizar o crear marcadores para cada drone
        drones.forEach(drone => {
            if (!drone.latitude || !drone.longitude) return;

            const existingMarker = markers.current.get(drone.vehicleId);

            if (existingMarker) {
                // Actualizar posición del marcador existente
                existingMarker.setLngLat([drone.longitude, drone.latitude]);
            } else {
                // Crear nuevo marcador
                const el = document.createElement('div');
                el.className = 'drone-marker';
                el.innerHTML = `
                    <div class="relative">
                        <div class="absolute -inset-2 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                        <div class="relative bg-blue-500 rounded-full p-2 shadow-lg border-2 border-white">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/>
                            </svg>
                        </div>
                    </div>
                `;

                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                    <div class="p-2">
                        <div class="font-bold text-sm mb-1">${drone.vehicleId}</div>
                        <div class="text-xs text-gray-600">
                            <div>Alt: ${drone.altitude ? `${drone.altitude.toFixed(1)}m` : 'N/A'}</div>
                            <div>Vel: ${drone.speed ? `${drone.speed.toFixed(1)} m/s` : 'N/A'}</div>
                            <div>Bat: ${drone.battery ? `${drone.battery}%` : 'N/A'}</div>
                        </div>
                    </div>
                `);

                const marker = new mapboxgl.Marker(el)
                    .setLngLat([drone.longitude, drone.latitude])
                    .setPopup(popup)
                    .addTo(map.current!);

                markers.current.set(drone.vehicleId, marker);
            }
        });

        // Centrar el mapa en los drones si hay al menos uno
        if (drones.length > 0 && drones[0].latitude && drones[0].longitude) {
            const bounds = new mapboxgl.LngLatBounds();
            drones.forEach(drone => {
                if (drone.latitude && drone.longitude) {
                    bounds.extend([drone.longitude, drone.latitude]);
                }
            });

            if (!bounds.isEmpty()) {
                map.current?.fitBounds(bounds, { padding: 50, maxZoom: 14 });
            }
        }
    }, [drones, mapLoaded]);

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
                        {drones.length} {drones.length === 1 ? 'Drone' : 'Drones'}
                    </span>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                <div ref={mapContainer} className="absolute inset-0" />

                {/* Overlay de carga */}
                {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-400">Cargando mapa...</p>
                        </div>
                    </div>
                )}

                {/* Overlay de sin drones */}
                {mapLoaded && drones.length === 0 && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                        <div className="flex items-center gap-2">
                            <Navigation size={16} />
                            <span>No hay drones conectados</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Drone List */}
            {drones.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                    <div className="space-y-1">
                        {drones.map((drone) => (
                            <div
                                key={drone.vehicleId}
                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {drone.vehicleId}
                                </span>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <span>Alt: {drone.altitude ? `${drone.altitude.toFixed(0)}m` : 'N/A'}</span>
                                    <span>Bat: {drone.battery ? `${drone.battery}%` : 'N/A'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
