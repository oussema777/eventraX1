import { useState } from 'react';
import { AlertCircle, Calendar, Check, CheckCheck, Clock, Lock, MapPin, User, X } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { getBulkSessionIds, isSessionOpen, validateSessionSelection, type BookableSession } from '../../utils/sessionBooking';
import { groupAgendaSessions, resolveAgendaTimeZone, type DatedSession } from '../../utils/agendaDates';
import './RegistrationAgenda.css';

interface AgendaSession extends BookableSession, DatedSession { location?: string; speaker_name?: string }
interface Props {
  sessions: AgendaSession[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
  workshopLimit: number | null;
  timeZone?: string;
}

export default function RegistrationAgenda({ sessions, selected, onChange, workshopLimit, timeZone }: Props) {
  const { t, locale } = useI18n();
  const [rejectedId, setRejectedId] = useState<string | null>(null);
  const zone = resolveAgendaTimeZone(timeZone);
  const groups = groupAgendaSessions(sessions, zone, locale);
  const workshops = sessions.filter(s => s.type === 'workshop' && selected.has(s.id));
  const bulkIds = getBulkSessionIds(sessions, workshopLimit);
  const allBulkSelected = bulkIds.length > 0 && bulkIds.every(id => selected.has(id));
  const hasWorkshops = sessions.some(s => s.type === 'workshop');
  const atLimit = workshopLimit !== null && workshops.length >= workshopLimit;
  const rule = t(workshopLimit === 1 ? 'agendaBooking.workshopRuleSingle' : 'agendaBooking.workshopRule', { count: workshopLimit || 0 });
  const limitMessage = t(workshopLimit === 1 ? 'agendaBooking.workshopLimitReachedSingle' : 'agendaBooking.workshopLimitReached', { count: workshopLimit || 0 });
  const formatTime = (value: string) => Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat(locale, { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
    : t('agendaBooking.timePending');

  const change = (next: Set<string>) => { setRejectedId(null); onChange(next); };
  const toggle = (session: AgendaSession) => {
    const next = new Set(selected);
    if (next.delete(session.id)) { change(next); return; }
    if (!isSessionOpen(session)) return;
    next.add(session.id);
    if (validateSessionSelection(sessions, next, workshopLimit)) { setRejectedId(session.id); return; }
    change(next);
  };
  const replaceWorkshop = (session: AgendaSession) => {
    const next = new Set([...selected].filter(id => !workshops.some(s => s.id === id)));
    next.add(session.id);
    if (!validateSessionSelection(sessions, next, workshopLimit)) change(next);
  };

  if (!sessions.length) return <div className="registration-agenda-empty"><Calendar size={32} /><p>{t('registrationFlow.noSessionsAvailable')}</p></div>;

  return (
    <div className="registration-agenda">
      <div className="agenda-selection-bar">
        <div className="agenda-selection-summary" role="status" aria-live="polite">
          <span className="agenda-summary-icon"><CheckCheck size={20} /></span>
          <div><strong>{t('agendaBooking.selectionCount', { count: selected.size })}</strong><span>{t('agendaBooking.chooseHint')}</span></div>
        </div>
        <div className="agenda-bulk-actions">
          {bulkIds.length > 0 && <button type="button" className="agenda-bulk-button"
            onClick={() => change(allBulkSelected ? new Set([...selected].filter(id => !bulkIds.includes(id))) : new Set([...selected, ...bulkIds]))}>
            {allBulkSelected ? <X size={16} /> : <CheckCheck size={16} />}
            {t(allBulkSelected ? 'agendaBooking.clearBulk' : workshopLimit === null ? 'registrationFlow.selectAllSessions' : 'agendaBooking.bulkSelect')}
          </button>}
          {selected.size > 0 && <button type="button" className="agenda-clear-button" onClick={() => change(new Set())}>{t('agendaBooking.clearAll')}</button>}
        </div>
      </div>

      {workshopLimit !== null && hasWorkshops && <div className="agenda-workshop-rule">
        <div className="agenda-rule-heading"><span><Lock size={15} />{rule}</span><strong>{workshops.length} / {workshopLimit}</strong></div>
        <p>{t('agendaBooking.bulkHint')}</p>
        {workshops.length > 0 && <div className="agenda-workshop-choices">{workshops.map(s => (
          <button key={s.id} type="button" onClick={() => toggle(s)} aria-label={t('agendaBooking.removeChoice', { title: s.title.trim() })}>
            <Check size={14} /><span>{s.title.trim()}</span><X size={14} />
          </button>
        ))}</div>}
      </div>}

      <p className="agenda-timezone"><Clock size={13} />{t('agendaBooking.timezone', { zone })}</p>
      {groups.map((group, index) => (
        <section className="agenda-date-group" key={group.key} aria-labelledby={`agenda-date-${index}`}>
          <div className="agenda-date-heading">
            <span className="agenda-calendar-icon"><Calendar size={19} /></span>
            <div><h2 id={`agenda-date-${index}`}>{group.date
              ? new Intl.DateTimeFormat(locale, { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(group.date)
              : t('agendaBooking.datePending')}</h2><span>{t('agendaBooking.dayCount', { count: group.sessions.length })}</span></div>
          </div>
          <div className="agenda-date-sessions">{group.sessions.map(session => {
            const isSelected = selected.has(session.id), isOpen = isSessionOpen(session);
            const isWorkshop = session.type === 'workshop';
            const rejected = rejectedId === session.id && !isSelected && isWorkshop && atLimit;
            const errorId = `agenda-error-${session.id}`;
            return <article key={session.id} className={`agenda-session-card${isSelected ? ' is-selected' : ''}${!isOpen ? ' is-closed' : ''}${rejected ? ' is-rejected' : ''}`}>
              <button type="button" className="agenda-session-choice" role="checkbox" aria-checked={isSelected} aria-disabled={!isOpen}
                aria-label={session.title.trim()} aria-describedby={rejected ? errorId : undefined} tabIndex={isOpen ? 0 : -1} onClick={() => toggle(session)}>
                <span className="agenda-session-check" aria-hidden="true">{!isOpen ? <Lock size={13} /> : isSelected ? <Check size={15} /> : null}</span>
                <span className="agenda-session-content">
                  <span className="agenda-session-meta"><span className="agenda-session-time"><Clock size={13} />{formatTime(session.starts_at)} – {formatTime(session.ends_at)}</span>
                    {isWorkshop && <span className="agenda-type-tag">{t('wizard.step3.sessions.types.workshop')}</span>}
                    {isSelected && <span className="agenda-selected-tag">{t('agendaBooking.selected')}</span>}
                  </span>
                  <span className="agenda-session-title">{session.title.trim()}</span>
                  {(session.speaker_name || session.location) && <span className="agenda-session-details">
                    {session.speaker_name && <span><User size={13} />{session.speaker_name}</span>}
                    {session.location && <span><MapPin size={13} />{session.location}</span>}
                  </span>}
                  {!isOpen && <span className="agenda-closed-label">{t('agendaBooking.closed')}</span>}
                  {isOpen && !isSelected && isWorkshop && atLimit && !rejected && <span className="agenda-limit-hint">{t('agendaBooking.limitHintCard')}</span>}
                </span>
              </button>
              {rejected && <div className="agenda-card-error" id={errorId} role="alert">
                <p><AlertCircle size={17} /><span>{limitMessage}</span></p>
                {workshopLimit === 1 && isOpen && <button type="button" className="agenda-replace-button" onClick={() => replaceWorkshop(session)}>{t('agendaBooking.replaceWorkshop')}</button>}
              </div>}
            </article>;
          })}</div>
        </section>
      ))}
    </div>
  );
}
