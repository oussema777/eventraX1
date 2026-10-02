interface EventImageSource {
  cover_image_url?: string | null;
  logo_url?: string | null;
  event_logo_url?: string | null;
  branding_settings?: {
    logoUrl?: string;
    design_studio?: {
      logoUrl?: string;
      activeBlocks?: Array<{ type: string; settings?: { backgroundImage?: string } }>;
    };
  } | null;
}

export function resolveEventImage(event: EventImageSource, fallback: string): string {
  const branding = event.branding_settings;
  const hero = branding?.design_studio?.activeBlocks?.find(block => block.type === 'hero');
  return event.cover_image_url || hero?.settings?.backgroundImage || event.logo_url
    || event.event_logo_url || branding?.design_studio?.logoUrl || branding?.logoUrl || fallback;
}
