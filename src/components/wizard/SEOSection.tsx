import { useState } from 'react';
import { X } from 'lucide-react';
import EventUrlSettings from './EventUrlSettings';
import { useI18n } from '../../i18n/I18nContext';
import type { EventDraft } from '../../hooks/useEventWizard';

interface SEOSectionProps {
  draft: EventDraft;
  updateDraft: (updates: Partial<EventDraft>) => Promise<EventDraft | null>;
}

export default function SEOSection({ draft, updateDraft }: SEOSectionProps) {
  const { t } = useI18n();
  const [newKeyword, setNewKeyword] = useState('');

  const metaTitle = draft.seo_title || '';
  const metaDescription = draft.seo_description || '';
  const keywords = draft.seo_keywords || [];

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      updateDraft({ seo_keywords: [...keywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    updateDraft({ seo_keywords: keywords.filter(k => k !== keyword) });
  };

  const getTitleColor = () => {
    if (metaTitle.length > 60) return 'var(--destructive)';
    if (metaTitle.length > 50) return 'var(--warning)';
    return 'var(--success)';
  };

  const getDescriptionColor = () => {
    if (metaDescription.length > 160) return 'var(--destructive)';
    if (metaDescription.length > 150) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div
      className="rounded-xl p-8 border"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
    >
      <h2
        className="text-2xl mb-2"
        style={{ fontWeight: 600, color: '#0B2641' }}
      >
        {t('wizard.step4.seo.title')}
      </h2>
      <p
        className="text-sm mb-5"
        style={{ color: '#6B7280' }}
      >
        {t('wizard.step4.seo.subtitle')}
      </p>

      <div
        className="w-full h-px mb-6"
        style={{ backgroundColor: '#E5E7EB' }}
      />

      <div className="space-y-6">
        {/* Meta Title */}
        <div>
          <label
            className="block text-sm mb-2"
            style={{ fontWeight: 500, color: '#6B7280' }}
          >
            {t('wizard.step4.seo.fields.title.label')}
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => updateDraft({ seo_title: e.target.value })}
            className="w-full h-11 px-4 rounded-lg border outline-none"
            style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
          />
          <div className="flex justify-end mt-1">
            <span
              className="text-xs"
              style={{ color: getTitleColor(), fontWeight: 500 }}
            >
              {metaTitle.length}/60
            </span>
          </div>
        </div>

        {/* Meta Description */}
        <div>
          <label
            className="block text-sm mb-2"
            style={{ fontWeight: 500, color: '#6B7280' }}
          >
            {t('wizard.step4.seo.fields.description.label')}
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => updateDraft({ seo_description: e.target.value })}
            className="w-full h-[120px] px-4 py-3 rounded-lg border outline-none resize-none"
            style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
          />
          <div className="flex justify-end mt-1">
            <span
              className="text-xs"
              style={{ color: getDescriptionColor(), fontWeight: 500 }}
            >
              {metaDescription.length}/160
            </span>
          </div>
        </div>

        <EventUrlSettings draft={draft} onSave={updateDraft} />

        {/* Keywords */}
        <div>
          <label
            className="block text-sm mb-2"
            style={{ fontWeight: 500, color: '#6B7280' }}
          >
            {t('wizard.step4.seo.fields.keywords.label')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {keywords.map((keyword) => (
              <div
                key={keyword}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{
                  backgroundColor: 'rgba(6, 132, 245, 0.1)',
                  color: 'var(--primary)',
                  fontWeight: 500
                }}
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="hover:opacity-70"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addKeyword();
              }
            }}
            placeholder={t('wizard.step4.seo.fields.keywords.placeholder')}
            className="w-full h-11 px-4 rounded-lg border outline-none"
            style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
          />
        </div>
      </div>
    </div>
  );
}
