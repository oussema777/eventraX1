import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useLocalizedLabels } from '../../i18n/useLocalizedLabels';
import './ParticipantDirectoryFilters.css';

export default function ParticipantDirectoryFilters({ sectors, selected, search, onSector, onSearch, count, total }: {
  sectors: string[]; selected: string; search: string; onSector: (value: string) => void;
  onSearch: (value: string) => void; count: number; total: number;
}) {
  const { t } = useI18n();
  const { label } = useLocalizedLabels();
  return <div className="directory-filters">
    <div className="directory-filters__heading">
      <div><span className="directory-filters__eyebrow"><SlidersHorizontal size={14} />{t('attendeeExperience.filterEyebrow')}</span>
        <h2>{t('eventImprovements.b2bParticipants')} <span>{total}</span></h2>
      </div>
      <label className="directory-filters__search"><Search size={18} aria-hidden="true" />
        <input type="search" value={search} onChange={e => onSearch(e.target.value)}
          aria-label={t('attendeeExperience.search')} placeholder={t('attendeeExperience.search')} />
      </label>
    </div>
    <div className="directory-filters__sectors" role="group" aria-label={t('eventImprovements.filterSector')}>
      {['All', ...sectors].map(sector => <button key={sector} type="button" aria-pressed={selected === sector}
        onClick={() => onSector(sector)}>
        <span className="directory-filters__dot" aria-hidden="true" />
        {sector === 'All' ? t('eventImprovements.allSectors') : sector === '__none' ? t('eventImprovements.noSector') : label(sector)}
      </button>)}
    </div>
    <div className="directory-filters__summary"><p role="status" aria-live="polite">{t('eventImprovements.filteredCount', { count, total })}</p>
      {(selected !== 'All' || search) && <button type="button" onClick={() => { onSector('All'); onSearch(''); }}><X size={14} />{t('attendeeExperience.clearFilters')}</button>}
    </div>
  </div>;
}
