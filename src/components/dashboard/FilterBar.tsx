import { Search, Filter, ChevronDown } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface FilterBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortOption: 'recent' | 'oldest';
  onSortChange: (value: 'recent' | 'oldest') => void;
}

export default function FilterBar({
  activeTab,
  setActiveTab,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange
}: FilterBarProps) {
  const { t } = useI18n();
  const tabs = [
    { id: 'all', label: t('dashboard.filters.tabs.all') },
    { id: 'live', label: t('dashboard.filters.tabs.live') },
    { id: 'draft', label: t('dashboard.filters.tabs.draft') },
    { id: 'archived', label: t('dashboard.filters.tabs.archived') }
  ];
  const sortLabel =
    sortOption === 'oldest'
      ? t('dashboard.filters.sortOptions.oldest')
      : t('dashboard.filters.sortOptions.recent');

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      {/* Left Side - Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.7)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right Side - Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end w-full md:w-auto">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search 
            size={18} 
            className="absolute left-3 top-3  -translate-y-1/2"
            style={{ color: '#6B7280' }}
          />
          <input
            type="text"
            placeholder={t('dashboard.filters.searchPlaceholder')}
            className="w-full h-11 pl-10 pr-4 rounded-lg border text-sm outline-none transition-colors focus:border-primary"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            style={{
              backgroundColor: 'white',
              borderColor: '#E5E7EB',
              color: '#0B2641'
            }}
          />
        </div>

        {/* Filter Button */}

        {/* Sort Dropdown */}
        <button
          type="button"
          onClick={() => {
            const next = sortOption === 'recent' ? 'oldest' : 'recent';
            onSortChange(next);
          }}
          className="h-11 px-4 rounded-lg border flex items-center gap-2 text-sm font-medium transition-colors hover:bg-gray-50"
          style={{
            backgroundColor: 'white',
            borderColor: '#E5E7EB',
            color: '#0B2641'
          }}
        >
          {t('dashboard.filters.sortLabel', { option: sortLabel })}
          <ChevronDown size={16} style={{ color: '#6B7280' }} />
        </button>
      </div>
    </div>
  );
}
