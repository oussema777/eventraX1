import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'scripts-output');

const TAXONOMY = [
  'Technology & Software',
  'AI, IoT & Emerging Tech',
  'Telecommunications',
  'Marketing & Advertising',
  'Sales & Business Development',
  'Financial Services & Banking',
  'Investment & Private Equity',
  'Accounting & Audit',
  'Legal Services',
  'Consulting & Professional Services',
  'Education & Training',
  'Research & Academia',
  'Government & Public Sector',
  'Non-Profit & Civil Society',
  'Healthcare & Pharmaceuticals',
  'Biotechnology & Life Sciences',
  'Agriculture & Agritech',
  'Manufacturing & Production',
  'Retail & E-commerce',
  'Logistics & Supply Chain',
  'Media & Communications',
  'Events, Hospitality & Tourism',
  'Real Estate & Construction',
  'Energy & Utilities',
  'Insurance',
  'Human Resources & Recruitment',
  'Automotive & Mobility',
  'Fashion & Beauty',
  'Food & Beverage',
  'Arts & Creative Industries',
  'Security & Defense',
  'Mining & Metals',
  'Sports & Entertainment',
  'Environmental Services',
  'Aviation & Maritime',
  'Consumer Goods',
  'Religious & Community Organizations',
  'Public Safety & Emergency Services',
  'Entrepreneurs & Startups',
  'Developers & Engineers',
  'Other'
];

const EXACT_MAP = new Map(
  TAXONOMY.map((value) => [normalize(value), value])
);

const ROLE_DEFAULTS = [
  { pattern: /\b(student|etudiant|étudiant|learner|apprenant)\b/i, sector: 'Education & Training', weight: 8 },
  { pattern: /\b(professor|professeur|teacher|enseignant|enseignante|trainer|coach)\b/i, sector: 'Education & Training', weight: 10 },
  { pattern: /\b(researcher|research|phd|doctoral|academi|universit|laboratory|lab)\b/i, sector: 'Research & Academia', weight: 10 },
  { pattern: /\b(consultant|consultante|advisor|advisory|expert)\b/i, sector: 'Consulting & Professional Services', weight: 8 },
  { pattern: /\b(hr|human resources|recruit|talent|employability)\b/i, sector: 'Human Resources & Recruitment', weight: 9 },
  { pattern: /\b(marketing|seo|brand|communication|communications|community manager|advertising|publicit)\b/i, sector: 'Marketing & Advertising', weight: 10 },
  { pattern: /\b(sales|commercial|business development|account manager|account executive)\b/i, sector: 'Sales & Business Development', weight: 10 },
  { pattern: /\b(finance|financial|bank|banking|invest|trader|financier)\b/i, sector: 'Financial Services & Banking', weight: 10 },
  { pattern: /\b(accounting|accountant|audit|auditor|comptable|comptabilit)\b/i, sector: 'Accounting & Audit', weight: 10 },
  { pattern: /\b(legal|law|lawyer|attorney|avocat|juridique|compliance)\b/i, sector: 'Legal Services', weight: 10 },
  { pattern: /\b(engineer|engineering|developer|software|programmer|informatique|it\b|ict\b|web|full stack|frontend|backend)\b/i, sector: 'Technology & Software', weight: 10 },
  { pattern: /\b(ai|artificial intelligence|machine learning|data scientist|iot|robotics|automation)\b/i, sector: 'AI, IoT & Emerging Tech', weight: 11 },
  { pattern: /\b(telecom|telecommunication|network)\b/i, sector: 'Telecommunications', weight: 10 },
  { pattern: /\b(designer|creative|artist|artistic|photograph|videograph|media production|audio visual|audiovisual)\b/i, sector: 'Arts & Creative Industries', weight: 10 },
  { pattern: /\b(product designer|ux|ui)\b/i, sector: 'Arts & Creative Industries', weight: 8 },
  { pattern: /\b(pharma|pharmaceutical|doctor|medical|clinic|hospital|health|healthcare|nurse|dentist)\b/i, sector: 'Healthcare & Pharmaceuticals', weight: 10 },
  { pattern: /\b(biotech|biotechnology|life science)\b/i, sector: 'Biotechnology & Life Sciences', weight: 10 },
  { pattern: /\b(agri|agro|agriculture|farmer|farming|apiculture|beekeeper|permaculture|zra|زراع|فلاح)\b/i, sector: 'Agriculture & Agritech', weight: 10 },
  { pattern: /\b(factory|manufacturing|production|industrial|industrie|technicien|mechanic)\b/i, sector: 'Manufacturing & Production', weight: 10 },
  { pattern: /\b(retail|e-commerce|ecommerce|commerce|shop|store|merchand)\b/i, sector: 'Retail & E-commerce', weight: 10 },
  { pattern: /\b(logistics|supply chain|freight|shipping|transport)\b/i, sector: 'Logistics & Supply Chain', weight: 10 },
  { pattern: /\b(journalist|media|publisher|publishing|public relations|press)\b/i, sector: 'Media & Communications', weight: 10 },
  { pattern: /\b(event|events|hospitality|tourism|hotel|restaurant|catering)\b/i, sector: 'Events, Hospitality & Tourism', weight: 10 },
  { pattern: /\b(architect|construction|property|real estate|interior)\b/i, sector: 'Real Estate & Construction', weight: 10 },
  { pattern: /\b(energy|solar|renewable|waste|utilities)\b/i, sector: 'Energy & Utilities', weight: 10 },
  { pattern: /\b(insurance|assurance)\b/i, sector: 'Insurance', weight: 10 },
  { pattern: /\b(automotive|mobility|vehicle|transport tech)\b/i, sector: 'Automotive & Mobility', weight: 10 },
  { pattern: /\b(fashion|beauty|cosmetic|textile)\b/i, sector: 'Fashion & Beauty', weight: 10 },
  { pattern: /\b(food|beverage|bakery|baker|chef|cuisine|mouneh|مونة|مناقيش|خباز)\b/i, sector: 'Food & Beverage', weight: 10 },
  { pattern: /\b(non-profit|non profit|ngo|association|civil society)\b/i, sector: 'Non-Profit & Civil Society', weight: 10 },
  { pattern: /\b(government|public sector|ministry|municipal|state)\b/i, sector: 'Government & Public Sector', weight: 10 },
  { pattern: /\b(entrepreneur|startup|founder|co-founder|cofounder|co fondateur|business owner|owner|ceo|c e o|managing director|gerant|gerante|gérant|gérante|fondatrice|fondateur|cofondatrice|cofondateur|pdg|president|président|presidente|présidente|directeur general|directeur général|business manager|operations manager|executive director|promotrice|proprietaire|propriétaire)\b/i, sector: 'Entrepreneurs & Startups', weight: 7 },
  { pattern: /\b(athlete|sport|sports|fitness|entertainment)\b/i, sector: 'Sports & Entertainment', weight: 9 },
  { pattern: /\b(environment|environmental|sustainability|climate)\b/i, sector: 'Environmental Services', weight: 9 },
  { pattern: /\b(security|cybersecurity|defense|defence)\b/i, sector: 'Security & Defense', weight: 10 },
  { pattern: /\b(public relation|public relations)\b/i, sector: 'Media & Communications', weight: 8 },
  { pattern: /\b(export|import)\b/i, sector: 'Sales & Business Development', weight: 7 },
  { pattern: /\b(quality|controle qualite|contrôle qualité|rmq)\b/i, sector: 'Manufacturing & Production', weight: 7 },
  { pattern: /\b(organisation|organization|association)\b/i, sector: 'Non-Profit & Civil Society', weight: 6 },
  { pattern: /مؤسس|مالك|رئيس|مدير/i, sector: 'Entrepreneurs & Startups', weight: 7 },
  { pattern: /خباز|فرن|مناقيش|مونة/i, sector: 'Food & Beverage', weight: 10 },
  { pattern: /دكان|متجر/i, sector: 'Retail & E-commerce', weight: 9 }
];

const COMPANY_HINTS = [
  { pattern: /\b(university|universit|school|academy|institute|institut|college|faculty)\b/i, sector: 'Education & Training', weight: 10 },
  { pattern: /\b(lab|laboratory|research)\b/i, sector: 'Research & Academia', weight: 9 },
  { pattern: /\b(bank|finance|capital|invest|holding)\b/i, sector: 'Financial Services & Banking', weight: 9 },
  { pattern: /\b(legal|law|attorney|avocat)\b/i, sector: 'Legal Services', weight: 8 },
  { pattern: /\b(tech|software|digital|systems|solutions|informatics|informatique|it\b)\b/i, sector: 'Technology & Software', weight: 9 },
  { pattern: /\b(media|studio|creative|design|production)\b/i, sector: 'Arts & Creative Industries', weight: 8 },
  { pattern: /\b(food|bakery|restaurant|cafe|kitchen)\b/i, sector: 'Food & Beverage', weight: 8 },
  { pattern: /\b(farm|agri|agro)\b/i, sector: 'Agriculture & Agritech', weight: 8 },
  { pattern: /\b(factory|manufacturing|industry|industrial)\b/i, sector: 'Manufacturing & Production', weight: 8 },
  { pattern: /\b(logistics|shipping|freight|transport)\b/i, sector: 'Logistics & Supply Chain', weight: 8 },
  { pattern: /\b(hospital|clinic|medical|health|pharma)\b/i, sector: 'Healthcare & Pharmaceuticals', weight: 8 },
  { pattern: /\b(ngo|association|foundation)\b/i, sector: 'Non-Profit & Civil Society', weight: 8 },
  { pattern: /\b(government|ministry|municipality|public|mesrs|mefp)\b/i, sector: 'Government & Public Sector', weight: 8 },
  { pattern: /\b(consulting|consult)\b/i, sector: 'Consulting & Professional Services', weight: 8 },
  { pattern: /\b(food|foods|taste|bakery|pain|mare|kitchen)\b/i, sector: 'Food & Beverage', weight: 8 },
  { pattern: /\b(deco|decor|design|ceram|ceramic|flowers|handmade|artisan|artisanal|gallery)\b/i, sector: 'Arts & Creative Industries', weight: 8 },
  { pattern: /\b(mode|abaya|fashion|accessoires|accessories|boutique)\b/i, sector: 'Fashion & Beauty', weight: 8 },
  { pattern: /\b(export|import)\b/i, sector: 'Sales & Business Development', weight: 7 },
  { pattern: /\b(industri|industrial|embal|pack|atelier|electrical|dry foods|sechage|séchage)\b/i, sector: 'Manufacturing & Production', weight: 8 },
  { pattern: /\b(entrepreneurs?|startup)\b/i, sector: 'Entrepreneurs & Startups', weight: 7 },
  { pattern: /\b(agric|agro|smsa)\b/i, sector: 'Agriculture & Agritech', weight: 8 },
  { pattern: /دكان|مفروشات|معرض/i, sector: 'Retail & E-commerce', weight: 8 },
  { pattern: /فرن|مناقيش|مونة|مجفف/i, sector: 'Food & Beverage', weight: 8 }
];

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[\u2019']/g, '')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseEnv(contents) {
  const parsed = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    parsed[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return parsed;
}

async function loadEnv() {
  const envPaths = [path.join(projectRoot, '.env'), path.join(projectRoot, '.env.local')];
  const merged = {};
  for (const envPath of envPaths) {
    try {
      const contents = await fs.readFile(envPath, 'utf8');
      Object.assign(merged, parseEnv(contents));
    } catch {}
  }
  return merged;
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
}

function collectTexts(profile) {
  const professionalData = profile.professional_data || {};
  const b2bProfile = profile.b2b_profile || {};

  return [
    { text: profile.industry, source: 'industry', weight: 9 },
    { text: professionalData.industry_other, source: 'industry_other', weight: 9 },
    { text: profile.job_title, source: 'job_title', weight: 8 },
    { text: profile.company, source: 'company', weight: 5 },
    { text: profile.bio, source: 'bio', weight: 6 },
    ...asStringArray(professionalData.skills).map((text) => ({ text, source: 'skills', weight: 6 })),
    ...asStringArray(professionalData.interests).map((text) => ({ text, source: 'interests', weight: 5 })),
    ...asStringArray(professionalData.meetingTopics).map((text) => ({ text, source: 'meetingTopics', weight: 4 })),
    ...asStringArray(professionalData.industriesOfInterest).map((text) => ({ text, source: 'professionalIndustries', weight: 8 })),
    ...asStringArray(b2bProfile.industries_of_interest).map((text) => ({ text, source: 'b2bIndustries', weight: 10 })),
    ...asStringArray(b2bProfile.industries).map((text) => ({ text, source: 'b2bIndustriesLegacy', weight: 8 })),
    ...asStringArray(b2bProfile.topics).map((text) => ({ text, source: 'b2bTopics', weight: 4 })),
    ...asStringArray(b2bProfile.meeting_topics).map((text) => ({ text, source: 'meeting_topics', weight: 4 })),
    ...asStringArray(b2bProfile.lookingFor).map((text) => ({ text, source: 'lookingFor', weight: 3 })),
    ...asStringArray(b2bProfile.meeting_goals).map((text) => ({ text, source: 'meeting_goals', weight: 3 }))
  ].filter((entry) => typeof entry.text === 'string' && entry.text.trim());
}

function scoreProfile(profile) {
  const scores = new Map(TAXONOMY.map((sector) => [sector, 0]));
  const reasons = new Map(TAXONOMY.map((sector) => [sector, []]));
  const texts = collectTexts(profile);

  function addScore(sector, amount, reason) {
    scores.set(sector, (scores.get(sector) || 0) + amount);
    reasons.get(sector).push(reason);
  }

  for (const entry of texts) {
    const normalized = normalize(entry.text);
    const exact = EXACT_MAP.get(normalized);
    if (exact && exact !== 'Other') {
      addScore(exact, entry.weight + 6, `${entry.source}: exact "${entry.text}"`);
    }

    for (const rule of ROLE_DEFAULTS) {
      if (rule.pattern.test(entry.text) || rule.pattern.test(normalized)) {
        addScore(rule.sector, rule.weight + Math.max(entry.weight - 3, 0), `${entry.source}: ${entry.text}`);
      }
    }

    if (entry.source === 'company') {
      for (const rule of COMPANY_HINTS) {
        if (rule.pattern.test(entry.text) || rule.pattern.test(normalized)) {
          addScore(rule.sector, rule.weight, `${entry.source}: ${entry.text}`);
        }
      }
    }
  }

  if (!texts.length) {
    addScore('Other', 1, 'no-usable-data');
  }

  const ranked = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const [topSector, topScore] = ranked[0];
  const secondScore = ranked[1]?.[1] || 0;

  let primary = topSector;
  if (topScore <= 0) {
    primary = 'Other';
  } else if (topSector === 'Other' && secondScore > 0) {
    primary = ranked[1][0];
  }

  const related = ranked
    .filter(([sector, score]) => sector !== 'Other' && score >= Math.max(6, topScore - 6))
    .slice(0, 3)
    .map(([sector]) => sector);

  if (primary !== 'Other' && !related.includes(primary)) {
    related.unshift(primary);
  }

  return {
    primary,
    related: related.slice(0, 3),
    ranked: ranked.filter(([, score]) => score > 0).slice(0, 5).map(([sector, score]) => ({
      sector,
      score,
      reasons: reasons.get(sector).slice(0, 5)
    }))
  };
}

async function main() {
  const env = await loadEnv();
  const connectionString = env.VITE_SUPABASE_DATABASE;
  if (!connectionString) {
    throw new Error('Missing VITE_SUPABASE_DATABASE');
  }

  await fs.mkdir(outputDir, { recursive: true });

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const { rows } = await client.query(`
      SELECT id, full_name, industry, job_title, company, bio, professional_data, b2b_profile
      FROM public.profiles
      ORDER BY created_at ASC NULLS LAST, id ASC
    `);

    const beforeCounts = new Map();
    const afterCounts = new Map();
    const reportRows = [];

    await client.query('BEGIN');

    for (const row of rows) {
      const before = (row.industry || '').trim() || 'Other';
      beforeCounts.set(before, (beforeCounts.get(before) || 0) + 1);

      const result = scoreProfile(row);
      const nextIndustry = result.primary || 'Other';
      const nextRelated = result.related || [];

      afterCounts.set(nextIndustry, (afterCounts.get(nextIndustry) || 0) + 1);

      await client.query(
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
        [row.id, nextIndustry, nextRelated]
      );

      reportRows.push({
        id: row.id,
        full_name: row.full_name,
        previousIndustry: before,
        nextIndustry,
        relatedIndustries: nextRelated,
        job_title: row.job_title,
        company: row.company,
        ranked: result.ranked
      });
    }

    await client.query('COMMIT');

    const sortCounts = (map) =>
      Array.from(map.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([sector, count]) => ({ sector, count }));

    const summary = {
      generatedAt: new Date().toISOString(),
      totalProfiles: rows.length,
      beforeCounts: sortCounts(beforeCounts),
      afterCounts: sortCounts(afterCounts)
    };

    await fs.writeFile(path.join(outputDir, 'industry-reclassification-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
    await fs.writeFile(path.join(outputDir, 'industry-reclassification-report.json'), `${JSON.stringify(reportRows, null, 2)}\n`);

    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
