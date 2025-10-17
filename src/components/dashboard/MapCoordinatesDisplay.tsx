import { useState, useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

/**
 * Componente que muestra las coordenadas del centro del mapa
 * Se actualiza cuando el usuario mueve o hace zoom en el mapa
 */
export const MapCoordinatesDisplay = () => {
    const map = useMap();
    const [coordinates, setCoordinates] = useState({
        lat: map.getCenter().lat,
        lng: map.getCenter().lng,
        zoom: map.getZoom(),
    });

    // Actualizar coordenadas cuando el mapa se mueve o hace zoom
    useMapEvents({
        moveend: () => {
            const center = map.getCenter();
            setCoordinates({
                lat: center.lat,
                lng: center.lng,
                zoom: map.getZoom(),
            });
        },
        zoomend: () => {
            const center = map.getCenter();
            setCoordinates({
                lat: center.lat,
                lng: center.lng,
                zoom: map.getZoom(),
            });
        },
    });

    useEffect(() => {
        const center = map.getCenter();
        setCoordinates({
            lat: center.lat,
            lng: center.lng,
            zoom: map.getZoom(),
        });
    }, [map]);

    return (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-xs text-gray-700 dark:text-gray-300 z-[1000]">
            <div className="space-y-1">
                <div>
                    Lat: {coordinates.lat.toFixed(5)}°
                </div>
                <div>
                    Lng: {coordinates.lng.toFixed(5)}°
                </div>
                <div>
                    Zoom: {coordinates.zoom}
                </div>
            </div>
        </div>
    );
};