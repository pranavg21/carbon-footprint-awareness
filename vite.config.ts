import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite configuration for the CarbonTrack platform.
 *
 * @see https://vite.dev/config/
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
