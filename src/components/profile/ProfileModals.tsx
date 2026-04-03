import { type PointerEvent, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useI18n } from '../../i18n/I18nContext';
import type { EducationDraft } from './types';

/* ─── shared overlay style ─── */
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(11,38,65,0.90)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 200
};

const modalCardStyle: React.CSSProperties = {
  maxWidth: '90vw',
  backgroundColor: '#1E3A5F',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.15)',
  overflow: 'hidden'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  padding: '0 16px',
  backgroundColor: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '15px'
};

const headerStyle: React.CSSProperties = {
  padding: '24px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const footerStyle: React.CSSProperties = {
  padding: '24px',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end'
};

const cancelBtnStyle: React.CSSProperties = {
  height: '40px',
  padding: '0 20px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer'
};

const primaryBtnStyle = (disabled: boolean): React.CSSProperties => ({
  height: '40px',
  padding: '0 20px',
  backgroundColor: disabled ? '#2A4B6D' : '#0684F5',
  border: 'none',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.7 : 1
});

/* ─────────────────────────────────────────────
   1. Education Modal
   ───────────────────────────────────────────── */
export interface EducationModalProps {
  draft: EducationDraft;
  onDraftChange: (draft: EducationDraft) => void;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
}

export function EducationModal({ draft, onDraftChange, isSaving, onSave, onClose }: EducationModalProps) {
  const { t } = useI18n();

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalCardStyle, width: '520px' }}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>
            {draft.id ? t('profile.modals.education.editTitle') : t('profile.modals.education.addTitle')}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('profile.modals.education.degree')}
            </label>
            <input
              type="text"
              value={draft.degree}
              onChange={(e) => onDraftChange({ ...draft, degree: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('profile.modals.education.institution')}
            </label>
            <input
              type="text"
              value={draft.institution}
              onChange={(e) => onDraftChange({ ...draft, institution: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('profile.modals.education.years')}
            </label>
            <input
              type="text"
              value={draft.years}
              onChange={(e) => onDraftChange({ ...draft, years: e.target.value })}
              placeholder={t('profile.modals.education.yearsPlaceholder')}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={footerStyle}>
          <button onClick={onClose} style={cancelBtnStyle}>
            {t('profile.modals.common.cancel')}
          </button>
          <button onClick={onSave} disabled={isSaving} style={primaryBtnStyle(isSaving)}>
            {isSaving ? t('profile.modals.common.saving') : t('profile.modals.common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   2. Password Modal
   ───────────────────────────────────────────── */
export interface PasswordModalProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  isUpdating: boolean;
  onUpdate: () => void;
  onClose: () => void;
}

export function PasswordModal({
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  isUpdating,
  onUpdate,
  onClose
}: PasswordModalProps) {
  const { t } = useI18n();

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalCardStyle, width: '500px' }}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>{t('profile.modals.password.title')}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('profile.modals.password.current')}
            </label>
            <input type="password" value={currentPassword} onChange={(e) => onCurrentPasswordChange(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('profile.modals.password.new')}
            </label>
            <input type="password" value={newPassword} onChange={(e) => onNewPasswordChange(e.target.value)} style={inputStyle} />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6B7280' }}>
              <div style={{ color: '#10B981' }}>&#10003; {t('profile.modals.password.requirements.length')}</div>
              <div style={{ color: '#EF4444' }}>&#10007; {t('profile.modals.password.requirements.uppercase')}</div>
              <div style={{ color: '#10B981' }}>&#10003; {t('profile.modals.password.requirements.number')}</div>
              <div style={{ color: '#10B981' }}>&#10003; {t('profile.modals.password.requirements.special')}</div>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('profile.modals.password.confirm')}
            </label>
            <input type="password" value={confirmPassword} onChange={(e) => onConfirmPasswordChange(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={footerStyle}>
          <button onClick={onClose} style={cancelBtnStyle}>
            {t('profile.modals.common.cancel')}
          </button>
          <button onClick={onUpdate} disabled={isUpdating} style={primaryBtnStyle(isUpdating)}>
            {isUpdating ? t('profile.modals.password.updating') : t('profile.modals.password.update')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   3. Two-Factor Setup Modal
   ───────────────────────────────────────────── */
export interface TwoFactorModalProps {
  qrCode: string;
  code: string;
  onCodeChange: (v: string) => void;
  isSaving: boolean;
  onVerify: () => void;
  onClose: () => void;
}

export function TwoFactorModal({ qrCode, code, onCodeChange, isSaving, onVerify, onClose }: TwoFactorModalProps) {
  const { t } = useI18n();

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalCardStyle, width: '520px' }}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>{t('profile.modals.twoFactor.title')}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
            {t('profile.modals.twoFactor.instructions')}
          </p>
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
            {qrCode ? (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(qrCode, { USE_PROFILES: { svg: true } }) }} />
            ) : (
              <span style={{ color: '#111827', fontSize: '14px' }}>{t('profile.modals.twoFactor.qrUnavailable')}</span>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('profile.modals.twoFactor.codeLabel')}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder={t('profile.modals.twoFactor.codePlaceholder')}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={footerStyle}>
          <button onClick={onClose} style={cancelBtnStyle}>
            {t('profile.modals.common.cancel')}
          </button>
          <button onClick={onVerify} disabled={isSaving} style={primaryBtnStyle(isSaving)}>
            {isSaving ? t('profile.modals.twoFactor.verifying') : t('profile.modals.twoFactor.verify')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   4. Delete Confirm Modal
   ───────────────────────────────────────────── */
export interface DeleteConfirmModalProps {
  fields: string[];
  isAccepted: boolean;
  onAcceptChange: (v: boolean) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({ fields, isAccepted, onAcceptChange, onConfirm, onClose }: DeleteConfirmModalProps) {
  const { t } = useI18n();

  return (
    <div style={{ ...overlayStyle, zIndex: 210 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalCardStyle, width: '540px' }}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>{t('profile.modals.deleteConfirm.title')}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '14px', color: '#94A3B8' }}>
            {t('profile.modals.deleteConfirm.message')}
          </p>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
            {fields.map((field) => (
              <div key={field} style={{ fontSize: '13px', color: '#FFFFFF', marginBottom: '6px' }}>
                - {field}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(e) => onAcceptChange(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '13px', color: '#E2E8F0' }}>
              {t('profile.modals.deleteConfirm.accept')}
            </span>
          </div>
        </div>

        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              onAcceptChange(false);
              onClose();
            }}
            style={cancelBtnStyle}
          >
            {t('profile.modals.common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={!isAccepted}
            style={primaryBtnStyle(!isAccepted)}
          >
            {t('profile.modals.deleteConfirm.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   5. Preview Modal
   ───────────────────────────────────────────── */
export interface PreviewModalProps {
  avatarUrl: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  bio: string;
  skills: string[];
  interests: string[];
  onClose: () => void;
}

export function PreviewModal({
  avatarUrl,
  firstName,
  lastName,
  jobTitle,
  company,
  bio,
  skills,
  interests,
  onClose
}: PreviewModalProps) {
  const { t } = useI18n();

  return (
    <div style={{ ...overlayStyle, padding: '40px' }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '800px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Cover & Profile Photo */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: '200px', background: 'linear-gradient(135deg, #0684F5 0%, #4A7C6D 100%)' }} />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '50%',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
          <div style={{ position: 'absolute', bottom: '-60px', left: '40px' }}>
            <img
              src={avatarUrl}
              alt={t('profile.preview.avatarAlt')}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid #FFFFFF',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>

        <div style={{ padding: '80px 40px 40px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
            {firstName} {lastName}
          </h2>
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '4px' }}>{jobTitle}</p>
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '24px' }}>{company}</p>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>{t('profile.preview.about')}</h3>
            <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.6' }}>{bio}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>{t('profile.preview.skills')}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map((skill) => (
                <div
                  key={skill}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: '#E0F2FE',
                    color: '#0284C7',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>{t('profile.preview.interests')}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {interests.map((interest) => (
                <div
                  key={interest}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: '#D1FAE5',
                    color: '#059669',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  {interest}
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', marginTop: '32px' }}>
            {t('profile.preview.hint')}
          </p>
        </div>

        <div style={{ padding: '20px 40px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              height: '44px',
              padding: '0 32px',
              backgroundColor: '#0684F5',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t('profile.preview.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   6. Crop Photo Modal
   ───────────────────────────────────────────── */
export interface CropModalProps {
  cropContainerSize: number;
  cropImageUrl: string;
  isDraggingCrop: boolean;
  cropCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  cropZoom: number;
  onCropZoomChange: (v: number) => void;
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onApply: () => void;
  onClose: () => void;
}

export function CropModal({
  cropContainerSize,
  cropImageUrl,
  isDraggingCrop,
  cropCanvasRef,
  cropZoom,
  onCropZoomChange,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onApply,
  onClose
}: CropModalProps) {
  const { t } = useI18n();

  return (
    <div
      style={{ ...overlayStyle, zIndex: 220, padding: '40px' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '520px',
          maxWidth: '90vw',
          backgroundColor: '#1E3A5F',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.15)',
          overflow: 'hidden'
        }}
      >
        <div style={headerStyle}>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>{t('profile.crop.title')}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div
            style={{
              width: `${cropContainerSize}px`,
              height: `${cropContainerSize}px`,
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              overflow: 'hidden',
              position: 'relative',
              cursor: isDraggingCrop ? 'grabbing' : 'grab'
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <canvas
              ref={cropCanvasRef}
              width={cropContainerSize}
              height={cropContainerSize}
              style={{ display: 'block' }}
            />
          </div>
          <div style={{ width: '100%' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('profile.crop.zoom')}
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={cropZoom}
              onChange={(e) => onCropZoomChange(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              height: '40px',
              padding: '0 20px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t('profile.modals.common.cancel')}
          </button>
          <button
            onClick={onApply}
            style={{
              height: '40px',
              padding: '0 20px',
              backgroundColor: '#0684F5',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t('profile.crop.apply')}
          </button>
        </div>
      </div>
    </div>
  );
}
