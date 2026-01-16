import { Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';

interface EditModuleProps {
  blockName: string;
  onEdit?: () => void;
  quickActions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }>;
}

export default function EditModule({ blockName, onEdit, quickActions = [] }: EditModuleProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 20,
        display: 'flex',
        gap: '8px'
      }}
    >
      <button
        onClick={onEdit}
        title={t('wizard.designStudio.editModule.title', { block: blockName })}
        style={{
          height: '36px',
          padding: '0 14px',
          backgroundColor: 'rgba(11, 38, 65, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '13px',
          fontWeight: 600,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0684F5';
          e.currentTarget.style.transform = 'translateY(-2px)';
          setIsHovered(true);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(11, 38, 65, 0.95)';
          e.currentTarget.style.transform = 'translateY(0)';
          setIsHovered(false);
        }}
      >
        <Edit2 size={14} />
        {t('wizard.designStudio.editModule.label', { block: blockName })}
      </button>

      {/* Quick Actions - Only show when main button is hovered */}
      {isHovered && quickActions.length > 0 && (
        <div style={{ display: 'flex', gap: '4px' }}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              title={action.label}
              onClick={action.onClick}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(11, 38, 65, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0684F5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(11, 38, 65, 0.95)';
              }}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
