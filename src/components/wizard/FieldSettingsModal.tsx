import { X, CheckCircle, Plus, XCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';

interface CustomField {
  id: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'file' | 'number' | 'multichoice' | 'country' | 'email' | 'phone';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
  isSystem?: boolean;
  showInDashboard?: boolean;
}

interface FieldSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: CustomField | null;
  onSave: (updatedField: CustomField) => void;
  onDelete: (fieldId: string) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: '#FFFFFF',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const FIELD_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  text: { label: 'Short Text', color: '#0684F5' },
  textarea: { label: 'Long Text', color: '#0684F5' },
  dropdown: { label: 'Dropdown Select', color: '#8B5CF6' },
  checkbox: { label: 'Checkbox', color: '#10B981' },
  radio: { label: 'Single Choice', color: '#F59E0B' },
  date: { label: 'Date Picker', color: '#EC4899' },
  file: { label: 'File Upload', color: '#F97316' },
  number: { label: 'Number', color: '#06B6D4' },
  multichoice: { label: 'Multiple Choice', color: '#8B5CF6' },
  country: { label: 'Country Select', color: '#10B981' },
  email: { label: 'Email Address', color: '#0684F5' },
  phone: { label: 'Phone Number', color: '#06B6D4' },
};

export default function FieldSettingsModal({
  isOpen,
  onClose,
  field,
  onSave,
  onDelete
}: FieldSettingsModalProps) {
  const { t } = useI18n();
  const [editedField, setEditedField] = useState<CustomField | null>(null);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (field) {
      setEditedField({ ...field });
    }
  }, [field]);

  if (!isOpen || !editedField) return null;

  const hasOptions = ['dropdown', 'checkbox', 'radio', 'multichoice'].includes(editedField.type);
  const supportsPlaceholder = !['checkbox', 'radio', 'date', 'file', 'country'].includes(editedField.type);
  const typeMeta = FIELD_TYPE_LABELS[editedField.type] || { label: editedField.type, color: '#94A3B8' };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const currentOptions = editedField.options || [];
      setEditedField({
        ...editedField,
        options: [...currentOptions, newOption.trim()]
      });
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = editedField.options || [];
    setEditedField({
      ...editedField,
      options: currentOptions.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    if (editedField) {
      onSave(editedField);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#0B2641',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
              {t('wizard.step3.customForms.fieldSettings.title')}
            </h3>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: typeMeta.color,
              backgroundColor: `${typeMeta.color}18`,
              padding: '3px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: typeMeta.color,
              }} />
              {typeMeta.label}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              color: '#94A3B8',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94A3B8'; }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Label */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>
                {t('wizard.step3.customForms.fieldSettings.labels.fieldLabel')} <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={editedField.label}
                onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(6,132,245,0.5)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>

            {/* Help Text */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>
                {t('wizard.step3.customForms.fieldSettings.labels.helpText')}
              </label>
              <input
                type="text"
                value={editedField.helpText || ''}
                onChange={(e) => setEditedField({ ...editedField, helpText: e.target.value })}
                placeholder={t('wizard.step3.customForms.fieldSettings.placeholders.helpText')}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(6,132,245,0.5)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Shown below the field to guide users on what to enter
              </p>
            </div>

            {/* Placeholder (if applicable) */}
            {supportsPlaceholder && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>
                  {t('wizard.step3.customForms.fieldSettings.labels.placeholder')}
                </label>
                <input
                  type="text"
                  value={editedField.placeholder || ''}
                  onChange={(e) => setEditedField({ ...editedField, placeholder: e.target.value })}
                  placeholder={t('wizard.step3.customForms.fieldSettings.placeholders.inputPlaceholder')}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(6,132,245,0.5)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Example text shown inside the empty field
                </p>
              </div>
            )}

            {/* Options (for choice types) */}
            {hasOptions && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>
                  {t('wizard.step3.customForms.fieldSettings.labels.options')}
                  <span style={{ color: '#64748B', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>
                    ({(editedField.options || []).length} options)
                  </span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(editedField.options || []).map((option, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700, color: '#64748B', flexShrink: 0,
                      }}>
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(editedField.options || [])];
                          newOptions[idx] = e.target.value;
                          setEditedField({ ...editedField, options: newOptions });
                        }}
                        style={{
                          ...inputStyle,
                          padding: '8px 12px',
                          fontSize: '13px',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(6,132,245,0.5)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                      />
                      <button
                        onClick={() => handleRemoveOption(idx)}
                        style={{
                          border: 'none', background: 'none', color: '#EF4444',
                          cursor: 'pointer', padding: '6px', borderRadius: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Add new option */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                      placeholder={t('wizard.step3.customForms.fieldSettings.labels.newOption')}
                      style={{
                        ...inputStyle,
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '13px',
                        borderColor: 'rgba(6,132,245,0.25)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(6,132,245,0.5)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(6,132,245,0.25)'; }}
                    />
                    <button
                      onClick={handleAddOption}
                      style={{
                        padding: '0 14px',
                        backgroundColor: 'rgba(6,132,245,0.15)',
                        color: '#0684F5',
                        border: '1px solid rgba(6,132,245,0.3)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0684F5'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(6,132,245,0.15)'; e.currentTarget.style.color = '#0684F5'; }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Settings Section ── */}
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h4 style={{
                fontSize: '11px', fontWeight: 700, color: '#64748B',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px',
              }}>
                {t('wizard.step3.customForms.fieldSettings.labels.settings')}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Required toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  opacity: editedField.isSystem ? 0.5 : 1,
                }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', display: 'block' }}>
                      {t('wizard.step3.customForms.fieldSettings.labels.requiredField')}
                    </span>
                    {editedField.isSystem && (
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {t('wizard.step3.customForms.fieldSettings.labels.requiredSystemNote')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => !editedField.isSystem && setEditedField({ ...editedField, required: !editedField.required })}
                    style={{
                      position: 'relative', width: '44px', height: '24px', borderRadius: '12px',
                      border: 'none', cursor: editedField.isSystem ? 'not-allowed' : 'pointer',
                      backgroundColor: editedField.required ? '#0684F5' : 'rgba(255,255,255,0.15)',
                      transition: 'background-color 0.2s', flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '3px',
                      left: editedField.required ? '23px' : '3px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      backgroundColor: '#fff', display: 'block',
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>

                {/* Show in Dashboard toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', display: 'block' }}>
                      {t('wizard.step3.customForms.fieldSettings.labels.showInDashboard')}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {t('wizard.step3.customForms.fieldSettings.labels.dashboardNote')}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditedField({ ...editedField, showInDashboard: !editedField.showInDashboard })}
                    style={{
                      position: 'relative', width: '44px', height: '24px', borderRadius: '12px',
                      border: 'none', cursor: 'pointer',
                      backgroundColor: editedField.showInDashboard ? '#F59E0B' : 'rgba(255,255,255,0.15)',
                      transition: 'background-color 0.2s', flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '3px',
                      left: editedField.showInDashboard ? '23px' : '3px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      backgroundColor: '#fff', display: 'block',
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {!editedField.isSystem ? (
            <button
              onClick={() => onDelete(editedField.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: '#EF4444', backgroundColor: 'transparent',
                border: 'none', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', padding: '8px 0',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              <Trash2 size={15} />
              {t('wizard.step3.customForms.fieldSettings.actions.deleteField')}
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 18px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'transparent',
                color: '#94A3B8', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
            >
              {t('wizard.step3.customForms.fieldSettings.actions.cancel')}
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 22px', borderRadius: '10px',
                border: 'none', backgroundColor: '#0684F5',
                color: '#FFFFFF', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(6, 132, 245, 0.3)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0574D9'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0684F5'; }}
            >
              <CheckCircle size={15} />
              {t('wizard.step3.customForms.fieldSettings.actions.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
