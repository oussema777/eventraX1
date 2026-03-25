import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, 'output');
const rawExportPath = path.join(outputDir, 'community-sector-raw-export.json');
const maxCanonicalIndustries = 40;
const fixedIndustryTaxonomy = [
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
  'Developers & Engineers'
];

const shortAllowList = new Set(['ai', 'ar', 'bi', 'hr', 'it', 'pr', 'qa', 'ui', 'ux', 'vr']);
const directNoiseValues = new Set([
  '',
  '-',
  '--',
  'n/a',
  'na',
  'none',
  'null',
  'nil',
  'unknown',
  'undefined',
  'other',
  'others',
  'sample',
  'test',
  'testing',
  'demo',
  'temp',
  'tmp',
  'aaa',
  'aa',
  'a',
  'abc',
  'asdf',
  'qwerty',
  'nil'
]);

const exactRolePhrases = new Set([
  'ceo',
  'chief executive officer',
  'founder',
  'co founder',
  'co-founder',
  'owner',
  'manager',
  'director',
  'executive',
  'developer',
  'engineer',
  'designer',
  'consultant',
  'student',
  'freelancer',
  'intern'
]);

const roleWords = new Set([
  'adjoint',
  'administratif',
  'account',
  'administrator',
  'advisor',
  'analyst',
  'avocat',
  'architect',
  'assistant',
  'associate',
  'auditeur',
  'ceo',
  'cfo',
  'charge',
  'chief',
  'cio',
  'clerk',
  'coach',
  'commercial',
  'commerciale',
  'comptable',
  'conseiller',
  'consultant',
  'consultante',
  'coo',
  'coordinator',
  'copywriter',
  'cmo',
  'cto',
  'customer',
  'directeur',
  'directrice',
  'enseignant',
  'enseignante',
  'designer',
  'developer',
  'director',
  'employee',
  'employe',
  'employee',
  'engineer',
  'etudiant',
  'entrepreneur',
  'expert',
  'exposant',
  'executive',
  'founder',
  'fondatrice',
  'fondateur',
  'freelancer',
  'gerant',
  'gerante',
  'head',
  'ingenieur',
  'intern',
  'lead',
  'manager',
  'marketer',
  'officer',
  'owner',
  'president',
  'producer',
  'professor',
  'project',
  'recruiter',
  'representative',
  'researcher',
  'sales',
  'specialist',
  'staff',
  'responsable',
  'service',
  'stagiaire',
  'student',
  'supervisor',
  'teacher',
  'technician',
  'vp',
  'writer'
]);

const fillerWords = new Set(['and', '&', 'of', 'the', 'for', 'in', 'to', 'co', 'cofounder']);
const acronymWords = new Set([
  'ai',
  'api',
  'ar',
  'b2b',
  'b2c',
  'crm',
  'erp',
  'fintech',
  'hr',
  'ict',
  'iot',
  'it',
  'ngo',
  'pr',
  'qa',
  'saas',
  'seo',
  'ui',
  'ux',
  'vr'
]);

const aliasRules = [
  { pattern: /^(technology|tech|technology software|technology & software|software|software development|information technology|ict|informatique|digital)$/i, canonical: 'Technology & Software' },
  { pattern: /^(ai|artificial intelligence|ai iot emerging tech|ai & iot|iot|ai\/iot)$/i, canonical: 'AI, IoT & Emerging Tech' },
  { pattern: /^(telecom|telecommunications|telecommunication)$/i, canonical: 'Telecommunications' },
  { pattern: /^(marketing|marketing advertising|marketing & advertising|advertising|digital marketing|brand strategy|growth marketing|publicite)$/i, canonical: 'Marketing & Advertising' },
  { pattern: /^(sales|business development|sales business development)$/i, canonical: 'Sales & Business Development' },
  { pattern: /^(finance|financial services|banking|finance banking|banque)$/i, canonical: 'Financial Services & Banking' },
  { pattern: /^(investment|private equity|investment banking)$/i, canonical: 'Investment & Private Equity' },
  { pattern: /^(accounting|audit|accounting audit|comptabilite)$/i, canonical: 'Accounting & Audit' },
  { pattern: /^(legal|legal services|law|juridique)$/i, canonical: 'Legal Services' },
  { pattern: /^(consulting|consulting professional services|consulting & professional services|professional services)$/i, canonical: 'Consulting & Professional Services' },
  { pattern: /^(education|education training|training|formation)$/i, canonical: 'Education & Training' },
  { pattern: /^(research|academia|academic|universite)$/i, canonical: 'Research & Academia' },
  { pattern: /^(government|government public sector|government & public sector|public sector)$/i, canonical: 'Government & Public Sector' },
  { pattern: /^(non profit|nonprofit|non profit ngo|non-profit|non-profit ngo|ngo|civil society)$/i, canonical: 'Non-Profit & Civil Society' },
  { pattern: /^(healthcare|health care|healthcare pharmaceuticals|healthcare & pharmaceuticals|pharmaceuticals|medical|sante)$/i, canonical: 'Healthcare & Pharmaceuticals' },
  { pattern: /^(biotechnology|biotech|life sciences)$/i, canonical: 'Biotechnology & Life Sciences' },
  { pattern: /^(agriculture|agric|farming|agritech)$/i, canonical: 'Agriculture & Agritech' },
  { pattern: /^(manufacturing|manufacturing production|manufacturing & production|production|industrie)$/i, canonical: 'Manufacturing & Production' },
  { pattern: /^(retail|retail ecommerce|retail & e-commerce|ecommerce|e-commerce|commerce)$/i, canonical: 'Retail & E-commerce' },
  { pattern: /^(logistics|transport|transportation|supply chain)$/i, canonical: 'Logistics & Supply Chain' },
  { pattern: /^(media|media communications|communications|communication|public relations)$/i, canonical: 'Media & Communications' },
  { pattern: /^(events|event management|hospitality|tourism|event hospitality tourism)$/i, canonical: 'Events, Hospitality & Tourism' },
  { pattern: /^(real estate|construction|property|immobilier)$/i, canonical: 'Real Estate & Construction' },
  { pattern: /^(energy|utilities|oil gas|renewable energy)$/i, canonical: 'Energy & Utilities' },
  { pattern: /^(insurance|assurance)$/i, canonical: 'Insurance' },
  { pattern: /^(human resources|hr|recruitment|talent acquisition)$/i, canonical: 'Human Resources & Recruitment' },
  { pattern: /^(automotive|mobility|transport mobility)$/i, canonical: 'Automotive & Mobility' },
  { pattern: /^(fashion|beauty|cosmetics)$/i, canonical: 'Fashion & Beauty' },
  { pattern: /^(food|beverage|food beverage|restauration)$/i, canonical: 'Food & Beverage' },
  { pattern: /^(arts|creative industries|creative|design)$/i, canonical: 'Arts & Creative Industries' },
  { pattern: /^(security|defense|cybersecurity|cyber security)$/i, canonical: 'Security & Defense' },
  { pattern: /^(mining|metals)$/i, canonical: 'Mining & Metals' },
  { pattern: /^(sports|entertainment|sport)$/i, canonical: 'Sports & Entertainment' },
  { pattern: /^(environment|environmental services|sustainability)$/i, canonical: 'Environmental Services' },
  { pattern: /^(aviation|maritime|shipping)$/i, canonical: 'Aviation & Maritime' },
  { pattern: /^(consumer goods|fmcg)$/i, canonical: 'Consumer Goods' },
  { pattern: /^(religious|community organizations|community organization)$/i, canonical: 'Religious & Community Organizations' },
  { pattern: /^(public safety|emergency services)$/i, canonical: 'Public Safety & Emergency Services' },
  { pattern: /^(entrepreneurship|entrepreneurs startups|entrepreneurs & startups|startup|startups)$/i, canonical: 'Entrepreneurs & Startups' },
  { pattern: /^(developers engineers|developers & engineers|engineering)$/i, canonical: 'Developers & Engineers' }
];

const keywordRules = [
  { pattern: /\b(software|developer|development|coding|programming|informatique|digital|web|app|saas|system integration|edi|tech lead|technical lead|technical leader|presales engineer|ingenieur informatique)\b/i, canonical: 'Technology & Software' },
  { pattern: /\b(ai|artificial intelligence|machine learning|data science|iot|robot|automation)\b/i, canonical: 'AI, IoT & Emerging Tech' },
  { pattern: /\b(telecom|telecommunication|networking|network engineer)\b/i, canonical: 'Telecommunications' },
  { pattern: /\b(marketing|seo|brand|branding|advertising|publicite|growth|communication|media|community manager|communications?)\b/i, canonical: 'Marketing & Advertising' },
  { pattern: /\b(sales|business development|commercial|responsable commercial|account manager|account executive|export manager)\b/i, canonical: 'Sales & Business Development' },
  { pattern: /\b(finance|financial|bank|banking|financier|investment|invest|trading)\b/i, canonical: 'Financial Services & Banking' },
  { pattern: /\b(accounting|audit|comptabilit|comptable|auditeur)\b/i, canonical: 'Accounting & Audit' },
  { pattern: /\b(law|legal|juridique|avocat|compliance)\b/i, canonical: 'Legal Services' },
  { pattern: /\b(consulting|consultant|consultante|advisory|expert entrepreneurial|innovation consultant|business operations consultant)\b/i, canonical: 'Consulting & Professional Services' },
  { pattern: /\b(teacher|teaching|professor|professeur|enseignant|enseignante|education|training|formation|academy)\b/i, canonical: 'Education & Training' },
  { pattern: /\b(research|researcher|phd|academia|academic|universitaire|technology transfer|valorisation de la recherche|transfert technologique)\b/i, canonical: 'Research & Academia' },
  { pattern: /\b(government|public sector|municipal|ministry)\b/i, canonical: 'Government & Public Sector' },
  { pattern: /\b(non-profit|non profit|ngo|civil society|association)\b/i, canonical: 'Non-Profit & Civil Society' },
  { pattern: /\b(health|healthcare|medical|medicine|pharma|pharmaceutical|clinic|hospital|nursing)\b/i, canonical: 'Healthcare & Pharmaceuticals' },
  { pattern: /\b(biotech|biotechnology|life science|life sciences)\b/i, canonical: 'Biotechnology & Life Sciences' },
  { pattern: /\b(agri|agro|agriculture|agriculteur|farming|farm|apiculteur|permaculture|apiculture)\b/i, canonical: 'Agriculture & Agritech' },
  { pattern: /\b(factory|manufacturing|manufacture|industrial|industrie|production|printing|incubator|technicien)\b/i, canonical: 'Manufacturing & Production' },
  { pattern: /\b(retail|e-commerce|ecommerce|commerce|shop|store|b2b e-commerce)\b/i, canonical: 'Retail & E-commerce' },
  { pattern: /\b(logistics|supply chain|transport|shipping|freight)\b/i, canonical: 'Logistics & Supply Chain' },
  { pattern: /\b(media|publisher|publishing|journalist|journalisme|public relations)\b/i, canonical: 'Media & Communications' },
  { pattern: /\b(event|events|hospitality|tourism|hotel|restaurant|restauration)\b/i, canonical: 'Events, Hospitality & Tourism' },
  { pattern: /\b(real estate|construction|property|immobilier|interior designer|architect)\b/i, canonical: 'Real Estate & Construction' },
  { pattern: /\b(energy|renewable|solar|waste conversion|utilities)\b/i, canonical: 'Energy & Utilities' },
  { pattern: /\b(insurance|assurance)\b/i, canonical: 'Insurance' },
  { pattern: /\b(human resources|hr\b|recruitment|employability|talent)\b/i, canonical: 'Human Resources & Recruitment' },
  { pattern: /\b(automotive|mobility|transport mobility)\b/i, canonical: 'Automotive & Mobility' },
  { pattern: /\b(fashion|beauty|cosmetic|designer|design|creative|artist|artistic|orange economy|craft|handmade|furnishings)\b/i, canonical: 'Arts & Creative Industries' },
  { pattern: /\b(food|beverage|bakery|baker|خباز|مونة|مناقيش|تحضير مونة)\b/i, canonical: 'Food & Beverage' },
  { pattern: /\b(security|defense|cyber)\b/i, canonical: 'Security & Defense' },
  { pattern: /\b(mining|metals)\b/i, canonical: 'Mining & Metals' },
  { pattern: /\b(sport|sports|entertainment)\b/i, canonical: 'Sports & Entertainment' },
  { pattern: /\b(environment|environmental|sustainability)\b/i, canonical: 'Environmental Services' },
  { pattern: /\b(aviation|maritime|shipping)\b/i, canonical: 'Aviation & Maritime' },
  { pattern: /\b(consumer goods|fmcg)\b/i, canonical: 'Consumer Goods' },
  { pattern: /\b(religious|community organizations?)\b/i, canonical: 'Religious & Community Organizations' },
  { pattern: /\b(emergency|public safety|rescue)\b/i, canonical: 'Public Safety & Emergency Services' },
  { pattern: /\b(entrepreneur|startup|startups|founder|co-founder|cofounder|business owner|businessowner|owner of a factory|founder and designer|founder and fashion designer)\b/i, canonical: 'Entrepreneurs & Startups' },
  { pattern: /\b(engineer|engineering|developers? & engineers?)\b/i, canonical: 'Developers & Engineers' },
  { pattern: /زراعي|زراعة|فلاحة|فلاحي/i, canonical: 'Agriculture & Agritech' },
  { pattern: /المفروشات|فني|فنان|حرفي|يدوية/i, canonical: 'Arts & Creative Industries' }
];

function collapseWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function toSlug(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatToken(token) {
  const lower = token.toLowerCase();
  if (acronymWords.has(lower) || /^[a-z]{2,4}\d?$/.test(lower) && lower === lower.toUpperCase()) {
    return lower.toUpperCase();
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function toDisplayCase(value) {
  return value
    .split(/(\s+|&|\/|-|,)/)
    .map((part) => {
      if (/^\s+$/.test(part) || ['&', '/', '-', ','].includes(part)) return part;
      return formatToken(part);
    })
    .join('');
}

function looksLikeNoise(value) {
  const slug = toSlug(value);
  if (!slug) return true;
  if (directNoiseValues.has(slug)) return true;
  if (/^\d+$/.test(slug)) return true;
  if (/^([a-z0-9])\1{1,}$/.test(slug.replace(/\s+/g, ''))) return true;
  if (slug.length <= 3 && !shortAllowList.has(slug)) return true;
  if (/^(test|demo|sample|temp|tmp|misc)( |$)/.test(slug)) return true;
  return false;
}

function looksLikeRole(value) {
  const slug = toSlug(value);
  if (!slug) return false;
  if (exactRolePhrases.has(slug)) return true;

  const tokens = slug.split(' ').filter(Boolean);
  const significant = tokens.filter((token) => !fillerWords.has(token));
  if (!significant.length) return false;

  return significant.every((token) => roleWords.has(token)) && significant.some((token) => roleWords.has(token));
}

function canonicalizeValue(value) {
  const trimmed = collapseWhitespace(String(value || ''));
  if (!trimmed) {
    return { canonical: 'Other', reason: 'empty' };
  }

  if (looksLikeNoise(trimmed)) {
    return { canonical: 'Other', reason: 'noise' };
  }

  if (looksLikeRole(trimmed)) {
    return { canonical: 'Other', reason: 'role' };
  }

  const slug = toSlug(trimmed);
  for (const rule of aliasRules) {
    if (rule.pattern.test(slug)) {
      return { canonical: rule.canonical, reason: 'alias' };
    }
  }

  for (const rule of keywordRules) {
    if (rule.pattern.test(trimmed) || rule.pattern.test(slug)) {
      return { canonical: rule.canonical, reason: 'keyword' };
    }
  }

  return { canonical: 'Other', reason: 'unmapped' };
}

function buildEntries(rows, valueSelector) {
  const entries = [];

  for (const row of rows) {
    const values = valueSelector(row);
    for (const value of values) {
      entries.push({
        profileId: row.id,
        raw: value
      });
    }
  }

  return entries;
}

function summarizeEntries(entries) {
  const rawCounts = new Map();
  const canonicalCounts = new Map();
  const rawToCanonical = new Map();

  for (const entry of entries) {
    const rawValue = collapseWhitespace(entry.raw);
    const normalized = canonicalizeValue(rawValue);
    const rawRecord = rawCounts.get(rawValue) || {
      raw: rawValue,
      count: 0,
      canonical: normalized.canonical,
      reason: normalized.reason,
      profileIds: []
    };
    rawRecord.count += 1;
    rawRecord.profileIds.push(entry.profileId);
    rawCounts.set(rawValue, rawRecord);
    rawToCanonical.set(rawValue, normalized.canonical);

    const canonicalRecord = canonicalCounts.get(normalized.canonical) || {
      canonical: normalized.canonical,
      count: 0,
      sourceValues: new Set()
    };
    canonicalRecord.count += 1;
    canonicalRecord.sourceValues.add(rawValue);
    canonicalCounts.set(normalized.canonical, canonicalRecord);
  }

  const presentCanonicals = fixedIndustryTaxonomy.filter((canonical) => canonicalCounts.has(canonical));
  const topCanonicals = presentCanonicals.slice(0, maxCanonicalIndustries);
  const keepSet = new Set(fixedIndustryTaxonomy);
  keepSet.add('Other');

  const finalCanonicalCounts = new Map();
  const finalMapping = [];

  for (const rawEntry of Array.from(rawCounts.values())) {
    const finalCanonical = keepSet.has(rawEntry.canonical) ? rawEntry.canonical : 'Other';
    finalMapping.push({
      raw: rawEntry.raw,
      count: rawEntry.count,
      currentCanonical: rawEntry.canonical,
      finalCanonical,
      reason: rawEntry.reason,
      profileIds: rawEntry.profileIds
    });

    const target = finalCanonicalCounts.get(finalCanonical) || {
      canonical: finalCanonical,
      count: 0,
      sourceValues: new Set()
    };
    target.count += rawEntry.count;
    target.sourceValues.add(rawEntry.raw);
    finalCanonicalCounts.set(finalCanonical, target);
  }

  finalMapping.sort((a, b) => {
    if (a.finalCanonical === 'Other' && b.finalCanonical !== 'Other') return 1;
    if (b.finalCanonical === 'Other' && a.finalCanonical !== 'Other') return -1;
    if (a.finalCanonical !== b.finalCanonical) {
      return a.finalCanonical.localeCompare(b.finalCanonical, undefined, { sensitivity: 'base' });
    }
    if (b.count !== a.count) return b.count - a.count;
    return a.raw.localeCompare(b.raw, undefined, { sensitivity: 'base' });
  });

  const finalCanonicalList = Array.from(finalCanonicalCounts.values())
    .map((entry) => ({
      canonical: entry.canonical,
      count: entry.count,
      sourceValues: Array.from(entry.sourceValues).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' })
      )
    }))
    .sort((a, b) => {
      if (a.canonical === 'Other' && b.canonical !== 'Other') return 1;
      if (b.canonical === 'Other' && a.canonical !== 'Other') return -1;
      if (b.count !== a.count) return b.count - a.count;
      return a.canonical.localeCompare(b.canonical, undefined, { sensitivity: 'base' });
    });

  return {
    rawUniqueCount: rawCounts.size,
    initialCanonicalCount: canonicalCounts.size,
    finalCanonicalCount: finalCanonicalList.length,
    topCanonicals,
    mapping: finalMapping,
    canonicalSummary: finalCanonicalList
  };
}

async function main() {
  const rawExport = JSON.parse(await fs.readFile(rawExportPath, 'utf8'));
  const industryEntries = buildEntries(rawExport.rows, (row) => (row.industry ? [row.industry] : []));
  const b2bEntries = buildEntries(rawExport.rows, (row) => row.b2bIndustriesOfInterest || []);

  const industrySummary = summarizeEntries(industryEntries);
  const b2bSummary = summarizeEntries(b2bEntries);

  const result = {
    generatedAt: new Date().toISOString(),
    policy: {
      maxCanonicalIndustries,
      fallbackIndustry: 'Other'
    },
    industry: industrySummary,
    b2bIndustriesOfInterest: b2bSummary
  };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, 'community-sector-normalization-report.json'),
    `${JSON.stringify(result, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(outputDir, 'industry-normalization-map.json'),
    `${JSON.stringify(industrySummary.mapping, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(outputDir, 'b2b-industries-of-interest-normalization-map.json'),
    `${JSON.stringify(b2bSummary.mapping, null, 2)}\n`
  );

  console.log(
    JSON.stringify(
      {
        outputDir,
        industry: {
          rawUniqueCount: industrySummary.rawUniqueCount,
          finalCanonicalCount: industrySummary.finalCanonicalCount,
          topCanonicals: industrySummary.topCanonicals
        },
        b2bIndustriesOfInterest: {
          rawUniqueCount: b2bSummary.rawUniqueCount,
          finalCanonicalCount: b2bSummary.finalCanonicalCount,
          topCanonicals: b2bSummary.topCanonicals
        }
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
