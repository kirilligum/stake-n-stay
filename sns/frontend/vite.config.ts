import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensure relative paths for assets after build
  build: {
    outDir: '../public', // Output to sns/public
    emptyOutDir: true,   // Clear public directory before build
    assetsDir: 'assets' // Place assets like CSS/JS in public/assets
  }
})
