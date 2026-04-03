export type TabType = 'ai-matchmaker' | 'all-meetings' | 'analytics' | 'suggestions' | 'logistics';

export const formatDateTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const date = d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${date} at ${time}`;
};

export const statusToColor = (s?: string | null) => {
  const v = String(s || '').toLowerCase();
  if (v === 'confirmed') return '#10B981';
  if (v === 'completed') return '#64748B';
  if (v === 'cancelled') return '#EF4444';
  if (v === 'pending') return '#F59E0B';
  return '#94A3B8';
};
