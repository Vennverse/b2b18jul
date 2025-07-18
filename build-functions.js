import { build } from 'esbuild';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildFunctions() {
  const functionFiles = await glob('netlify/functions/*.ts');
  
  const builds = functionFiles.map(file => 
    build({
      entryPoints: [file],
      bundle: true,
      outfile: file.replace('.ts', '.js'),
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      external: ['@netlify/functions'],
      minify: true,
    })
  );

  await Promise.all(builds);
  console.log('✓ Functions built successfully');
}

buildFunctions().catch(console.error);