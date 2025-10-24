import { DivIcon } from 'leaflet';

interface DroneIconOptions {
    vehicleId: string;
    heading: number;
    isSelected: boolean;
}

/**
 * Crea un icono SVG personalizado para el marcador del dron
 * Incluye una flecha que apunta en la dirección del heading
 */
export const createDroneIcon = ({ vehicleId, heading, isSelected }: DroneIconOptions): DivIcon => {
    const color = isSelected ? '#3b82f6' : '#10b981';
    const size = isSelected ? 40 : 32;

    const svgIcon = `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Círculo exterior -->
            <circle 
                cx="50" 
                cy="50" 
                r="35" 
                fill="${color}" 
                stroke="white" 
                stroke-width="4"
                opacity="0.9"
            />
            
            <!-- Flecha indicando dirección -->
            <g transform="rotate(${heading} 50 50)">
                <path 
                    d="M 50 20 L 60 45 L 50 40 L 40 45 Z" 
                    fill="white"
                    opacity="0.95"
                />
            </g>
            
            <!-- Texto del ID (opcional, solo si es corto) -->
            ${vehicleId.length <= 3 ? `
                <text 
                    x="50" 
                    y="62" 
                    text-anchor="middle" 
                    font-size="14" 
                    font-weight="bold" 
                    fill="white"
                    opacity="0.9"
                >
                    ${vehicleId}
                </text>
            ` : ''}
        </svg>
    `;

    return new DivIcon({
        html: svgIcon,
        className: 'drone-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
};