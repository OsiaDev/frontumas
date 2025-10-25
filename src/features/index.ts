/**
 * Features Index - Exporta todas las features de la aplicación
 *
 * Arquitectura Feature-First:
 * - Cada feature es auto-contenida
 * - Exporta solo su API pública
 * - Oculta detalles de implementación
 */

// Auth Feature
export * from './auth';

// Drones Feature
export * from './drones';

// Tracking Feature
export * from './tracking';
