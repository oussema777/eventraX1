import { useParticipantBusinesses } from '../../hooks/useParticipantBusinesses';
import ParticipantBusinessIdentity from './ParticipantBusinessIdentity';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  CalendarDays,
  Handshake,
  Landmark,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { useLocalizedLabels } from '../../i18n/useLocalizedLabels';
import { supabase } from '../../lib/supabase';
import { loadEventNetworkingParticipants } from '../../lib/eventNetworkingParticipants';
import { eventAuthPath } from '../../utils/authRedirect';
import { eventPublicPath } from '../../utils/eventLinks';
import { investorShowcaseCopy } from './investorShowcaseCopy';
import './EventInvestorShowcase.css';

type EventRef = { id: string; seo_slug?: string | null };
export function InvestorDiscoveryBanner({ event }: { event: EventRef }) {
  const { locale } = useI18n();
  const c = investorShowcaseCopy[locale];
  return (
    <aside className="investor-discovery" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="investor-discovery__icon">
        <Handshake size={28} />
      </div>
      <div>
        <span>{c.nav}</span>
        <h2>{c.banner}</h2>
        <p>{c.bannerHint}</p>
      </div>
      <Link to={eventPublicPath(event, 'investors')}>
        {c.explore}
        <ArrowUpRight size={18} />
      </Link>
    </aside>
  );
}

export default function EventInvestorShowcase({
  eventId,
  onRequestMeeting,
}: {
  eventId: string;
  onRequestMeeting: (person: {
    id: string;
    name: string;
    avatar?: string | null;
  }) => void;
}) {
  const { user } = useAuth();
  return (
    <InvestorShowcase
      key={`${eventId}:${user?.id}`}
      eventId={eventId}
      onRequestMeeting={onRequestMeeting}
    />
  );
}

function InvestorShowcase({
  eventId,
  onRequestMeeting,
}: {
  eventId: string;
  onRequestMeeting: (person: {
    id: string;
    name: string;
    avatar?: string | null;
  }) => void;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { locale } = useI18n();
  const c = investorShowcaseCopy[locale];
  const { label } = useLocalizedLabels();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const directory = useQuery({
    queryKey: ['attendee-investor-showcase', eventId, user?.id],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      const [registration, staff] = await Promise.all([
        supabase
          .from('event_attendees')
          .select('id')
          .eq('event_id', eventId)
          .eq('profile_id', user!.id)
          .in('status', ['registered', 'approved'])
          .limit(1),
        supabase.rpc('event_can', {
          p_event_id: eventId,
          p_permission: 'read',
        }),
      ]);
      if (registration.error || staff.error)
        throw registration.error || staff.error;
      if (!registration.data?.length && !staff.data)
        return { allowed: false, people: [] };
      // Use the event-scoped, authenticated directory RPC; never expose invitation emails or pending invitations.
      const { data: investors, error } = await supabase.rpc(
        'list_event_investors',
        { p_event: eventId }
      );
      if (error) throw error;
      const ids = new Set(
        (investors || [])
          .map((row: { profile_id: string | null }) => row.profile_id)
          .filter(Boolean)
      );
      if (!ids.size) return { allowed: true, people: [] };
      const participants = await loadEventNetworkingParticipants(eventId);
      return {
        allowed: true,
        people: participants.filter((p) => ids.has(p.id)),
      };
    },
  });
  const people = directory.data?.people || [];
  const query = search.trim().toLocaleLowerCase(locale);
  const filtered = people.filter((p) =>
    [p.full_name, p.company, p.job_title, p.sector, ...p.interests].some(
      (value) =>
        value &&
        (value.toLocaleLowerCase(locale).includes(query) ||
          label(value).toLocaleLowerCase(locale).includes(query))
    )
  );
  const businesses = useParticipantBusinesses(filtered.slice(page*12,page*12+12).map(p=>p.id));
  const totalPages = Math.max(1, Math.ceil(filtered.length / 12));
  const currentPage = Math.min(page, totalPages - 1);
  const entry = (
    <div className="investor-showcase__entry">
      <h2>{user ? c.registration : c.signIn}</h2>
      <p>{user ? c.registrationHint : c.signInHint}</p>
      <div>
        {!user && (
          <Link
            className="investor-showcase__primary"
            to={eventAuthPath(`/event/${eventId}/investors`)}
          >
            {c.login}
          </Link>
        )}
        <Link
          className="investor-showcase__secondary"
          to={`/event/${eventId}/register`}
        >
          {c.register}
        </Link>
      </div>
    </div>
  );
  return (
    <section
      className="investor-showcase"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      aria-label={c.title}
    >
      <header className="investor-showcase__hero">
        <span className="investor-showcase__eyebrow">
          <Landmark size={18} />
          {c.nav}
        </span>
        <h1>{c.title}</h1>
        <p>{c.intro}</p>
        <ol className="investor-showcase__steps">
          {[c.step1, c.step2, c.step3].map((step, i) => (
            <li key={step}>
              <span>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </header>
      {authLoading ? (
        <p role="status">{c.loading}</p>
      ) : !user ? (
        entry
      ) : directory.isPending ? (
        <p role="status">{c.loading}</p>
      ) : directory.isError ? (
        <div className="investor-showcase__entry" role="alert">
          <p>{c.failed}</p>
          <button onClick={() => void directory.refetch()}>{c.retry}</button>
        </div>
      ) : !directory.data?.allowed ? (
        entry
      ) : (
        <>
          <div className="investor-showcase__toolbar">
            <strong>
              {people.length} {people.length === 1 ? c.investor.toLocaleLowerCase(locale) : c.count}
            </strong>
            <label>
              <Search size={18} />
              <input
                type="search"
                aria-label={c.search}
                placeholder={c.search}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </label>
          </div>
          {!people.length ? (
            <div className="investor-showcase__entry">
              <Landmark size={32} />
              <h2>{c.empty}</h2>
              <p>{c.emptyHint}</p>
            </div>
          ) : !filtered.length ? (
            <div className="investor-showcase__entry">
              <h2>{c.noResults}</h2>
              <button onClick={() => setSearch('')}>{c.clear}</button>
            </div>
          ) : (
            <div className="investor-showcase__grid">
              {filtered
                .slice(currentPage * 12, currentPage * 12 + 12)
                .map((p) => (
                  <article className="investor-showcase__card" key={p.id}>
                    <div className="investor-showcase__identity">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" loading="lazy" />
                      ) : (
                        <span
                          className="investor-showcase__initials"
                          aria-hidden="true"
                        >
                          {(p.full_name || p.company || 'I')
                            .split(/\s+/)
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                      )}
                      <span className="investor-showcase__badge">
                        <Landmark size={13} />
                        {c.investor}
                      </span>
                    </div>
                    <h2>{p.full_name || p.company || c.investor}</h2>
                    {p.job_title && (
                      <p className="investor-showcase__job">{p.job_title}</p>
                    )}
                    {p.company && (
                      <p className="investor-showcase__company">{p.company}</p>
                    )}
                    <ParticipantBusinessIdentity businesses={businesses.data?.get(p.id) || []}/>
                    <div className="investor-showcase__tags">
                      {[
                        ...new Set(
                          [p.sector, ...p.interests].filter(
                            (v): v is string => !!v
                          )
                        ),
                      ]
                        .slice(0, 3)
                        .map((v) => (
                          <span key={v}>{label(v)}</span>
                        ))}
                    </div>
                    <div className="investor-showcase__card-actions">
                      <Link
                        className="investor-showcase__secondary"
                        to={`/event/${eventId}/profile/${p.id}`}
                      >
                        {c.view}
                        <ArrowUpRight size={15} />
                      </Link>
                      {p.id !== user.id ? (
                        <button
                          className="investor-showcase__primary"
                          onClick={() =>
                            onRequestMeeting({
                              id: p.id,
                              name: p.full_name || p.company || c.investor,
                              avatar: p.avatar_url,
                            })
                          }
                        >
                          <CalendarDays size={16} />
                          {c.book}
                        </button>
                      ) : (
                        <span>{c.own}</span>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          )}
          {totalPages > 1 && (
            <nav className="investor-showcase__pagination" aria-label={c.nav}>
              <button
                disabled={!currentPage}
                onClick={() => setPage(currentPage - 1)}
              >
                {c.previous}
              </button>
              <span>
                {c.page} {currentPage + 1} {c.of} {totalPages}
              </span>
              <button
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                {c.next}
              </button>
            </nav>
          )}
          <p className="investor-showcase__note">
            <ShieldCheck size={18} />
            {c.note}
          </p>
        </>
      )}
    </section>
  );
}
