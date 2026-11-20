import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import chatbotSample from './dev/chatbotSample.js'
import orderTrackingSample from './dev/orderTrackingSample.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  return {
    plugins: [
      react(),
      // Dev-only stand-ins for the API's /ordertracking and /chatbot endpoints.
      orderTrackingSample(env.ORDER_TRACKING_SAMPLE_DB),
      chatbotSample(env),
    ],
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
  }
})
