import { X, CheckCircle, Plus, XCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';

interface CustomField {
  id: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'file' | 'number' | 'multichoice' | 'country' | 'email' | 'phone' | 'url' | 'address';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
  isPro: boolean;
}

interface FieldEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: CustomField) => void;
  onDelete: () => void;
  field: CustomField;
}

export default function FieldEditorModal({ isOpen, onClose, onSave, onDelete, field }: FieldEditorModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<CustomField>(field);
  const [charCount, setCharCount] = useState(field.label.length);
  const [newOption, setNewOption] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleLabelChange = (value: string) => {
    if (value.length <= 100) {
      setFormData({ ...formData, label: value });
      setCharCount(value.length);
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...(formData.options || []), newOption.trim()]
      });
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options?.filter((_, i) => i !== index)
    });
  };

  const handleUpdateOption = (index: number, value: string) => {
    setFormData({
      ...formData,
      options: formData.options?.map((opt, i) => i === index ? value : opt)
    });
  };

  const needsOptions = ['dropdown', 'radio', 'multichoice', 'checkbox'].includes(formData.type);
  const supportsPlaceholder = ['text', 'textarea', 'number', 'email', 'phone', 'url'].includes(formData.type);

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
    url: { label: 'Website URL', color: '#0684F5' },
    address: { label: 'Address', color: '#10B981' },
  };
  const typeMeta = FIELD_TYPE_LABELS[formData.type] || { label: formData.type, color: '#94A3B8' };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="w-full max-w-lg rounded-xl overflow-hidden border flex flex-col"
          style={{ 
            backgroundColor: '#0B2641',
            borderColor: 'rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            maxHeight: '85vh'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="p-5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 
                  className="text-lg mb-1"
                  style={{ fontWeight: 600, color: '#FFFFFF' }}
                >
                  {t('designStudio.modals.fieldEditor.title')}
                </h2>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] uppercase tracking-wide"
                  style={{ backgroundColor: `${typeMeta.color}18`, color: typeMeta.color, fontWeight: 700 }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: typeMeta.color }} />
                  {typeMeta.label}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto p-5"
          >
            <div className="space-y-5">
              {/* Field Label */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 600, color: '#E2E8F0' }}
                >
                  {t('designStudio.modals.fieldEditor.labels.fieldLabel')} *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder={t('designStudio.modals.fieldEditor.placeholders.fieldLabel')}
                  className="w-full h-10 px-3 rounded-lg border outline-none transition-colors focus:border-blue-500 text-sm"
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  }}
                />
                <div className="flex justify-end mt-1">
                  <span 
                    className="text-[10px]"
                    style={{ color: charCount > 90 ? '#EF4444' : '#94A3B8' }}
                  >
                    {charCount}/100
                  </span>
                </div>
              </div>

              {/* Help Text */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 600, color: '#E2E8F0' }}
                >
                  {t('designStudio.modals.fieldEditor.labels.helpText')}
                </label>
                <input
                  type="text"
                  value={formData.helpText || ''}
                  onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                  placeholder={t('designStudio.modals.fieldEditor.placeholders.helpText')}
                  className="w-full h-10 px-3 rounded-lg border outline-none transition-colors focus:border-blue-500 text-sm"
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  }}
                />
              </div>

              {/* Placeholder (for applicable field types) */}
              {supportsPlaceholder && (
                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ fontWeight: 600, color: '#E2E8F0' }}
                  >
                    {t('designStudio.modals.fieldEditor.labels.placeholder')}
                  </label>
                  <input
                    type="text"
                    value={formData.placeholder || ''}
                    onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                    placeholder={t('designStudio.modals.fieldEditor.placeholders.placeholder')}
                    className="w-full h-10 px-3 rounded-lg border outline-none transition-colors focus:border-blue-500 text-sm"
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }}
                  />
                </div>
              )}

              {/* Field Options (for dropdown, radio, multichoice) */}
              {needsOptions && (
                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ fontWeight: 600, color: '#E2E8F0' }}
                  >
                    {t('designStudio.modals.fieldEditor.labels.options')}
                  </label>
                  
                  {/* Existing Options */}
                  <div className="space-y-2 mb-3">
                    {formData.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleUpdateOption(index, e.target.value)}
                          className="flex-1 h-9 px-3 rounded-lg border outline-none transition-colors focus:border-blue-500 text-sm"
                          style={{ 
                            borderColor: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            backgroundColor: 'rgba(255,255,255,0.05)'
                          }}
                        />
                        <button
                          onClick={() => handleRemoveOption(index)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/20"
                          style={{ border: '1px solid rgba(239,68,68,0.3)' }}
                        >
                          <XCircle size={16} style={{ color: '#EF4444' }} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Option */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                      placeholder={t('designStudio.modals.fieldEditor.placeholders.newOption')}
                      className="flex-1 h-9 px-3 rounded-lg border outline-none transition-colors focus:border-blue-500 text-sm"
                      style={{ 
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                        backgroundColor: 'rgba(255,255,255,0.05)'
                      }}
                    />
                    <button
                      onClick={handleAddOption}
                      className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors hover:bg-blue-500/20"
                      style={{ borderColor: 'rgba(6,132,245,0.3)' }}
                    >
                      <Plus size={16} style={{ color: '#0684F5' }} />
                    </button>
                  </div>
                </div>
              )}

              {/* Validation Rules */}
              <div>
                <label 
                  className="block text-sm mb-3"
                  style={{ fontWeight: 600, color: '#E2E8F0' }}
                >
                  {t('designStudio.modals.fieldEditor.labels.validationRules')}
                </label>
                
                <div className="space-y-3">
                  {/* Make Required */}
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-sm" style={{ color: '#FFFFFF' }}>
                      {t('designStudio.modals.fieldEditor.labels.makeRequired')}
                    </span>
                    <button
                      onClick={() => setFormData({ ...formData, required: !formData.required })}
                      className="relative w-9 h-5 rounded-full transition-colors"
                      style={{ 
                        backgroundColor: formData.required ? '#0684F5' : 'rgba(255,255,255,0.2)'
                      }}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                        style={{
                          left: formData.required ? 'calc(100% - 18px)' : '2px'
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-between p-5 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0B2641' }}
          >
            <button
              onClick={onDelete}
              className="text-sm transition-colors hover:text-red-400 flex items-center gap-2"
              style={{ color: '#EF4444', fontWeight: 500 }}
            >
              <Trash2 size={16} />
              {t('designStudio.modals.fieldEditor.actions.deleteField')}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="h-9 px-4 rounded-lg transition-colors hover:bg-white/10 text-sm"
                style={{ color: '#FFFFFF', fontWeight: 500 }}
              >
                {t('designStudio.modals.fieldEditor.actions.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="h-9 px-4 rounded-lg flex items-center gap-2 transition-all hover:bg-blue-600 text-sm"
                style={{
                  backgroundColor: '#0684F5',
                  color: '#FFFFFF',
                  fontWeight: 600
                }}
              >
                <CheckCircle size={16} />
                {t('designStudio.modals.fieldEditor.actions.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}