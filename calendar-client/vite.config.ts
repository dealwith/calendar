import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dotenv from 'dotenv';
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: "https://calendar-backend-dealwith-1f2d47cc339b.herokuapp.com/" || 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
