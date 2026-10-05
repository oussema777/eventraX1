import { useI18n } from '../../i18n/I18nContext';

interface Props {
  currentTitle: string;
  nextTitle: string;
  pending: boolean;
  dark?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function WorkshopReplacementPrompt({ currentTitle, nextTitle, pending, dark = false, onConfirm, onCancel }: Props) {
  const { t } = useI18n();
  return (
    <div role="alert" className="workshop-replacement-prompt" style={{ marginTop: 12, padding: 16, borderRadius: 12,
      border: `1px solid ${dark ? '#3B82F6' : '#BFDBFE'}`, background: dark ? 'rgba(59,130,246,0.12)' : '#EFF6FF', color: dark ? '#DBEAFE' : '#1E3A8A' }}>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{t('agendaBooking.replaceConfirm', { current: currentTitle, next: nextTitle })}</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" disabled={pending} onClick={onConfirm}
          style={{ border: 0, borderRadius: 8, padding: '10px 14px', background: '#2563EB', color: '#FFFFFF', fontWeight: 600, cursor: pending ? 'wait' : 'pointer' }}>
          {t(pending ? 'agendaBooking.saving' : 'agendaBooking.replaceWorkshop')}
        </button>
        <button type="button" disabled={pending} onClick={onCancel}
          style={{ border: '1px solid currentColor', borderRadius: 8, padding: '10px 14px', background: 'transparent', color: 'inherit', cursor: 'pointer' }}>
          {t('agendaBooking.keepWorkshop')}
        </button>
      </div>
    </div>
  );
}
