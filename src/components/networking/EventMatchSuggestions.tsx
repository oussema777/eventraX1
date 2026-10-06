import { useI18n } from '../../i18n/I18nContext';
import { useRef, useState } from 'react';
import { nextMatchBatch } from '../../utils/eventRecommendations';
import type { rankEventParticipants } from '../../utils/eventRecommendations';
import type { RecommendationState } from '../../hooks/useEventRecommendations';

function MatchAvatar({ url, name, color }: { url?: string | null; name: string; color: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return <div aria-hidden="true" style={{ borderRadius: '50%', width: 72, height: 72, flexShrink: 0, overflow: 'hidden', marginBottom: 12, background: color, display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700 }}>
    {url && failedUrl !== url
      ? <img src={url} alt="" onError={() => setFailedUrl(url)} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center' }} />
      : name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase()}
  </div>;
}

export default function EventMatchSuggestions({ matches, state, signedIn, loading, failed, onRetry, onGenerate, onLogin, onView, onBook, onMessage, messagePending, brandColor }: {
  state?: RecommendationState;
  matches: ReturnType<typeof rankEventParticipants>;
  signedIn: boolean; loading: boolean; failed: boolean; messagePending: boolean;
  onRetry: () => void; onLogin: () => void;
  onGenerate: () => Promise<ReturnType<typeof rankEventParticipants>>;
  onView: (person: { id: string }) => void;
  onBook: (person: { id: string; name: string }) => void;
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
    {!signedIn ? <button onClick={onLogin} style={{ color: '#93C5FD' }}>{t('eventImprovements.signInMatches')}</button>
      : loading ? <p role="status" style={{ color: '#94A3B8' }}>{t('eventImprovements.loadingMatches')}</p>
      : failed && !matches.length ? <div role="alert" style={{ color: '#94A3B8' }}><p>{t('eventImprovements.matchesError')}</p><button onClick={onRetry}>{t('eventImprovements.retry')}</button></div>
      : state && state !== 'ready' ? <p style={{ color: '#94A3B8' }}>{t(`eventImprovements.${state}`)}</p>
      : !matches.length ? <p style={{ color: '#94A3B8' }}>{t('eventImprovements.noMatches')}</p>
      : <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 24 }}>
          {displayed.map(person => <article key={person.id} style={{ border: '1px solid #334155', borderRadius: 16, padding: 20, color: '#fff', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflowWrap: 'anywhere' }}>
            <span aria-label={t('eventImprovements.matchScore', { score: person.score })}
              title={t('eventImprovements.matchScore', { score: person.score })}
              style={{ alignSelf: 'flex-end', color: '#6EE7B7', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 999, padding: '3px 8px', fontWeight: 700, fontSize: 12, lineHeight: '18px', fontVariantNumeric: 'tabular-nums' }}>{person.score}/100</span>
            <MatchAvatar url={person.avatar_url} name={person.full_name || ''} color={brandColor} />
            <h4 style={{ fontWeight: 700, fontSize: 18 }}>{person.full_name}</h4>
            <p style={{ color: '#94A3B8' }}>{[person.job_title, person.company].filter(Boolean).join(' · ')}</p>
            <ul style={{ color: '#6EE7B7', padding: '12px 0', fontSize: 13 }}>
              {person.sameSector && <li>{t('eventImprovements.sharedSector', { sector: person.sector || '' })}</li>}
              {person.sharedInterests.length > 0 && <li>{t('eventImprovements.sharedInterests', { interests: person.sharedInterests.join(', ') })}</li>}
            </ul>
            <div style={{ display: 'grid', gap: 8, width: '100%', marginTop: 'auto' }}>
              <button onClick={() => onView({ id: person.id })} style={{ border: '1px solid #475569', borderRadius: 8, padding: 8 }}>{t('eventImprovements.viewProfile')}</button>
              <button onClick={() => onBook({ id: person.id, name: person.full_name || '' })} style={{ background: brandColor, borderRadius: 8, padding: 8, fontWeight: 600 }}>{t('eventImprovements.bookMeeting')}</button>
              <button disabled={messagePending} onClick={() => onMessage(person.id)} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 8, opacity: messagePending ? 0.5 : 1 }}>{t('eventImprovements.message')}</button>
            </div>
          </article>)}
        </div>
      </>}
  </section>;
}
