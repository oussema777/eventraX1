import { X, Upload, Download, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';

interface ImportSpeakersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export default function ImportSpeakersModal({ isOpen, onClose, onImport }: ImportSpeakersModalProps) {
  const { t } = useI18n();
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleImport = () => {
    onImport({ fileName });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(11, 38, 65, 0.7)' }}
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="w-[600px] rounded-xl overflow-hidden"
          style={{ 
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="p-6"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 
                  className="text-2xl mb-1"
                  style={{ fontWeight: 600, color: '#0B2641' }}
                >
                  {t('wizard.step3.speakers.importModal.title')}
                </h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {t('wizard.step3.speakers.importModal.subtitle')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: '#6B7280' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Upload Area */}
            <div 
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50 mb-6"
              style={{ borderColor: '#E5E7EB' }}
            >
              <Upload size={48} style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
              <p className="text-base mb-2" style={{ color: '#0B2641', fontWeight: 500 }}>
                {t('wizard.step3.speakers.importModal.dropzone.title')}
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {t('wizard.step3.speakers.importModal.dropzone.helper')}
              </p>
              {fileName && (
                <div className="mt-4">
                  <span 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
                    style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)', color: 'var(--primary)' }}
                  >
                    <CheckCircle size={16} />
                    {fileName}
                  </span>
                </div>
              )}
            </div>

            {/* Template Download */}
            <div 
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: '#F9FAFB' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ fontWeight: 600, color: '#0B2641' }}>
                    {t('wizard.step3.speakers.importModal.template.title')}
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    {t('wizard.step3.speakers.importModal.template.subtitle')}
                  </p>
                </div>
                <button 
                  className="flex items-center gap-2 px-4 h-10 rounded-lg border transition-colors hover:bg-white"
                  style={{ borderColor: '#E5E7EB', fontWeight: 600 }}
                >
                  <Download size={16} style={{ color: 'var(--primary)' }} />
                  {t('wizard.step3.speakers.importModal.template.cta')}
                </button>
              </div>
            </div>

            {/* Field Mapping Info */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}
            >
              <p className="text-xs" style={{ color: '#92400E' }}>
                <strong>{t('wizard.step3.speakers.importModal.fields.requiredLabel')}</strong>{' '}
                {t('wizard.step3.speakers.importModal.fields.required')}
              </p>
              <p className="text-xs mt-1" style={{ color: '#92400E' }}>
                <strong>{t('wizard.step3.speakers.importModal.fields.optionalLabel')}</strong>{' '}
                {t('wizard.step3.speakers.importModal.fields.optional')}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-end gap-3 p-6"
            style={{ borderTop: '1px solid #E5E7EB' }}
          >
            <button
              onClick={onClose}
              className="h-11 px-5 rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: '#0B2641', fontWeight: 600 }}
            >
              {t('wizard.common.cancel')}
            </button>
            <button
              onClick={handleImport}
              className="h-11 px-5 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              <CheckCircle size={18} />
              {t('wizard.step3.speakers.importModal.actions.import')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
