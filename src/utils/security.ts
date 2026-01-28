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
