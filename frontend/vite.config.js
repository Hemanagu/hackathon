import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  optimizeDeps: {
    // MediaPipe ships its own WASM — must not be pre-bundled by Vite
    exclude: ['@mediapipe/tasks-vision'],
  },
})
