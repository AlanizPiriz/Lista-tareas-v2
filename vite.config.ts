import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // carpeta donde Vercel espera los archivos
    emptyOutDir: true, // limpia la carpeta dist antes de build
  },
  base: './', // rutas relativas para que funcione en producción
})
