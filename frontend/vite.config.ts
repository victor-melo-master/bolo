import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Forzar a Vite a revisar cambios de archivos si estás en Linux/WSL
    },
    hmr: {
      host: 'localhost',
    },
  },
})
