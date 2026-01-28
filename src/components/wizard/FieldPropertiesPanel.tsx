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
}

interface FieldPropertiesPanelProps {
  field: CustomField;
  onSave: (field: CustomField) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function FieldPropertiesPanel({ field, onSave, onDelete, onClose }: FieldPropertiesPanelProps) {
  const [formData, setFormData] = useState<CustomField>(field);
  const [newOption, setNewOption] = useState('');

  // Update local state when selected field changes
  useEffect(() => {
    setFormData(field);
  }, [field]);

  // Auto-save on changes (or we can keep it explicit with a "Done" button)
  // The user asked for "editor that saves". Real-time updates feel better in a panel.
  // I will trigger onSave whenever formData changes.
  useEffect(() => {
    const timer = setTimeout(() => {
        onSave(formData);
    }, 300); // Debounce slightly to avoid excessive re-renders/saves
    return () => clearTimeout(timer);
  }, [formData]);

  const handleLabelChange = (value: string) => {
    if (value.length <= 100) {
      setFormData(prev => ({ ...prev, label: value }));
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt)
    }));
  };

  const needsOptions = ['dropdown', 'radio', 'multichoice', 'checkbox'].includes(formData.type);
  const supportsPlaceholder = ['text', 'textarea', 'number', 'email', 'phone', 'url'].includes(formData.type);

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: '#94A3B8' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h3 className="text-lg font-semibold text-white">Edit Field</h3>
          <p className="text-xs text-slate-400">{getFieldTypeName()}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        {/* Field Label */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Field Label <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border outline-none transition-colors text-sm"
            style={{ 
              borderColor: 'rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#FFFFFF'
            }}
          />
          <div className="flex justify-end mt-1">
            <span className="text-[10px] text-slate-500">
              {formData.label.length}/100
            </span>
          </div>
        </div>

        {/* Help Text */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Help Text
          </label>
          <input
            type="text"
            value={formData.helpText || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, helpText: e.target.value }))}
            placeholder="Instructions for user"
            className="w-full h-10 px-3 rounded-lg border outline-none transition-colors text-sm"
            style={{ 
              borderColor: 'rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#FFFFFF'
            }}
          />
        </div>

        {/* Placeholder */}
        {supportsPlaceholder && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Placeholder
            </label>
            <input
              type="text"
              value={formData.placeholder || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
              placeholder="Input placeholder"
              className="w-full h-10 px-3 rounded-lg border outline-none transition-colors text-sm"
              style={{ 
                borderColor: 'rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#FFFFFF'
              }}
            />
          </div>
        )}

        {/* Options */}
        {needsOptions && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Options
            </label>
            <div className="space-y-2 mb-3">
              {formData.options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg border outline-none transition-colors text-sm"
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF'
                    }}
                  />
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/20 border border-red-500/30"
                  >
                    <XCircle size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                placeholder="New option"
                className="flex-1 h-9 px-3 rounded-lg border outline-none transition-colors text-sm"
                style={{ 
                  borderColor: 'rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#FFFFFF'
                }}
              />
              <button
                onClick={handleAddOption}
                className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors hover:bg-blue-500/20 border-blue-500/30"
              >
                <Plus size={16} className="text-blue-500" />
              </button>
            </div>
          </div>
        )}

        {/* Validation */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Settings
          </label>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <span className="text-sm text-white">Required Field</span>
            <button
              onClick={() => setFormData(prev => ({ ...prev, required: !prev.required }))}
              className="relative w-9 h-5 rounded-full transition-colors"
              style={{ backgroundColor: formData.required ? '#0684F5' : 'rgba(255,255,255,0.2)' }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                style={{ left: formData.required ? 'calc(100% - 18px)' : '2px' }}
              />
            </button>
          </div>
        </div>

        {/* Delete Button */}
        {!field.isSystem && (
           <div className="pt-4 mt-4 border-t border-white/10">
            <button
              onClick={onDelete}
              className="w-full h-10 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-red-500/10 text-red-400 text-sm font-medium"
            >
              <Trash2 size={16} />
              Delete Field
            </button>
          </div>
        )}
      </div>

      {/* Done Button */}
      <div className="pt-4 mt-auto border-t border-white/10">
        <button
          onClick={onClose}
          className="w-full h-10 rounded-lg flex items-center justify-center gap-2 transition-colors bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <CheckCircle size={16} />
          Done Editing
        </button>
      </div>
    </div>
  );
}
