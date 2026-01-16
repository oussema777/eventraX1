import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function SEOSection() {
  const { t, tList } = useI18n();
  const [metaTitle, setMetaTitle] = useState(() => t('wizard.step4.seo.defaults.title'));
  const [metaDescription, setMetaDescription] = useState(() => t('wizard.step4.seo.defaults.description'));
  const [urlSlug, setUrlSlug] = useState(() => t('wizard.step4.seo.defaults.slug'));
  const [keywords, setKeywords] = useState(() => tList<string>('wizard.step4.seo.defaults.keywords', []));
  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
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
            onChange={(e) => setMetaTitle(e.target.value)}
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
            onChange={(e) => setMetaDescription(e.target.value)}
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

        {/* Custom URL Slug */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontWeight: 500, color: '#6B7280' }}
          >
            {t('wizard.step4.seo.fields.url.label')}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center h-11 px-4 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
              <span className="text-sm" style={{ color: '#6B7280' }}>
                {t('wizard.step4.seo.fields.url.prefix')}
              </span>
              <input
                type="text"
                value={urlSlug}
                onChange={(e) => setUrlSlug(e.target.value)}
                className="flex-1 outline-none text-sm"
                style={{ color: '#0B2641' }}
              />
              <Check size={16} style={{ color: 'var(--success)' }} />
            </div>
            <button
              className="px-4 h-11 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#0B2641',
                fontWeight: 500
              }}
            >
              {t('wizard.step4.seo.fields.url.check')}
            </button>
          </div>
        </div>

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
