import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // WAJIB untuk GitHub Pages: harus sama persis dengan nama repositori.
  // Tanpa ini, file JS/CSS akan dicari di "/" dan halaman menjadi blank (404).
  base: '/study-planner/',
})
