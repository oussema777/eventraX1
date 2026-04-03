export function sanitizeError(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (
      msg.includes('duplicate key') ||
      msg.includes('violates') ||
      msg.includes('PGRST') ||
      msg.includes('relation') ||
      msg.includes('column')
    ) {
      return fallback;
    }
    return msg.split('\n')[0].substring(0, 200);
  }
  return fallback;
}
