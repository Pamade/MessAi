import type { Plugin } from 'vite';
import { copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export function copyManifestPlugin(): Plugin {
  return {
    name: 'copy-manifest',
    writeBundle() {
      const manifestPath = resolve(process.cwd(), 'manifest.json');
      const distManifestPath = resolve(process.cwd(), 'dist', 'manifest.json');
      
      if (existsSync(manifestPath)) {
        copyFileSync(manifestPath, distManifestPath);
        console.log('✓ Copied manifest.json to dist');
      }
    },
  };
}

