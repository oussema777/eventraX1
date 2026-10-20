import ParticipantCard from './ParticipantCard';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, Users } from 'lucide-react';
import { loadEventNetworkingParticipants } from '../../lib/eventNetworkingParticipants';
import { compareParticipantImages } from '../../utils/participantOrder';
import { useI18n } from '../../i18n/I18nContext';
import { useLocalizedLabels } from '../../i18n/useLocalizedLabels';
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
  onRequestMeeting: (participant: { id: string; name: string; avatar?: string | null }) => void;
}

export default function EventNetworkingPeople({ eventId, userId, onRequestMeeting }: Props) {
  const { t } = useI18n();
  const { label: localizedLabel } = useLocalizedLabels();
  const navigate = useNavigate();
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
        const participants = await loadEventNetworkingParticipants(eventId);
        const profiles = participants.filter(person => person.id !== userId);
        if (!cancelled) setPeople(profiles.sort(compareParticipantImages));
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
      .some(value => value?.toLocaleLowerCase().includes(query) || localizedLabel(value).toLocaleLowerCase().includes(query)));
  }, [people, search, localizedLabel]);

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
                <ParticipantCard key={person.id} name={name} avatar={person.avatar_url} title={person.job_title} company={person.company}
                  tags={[person.sector, ...(person.interests || [])].filter(Boolean) as string[]}
                  onView={() => navigate(`/event/${eventId}/profile/${person.id}?from=my-networking`)}
                  onBook={() => onRequestMeeting({ id: person.id, name, avatar: person.avatar_url })} />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
