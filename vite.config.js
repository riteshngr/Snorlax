import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Force reload to resolve transformation issues
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})