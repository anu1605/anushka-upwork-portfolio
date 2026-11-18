import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        emptyOutDir: true,
        outDir: 'dist/client',
        assetsDir: 'assets',
        sourcemap: false,
    },
    server: {
        port: 5173,
        strictPort: false,
    },
});
