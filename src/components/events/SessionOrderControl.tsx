import { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { useSessions } from '../../hooks/useSessions';
import { useI18n } from '../../i18n/I18nContext';
import SessionOrderDialog from './SessionOrderDialog';

function OrderEditor({ eventId, onClose, onSaved }: { eventId: string; onClose: () => void; onSaved: (ids: string[]) => void }) {
  const { sessions, isLoading, isError, reorderSessions, reloadSessions } = useSessions(eventId);
  const { t } = useI18n();
  if (isLoading) return <p role="status" style={{ color: '#AFC1D2' }}>{t('eventImprovements.loading')}</p>;
  if (isError) return <div role="alert" style={{ color: '#FCA5A5' }}>{t('eventImprovements.orderLoadError')} <button onClick={() => { void reloadSessions().catch(() => {}); }}>{t('eventImprovements.retry')}</button></div>;
  return <SessionOrderDialog sessions={sessions} onReload={reloadSessions} onClose={onClose} onSave={async ordered => { await reorderSessions(ordered); onSaved(ordered.map(s => s.id)); }} />;
}

export default function SessionOrderControl({ eventId, onSaved }: { eventId?: string; onSaved: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  if (!eventId) return null;
  return <div style={{ marginBottom: 24, padding: '16px 20px', border: '1px solid #32658E', borderRadius: 12, background: '#153C5C' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ flex: '1 1 240px' }}><p style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{t('eventImprovements.orderToolbarTitle')}</p><p style={{ marginTop: 4, fontSize: 13, color: '#AFC1D2' }}>{t('eventImprovements.orderToolbarHint')}</p></div>
      <button onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, padding: '10px 18px', borderRadius: 8, background: '#0684F5', color: '#fff', fontWeight: 600 }}><ArrowDownUp size={18} />{t('eventImprovements.reorder')}</button>
    </div>
    {open && <OrderEditor eventId={eventId} onClose={() => setOpen(false)} onSaved={onSaved} />}
  </div>;
}
