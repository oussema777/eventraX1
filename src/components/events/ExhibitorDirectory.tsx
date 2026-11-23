import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight, Bookmark, BookmarkCheck, CalendarDays, Check, LayoutGrid, MapPin, Search, X } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { loadPublicExhibitors, type PublicExhibitor } from '../../lib/publicExhibitors';
import { exhibitorDirectoryCopy } from './exhibitorDirectoryCopy';
import { Link } from 'react-router-dom';
import './exhibitorDirectory.css';

type Copy = typeof exhibitorDirectoryCopy.en;

function webAddress(value: string | null) {
  if (!value?.trim()) return;
  try {
    const url = new URL(value.includes(':') ? value : 'https://' + value.trim());
    if (['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.') && !url.username && !url.password) return url.href;
  } catch { /* Omit malformed addresses from the card. */ }
}

function normalize(text: string) {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase().trim();
}

function ExhibitorCard({ row, copy, saved, onToggle }: { row: PublicExhibitor; copy: Copy; saved: boolean; onToggle: () => void }) {
  const [failedLogo, setFailedLogo] = useState<string>();
  const logo = webAddress(row.logo_url);
  const website = webAddress(row.website_url);
  const initials = row.company_name.trim().split(/\s+/u).slice(0, 2).map(word => Array.from(word)[0]).join('');
  return <article className="expo-card">
    <div className="expo-logo-stage">
      {logo && logo !== failedLogo
        ? <img src={logo} alt="" loading="lazy" onError={() => setFailedLogo(logo)} />
        : <span className="expo-monogram" aria-hidden="true">{initials}</span>}
    </div>
    <div className="expo-card-body">
      <div className="expo-card-title">
        <h2 dir="auto">{row.company_name}</h2>
        <button type="button" className="expo-bookmark" aria-pressed={saved}
          aria-label={`${saved ? copy.remove : copy.save} · ${row.company_name}`}
          title={saved ? copy.remove : copy.save} onClick={onToggle}>
          {saved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
        </button>
      </div>
      {row.sector && <p className="expo-sector" dir="auto">{row.sector}</p>}
      {(row.booth_number || row.booth_location) && <p className="expo-booth"><MapPin size={15} />
        {row.booth_number && <span>{copy.booth} <bdi>{row.booth_number}</bdi></span>}
        {row.booth_location && <bdi>{row.booth_location}</bdi>}</p>}
      {row.description && <p className="expo-description" dir="auto">{row.description}</p>}
      {(website || row.contact_email || row.contact_phone) && <div className="expo-links">
        {website && <a href={website} target="_blank" rel="noopener noreferrer">{copy.website} <ArrowUpRight size={15} /></a>}
        {row.contact_email && <a href={`mailto:${row.contact_email}`}>{copy.email}</a>}
        {row.contact_phone && <a href={`tel:${row.contact_phone}`}>{copy.phone}</a>}
      </div>}
    </div>
  </article>;
}

const pageSize = 24;

interface DirectoryProps {
  eventId: string;
  eventName?: string;
  eventPath: string;
  startDate?: string;
  endDate?: string;
  timeZone: string;
}

export default function ExhibitorDirectory({ eventId, eventName, eventPath, startDate, endDate, timeZone }: DirectoryProps) {
  const { locale } = useI18n();
  const copy = exhibitorDirectoryCopy[locale];
  const storageKey = 'eventra.exhibitor-shortlist.' + eventId;
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    } catch { return []; }
  });
  const [savedOnly, setSavedOnly] = useState(false);
  const [query, setQuery] = useState('');
  const searchField = useRef<HTMLInputElement>(null);
  const [limit, setLimit] = useState(pageSize);
  const directory = useQuery({ queryKey: ['public-exhibitors', eventId], queryFn: () => loadPublicExhibitors(eventId) });
  const rows = directory.data || [];
  const shortlist = rows.filter(row => saved.includes(row.id));
  const term = normalize(query);
  const matches = (savedOnly ? shortlist : rows).filter(row =>
    [row.company_name, row.sector, row.booth_number, row.booth_location].some(value => value && normalize(value).includes(term)));
  const toggle = (id: string) => {
    const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
    setSaved(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Still available during this visit. */ }
  };

  const formatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone });
  const start = Date.parse(startDate || '');
  const end = Date.parse(endDate || '');
  const dates = Number.isFinite(start) && (Number.isFinite(end) && end > start && 'formatRange' in formatter && typeof formatter.formatRange === 'function'
    ? formatter.formatRange(start, end) : formatter.format(start));

  return <main className="expo-directory" dir={locale === 'ar' ? 'rtl' : 'ltr'} aria-labelledby="expo-title">
    <header className="expo-heading">
      <div className="expo-heading-copy">
        {eventName && <Link className="expo-event-link" to={eventPath}><ArrowLeft size={16} /><bdi>{eventName}</bdi></Link>}
        <h1 id="expo-title">{copy.title}</h1>
      </div>
      {dates && <p className="expo-dates"><CalendarDays size={16} /> {dates}</p>}
    </header>
    <div className="expo-content">
      {directory.isPending ? <div role="status" className="expo-state" aria-label={copy.title}>…</div>
        : directory.isError ? <div role="alert" className="expo-state">{copy.error} <button onClick={() => directory.refetch()}>{copy.retry}</button></div>
        : !rows.length ? <p className="expo-state">{copy.empty}</p>
        : <>
          <div className="expo-toolbar">
            <div className="expo-modes">
              <button aria-pressed={!savedOnly} onClick={() => { setSavedOnly(false); setLimit(pageSize); }}><LayoutGrid size={16} />{copy.all} <span>{rows.length}</span></button>
              <button aria-pressed={savedOnly} onClick={() => { setSavedOnly(true); setLimit(pageSize); }}><Bookmark size={15} /> {copy.saved} <span>{shortlist.length}</span></button>
            </div>
            <div className="expo-search"><Search size={17}/><input ref={searchField} type="text" aria-label={copy.search} placeholder={copy.placeholder} value={query}
              onChange={e => { setQuery(e.target.value); setLimit(pageSize); }} />
              {query && <button aria-label={copy.reset} onClick={() => { setQuery(''); searchField.current?.focus(); }}><X size={16}/></button>}
            </div>
          </div>
          {savedOnly && shortlist.length > 0 && <p className="expo-device"><Check size={14}/>{copy.device}</p>}
          {matches.length === 0 ? <p className="expo-state" role="status">{savedOnly && !shortlist.length ? copy.noSaved : copy.noResults}</p>
            : <div className="expo-grid">{matches.slice(0, limit).map(row =>
                <ExhibitorCard key={row.id} row={row} copy={copy} saved={saved.includes(row.id)} onToggle={() => toggle(row.id)} />)}
              </div>}
          {matches.length > limit && <button className="expo-more" onClick={() => setLimit(limit + pageSize)}>{copy.more}</button>}
        </>}
    </div>
  </main>;
}
