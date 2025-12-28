import { watch } from 'fs';
import { copyFile, mkdir } from 'fs/promises';
import { resolve } from 'path';

const manifestPath = resolve(process.cwd(), 'manifest.json');
const distPath = resolve(process.cwd(), 'dist');
const distManifestPath = resolve(distPath, 'manifest.json');

console.log('Watching manifest.json for changes...');

async function copyManifest() {
  try {
    await mkdir(distPath, { recursive: true });
    await copyFile(manifestPath, distManifestPath);
    console.log('✓ Copied manifest.json to dist');
  } catch (err) {
    console.error('Error copying manifest.json:', err);
  }
}

// Copy immediately
copyManifest();

// Watch for changes to manifest.json
watch(manifestPath, (eventType) => {
  if (eventType === 'change') {
    copyManifest();
  }
});

// Also watch dist folder - if Vite cleans it, re-copy manifest
watch(distPath, (eventType, filename) => {
  // If manifest.json was deleted from dist, re-copy it
  if (filename === 'manifest.json' && eventType === 'rename') {
    setTimeout(() => {
      copyManifest();
    }, 100); // Small delay to ensure file system is ready
  }
});

// Keep process alive
process.stdin.resume();

