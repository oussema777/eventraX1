import { X, CheckCircle, Plus, XCircle, Trash2, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CustomField {
  id: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'file' | 'number' | 'multichoice' | 'country' | 'email' | 'phone' | 'url' | 'address';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
  isPro: boolean;
  isSystem?: boolean;
  isEditable?: boolean;
  isKpi?: boolean;
}

interface FieldSettingsModalProps {
  isOpen: boolean;
  field: CustomField | null;
  onSave: (field: CustomField) => void;
  onDelete: (fieldId: string) => void;
  onClose: () => void;
}

export default function FieldSettingsModal({ isOpen, field, onSave, onDelete, onClose }: FieldSettingsModalProps) {
  const [formData, setFormData] = useState<CustomField | null>(null);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (isOpen && field) {
      setFormData(field);
    }
  }, [isOpen, field]);

  if (!isOpen || !formData) return null;

  const handleLabelChange = (value: string) => {
    if (value.length <= 100) {
      setFormData(prev => prev ? ({ ...prev, label: value }) : null);
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData(prev => prev ? ({
        ...prev,
        options: [...(prev.options || []), newOption.trim()]
      }) : null);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => prev ? ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }) : null);
  };

  const handleUpdateOption = (index: number, value: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt)
    }) : null);
  };

  const handleSaveAndClose = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (formData && !formData.isSystem) {
      onDelete(formData.id);
      onClose();
    }
  };

  const needsOptions = ['dropdown', 'radio', 'multichoice', 'checkbox'].includes(formData.type);
  const supportsPlaceholder = ['text', 'textarea', 'number', 'email', 'phone', 'url', 'address'].includes(formData.type);

  const getFieldTypeName = () => {
    const names: Record<string, string> = {
      text: 'Single Line Text',
      textarea: 'Multi-line Text',
      dropdown: 'Dropdown Select',
      checkbox: 'Checkboxes',
      radio: 'Radio Buttons',
      date: 'Date Picker',
      file: 'File Upload',
      number: 'Number Input',
      multichoice: 'Multiple Choice',
      country: 'Country Selector',
      email: 'Email Input',
      phone: 'Phone Number Input',
      url: 'URL Input',
      address: 'Address Input'
    };
    return names[formData.type] || formData.type;
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
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
              Edit Field
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {getFieldTypeName()}
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              color: '#111827', 
              backgroundColor: '#F3F4F6',
              border: 'none', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer' 
            }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '28px', overflowY: 'auto' }}>
          
          {/* Field Label */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Field Label <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              disabled={formData.isSystem}
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                border: '1px solid #D1D5DB', 
                fontSize: '14px',
                color: '#111827',
                backgroundColor: formData.isSystem ? '#F3F4F6' : '#FFFFFF',
                cursor: formData.isSystem ? 'not-allowed' : 'text',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{formData.label.length}/100</span>
            </div>
          </div>

          {/* Help Text */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Help Text
            </label>
            <input
              type="text"
              value={formData.helpText || ''}
              onChange={(e) => setFormData(prev => prev ? ({ ...prev, helpText: e.target.value }) : null)}
              placeholder="Instructions for user"
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                border: '1px solid #D1D5DB', 
                fontSize: '14px',
                color: '#111827',
                outline: 'none'
              }}
            />
          </div>

          {/* Placeholder */}
          {supportsPlaceholder && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Placeholder
              </label>
              <input
                type="text"
                value={formData.placeholder || ''}
                onChange={(e) => setFormData(prev => prev ? ({ ...prev, placeholder: e.target.value }) : null)}
                placeholder="Input placeholder"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  border: '1px solid #D1D5DB', 
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Options */}
          {needsOptions && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Options
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {formData.options?.map((option, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleUpdateOption(index, e.target.value)}
                      style={{ 
                        flex: 1, 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid #D1D5DB', 
                        fontSize: '14px', 
                        color: '#111827' 
                      }}
                    />
                    <button
                      onClick={() => handleRemoveOption(index)}
                      style={{ 
                        width: '36px', 
                        borderRadius: '6px', 
                        border: '1px solid #FECACA', 
                        backgroundColor: '#FEF2F2', 
                        color: '#EF4444', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer' 
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                  placeholder="New option"
                  style={{ 
                    flex: 1, 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    border: '1px solid #D1D5DB', 
                    fontSize: '14px', 
                    color: '#111827' 
                  }}
                />
                <button
                  onClick={handleAddOption}
                  style={{ 
                    width: '36px', 
                    borderRadius: '6px', 
                    border: '1px solid #BFDBFE', 
                    backgroundColor: '#EFF6FF', 
                    color: '#3B82F6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer' 
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Validation & Settings */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Settings</h3>
            
            {/* Required Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', display: 'block' }}>Required Field</span>
                {formData.isSystem && <span style={{ fontSize: '11px', color: '#6B7280' }}>System fields are always required</span>}
              </div>
              <button
                onClick={() => !formData.isSystem && setFormData(prev => prev ? ({ ...prev, required: !prev.required }) : null)}
                style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: formData.required ? '#0684F5' : '#E5E7EB',
                  border: 'none',
                  cursor: formData.isSystem ? 'not-allowed' : 'pointer',
                  opacity: formData.isSystem ? 0.6 : 1,
                  transition: 'background-color 0.2s'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: formData.required ? '22px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                />
              </button>
            </div>

            {/* KPI Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', display: 'block' }}>Show in Dashboard (KPI)</span>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Display stats in Event Overview</span>
              </div>
              <button
                onClick={() => setFormData(prev => prev ? ({ ...prev, isKpi: !prev.isKpi }) : null)}
                style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: formData.isKpi ? '#F59E0B' : '#E5E7EB',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: formData.isKpi ? '22px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                />
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 28px', borderTop: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
          <div>
            {!formData.isSystem && (
              <button
                type="button"
                onClick={handleDelete}
                style={{ 
                  padding: '10px 16px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  backgroundColor: '#EF4444', 
                  color: '#FFFFFF', 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                }}
              >
                <Trash2 size={16} />
                Delete Field
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ 
                padding: '10px 20px', 
                borderRadius: '8px', 
                border: '1px solid #D1D5DB', 
                backgroundColor: '#FFFFFF', 
                color: '#374151', 
                fontSize: '14px', 
                fontWeight: 600, 
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              style={{ 
                padding: '10px 24px', 
                borderRadius: '8px', 
                border: 'none', 
                backgroundColor: '#0684F5', 
                color: '#FFFFFF', 
                fontSize: '14px', 
                fontWeight: 600, 
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                boxShadow: '0 4px 6px -1px rgba(6, 132, 245, 0.2)'
              }}
            >
              <CheckCircle size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
