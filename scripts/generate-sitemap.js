import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BASE_URL = 'https://eventra.cloud';

async function generateSitemap() {
  // Fetch all published events
  const { data: events, error } = await supabase
    .from('events')
    .select('id, name, start_date, seo_slug')
    .eq('status', 'published')
    .eq('is_public', true);

  if (error) {
    console.error('Error fetching events:', error);
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/browse-events', priority: '0.8', changefreq: 'daily' },
    { url: '/communities', priority: '0.7', changefreq: 'weekly' },
    { url: '/b2b-marketplace', priority: '0.7', changefreq: 'weekly' },
  ];

  // Event pages
  const eventPages = (events || []).map(event => ({
    url: `/event/${event.id}/landing`,
    priority: '0.9',
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...eventPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const outPath = resolve(process.cwd(), 'build', 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf-8');
  console.log(`Sitemap generated: ${outPath} (${allPages.length} URLs)`);
}

generateSitemap();
