import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const outputDir = path.join(__dirname, 'output');

function parseEnvFile(contents) {
  const parsed = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    parsed[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
  }

  return parsed;
}

async function loadEnv() {
  const envPaths = [
    path.join(projectRoot, '.env'),
    path.join(projectRoot, '.env.local')
  ];

  const merged = {};
  for (const envPath of envPaths) {
    try {
      const contents = await fs.readFile(envPath, 'utf8');
      Object.assign(merged, parseEnvFile(contents));
    } catch (_error) {
      // ignore
    }
  }
  return merged;
}

async function readJson(fileName) {
  const fullPath = path.join(outputDir, fileName);
  return JSON.parse(await fs.readFile(fullPath, 'utf8'));
}

function buildMappingIndex(entries) {
  const map = new Map();
  for (const entry of entries) {
    map.set(entry.raw, entry.finalCanonical);
  }
  return map;
}

function normalizeArray(values, mappingIndex) {
  if (!Array.isArray(values)) return [];

  const seen = new Set();
  const normalized = [];

  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    const mapped = mappingIndex.get(trimmed) || 'Other';
    if (!seen.has(mapped)) {
      seen.add(mapped);
      normalized.push(mapped);
    }
  }

  return normalized;
}

async function main() {
  const env = await loadEnv();
  const connectionString = env.VITE_SUPABASE_DATABASE;
  if (!connectionString) {
    throw new Error('Missing VITE_SUPABASE_DATABASE in .env');
  }

  const rawExport = await readJson('community-sector-raw-export.json');
  const industryMapEntries = await readJson('industry-normalization-map.json');
  const b2bMapEntries = await readJson('b2b-industries-of-interest-normalization-map.json');
  const industryMap = buildMappingIndex(industryMapEntries);
  const b2bMap = buildMappingIndex(b2bMapEntries);

  const updates = rawExport.rows.map((row) => {
    const rawIndustry = typeof row.industry === 'string' ? row.industry.trim() : '';
    const nextIndustry = rawIndustry ? (industryMap.get(rawIndustry) || 'Other') : 'Other';
    const nextB2BIndustries = normalizeArray(row.b2bIndustriesOfInterest, b2bMap);
    return {
      id: row.id,
      nextIndustry,
      nextB2BIndustries
    };
  });

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  let updatedIndustries = 0;
  let updatedB2BProfiles = 0;

  try {
    await client.query('BEGIN');

    for (const update of updates) {
      const result = await client.query(
        `
          UPDATE public.profiles
          SET
            industry = $2,
            b2b_profile = CASE
              WHEN b2b_profile IS NULL THEN jsonb_build_object('industries_of_interest', to_jsonb($3::text[]))
              ELSE jsonb_set(b2b_profile, '{industries_of_interest}', to_jsonb($3::text[]), true)
            END
          WHERE id = $1
        `,
        [update.id, update.nextIndustry, update.nextB2BIndustries]
      );

      if (result.rowCount > 0) {
        updatedIndustries += 1;
        updatedB2BProfiles += 1;
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }

  console.log(
    JSON.stringify(
      {
        updatedProfiles: updates.length,
        updatedIndustries,
        updatedB2BProfiles
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
