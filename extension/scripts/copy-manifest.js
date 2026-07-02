import fs from 'node:fs';
import path from 'node:path';

const source = path.resolve('manifest.json');
const destDir = path.resolve('dist');
const dest = path.join(destDir, 'manifest.json');

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(source, dest);
console.log('Copied manifest.json to dist/manifest.json');
