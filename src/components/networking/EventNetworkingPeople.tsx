import { useEffect, useMemo, useState } from 'react';
import { Building2, Calendar, Loader2, Search, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';
import './EventNetworkingPeople.css';

interface Participant {
  id: string;
  full_name: string | null;
  job_title: string | null;
  company: string | null;
  avatar_url: string | null;
  sector: string | null;
  interests: string[] | null;
}

interface Props {
  eventId: string;
  userId: string;
  onRequestMeeting: (participant: { id: string; name: string }) => void;
}

export default function EventNetworkingPeople({ eventId, userId, onRequestMeeting }: Props) {
  const { t } = useI18n();
  const [people, setPeople] = useState<Participant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setPeople([]);
    setSearch('');
    const load = async () => {
      try {
        const ids = new Set<string>();
        // Page through registrations so discovery is not capped by the API row limit.
        for (let offset = 0; ; offset += 500) {
          const { data, error } = await supabase.from('event_attendees')
            .select('profile_id')
            .eq('event_id', eventId)
            .eq('status', 'registered')
            .eq('meta->>b2bOptIn', 'true')
            .neq('profile_id', userId)
            .order('id')
            .range(offset, offset + 499);
          if (error) throw error;
          if (cancelled) return;
          for (const row of data || []) if (row.profile_id) ids.add(row.profile_id);
          if (!data || data.length < 500) break;
        }
        const profiles: Participant[] = [];
        const profileIds = [...ids];
        for (let offset = 0; offset < profileIds.length; offset += 100) {
          const { data, error } = await supabase.from('profiles')
            .select('id, full_name, job_title, company, avatar_url, sector, interests')
            .in('id', profileIds.slice(offset, offset + 100));
          if (error) throw error;
          if (cancelled) return;
          profiles.push(...(data || []));
        }
        if (!cancelled) setPeople(profiles.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')));
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [eventId, userId, retry]);

  const visiblePeople = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return people;
    return people.filter(person => [person.full_name, person.job_title, person.company, person.sector, ...(person.interests || [])]
      .some(value => value?.toLocaleLowerCase().includes(query)));
  }, [people, search]);

  return (
    <section className="networking-people" aria-label={t('networking.people.title')}>
      <div className="networking-people-header">
        <div>
          <h2>{t('networking.people.title')}</h2>
          <p>{t('networking.people.subtitle')}</p>
        </div>
        <div className="networking-people-search">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            aria-label={t('networking.people.search')} placeholder={t('networking.people.search')}
          />
        </div>
      </div>
      {loading ? (
        <div role="status" className="networking-people-state">
          <Loader2 className="animate-spin" size={20} />{t('networking.people.loading')}
        </div>
      ) : failed ? (
        <div role="alert" className="networking-people-state">
          <p>{t('networking.people.error')}</p>
          <button onClick={() => setRetry(value => value + 1)} className="networking-people-retry">{t('networking.people.retry')}</button>
        </div>
      ) : visiblePeople.length === 0 ? (
        <div className="networking-people-state">
          <Users size={32} />
          <p>{t(people.length ? 'networking.people.noResults' : 'networking.people.empty')}</p>
        </div>
      ) : (
        <>
          <p className="networking-people-count" aria-live="polite">{t('networking.people.count', { count: visiblePeople.length })}</p>
          <div className="networking-people-grid">
            {visiblePeople.map(person => {
              const name = person.full_name || t('networking.defaults.user');
              return (
                <article key={person.id} className="networking-people-card">
                  <div className="networking-people-identity">
                    {person.avatar_url ? <img src={person.avatar_url} alt="" className="networking-people-avatar" /> : (
                      <div className="networking-people-avatar">{name.slice(0, 1).toUpperCase()}</div>
                    )}
                    <div>
                      <h3>{name}</h3>
                      {person.job_title && <p>{person.job_title}</p>}
                    </div>
                  </div>
                  {person.company && <p className="networking-people-company"><Building2 size={16} />{person.company}</p>}
                  <div className="networking-people-tags">
                    {[...new Set([person.sector, ...(person.interests || [])].filter(Boolean))].slice(0, 4).map(tag => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <button onClick={() => onRequestMeeting({ id: person.id, name })}
                    className="networking-people-request">
                    <Calendar size={16} />{t('networking.people.requestMeeting')}
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
