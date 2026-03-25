import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const outputDir = path.join(__dirname, 'output');
const pageSize = 1000;

function parseEnvFile(contents) {
  const parsed = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    parsed[key] = value;
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
      // Ignore missing env files.
    }
  }

  return merged;
}

function toArrayOfStrings(values) {
  if (!Array.isArray(values)) return [];

  return values
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);
}

function bumpCount(map, value, profileId) {
  const current = map.get(value) || { value, count: 0, profileIds: [] };
  current.count += 1;
  current.profileIds.push(profileId);
  map.set(value, current);
}

async function main() {
  const env = await loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const rows = [];
  const industryCounts = new Map();
  const b2bIndustryCounts = new Map();
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, industry, b2b_profile')
      .range(from, to);

    if (error) {
      throw error;
    }

    const batch = data || [];
    for (const profile of batch) {
      const industry = typeof profile.industry === 'string' ? profile.industry.trim() : '';
      const b2bIndustries = toArrayOfStrings(profile?.b2b_profile?.industries_of_interest);

      rows.push({
        id: profile.id,
        industry,
        b2bIndustriesOfInterest: b2bIndustries
      });

      if (industry) {
        bumpCount(industryCounts, industry, profile.id);
      }

      for (const value of b2bIndustries) {
        bumpCount(b2bIndustryCounts, value, profile.id);
      }
    }

    if (batch.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  const sortByCountThenValue = (a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.value.localeCompare(b.value, undefined, { sensitivity: 'base' });
  };

  const serializeCounts = (map) =>
    Array.from(map.values())
      .sort(sortByCountThenValue)
      .map((entry) => ({
        value: entry.value,
        count: entry.count,
        profileIds: entry.profileIds
      }));

  await fs.mkdir(outputDir, { recursive: true });

  const rawExport = {
    generatedAt: new Date().toISOString(),
    totalProfiles: rows.length,
    filledIndustryProfiles: rows.filter((row) => row.industry).length,
    filledB2BIndustryProfiles: rows.filter((row) => row.b2bIndustriesOfInterest.length > 0).length,
    rows
  };

  const industryExport = {
    generatedAt: rawExport.generatedAt,
    uniqueCount: industryCounts.size,
    values: serializeCounts(industryCounts)
  };

  const b2bExport = {
    generatedAt: rawExport.generatedAt,
    uniqueCount: b2bIndustryCounts.size,
    values: serializeCounts(b2bIndustryCounts)
  };

  await fs.writeFile(
    path.join(outputDir, 'community-sector-raw-export.json'),
    `${JSON.stringify(rawExport, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(outputDir, 'industry-raw-values.json'),
    `${JSON.stringify(industryExport, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(outputDir, 'b2b-industries-of-interest-raw-values.json'),
    `${JSON.stringify(b2bExport, null, 2)}\n`
  );

  console.log(
    JSON.stringify(
      {
        outputDir,
        totalProfiles: rawExport.totalProfiles,
        uniqueIndustryValues: industryExport.uniqueCount,
        uniqueB2BIndustryValues: b2bExport.uniqueCount
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
