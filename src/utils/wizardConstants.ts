export const DEFAULT_DESIGN_STUDIO_BLOCKS = [
  {
    id: 'hero',
    name: 'Hero Section',
    type: 'hero',
    description: 'Main event banner with title, date, and call to action.',
    tier: 'FREE',
    thumbnail: 'gradient',
    icon: '🎯',
    position: 0,
    isVisible: true,
    settings: {}
  }
];

export const DEFAULT_BRANDING_SETTINGS = {
  design_studio: {
    activeBlocks: DEFAULT_DESIGN_STUDIO_BLOCKS,
    brandColor: '#635BFF',
    brandColorSecondary: '#7C75FF',
    fontFamily: 'inter',
    buttonRadius: 12,
    logoSize: 80
  }
};
