import { useState, useEffect, useRef } from 'react';

export interface Position {
    latitude: number;
    longitude: number;
}

interface SmoothPositionOptions {
    duration?: number; // Duración de la animación en ms
    enabled?: boolean; // Habilitar/deshabilitar interpolación
}

/**
 * Hook que interpola suavemente entre posiciones de un dron
 * para evitar saltos bruscos en el mapa
 */
export const useSmoothDronePosition = (
    targetPosition: Position,
    options: SmoothPositionOptions = {}
) => {
    const { duration = 1000, enabled = true } = options;

    const [currentPosition, setCurrentPosition] = useState<Position>(targetPosition);
    const animationFrameRef = useRef<number>();
    const startPositionRef = useRef<Position>(targetPosition);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        // Si la interpolación está deshabilitada, actualizar directamente
        if (!enabled) {
            setCurrentPosition(targetPosition);
            return;
        }

        // Si es la primera posición o el dron está muy lejos, saltar directamente
        const distance = getDistance(currentPosition, targetPosition);
        if (distance > 0.1) {
            // Si está a más de ~11km, saltar directamente (probablemente es un nuevo dron o un salto grande)
            setCurrentPosition(targetPosition);
            startPositionRef.current = targetPosition;
            return;
        }

        // Iniciar animación suave
        startPositionRef.current = currentPosition;
        startTimeRef.current = Date.now();

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Usar easing function para suavizar el movimiento (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);

            const interpolated = {
                latitude: lerp(startPositionRef.current.latitude, targetPosition.latitude, eased),
                longitude: lerp(startPositionRef.current.longitude, targetPosition.longitude, eased),
            };

            setCurrentPosition(interpolated);

            // Continuar animando si no hemos llegado al final
            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [targetPosition.latitude, targetPosition.longitude, duration, enabled]);

    return currentPosition;
};

// Interpolación lineal
function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

// Calcular distancia aproximada entre dos puntos (en grados)
function getDistance(pos1: Position, pos2: Position): number {
    const latDiff = pos1.latitude - pos2.latitude;
    const lonDiff = pos1.longitude - pos2.longitude;
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
}
