import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Tailwind is configured via postcss/tailwind.config.js if present.
export default defineConfig({
  plugins: [react()],
})
