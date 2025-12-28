import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { copyManifestPlugin } from './vite-plugin-copy-manifest'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    copyManifestPlugin(),
    {
      name: 'move-popup-html',
      writeBundle() {
        // Move popup.html from dist/src/popup.html to dist/popup.html
        const srcPath = resolve(process.cwd(), 'dist', 'src', 'popup.html');
        const destPath = resolve(process.cwd(), 'dist', 'popup.html');
        if (existsSync(srcPath)) {
          let htmlContent = readFileSync(srcPath, 'utf-8');
          // Fix paths to be relative (remove leading slashes and any base path)
          htmlContent = htmlContent.replace(/src="[^"]*\/popup\.js"/g, 'src="popup.js"');
          htmlContent = htmlContent.replace(/href="[^"]*\/popup\.css"/g, 'href="popup.css"');
          writeFileSync(destPath, htmlContent, 'utf-8');
          console.log('✓ Moved and fixed popup.html to dist root');
        }
      },
    },
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        popup: resolve(__dirname, 'src/popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Don't hash HTML and CSS files for Chrome extension compatibility
          const name = assetInfo.name || '';
          if (name.endsWith('.html') || name.endsWith('.css')) {
            return '[name][extname]';
          }
          return '[name]-[hash][extname]';
        },
        dir: 'dist',
      },
    },
  },
})
