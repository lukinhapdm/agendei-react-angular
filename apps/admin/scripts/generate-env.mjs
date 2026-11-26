import { mkdirSync, writeFileSync } from 'node:fs';

// O Angular não lê .env: geramos um arquivo TS com as variáveis (Vercel ou .env.local)
const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
};

if (!env.supabaseUrl || !env.supabasePublishableKey) {
  console.warn('[generate-env] SUPABASE_URL ou SUPABASE_PUBLISHABLE_KEY não definidas');
}

mkdirSync('src/environments', { recursive: true });
writeFileSync(
  'src/environments/env.ts',
  `// Arquivo gerado por scripts/generate-env.mjs. Não edite.\nexport const env = ${JSON.stringify(env, null, 2)} as const;\n`,
);
