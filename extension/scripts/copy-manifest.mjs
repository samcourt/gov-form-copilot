import fs from 'node:fs';
import path from 'node:path';
fs.copyFileSync(path.resolve('src/manifest.json'), path.resolve('dist/manifest.json'));
