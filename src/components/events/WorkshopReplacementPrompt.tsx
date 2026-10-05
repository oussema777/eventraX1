import { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
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
  const noticeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    noticeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    noticeRef.current?.focus({ preventScroll: true });
  }, [nextTitle]);
  return (
    <div ref={noticeRef} tabIndex={-1} role="alert" className="workshop-replacement-prompt" style={{ marginTop: 12, padding: 16, borderRadius: 12,
      border: `1px solid ${dark ? '#FF767E' : '#FCA5A5'}`, background: dark ? '#3A2A39' : '#FEF2F2', color: dark ? '#FFC3C7' : '#991B1B' }}>
      <p style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.6, margin: 0 }}><AlertCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} /><span>{t('agendaBooking.replaceConfirm', { current: currentTitle, next: nextTitle })}</span></p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" disabled={pending} onClick={onConfirm}
          style={{ border: 0, borderRadius: 8, padding: '10px 14px', background: dark ? '#65404D' : '#B91C1C', color: '#FFFFFF', fontWeight: 600, cursor: pending ? 'wait' : 'pointer' }}>
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
