import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [
      react(),
      {
        name: 'copy-public-images',
        apply: 'build',
        enforce: 'post',
        generateBundle() {
          // Copy public/images to dist/images after build
          const publicImagesDir = path.join(process.cwd(), 'public', 'images');
          const distImagesDir = path.join(process.cwd(), 'dist', 'images');
          
          try {
            // Copy the entire images directory recursively
            const copyDir = (src: string, dest: string) => {
              fs.mkdirSync(dest, { recursive: true });
              const files = fs.readdirSync(src);
              files.forEach((file: string) => {
                const srcPath = path.join(src, file);
                const destPath = path.join(dest, file);
                const stat = fs.statSync(srcPath);
                if (stat.isDirectory()) {
                  copyDir(srcPath, destPath);
                } else {
                  fs.copyFileSync(srcPath, destPath);
                }
              });
            };
            copyDir(publicImagesDir, distImagesDir);
            console.log('✓ Successfully copied public/images to dist/images');
          } catch (err) {
            console.warn('⚠ Could not copy public/images to dist');
          }
        }
      }
    ],
    base: './', // Use relative paths for Electron
    define: {
      // Polyfill process.env.API_KEY so the app works locally
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  }
})