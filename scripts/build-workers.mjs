import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('public/workers',{recursive:true});
await build({entryPoints:{export:'lib/plume/export.worker.tsx',search:'lib/plume/search.worker.ts'},outdir:'public/workers',bundle:true,format:'esm',platform:'browser',target:'es2022',jsx:'automatic',minify:true,define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
for(const name of ['maplibre-gl-worker.mjs','maplibre-gl-shared.mjs'])await copyFile('node_modules/maplibre-gl/dist/'+name,'public/workers/'+name);
console.log('Prepared browser workers for reports, search, and maps.');
