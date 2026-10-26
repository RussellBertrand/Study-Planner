   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   // https://vite.dev/config/
   export default defineConfig({
     plugins: [react()],
     // Vercel serve dari root '/', GitHub Pages butuh '/Study-Planner/'
     base: process.env.VERCEL ? '/' : '/Study-Planner/',
   })
