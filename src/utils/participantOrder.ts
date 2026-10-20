/** Put actual uploaded images first, then use a stable name/ID order. */
export function compareParticipantImages(
  a: { id: string; name?: string | null; full_name?: string | null; final_avatar?: string | null; avatar_url?: string | null },
  b: { id: string; name?: string | null; full_name?: string | null; final_avatar?: string | null; avatar_url?: string | null },
) {
  const hasImage = (person: typeof a) => Boolean((person.final_avatar || person.avatar_url)?.trim());
  return Number(hasImage(b)) - Number(hasImage(a))
    || (a.name || a.full_name || '').localeCompare(b.name || b.full_name || '', 'fr', { sensitivity: 'base', numeric: true })
    || a.id.localeCompare(b.id);
}
