import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // WAJIB untuk GitHub Pages: harus sama persis dengan nama repositori.
  // URL: https://RussellBertrand.github.io/Study-Planner/
  base: '/Study-Planner/',
})
