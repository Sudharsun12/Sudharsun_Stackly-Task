import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,   // if 5173 busy, use next available (5174 etc.)
    open: true,          // auto-opens browser when you run npm run dev
  }
})
