import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const sharedCoreRoot = path.resolve(__dirname, 'packages/shared-core');

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@renderzero/shared-core': sharedCoreRoot,
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    exclude: ['@renderzero/shared-core']
  },
  server: {
    fs: {
      allow: [
        path.resolve(__dirname),
        sharedCoreRoot
      ]
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
