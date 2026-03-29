import http from 'http';
import https from 'https';

const PORT = 5002;
const BASE_URL = 'https://eventra.cloud';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Fetch JSON from Supabase REST API
function supabaseGet(table, query) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/rest/v1/${table}`, SUPABASE_URL);
    url.search = query;
    const options = {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Accept': 'application/json',
      },
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    }).on('error', reject);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(str, maxLen = 160) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  const t = str.slice(0, maxLen - 3);
  const sp = t.lastIndexOf(' ');
  return (sp > 0 ? t.slice(0, sp) : t) + '...';
}

function buildHtml({ title, description, image, url, type = 'website', jsonLd }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(truncate(description, 160));
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(url);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${safeTitle}</title>
<meta name="description" content="${safeDesc}" />
<link rel="canonical" href="${safeUrl}" />

<!-- Open Graph -->
<meta property="og:type" content="${type}" />
<meta property="og:site_name" content="Eventra" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDesc}" />
<meta property="og:url" content="${safeUrl}" />
${safeImage ? `<meta property="og:image" content="${safeImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />` : ''}

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDesc}" />
${safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : ''}

${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
<p>${safeTitle}</p>
<p>${safeDesc}</p>
<script>window.location.href="${safeUrl}";</script>
</body>
</html>`;
}

// Route handlers
async function handleEventPage(eventId, section) {
  try {
    const rows = await supabaseGet('events', `id=eq.${eventId}&select=id,name,description,tagline,cover_image_url,start_date,end_date,location_address,event_format,branding_settings`);
    const event = Array.isArray(rows) ? rows[0] : null;
    if (!event) return null;

    const path = section ? `/event/${eventId}/${section}` : `/event/${eventId}/landing`;
    const title = `${event.name || 'Event'} | Eventra`;
    const desc = event.description || event.tagline || `Join ${event.name || 'this event'} on Eventra`;

    // Extract image: cover_image_url > hero background > logo > fallback
    let image = event.cover_image_url;
    if (!image) {
      try {
        const blocks = event.branding_settings?.design_studio?.activeBlocks || [];
        const hero = blocks.find(b => b.type === 'hero');
        image = hero?.settings?.backgroundImage;
        if (!image) {
          image = event.branding_settings?.design_studio?.logoUrl;
        }
      } catch {}
    }
    if (!image) image = `${BASE_URL}/favicon.png`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.name || 'Event',
      description: truncate(desc, 300),
      eventStatus: 'https://schema.org/EventScheduled',
      ...(event.start_date ? { startDate: event.start_date } : {}),
      ...(event.end_date ? { endDate: event.end_date } : {}),
      ...(event.cover_image_url ? { image: event.cover_image_url } : {}),
      ...(event.location_address ? { location: { '@type': 'Place', name: event.location_address, address: event.location_address } } : {}),
    };

    return buildHtml({ title, description: desc, image, url: `${BASE_URL}${path}`, type: 'event', jsonLd });
  } catch (err) {
    console.error('Event fetch error:', err.message);
    return null;
  }
}

async function handleProfilePage(userId) {
  try {
    const rows = await supabaseGet('profiles', `id=eq.${userId}&select=id,first_name,last_name,headline,avatar_url`);
    const profile = Array.isArray(rows) ? rows[0] : null;
    if (!profile) return null;

    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'User';
    const title = `${name} | Eventra`;
    const desc = profile.headline ? `${name} — ${profile.headline}. Connect on Eventra.` : `${name}'s profile on Eventra.`;

    return buildHtml({ title, description: desc, image: profile.avatar_url || `${BASE_URL}/favicon.png`, url: `${BASE_URL}/profile/${userId}`, type: 'profile' });
  } catch {
    return null;
  }
}

function handleStaticPage(path) {
  const pages = {
    '/': {
      title: 'Eventra | Professional Event Management & B2B Networking',
      description: 'Eventra is the professional event management and B2B networking platform. Create events, manage registrations, and connect with industry peers.',
      image: `${BASE_URL}/favicon.png`,
    },
    '/browse-events': {
      title: 'Browse Events | Eventra',
      description: 'Discover professional events, conferences, and networking opportunities on Eventra.',
      image: `${BASE_URL}/favicon.png`,
    },
    '/communities': {
      title: 'Community & People Discovery | Eventra',
      description: 'Connect with professionals and communities in your industry on Eventra.',
      image: `${BASE_URL}/favicon.png`,
    },
    '/b2b-marketplace': {
      title: 'B2B Marketplace | Eventra',
      description: 'Find business partners and opportunities in the Eventra B2B Marketplace.',
      image: `${BASE_URL}/favicon.png`,
    },
  };

  const page = pages[path];
  if (!page) return null;
  return buildHtml({ ...page, url: `${BASE_URL}${path}` });
}

// Main server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  let html = null;

  // /event/:id/landing or /event/:id/section
  const eventMatch = path.match(/^\/event\/([a-f0-9-]+)(?:\/(\w+))?$/);
  if (eventMatch) {
    html = await handleEventPage(eventMatch[1], eventMatch[2]);
  }

  // /profile/:id
  const profileMatch = path.match(/^\/profile\/([a-f0-9-]+)$/);
  if (!html && profileMatch) {
    html = await handleProfilePage(profileMatch[1]);
  }

  // Static pages
  if (!html) {
    html = handleStaticPage(path);
  }

  // Fallback — platform homepage OG
  if (!html) {
    html = handleStaticPage('/');
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`OG meta server running on port ${PORT}`);
});
