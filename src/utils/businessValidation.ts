export function businessContactError(email: string, website: string, requireEmail = true): string | null {
  if ((requireEmail || email.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'businessFlows.invalidEmail';
  if (website.trim()) {
    try {
      const url = new URL(website.trim());
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) return 'businessFlows.invalidWebsite';
    } catch { return 'businessFlows.invalidWebsite'; }
  }
  return null;
}

export function offeringError(name: string, price: string | number | undefined, quantity?: string | number | null): string | null {
  if (!name.trim()) return 'businessFlows.offeringNameRequired';
  if (price !== undefined && price !== '' && (!Number.isFinite(Number(price)) || Number(price) < 0)) return 'businessFlows.invalidPrice';
  if (quantity !== undefined && quantity !== null && quantity !== '' && (!Number.isSafeInteger(Number(quantity)) || Number(quantity) < 0)) return 'businessFlows.invalidQuantity';
  return null;
}
