import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Lock, Eye, Copy, RefreshCw } from 'lucide-react';
import { generateAccessCode } from '../../utils/codeGenerator';
import { toast } from 'sonner';

interface PrivacySectionProps {
  isPrivateEvent: boolean;
  accessCode: string;
  onVisibilityChange: (isPrivate: boolean) => void;
  onAccessCodeChange: (code: string) => void;
}

export default function PrivacySection({ isPrivateEvent, accessCode, onVisibilityChange, onAccessCodeChange }: PrivacySectionProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: '#0D243B', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-lg font-semibold text-white mb-4">
        {t('event.visibility', { defaultValue: 'Event Visibility' })}
      </h3>

      {/* Current Status */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
        {isPrivateEvent ? (
          <Lock size={20} style={{ color: '#F59E0B' }} />
        ) : (
          <Eye size={20} style={{ color: '#10B981' }} />
        )}
        <div>
          <div className="text-sm font-medium text-white">
            {isPrivateEvent
              ? t('event.private', { defaultValue: 'Private' })
              : t('event.public', { defaultValue: 'Public' })}
          </div>
          <div className="text-xs" style={{ color: '#9CA3AF' }}>
            {isPrivateEvent
              ? t('event.privateDescription', { defaultValue: 'Requires access code to register' })
              : t('event.publicDescription', { defaultValue: 'Anyone can find and register' })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const newIsPrivate = !isPrivateEvent;
            onVisibilityChange(newIsPrivate);
            if (newIsPrivate && !accessCode) {
              onAccessCodeChange(generateAccessCode());
            }
          }}
          className="ml-auto px-3 py-1.5 text-xs rounded-lg border transition-colors"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#9CA3AF' }}
        >
          {isPrivateEvent
            ? t('event.switchToPublic', { defaultValue: 'Switch to Public' })
            : t('event.switchToPrivate', { defaultValue: 'Switch to Private' })}
        </button>
      </div>

      {/* Access Code Display (private only) */}
      {isPrivateEvent && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <label className="block text-xs mb-2" style={{ color: '#9CA3AF' }}>
            {t('event.accessCode', { defaultValue: 'Access Code' })}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={accessCode}
              onChange={(e) => onAccessCodeChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
              maxLength={10}
              className="flex-1 h-9 px-3 rounded-lg border outline-none font-mono text-sm tracking-wider"
              style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(accessCode);
                toast.success(t('event.codeCopied', { defaultValue: 'Code copied!' }));
              }}
              className="h-9 px-2.5 rounded-lg border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <Copy size={14} style={{ color: '#9CA3AF' }} />
            </button>
            <button
              type="button"
              onClick={() => onAccessCodeChange(generateAccessCode())}
              className="h-9 px-2.5 rounded-lg border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <RefreshCw size={14} style={{ color: '#9CA3AF' }} />
            </button>
          </div>
        </div>
      )}

      {/* Existing placeholder toggles — local-only, not wired to DB (out of scope) */}
      <div className="mt-4 space-y-3">
        {[
          { id: 'requireRegistration', label: t('wizard.step4.privacy.requireRegistration', { defaultValue: 'Require registration' }), defaultOn: true },
          { id: 'showAttendeeList', label: t('wizard.step4.privacy.showAttendeeList', { defaultValue: 'Show attendee list' }), defaultOn: false },
          { id: 'allowSocialSharing', label: t('wizard.step4.privacy.allowSocialSharing', { defaultValue: 'Allow social sharing' }), defaultOn: true },
        ].map((item) => (
          <PlaceholderToggle key={item.id} label={item.label} defaultOn={item.defaultOn} />
        ))}
      </div>
    </div>
  );
}

function PlaceholderToggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm" style={{ color: '#9CA3AF' }}>{label}</span>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className="w-10 h-5 rounded-full transition-colors relative"
        style={{ backgroundColor: on ? '#0684F5' : '#374151' }}
      >
        <div
          className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform"
          style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}
