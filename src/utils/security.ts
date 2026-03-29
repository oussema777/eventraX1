/**
 * Security utilities for Eventra platform
 */

const ALLOWED_ORIGINS = [
  'https://app.eventra.cloud',
  'https://eventra.cloud',
];

/**
 * Escapes special characters in a string to prevent XSS attacks when rendering HTML.
 */
export function escapeHTML(str: string): string {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Escapes data for CSV to prevent CSV injection (Formula Injection).
 * Prepend a single quote if the value starts with sensitive characters.
 */
export function escapeCSV(value: any): string {
  const str = String(value || '');
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    return `'${str}`;
  }
  return str;
}

/**
 * Validates that a redirect URL is safe (same-origin or relative path).
 * Blocks open redirect attacks via external URLs.
 */
export function isValidRedirectUrl(url: string): boolean {
  if (!url) return false;

  // Allow relative paths (but not protocol-relative //)
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    const currentOrigin = window.location.origin;

    // Allow same origin
    if (parsed.origin === currentOrigin) return true;

    // Allow known Eventra origins
    if (ALLOWED_ORIGINS.includes(parsed.origin)) return true;

    return false;
  } catch {
    return false;
  }
}

interface FileValidationOptions {
  allowedTypes: string[];
  maxSizeBytes: number;
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const FILE_VALIDATION_PRESETS = {
  image: {
    allowedTypes: IMAGE_TYPES,
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
  },
  submission: {
    allowedTypes: [...IMAGE_TYPES, ...DOCUMENT_TYPES],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
  },
} satisfies Record<string, FileValidationOptions>;

/**
 * Validates a file before upload. Returns null if valid, or an error message string.
 */
export function validateFileUpload(
  file: File,
  options: FileValidationOptions
): string | null {
  if (!file) return 'No file provided';

  if (!options.allowedTypes.includes(file.type)) {
    return `File type "${file.type || 'unknown'}" is not allowed. Accepted: ${options.allowedTypes.join(', ')}`;
  }

  if (file.size > options.maxSizeBytes) {
    const maxMB = Math.round(options.maxSizeBytes / (1024 * 1024));
    return `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the ${maxMB}MB limit`;
  }

  return null;
}

/**
 * Sanitize CSS to strip dangerous properties (expressions, imports, javascript urls)
 */
export function sanitizeCSS(css: string): string {
  if (!css) return '';
  return css
    .replace(/@import\s+[^;]+;?/gi, '')
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/url\s*\(\s*['"]?\s*javascript:[^)]*\)/gi, '')
    .replace(/behavior\s*:\s*[^;]+;?/gi, '')
    .replace(/-moz-binding\s*:\s*[^;]+;?/gi, '');
}
