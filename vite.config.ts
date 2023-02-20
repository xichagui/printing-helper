import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : "./",
  plugins: [react()],
  define: {
    "process.env": {},
  },
  server:{
    port:5173
  }
})
