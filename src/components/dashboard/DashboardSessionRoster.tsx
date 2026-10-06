import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Columns3, RefreshCw } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { loadDashboardSessionRoster, type AttendanceStatus } from '../../lib/dashboardSessionRoster';

const optionalColumns = ['company', 'email', 'job', 'sector', 'phone', 'ticket'] as const;
type Column = typeof optionalColumns[number];
const defaults: Column[] = ['company', 'email'];
const preferenceKey = 'eventra:session-roster-columns:v1';
function initialColumns(): Column[] {
  try {
    const value = JSON.parse(localStorage.getItem(preferenceKey) || 'null');
    if (Array.isArray(value)) return optionalColumns.filter(c => value.includes(c));
  } catch { /* Storage may be unavailable; use the default layout. */ }
  return defaults;
}

const attendanceColors: Record<AttendanceStatus, string> = { absent: '#F87171', event: '#FB923C', session: '#34D399', unknown: '#94A3B8' };
function AttendanceDot({ status, name }: { status: AttendanceStatus; name: string }) {
  const { t } = useI18n();
  const description = t(`eventImprovements.attendance.${status}`);
  return <Popover>
    <PopoverTrigger asChild><button type="button" aria-label={`${name}: ${description}`} title={description}
      style={{ display: 'inline-grid', placeItems: 'center', width: 28, height: 28, flexShrink: 0, borderRadius: '50%', background: 'transparent' }}>
      <span aria-hidden="true" data-attendance={status} style={{ width: 11, height: 11, borderRadius: '50%', background: attendanceColors[status], boxShadow: `0 0 0 3px ${attendanceColors[status]}20` }} />
    </button></PopoverTrigger>
    <PopoverContent style={{ zIndex: 100, width: 260, maxWidth: 'calc(100vw - 48px)', padding: 12, borderRadius: 8, background: '#173B5A', border: '1px solid #47637D', color: '#fff', fontSize: 13 }}>{description}</PopoverContent>
  </Popover>;
}

export default function DashboardSessionRoster({ eventId, session, onClose }: {
  eventId: string; session: { id: string; title: string }; onClose: () => void;
}) {
  const { t } = useI18n();
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [query, setQuery] = useState('');
  const chooserRef = useRef<HTMLButtonElement>(null);
  const { data: people = [], isLoading: loading, isFetching: refreshing, isError: failed, refetch } = useQuery({
    queryKey: ['dashboard-session-roster', eventId, session.id],
    queryFn: () => loadDashboardSessionRoster(eventId, session.id),
    staleTime: 0, gcTime: 0, retry: false, refetchInterval: 15000,
  });
  const updateColumns = (next: Column[]) => {
    setColumns(next);
    try { localStorage.setItem(preferenceKey, JSON.stringify(next)); } catch { /* Keep the current in-memory preference. */ }
  };
  const visibleColumns = optionalColumns.filter(c => columns.includes(c));
  const label = (column: string) => t(`eventImprovements.rosterFields.${column}`);
  const needle = query.trim().toLocaleLowerCase();
  const visible = people.filter(person => [person.name, ...optionalColumns.map(c => person[c])].some(value => value.toLocaleLowerCase().includes(needle)));
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent style={{ width: 'min(1040px, calc(100vw - 32px))', maxWidth: 1040, maxHeight: '85vh', overflowY: 'auto', background: '#0D3052', borderColor: '#304B63', color: '#fff' }}>
      <DialogTitle style={{ paddingInlineEnd: 24 }}>{t('manageEvent.agenda.modals.attendees.title')}</DialogTitle>
      <DialogDescription style={{ color: '#AFC1D2', paddingInlineEnd: 24 }}>{session.title}</DialogDescription>
      <style>{`
        .session-roster-table { width: 100%; border-collapse: collapse; text-align: start; font-size: 14px; }
        .session-roster-table th, .session-roster-table td { padding: 14px 16px; text-align: start; border-bottom: 1px solid #304B63; overflow-wrap: anywhere; min-width: 145px; max-width: 300px; }
        .session-roster-table th { color: #AFC1D2; background: #173B5A; font-size: 12px; font-weight: 600; }
        .session-roster-table td { color: #CBD5E1; }
        .session-roster-name { font-weight: 700; color: #fff; }
        .roster-column-option:focus-within { background: #244763; }
        @media (max-width: 600px) {
          .session-roster-table, .session-roster-table tbody { display: block; }
          .session-roster-table thead { display: none; }
          .session-roster-table tr { display: block; padding: 14px 16px; border-bottom: 1px solid #304B63; }
          .session-roster-table td { display: grid; grid-template-columns: minmax(80px, 1fr) minmax(0, 2fr); gap: 12px; padding: 7px 0; border: 0; min-width: 0; max-width: none; }
          .session-roster-table td::before { content: attr(data-label); color: #94A3B8; font-size: 12px; }
          .session-roster-table td:first-child { display: block; padding-bottom: 10px; }
          .session-roster-table td:first-child::before { display: none; }
        }
      `}</style>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <input type="search" aria-label={t('eventImprovements.searchParticipants')} placeholder={t('eventImprovements.searchParticipants')}
          value={query} onChange={e => setQuery(e.target.value)} style={{ flex: '1 1 220px', minWidth: 0, height: 42, padding: '0 12px', borderRadius: 8, background: '#173B5A', border: '1px solid #47637D', color: '#fff' }} />
        <button type="button" onClick={() => { void refetch(); }} disabled={refreshing} aria-label={t('eventImprovements.refreshAttendance')} title={t('eventImprovements.refreshAttendance')}
          style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 8, border: '1px solid #47637D', color: '#fff', opacity: refreshing ? 0.5 : 1 }}><RefreshCw size={16} /></button>
        <Popover>
          <PopoverTrigger asChild><button ref={chooserRef} style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 42, padding: '8px 12px', borderRadius: 8, border: '1px solid #47637D', background: '#173B5A', color: '#fff' }}><Columns3 size={16} />{t('eventImprovements.chooseColumns')}<ChevronDown size={14} /></button></PopoverTrigger>
          <PopoverContent align="end" onCloseAutoFocus={e => { e.preventDefault(); chooserRef.current?.focus(); }} style={{ zIndex: 100, width: 250, maxWidth: 'calc(100vw - 48px)', background: '#173B5A', color: '#fff', border: '1px solid #47637D', padding: 8, borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: '#AFC1D2', padding: 8 }}>{t('eventImprovements.columnsHint')}</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, color: '#94A3B8' }}><input type="checkbox" checked disabled />{label('name')}</label>
            {optionalColumns.map(column => <label className="roster-column-option" key={column} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={columns.includes(column)} onChange={e => updateColumns(e.target.checked ? [...columns, column] : columns.filter(c => c !== column))} style={{ width: 16, height: 16, accentColor: '#0684F5' }} />{label(column)}
            </label>)}
            <button onClick={() => updateColumns(defaults)} style={{ color: '#93C5FD', width: '100%', textAlign: 'start', padding: 10, borderTop: '1px solid #47637D', fontSize: 13 }}>{t('eventImprovements.resetColumns')}</button>
          </PopoverContent>
        </Popover>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', color: '#AFC1D2', fontSize: 12 }}>
        {(['absent', 'event', 'session'] as const).map(status => <span key={status} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: attendanceColors[status] }} />{t(`eventImprovements.attendanceLegend.${status}`)}</span>)}
      </div>
      {loading ? <p role="status">{t('eventImprovements.loading')}</p> : failed ? <div role="alert"><p>{t('eventImprovements.rosterError')}</p><button onClick={() => { void refetch(); }} style={{ color: '#93C5FD', marginTop: 10 }}>{t('eventImprovements.retry')}</button></div> : <>
        <p role="status" style={{ color: '#AFC1D2', fontSize: 13 }}>{t('eventImprovements.rosterShowing', { count: visible.length, total: people.length })}</p>
        {!visible.length ? <p style={{ color: '#AFC1D2' }}>{t(people.length ? 'eventImprovements.noResults' : 'eventImprovements.noParticipants')}</p> :
          <div style={{ overflowX: 'auto', border: '1px solid #304B63', borderRadius: 12 }}>
            <table className="session-roster-table" aria-label={t('manageEvent.agenda.modals.attendees.title')}>
              <thead><tr><th scope="col">{label('name')}</th>{visibleColumns.map(c => <th scope="col" key={c}>{label(c)}</th>)}</tr></thead>
              <tbody>{visible.map(person => <tr key={person.id}><td data-label={label('name')}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AttendanceDot status={person.attendance} name={person.name} /><span className="session-roster-name">{person.name}</span></span></td>
                {visibleColumns.map(c => <td key={c} data-label={label(c)}><span>{person[c] || <span style={{ color: '#94A3B8', fontSize: 12 }}>{t('eventImprovements.notProvided')}</span>}</span></td>)}
              </tr>)}</tbody>
            </table>
          </div>}
      </>}
    </DialogContent>
  </Dialog>;
}
