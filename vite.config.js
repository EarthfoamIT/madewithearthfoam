import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Hashed build output goes to /static/ so it can be cached as immutable
    // (see vercel.json). /assets/ stays reserved for the original site's
    // un-hashed videos and PDFs in public/assets/.
    assetsDir: 'static',
  },
  optimizeDeps: {
    // Only scan the app entry. Without this, Vite also crawls the scraped
    // HTML in site/ looking for dependencies.
    entries: ['index.html'],
  },
  server: {
    watch: {
      ignored: ['**/site/**', '**/tools/**'],
    },
  },
})
