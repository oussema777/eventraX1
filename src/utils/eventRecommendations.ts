export interface NetworkingParticipant {
  id: string;
  full_name: string | null;
  job_title?: string | null;
  company?: string | null;
  avatar_url?: string | null;
  sector?: string | null;
  interests?: string[] | null;
}

const normalize = (value: string) => value.trim().normalize('NFKC').toLocaleLowerCase('en');

// Fixed, explainable relevance points, not a probability of business success.
// Identical preferences may legitimately produce similar recommendations.
export function rankEventParticipants(people: NetworkingParticipant[], userId: string) {
  const viewer = people.find(p => p.id === userId);
  if (!viewer) return [];
  const viewerInterests = new Set((viewer.interests || []).map(normalize).filter(Boolean));
  const viewerSector = normalize(viewer.sector || '');
  const uniquePeople = [...new Map(people.map(p => [p.id, p])).values()];
  return uniquePeople.filter(person => person.id !== userId).map(person => {
    const interests = [...new Map((person.interests || []).map(interest => [normalize(interest), interest.trim()])).entries()]
      .filter(([key]) => viewerInterests.has(key)).map(([, label]) => label);
    const sameSector = !!viewerSector && viewerSector === normalize(person.sector || '');
    const sectorPoints = sameSector ? 30 : 0;
    const interestPoints = viewerInterests.size ? Math.round(70 * interests.length / viewerInterests.size) : 0;
    return { ...person, sharedInterests: interests, sameSector, sectorPoints, interestPoints, score: sectorPoints + interestPoints };
  }).filter(person => person.score > 0)
    .sort((a, b) => b.score - a.score || (a.full_name || '').localeCompare(b.full_name || '', 'en') || a.id.localeCompare(b.id));
}

export function nextMatchBatch<T extends { id: string }>(ranked: T[], seenIds: string[], size = 3) {
  const seen = new Set(seenIds);
  const unseen = ranked.filter(person => !seen.has(person.id));
  const restarted = unseen.length === 0 && ranked.length > 0;
  const batch = (restarted ? ranked : unseen).slice(0, size);
  return { batch, restarted, seenIds: [...new Set([...(restarted ? [] : seenIds), ...batch.map(person => person.id)])] };
}
