import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            // Feature-First Architecture
            '@features': path.resolve(__dirname, './src/features'),
            '@core': path.resolve(__dirname, './src/core'),
            '@shared': path.resolve(__dirname, './src/shared'),
            // Aliases de compatibilidad temporal
            '@store': path.resolve(__dirname, './src/core/store'),
            '@router': path.resolve(__dirname, './src/core/router'),
            '@config': path.resolve(__dirname, './src/core/config'),
            '@components': path.resolve(__dirname, './src/components'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@services': path.resolve(__dirname, './src/services'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@utils': path.resolve(__dirname, './src/shared/utils'),
            '@types': path.resolve(__dirname, './src/shared/types'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'keycloak-vendor': ['keycloak-js'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    server: {
        port: 3000,
        open: true,
    },
});