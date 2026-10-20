const transparencyCache = new Map<string, boolean>();
const blankImageCache = new Map<string, boolean>();

/** Ignore uploaded placeholder files that are completely transparent or a flat color. */
export function isBlankImage(image: HTMLImageElement): boolean {
  const cached = blankImageCache.get(image.currentSrc);
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return false;
    context.drawImage(image, 0, 0, 32, 32);
    const pixels = context.getImageData(0, 0, 32, 32).data;
    const low = [255, 255, 255, 255], high = [0, 0, 0, 0];
    for (let i = 0; i < pixels.length; i++) {
      const channel = i % 4;
      low[channel] = Math.min(low[channel], pixels[i]);
      high[channel] = Math.max(high[channel], pixels[i]);
    }
    const blank = high[3] < 8 || high.every((value, channel) => value - low[channel] < 12);
    if (blankImageCache.size >= 1000) blankImageCache.clear();
    blankImageCache.set(image.currentSrc, blank);
    return blank;
  } catch {
    return false;
  }
}

export function hasTransparency(image: HTMLImageElement): boolean {
  const cached = transparencyCache.get(image.currentSrc);
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return false;
    context.drawImage(image, 0, 0, 32, 32);
    const pixels = context.getImageData(0, 0, 32, 32).data;
    let transparent = false;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 250) { transparent = true; break; }
    }
    if (transparencyCache.size >= 1000) transparencyCache.clear();
    transparencyCache.set(image.currentSrc, transparent);
    return transparent;
  } catch {
    // Some external hosts disallow pixel inspection. Keep the normal photo crop.
    return false;
  }
}
