import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Extract just the host and port (e.g. http://localhost:8081) from the base URL
  // If the env variable isn't set, default to 8081 just in case
  const targetUrl = env.VITE_BACKEND_BASE_URL 
    ? env.VITE_BACKEND_BASE_URL.replace(/\/api\/?$/, '') 
    : 'http://localhost:8081';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
        }
      }
    }
  }
})
