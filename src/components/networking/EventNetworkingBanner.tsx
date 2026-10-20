import { useEffect, useId, useState } from 'react';
import { ArrowUpRight, CirclePause, CirclePlay, Plus, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { Link } from 'react-router-dom';
import { hasTransparency, isBlankImage } from '../../utils/imageTransparency';
import NetworkingParticles from './NetworkingParticles';
import './EventNetworkingBanner.css';

const copy = {
  en: {
    eyebrow: 'The right connection changes everything', title: 'Connect with',
    words: ['your next partner.', 'new perspectives.', 'new possibilities.'],
    accessibleTitle: 'Connect with your next partner.',
    description: 'Discover the people behind the ideas. Start a conversation, find common ground and meet at',
    explore: 'Explore B2B profiles', participants: 'B2B attendees', matches: 'Potential matches',
    sectors: 'Different sectors. Shared possibilities.', network: 'Your next connection', pause: 'Pause animation', play: 'Play animation',
    eventFallback: 'this event',
  },
  fr: {
    eyebrow: 'Une rencontre peut tout changer', title: 'Rencontrez',
    words: ['votre futur partenaire.', 'des experts passionnés.', 'les acteurs de demain.'],
    accessibleTitle: 'Rencontrez votre futur partenaire.',
    description: 'Découvrez les personnes derrière les idées. Échangez, trouvez vos points communs et rencontrez-vous à',
    explore: 'Explorer les profils B2B', participants: 'Participants B2B', matches: 'Rencontres potentielles',
    sectors: 'Des secteurs variés. Des perspectives communes.', network: 'Votre prochaine rencontre', pause: 'Mettre l’animation en pause', play: 'Reprendre l’animation',
    eventFallback: 'cet événement',
  },
  ar: {
    eyebrow: 'لقاء واحد قد يفتح آفاقاً جديدة', title: 'تواصل مع',
    words: ['شريكك القادم.', 'أصحاب أفكار جديدة.', 'عالم من الفرص.'],
    accessibleTitle: 'تواصل مع شريكك القادم.',
    description: 'تعرّف على الأشخاص وراء الأفكار. ابدأ حواراً، واكتشف اهتماماتكم المشتركة، والتقوا في',
    explore: 'استكشف ملفات المشاركين', participants: 'المشاركون في لقاءات الأعمال', matches: 'لقاءات محتملة',
    sectors: 'قطاعات متنوعة وآفاق مشتركة', network: 'لقاؤك القادم', pause: 'إيقاف الحركة مؤقتاً', play: 'تشغيل الحركة',
    eventFallback: 'هذا الحدث',
  },
};

type BannerParticipant = { id: string; profile_id?: string | null; name?: string; final_avatar?: string | null };

function ParticipantPhoto({ person, onUnavailable }: { person: BannerParticipant; onUnavailable: () => void }) {
  const [plainImage, setPlainImage] = useState(false);
  const [transparent, setTransparent] = useState(false);
  const photo = <img key={String(plainImage)} src={person.final_avatar!} alt={person.name || ''}
    width={48} height={48} decoding="async" crossOrigin={plainImage ? undefined : 'anonymous'}
    onLoad={event => isBlankImage(event.currentTarget) ? onUnavailable() : setTransparent(hasTransparency(event.currentTarget))}
    onError={() => plainImage ? onUnavailable() : setPlainImage(true)} />;
  return person.profile_id
    ? <Link to={`/profile/${person.profile_id}`} className="event-network-banner__avatar" data-transparent={transparent} title={person.name}>{photo}</Link>
    : <span className="event-network-banner__avatar" data-transparent={transparent} title={person.name}>{photo}</span>;
}

type Props = {
  eventName?: string;
  participantCount: number;
  participants?: BannerParticipant[];
  matchCount: number | null;
  onExplore?: () => void;
};

export default function EventNetworkingBanner({ eventName, participantCount, participants = [], matchCount, onExplore }: Props) {
  const { locale } = useI18n();
  const labels = copy[locale];
  const titleId = useId();
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(() => new Set());
  const seen = new Set<string>();
  const featuredPeople = participants.filter(person => {
    const identity = person.profile_id || person.id;
    if (!person.final_avatar || failedPhotos.has(person.final_avatar) || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  }).slice(0, 5);
  const remainingCount = Math.max(0, participantCount - featuredPeople.length);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [typed, setTyped] = useState({ locale, text: labels.words[0] });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    let wordIndex = 0;
    let characterIndex = Array.from(labels.words[0]).length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const characters = Array.from(labels.words[wordIndex]);
      characterIndex += deleting ? -1 : 1;
      setTyped({ locale, text: characters.slice(0, Math.max(0, characterIndex)).join('') });
      let delay = deleting ? 32 : 72;
      if (characterIndex <= 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % labels.words.length;
        delay = 240;
      } else if (characterIndex >= characters.length) {
        deleting = true;
        delay = 3100;
      }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 4200);
    return () => clearTimeout(timer);
  }, [labels, locale, paused, reducedMotion]);

  return (
    <section className="event-network-banner" dir={locale === 'ar' ? 'rtl' : 'ltr'} data-paused={paused || reducedMotion} aria-labelledby={titleId}>
      <NetworkingParticles paused={paused || reducedMotion} />
      <div className="event-network-banner__atmosphere" aria-hidden="true" />
      {!reducedMotion && <button type="button" className="event-network-banner__motion" onClick={() => setPaused(value => !value)} aria-label={paused ? labels.play : labels.pause} title={paused ? labels.play : labels.pause}>{paused ? <CirclePlay size={19} /> : <CirclePause size={19} />}</button>}
      <div className="event-network-banner__main">
        <div className="event-network-banner__copy">
          <p className="event-network-banner__eyebrow"><span className="event-network-banner__badge">B2B</span><span>{labels.eyebrow}</span></p>
          <h1 id={titleId} className="event-network-banner__title" aria-label={labels.accessibleTitle} dir="auto">
            <span aria-hidden="true">{labels.title}</span>
            <span className="event-network-banner__typed" aria-hidden="true" dir="auto">
              <span className="event-network-banner__title-sizer">{labels.words.reduce((longest, word) => word.length > longest.length ? word : longest, '')}</span>
              <span className="event-network-banner__typing-text">{reducedMotion || typed.locale !== locale ? labels.words[0] : typed.text}<span className="event-network-banner__cursor" /></span>
            </span>
          </h1>
          <p className="event-network-banner__description" dir="auto">{labels.description} <strong>{eventName || labels.eventFallback}</strong>.</p>
          {onExplore && <button type="button" className="event-network-banner__explore" onClick={onExplore}>{labels.explore}<span><ArrowUpRight size={19} aria-hidden="true" /></span></button>}
          <div className="event-network-banner__social-proof">
            {featuredPeople.length > 0 && <div className="event-network-banner__people">
              {featuredPeople.map(person => <ParticipantPhoto key={`${person.id}:${person.final_avatar}`} person={person}
                onUnavailable={() => setFailedPhotos(previous => new Set(previous).add(person.final_avatar!))} />)}
              {remainingCount > 0 && (onExplore
                ? <button type="button" className="event-network-banner__more" onClick={onExplore} aria-label={labels.explore} title={labels.explore}><Plus size={20} aria-hidden="true" /></button>
                : <span className="event-network-banner__more" aria-hidden="true"><Plus size={20} /></span>)}
            </div>}
            <p className="event-network-banner__participant-count"><strong>{participantCount.toLocaleString(locale)}</strong> {labels.participants}</p>
            {matchCount !== null && <p className="event-network-banner__matches"><Sparkles size={14} aria-hidden="true" /><strong>{matchCount.toLocaleString(locale)}</strong> {labels.matches}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
