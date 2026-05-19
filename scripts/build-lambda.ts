import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';

const lambdas = {
  integration: 'src/book/infrastructure/lambda/integration.handler.ts',
} as const;

type LambdaName = keyof typeof lambdas;

const forbiddenTerms = [
  '@nestjs',
  'fastify',
  'swagger',
  'app.module',
  'main.ts',
  'controller',
  'book.module',
];

function getRequestedLambdas(): LambdaName[] {
  const requested = process.argv[2] ?? 'integration';

  if (requested === 'all') {
    return Object.keys(lambdas) as LambdaName[];
  }

  if (!(requested in lambdas)) {
    throw new Error(
      `Unknown lambda "${requested}". Available: ${Object.keys(lambdas).join(
        ', ',
      )}, all`,
    );
  }

  return [requested as LambdaName];
}

function validateBundle(inputFiles: string[]): void {
  const matches = inputFiles.flatMap((file) => {
    const normalized = file.replaceAll('\\', '/').toLowerCase();

    return forbiddenTerms
      .filter((term) => normalized.includes(term.toLowerCase()))
      .map((term) => ({ file, term }));
  });

  if (matches.length > 0) {
    const details = matches
      .map((match) => `- ${match.file} matched "${match.term}"`)
      .join('\n');

    throw new Error(`Lambda bundle contains forbidden inputs:\n${details}`);
  }
}

async function buildLambda(name: LambdaName): Promise<void> {
  const entryPoint = lambdas[name];
  const outfile = `dist/lambda/${name}.handler.js`;

  const result = await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    minify: true,
    treeShaking: true,
    metafile: true,
  });

  const inputFiles = Object.keys(result.metafile.inputs).sort();

  console.log(`\nLambda "${name}" inputs:`);
  for (const file of inputFiles) {
    console.log(`- ${file}`);
  }

  validateBundle(inputFiles);

  const outputPath = join(process.cwd(), outfile);
  const sizeInBytes = existsSync(outputPath) ? statSync(outputPath).size : 0;
  const sizeInKb = (sizeInBytes / 1024).toFixed(2);

  console.log(`\nOutput: ${outfile}`);
  console.log(`Approx size: ${sizeInKb} KB`);
  console.log('Bundle validation passed');
}

async function main(): Promise<void> {
  for (const name of getRequestedLambdas()) {
    await buildLambda(name);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
