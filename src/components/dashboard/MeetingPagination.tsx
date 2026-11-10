import { useI18n } from '../../i18n/I18nContext';

const copy = {
  en: { rows: 'Rows per page', previous: 'Previous', next: 'Next', page: 'Page', of: 'of', results: 'meetings', label: 'Meeting pagination' },
  fr: { rows: 'Lignes par page', previous: 'Précédent', next: 'Suivant', page: 'Page', of: 'sur', results: 'rencontres', label: 'Pagination des rencontres' },
  ar: { rows: 'الصفوف في الصفحة', previous: 'السابق', next: 'التالي', page: 'صفحة', of: 'من', results: 'اجتماعات', label: 'صفحات الاجتماعات' }
};

export default function MeetingPagination({ total, page, pageSize, onPageChange, onPageSizeChange }: {
  total: number; page: number; pageSize: number;
  onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void;
}) {
  const { locale } = useI18n();
  const c = copy[locale];
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const buttonStyle = { padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.18)', background: '#17334D', color: '#FFFFFF', fontSize: '13px' };
  return (
    <nav aria-label={c.label} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 0', color: '#CBD5E1', fontSize: '13px' }}>
      <span aria-live="polite">{total ? (current - 1) * pageSize + 1 : 0}–{Math.min(current * pageSize, total)} / {total} {c.results}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {c.rows}
          <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))} style={{ ...buttonStyle, padding: '7px 8px' }}>
            {[10, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <button type="button" disabled={current <= 1} onClick={() => onPageChange(current - 1)} style={{ ...buttonStyle, cursor: current <= 1 ? 'default' : 'pointer', opacity: current <= 1 ? 0.45 : 1 }}>{c.previous}</button>
        <span>{c.page} {current} {c.of} {pages}</span>
        <button type="button" disabled={current >= pages} onClick={() => onPageChange(current + 1)} style={{ ...buttonStyle, cursor: current >= pages ? 'default' : 'pointer', opacity: current >= pages ? 0.45 : 1 }}>{c.next}</button>
      </div>
    </nav>
  );
}
