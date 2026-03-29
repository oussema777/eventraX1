/**
 * SEO utility functions for Eventra
 */

export const BASE_URL = 'https://eventra.cloud';

/**
 * Truncate a string to maxLen characters, ending at word boundary with ellipsis.
 */
export function truncateDescription(text: string, maxLen = 160): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate canonical URL for a path.
 */
export function canonicalUrl(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}

/**
 * Generate JSON-LD Organization schema for the homepage.
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Eventra',
    url: BASE_URL,
    description: 'Professional Event Management & B2B Networking Platform',
    logo: `${BASE_URL}/favicon.png`,
    sameAs: [
      'https://linkedin.com/company/eventra',
      'https://twitter.com/eventra',
    ],
  };
}

/**
 * Generate JSON-LD Event schema for an event page.
 */
export function generateEventJsonLd(event: {
  id: string;
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location_address?: string;
  event_format?: string;
  cover_image_url?: string;
  organizer_name?: string;
  ticket_price?: number;
  ticket_currency?: string;
}) {
  const attendanceMode = (() => {
    switch (event.event_format?.toLowerCase()) {
      case 'online': return 'https://schema.org/OnlineEventAttendanceMode';
      case 'hybrid': return 'https://schema.org/MixedEventAttendanceMode';
      default: return 'https://schema.org/OfflineEventAttendanceMode';
    }
  })();

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name || 'Untitled Event',
    description: truncateDescription(event.description || '', 300),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: attendanceMode,
  };

  if (event.start_date) jsonLd.startDate = event.start_date;
  if (event.end_date) jsonLd.endDate = event.end_date;
  if (event.cover_image_url) jsonLd.image = event.cover_image_url;

  if (event.location_address) {
    jsonLd.location = {
      '@type': 'Place',
      name: event.location_address,
      address: event.location_address,
    };
  }

  if (event.organizer_name) {
    jsonLd.organizer = {
      '@type': 'Organization',
      name: event.organizer_name,
    };
  }

  if (event.ticket_price !== undefined && event.ticket_currency) {
    jsonLd.offers = {
      '@type': 'Offer',
      url: `${BASE_URL}/event/${event.id}/register`,
      price: String(event.ticket_price),
      priceCurrency: event.ticket_currency,
      availability: 'https://schema.org/InStock',
    };
  }

  return jsonLd;
}

/**
 * Generate JSON-LD BreadcrumbList schema.
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}
