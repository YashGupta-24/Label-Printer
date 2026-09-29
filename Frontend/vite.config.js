import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  server: {
    host: true, // Listens on all network addresses (0.0.0.0)
    port: 5173
  },
  plugins: [
    basicSsl(),
    react(),
    tailwindcss(),
  ],
})