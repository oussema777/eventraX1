import ParticipantCard from './ParticipantCard';
import EventNetworkingAccess from './EventNetworkingAccess';
import { useI18n } from '../../i18n/I18nContext';
import { useRef, useState } from 'react';
import { nextMatchBatch } from '../../utils/eventRecommendations';
import type { rankEventParticipants } from '../../utils/eventRecommendations';
import type { RecommendationState } from '../../hooks/useEventRecommendations';

export default function EventMatchSuggestions({ matches, state, signedIn, loading, failed, onRetry, onGenerate, onRegister, onAccess, onView, onBook, onMessage, messagePending, brandColor }: {
  state?: RecommendationState;
  matches: ReturnType<typeof rankEventParticipants>;
  signedIn: boolean; loading: boolean; failed: boolean; messagePending: boolean;
  onRetry: () => void; onRegister: () => void; onAccess: () => void;
  onGenerate: () => Promise<ReturnType<typeof rankEventParticipants>>;
  onView: (person: { id: string }) => void;
  onBook: (person: { id: string; name: string; avatar?: string | null }) => void;
  onMessage: (id: string) => void;
  brandColor: string;
}) {
  const { t } = useI18n();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [restarted, setRestarted] = useState(false);
  const lock = useRef(false);
  const selected = matches.filter(person => selectedIds.includes(person.id));
  const displayed = selected.length ? selected : matches.slice(0, 3);
  const generate = async () => {
    if (lock.current) return;
    lock.current = true; setGenerating(true); setGenerationError(false); setRestarted(false);
    try {
      const fresh = await onGenerate();
      const next = nextMatchBatch(fresh, [...seenIds, ...displayed.map(person => person.id)]);
      setSelectedIds(next.batch.map(person => person.id)); setSeenIds(next.seenIds); setRestarted(next.restarted);
    } catch { setGenerationError(true); }
    finally { lock.current = false; setGenerating(false); }
  };
  return <section aria-label={t('eventImprovements.matchSuggestions')} style={{ marginBottom: 40 }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{t('eventImprovements.matchSuggestions')}</h3>
      {signedIn && state === 'ready' && <button onClick={generate} disabled={loading || generating}
        style={{ border: '1px solid #475569', padding: '10px 16px', borderRadius: 10, color: '#fff', background: brandColor, opacity: generating ? 0.6 : 1 }}>
        {t(generating ? 'eventImprovements.generatingMatches' : 'eventImprovements.generateMatches')}
      </button>}
    </div>
    {generationError && <p role="alert" style={{ color: '#FCA5A5', marginBottom: 12 }}>{t('eventImprovements.generationError')}</p>}
    {restarted && <p role="status" style={{ color: '#94A3B8', marginBottom: 12 }}>{t('eventImprovements.allMatchesSeen')}</p>}
    {!signedIn ? <EventNetworkingAccess b2bDisabled={false} onRegister={onRegister} onAccess={onAccess} />
      : loading ? <p role="status" style={{ color: '#94A3B8' }}>{t('eventImprovements.loadingMatches')}</p>
      : failed && !matches.length ? <div role="alert" style={{ color: '#94A3B8' }}><p>{t('eventImprovements.matchesError')}</p><button onClick={onRetry}>{t('eventImprovements.retry')}</button></div>
      : state === 'notRegistered' || state === 'b2bDisabled' ? <EventNetworkingAccess b2bDisabled={state === 'b2bDisabled'} onRegister={onRegister} onAccess={onAccess} />
      : state && state !== 'ready' ? <p style={{ color: '#94A3B8' }}>{t(`eventImprovements.${state}`)}</p>
      : !matches.length ? <p style={{ color: '#94A3B8' }}>{t('eventImprovements.noMatches')}</p>
      : <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 24 }}>
          {displayed.map(person => <ParticipantCard key={person.id} name={person.full_name || ''}
            avatar={person.avatar_url} title={person.job_title} company={person.company} score={person.score}
            tags={[person.sector, ...person.sharedInterests].filter(Boolean) as string[]}
            reason={[person.sameSector ? t('eventImprovements.sharedSector', { sector: person.sector || '' }) : '', person.sharedInterests.length ? t('eventImprovements.sharedInterests', { interests: person.sharedInterests.join(', ') }) : ''].filter(Boolean).join(' · ')}
            onView={() => onView({ id: person.id })} onBook={() => onBook({ id: person.id, name: person.full_name || '', avatar: person.avatar_url })}
            bookLabel={t('eventImprovements.bookMeeting')} onMessage={() => onMessage(person.id)} messagePending={messagePending} />)}
        </div>
      </>}
  </section>;
}
