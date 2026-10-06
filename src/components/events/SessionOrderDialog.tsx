import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Clock, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { useI18n } from '../../i18n/I18nContext';
import type { Session } from '../../hooks/useSessions';

export default function SessionOrderDialog({ sessions, onSave, onClose, onReload }: {
  sessions: Session[];
  onSave: (sessions: Session[]) => Promise<void>;
  onClose: () => void;
  onReload?: () => Promise<Session[]>;
}) {
  const { t, locale } = useI18n();
  const [baseline, setBaseline] = useState(() => [...sessions]);
  const [draft, setDraft] = useState(() => [...sessions]);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const lock = useRef(false);
  const sameSlot = (a?: Session, b?: Session) => !!a && !!b && Number.isFinite(Date.parse(a.startTime)) && Date.parse(a.startTime) === Date.parse(b.startTime);
  const unavailable = baseline.some(s => s.sortOrder === undefined);
  const changed = draft.some((s, i) => s.id !== baseline[i]?.id);
  const groups: { time: string; sessions: Session[] }[] = [];
  for (const session of draft) {
    const last = groups[groups.length - 1];
    if (last && sameSlot(last.sessions[0], session)) last.sessions.push(session);
    else groups.push({ time: session.startTime, sessions: [session] });
  }
  const move = (fromId: string, toId: string) => {
    if (lock.current) return;
    const from = draft.findIndex(s => s.id === fromId), to = draft.findIndex(s => s.id === toId);
    if (from < 0 || to < 0 || from === to || !sameSlot(draft[from], draft[to])) return;
    const next = [...draft]; const [item] = next.splice(from, 1); next.splice(to, 0, item);
    setDraft(next); setAnnouncement(t('eventImprovements.orderMoved', { title: item.title }));
  };
  const save = async () => {
    if (lock.current || !changed || unavailable) return;
    lock.current = true; setPending(true); setFailure(null);
    try { await onSave(draft); onClose(); }
    catch (error) {
      const code = (error as { code?: string })?.code;
      setFailure(code === '40001' ? 'orderConflict' : code === '42501' ? 'orderPermission' : ['PGRST202', '42703', '42883'].includes(code || '') ? 'orderUnavailable' : 'orderError');
    } finally { lock.current = false; setPending(false); }
  };
  const reload = async () => {
    if (!onReload || lock.current) return;
    lock.current = true; setPending(true);
    try { const fresh = await onReload(); setBaseline(fresh); setDraft(fresh); setFailure(null); }
    catch { setFailure('orderLoadError'); }
    finally { lock.current = false; setPending(false); }
  };
  return <Dialog open onOpenChange={open => { if (!open && !lock.current) onClose(); }}>
    <DialogContent style={{ background: '#0D3052', color: '#fff', borderColor: '#304B63', width: 'min(820px, calc(100vw - 24px))', maxWidth: 820, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 16 }}>
      <div style={{ paddingInlineEnd: 24 }}><DialogTitle>{t('eventImprovements.reorder')}</DialogTitle>
        <DialogDescription style={{ color: '#AFC1D2', marginTop: 8, lineHeight: 1.5 }}>{t('eventImprovements.orderIntro')}</DialogDescription></div>
      <p role="status" className="sr-only">{announcement}</p>
      {(unavailable || failure) && <div role="alert" style={{ background: '#443827', border: '1px solid #916E34', color: '#FDE4AF', borderRadius: 10, padding: 12, fontSize: 13 }}>
        <p>{t(`eventImprovements.${unavailable ? 'orderUnavailable' : failure}`)}</p>
        {onReload && <button disabled={pending} onClick={reload} style={{ marginTop: 10, textDecoration: 'underline', color: '#fff' }}>{t('eventImprovements.reloadOrder')}</button>}
      </div>}
      <div style={{ overflowY: 'auto', minHeight: 0, paddingInlineEnd: 4 }}>
        {groups.map((group, groupIndex) => <section key={`${group.time}:${groupIndex}`} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, color: '#AFC1D2', fontSize: 13, marginBottom: 10 }}>
            <Clock size={16} /><h3 style={{ fontWeight: 600 }}>{Number.isFinite(Date.parse(group.time)) ? new Date(group.time).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : t('eventImprovements.undated')}</h3>
            <span style={{ marginInlineStart: 'auto', fontSize: 12 }}>{t('eventImprovements.slotCount', { count: group.sessions.length })}</span>
          </div>
          {group.sessions.length === 1 && <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>{t('eventImprovements.singleSlot')}</p>}
          <ol style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
            {group.sessions.map((s, i) => <li key={s.id} data-session-id={s.id}
              onDragOver={e => { if (!pending && dragged && sameSlot(draft.find(item => item.id === dragged), s)) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setTarget(s.id); } }}
              onDrop={e => { e.preventDefault(); if (dragged) move(dragged, s.id); setDragged(null); setTarget(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 8px', border: `1px solid ${target === s.id ? '#38BDF8' : '#304B63'}`, background: target === s.id ? '#204B70' : '#17344E', borderRadius: 10, opacity: dragged === s.id ? 0.5 : 1 }}>
              <button type="button" disabled={pending || group.sessions.length < 2} draggable={!pending && group.sessions.length > 1} onDragStart={e => { setDragged(s.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', s.id); }} onDragEnd={() => { setDragged(null); setTarget(null); }}
                onKeyDown={e => { const next = e.key === 'ArrowUp' ? group.sessions[i - 1] : e.key === 'ArrowDown' ? group.sessions[i + 1] : null; if (next) { e.preventDefault(); move(s.id, next.id); } }}
                aria-label={`${t('eventImprovements.dragSession')}: ${s.title}`} title={t('eventImprovements.dragSession')} style={{ cursor: 'grab', flexShrink: 0, padding: 4, color: '#94A3B8' }}><GripVertical size={18} /></button>
              <span aria-hidden="true" style={{ color: '#7DD3FC', fontSize: 13, fontWeight: 700, minWidth: 16 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}><strong style={{ fontSize: 14, lineHeight: 1.5 }}>{s.title}</strong>{s.venue && <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>{s.venue}</p>}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button aria-label={t('eventImprovements.moveUp', { title: s.title })} disabled={pending || i === 0} onClick={() => move(s.id, group.sessions[i - 1].id)} style={{ display: 'grid', placeItems: 'center', width: 36, height: 32, borderRadius: 6, background: '#244763', opacity: pending || i === 0 ? 0.3 : 1 }}><ArrowUp size={17} /></button>
                <button aria-label={t('eventImprovements.moveDown', { title: s.title })} disabled={pending || i === group.sessions.length - 1} onClick={() => move(s.id, group.sessions[i + 1].id)} style={{ display: 'grid', placeItems: 'center', width: 36, height: 32, borderRadius: 6, background: '#244763', opacity: pending || i === group.sessions.length - 1 ? 0.3 : 1 }}><ArrowDown size={17} /></button>
              </div>
            </li>)}
          </ol>
        </section>)}
      </div>
      <div style={{ borderTop: '1px solid #304B63', paddingTop: 14, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, flexShrink: 0 }}>
        <button disabled={pending || !changed} onClick={() => setDraft([...baseline])} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#AFC1D2', fontSize: 13, opacity: pending || !changed ? 0.4 : 1 }}><RotateCcw size={14} />{t('eventImprovements.resetOrder')}</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled={pending} onClick={onClose} style={{ border: '1px solid #47637D', padding: '10px 14px', borderRadius: 8 }}>{t('eventImprovements.cancelOrder')}</button>
          <button disabled={pending || !changed || unavailable} onClick={save} style={{ background: '#0684F5', borderRadius: 8, padding: '10px 16px', fontWeight: 600, opacity: pending || !changed || unavailable ? 0.5 : 1 }}>{t(pending ? 'eventImprovements.savingOrder' : 'eventImprovements.saveOrder')}</button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
