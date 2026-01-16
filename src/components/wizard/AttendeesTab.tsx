import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Star,
  Mic,
  Camera,
  Clock,
  Info,
  Lock,
  Edit2,
  Trash2,
  Plus,
  X,
  Crown
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAttendees, Category } from '../../hooks/useAttendees';
import { useProfile } from '../../hooks/useProfile';
import { useI18n } from '../../i18n/I18nContext';

interface AttendeesTabProps {
  eventId?: string;
}

export default function AttendeesTab({ eventId }: AttendeesTabProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { profile } = useProfile();
  const hasPro = !!profile?.has_pro;
  const planRoute = '/select-plan';
  const { 
    categories, 
    settings, 
    isLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    updateSettings 
  } = useAttendees(eventId);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#0684F5',
    icon: 'Users',
    assignmentCriteria: 'manual'
  });

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Users,
      Star,
      Mic,
      Camera,
      Clock
    };
    return icons[iconName] || Users;
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success(t('wizard.step3.attendees.toasts.categoryDeleted'));
    } catch (error) {
      toast.error(t('wizard.step3.attendees.toasts.categoryDeleteFailed'));
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error(t('wizard.step3.attendees.toasts.categoryNameRequired'));
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: newCategory.name,
          description: newCategory.description,
          color: newCategory.color,
          icon: newCategory.icon,
          assignmentCriteria: newCategory.assignmentCriteria
        });
        toast.success(t('wizard.step3.attendees.toasts.categoryUpdated'));
      } else {
        await createCategory({
          name: newCategory.name,
          description: newCategory.description,
          color: newCategory.color,
          icon: newCategory.icon,
          isDefault: false,
          isActive: true,
          assignmentCriteria: newCategory.assignmentCriteria
        });
        toast.success(t('wizard.step3.attendees.toasts.categoryCreated'));
      }

      setShowAddCategoryModal(false);
      setEditingCategory(null);
      setNewCategory({
        name: '',
        description: '',
        color: '#0684F5',
        icon: 'Users',
        assignmentCriteria: 'manual'
      });
    } catch (error) {
      toast.error(t('wizard.step3.attendees.toasts.categorySaveFailed'));
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      assignmentCriteria: category.assignmentCriteria
    });
    setShowAddCategoryModal(true);
  };

  const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (val: boolean) => void; disabled?: boolean }) => (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '48px',
        height: '24px',
        backgroundColor: checked ? '#0684F5' : 'rgba(107,114,128,0.5)',
        borderRadius: '12px',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.2s'
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          backgroundColor: '#FFFFFF',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: checked ? '26px' : '2px',
          transition: 'left 0.2s'
        }}
      />
    </div>
  );

  if (isLoading) {
    return <div style={{ padding: '40px', color: '#FFFFFF' }}>{t('wizard.step3.attendees.loading')}</div>;
  }

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 40px) 80px', backgroundColor: '#0B2641', minHeight: 'calc(100vh - 300px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* PAGE HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('wizard.step3.attendees.title')}
            </h2>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>
              {t('wizard.step3.attendees.subtitle')}
            </p>
          </div>

          <button
            title={t('wizard.step3.attendees.infoTitle')}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center', 
              justifyContent: 'center'
            }}
          >
            <Info size={20} />
          </button>
        </div>

        {/* SECTION 1: ATTENDEE CATEGORIES */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                {t('wizard.step3.attendees.categories.title')}
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                {t('wizard.step3.attendees.categories.subtitle')}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setNewCategory({
                  name: '',
                  description: '',
                  color: '#0684F5',
                  icon: 'Users',
                  assignmentCriteria: 'manual'
                });
                setShowAddCategoryModal(true);
              }}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#0684F5',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={18} />
              {t('wizard.step3.attendees.categories.addButton')}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <div
                  key={category.id}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    border: `1px solid ${category.color}40`,
                    borderLeft: `4px solid ${category.color}`,
                    padding: '24px',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => handleEditCategory(category)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: `${category.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: category.color
                      }}
                    >
                      <IconComponent size={24} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'rgba(239,68,68,0.1)',
                          color: '#EF4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                    {category.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.5', minHeight: '42px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {category.description || t('wizard.step3.attendees.categories.noDescription')}
                  </p>
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{t('wizard.step3.attendees.categories.assignment')}:</span>
                    <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 500, textTransform: 'capitalize' }}>{category.assignmentCriteria}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        

        {/* SECTION 2: ATTENDEE PERMISSIONS */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: 'clamp(20px, 4vw, 32px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
              {t('wizard.step3.attendees.permissions.title')}
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              {t('wizard.step3.attendees.permissions.subtitle')}
            </p>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Permission 1: Self Check-in */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                  {t('wizard.step3.attendees.permissions.selfCheckin.title')}
                </p>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>
                  {t('wizard.step3.attendees.permissions.selfCheckin.subtitle')}
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
                  {t('wizard.step3.attendees.permissions.selfCheckin.note')}
                </p>
              </div>
              <ToggleSwitch checked={settings.allowSelfCheckin} onChange={(val) => updateSettings({ allowSelfCheckin: val })} />
            </div>

            {/* Permission 2: Profile Editing */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                    {t('wizard.step3.attendees.permissions.profileEditing.title')}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                    {t('wizard.step3.attendees.permissions.profileEditing.subtitle')}
                  </p>
                </div>
                <ToggleSwitch checked={settings.allowProfileEditing} onChange={(val) => updateSettings({ allowProfileEditing: val })} />
              </div>

              {settings.allowProfileEditing && (
                <div style={{ marginLeft: 'clamp(16px, 6vw, 48px)', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'contact', label: t('wizard.step3.attendees.permissions.profileEditing.options.contact') },
                    { key: 'dietary', label: t('wizard.step3.attendees.permissions.profileEditing.options.dietary') },
                    { key: 'requirements', label: t('wizard.step3.attendees.permissions.profileEditing.options.requirements') },
                    { key: 'company', label: t('wizard.step3.attendees.permissions.profileEditing.options.company') }
                  ].map((item) => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.profileEditPerms[item.key as keyof typeof settings.profileEditPerms]}
                        onChange={(e) => updateSettings({
                          profileEditPerms: { ...settings.profileEditPerms, [item.key]: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Permission 3: Session Registration */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                  {t('wizard.step3.attendees.permissions.sessionRegistration.title')}
                </p>
                <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                  {t('wizard.step3.attendees.permissions.sessionRegistration.subtitle')}
                </p>
              </div>
              <ToggleSwitch checked={settings.sessionRegistration} onChange={(val) => updateSettings({ sessionRegistration: val })} />
            </div>

            {/* Permission 4: B2B Networking */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                    {t('wizard.step3.attendees.permissions.b2b.title')}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                    {t('wizard.step3.attendees.permissions.b2b.subtitle')}
                  </p>
                </div>
                <ToggleSwitch checked={settings.b2bAccess} onChange={(val) => updateSettings({ b2bAccess: val })} />
              </div>

              {settings.b2bAccess && (
                <div style={{ marginLeft: 'clamp(16px, 6vw, 48px)', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { value: 'all', label: t('wizard.step3.attendees.permissions.b2b.options.all'), checked: true },
                    { value: 'categories', label: t('wizard.step3.attendees.permissions.b2b.options.categories'), checked: false },
                    { value: 'approval', label: t('wizard.step3.attendees.permissions.b2b.options.approval'), checked: false }
                  ].map((option) => (
                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="b2b-access"
                        defaultChecked={option.checked}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Permission 5: Download Materials */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                  {t('wizard.step3.attendees.permissions.download.title')}
                </p>
                <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                  {t('wizard.step3.attendees.permissions.download.subtitle')}
                </p>
              </div>
              <ToggleSwitch checked={settings.downloadAccess} onChange={(val) => updateSettings({ downloadAccess: val })} />
            </div>

            {/* Permission 6: Public Directory (PRO) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF' }}>
                    {t('wizard.step3.attendees.permissions.publicDirectory.title')}
                  </p>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(245,158,11,0.15)',
                      color: '#F59E0B',
                      fontSize: '10px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Crown size={10} />
                    PRO
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>
                  {t('wizard.step3.attendees.permissions.publicDirectory.subtitle')}
                </p>
                <button
                  onClick={() => navigate(planRoute)}
                  style={{ fontSize: '12px', color: '#F59E0B', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  {t('wizard.step3.attendees.permissions.publicDirectory.upgrade')}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                {!hasPro && (
                  <Lock size={16} style={{ position: 'absolute', top: '4px', left: '16px', color: '#6B7280', zIndex: 1 }} />
                )}
                <ToggleSwitch
                  checked={settings.publicDirectory}
                  onChange={(val) => {
                    if (!hasPro) {
                      navigate(planRoute);
                      return;
                    }
                    updateSettings({ publicDirectory: val });
                  }}
                  disabled={!hasPro}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: COMMUNICATION PREFERENCES */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: 'clamp(20px, 4vw, 32px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
              {t('wizard.step3.attendees.communication.title')}
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              {t('wizard.step3.attendees.communication.subtitle')}
            </p>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Automated Emails */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                    {t('wizard.step3.attendees.communication.automatedEmails.title')}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                    {t('wizard.step3.attendees.communication.automatedEmails.subtitle')}
                  </p>
                </div>
                <ToggleSwitch checked={settings.automatedEmails} onChange={(val) => updateSettings({ automatedEmails: val })} />
              </div>

              {settings.automatedEmails && (
                <div style={{ marginLeft: 'clamp(16px, 6vw, 48px)', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    {
                      key: 'registration',
                      label: t('wizard.step3.attendees.communication.automatedEmails.triggers.registration.label'),
                      sub: t('wizard.step3.attendees.communication.automatedEmails.triggers.registration.sub')
                    },
                    {
                      key: 'reminder',
                      label: t('wizard.step3.attendees.communication.automatedEmails.triggers.reminder.label'),
                      sub: t('wizard.step3.attendees.communication.automatedEmails.triggers.reminder.sub')
                    },
                    {
                      key: 'checkin',
                      label: t('wizard.step3.attendees.communication.automatedEmails.triggers.checkin.label'),
                      sub: t('wizard.step3.attendees.communication.automatedEmails.triggers.checkin.sub')
                    }
                  ].map((trigger) => (
                    <div key={trigger.key}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={settings.emailTriggers[trigger.key as keyof typeof settings.emailTriggers]}
                          onChange={(e) => updateSettings({
                            emailTriggers: { ...settings.emailTriggers, [trigger.key]: e.target.checked }
                          })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{trigger.label}</span>
                      </label>
                      <p style={{ fontSize: '12px', color: '#94A3B8', marginLeft: '30px' }}>
                        {trigger.sub}
                      </p>
                      <a href="#" style={{ fontSize: '12px', color: '#0684F5', marginLeft: '30px', textDecoration: 'none' }}>
                        {t('wizard.step3.attendees.communication.automatedEmails.editTemplate')}
                      </a>
                    </div>
                  ))}

                  {/* PRO Trigger */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'not-allowed', opacity: 0.6 }}>
                      <input
                        type="checkbox"
                        disabled
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>
                        {t('wizard.step3.attendees.communication.automatedEmails.triggers.thankYou.label')}
                      </span>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(245,158,11,0.15)',
                          color: '#F59E0B',
                          fontSize: '9px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <Crown size={8} />
                        PRO
                      </span>
                    </label>
                    <p style={{ fontSize: '12px', color: '#94A3B8', marginLeft: '30px' }}>
                      {t('wizard.step3.attendees.communication.automatedEmails.triggers.thankYou.sub')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SMS Notifications (PRO) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF' }}>
                    {t('wizard.step3.attendees.communication.sms.title')}
                  </p>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(245,158,11,0.15)',
                      color: '#F59E0B',
                      fontSize: '10px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Crown size={10} />
                    PRO
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>
                  {t('wizard.step3.attendees.communication.sms.subtitle')}
                </p>
                <button
                  onClick={() => navigate(planRoute)}
                  style={{ fontSize: '12px', color: '#F59E0B', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  {t('wizard.step3.attendees.communication.sms.upgrade')}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                {!hasPro && (
                  <Lock size={16} style={{ position: 'absolute', top: '4px', left: '16px', color: '#6B7280', zIndex: 1 }} />
                )}
                <ToggleSwitch
                  checked={settings.smsNotifications}
                  onChange={(val) => {
                    if (!hasPro) {
                      navigate(planRoute);
                      return;
                    }
                    updateSettings({ smsNotifications: val });
                  }}
                  disabled={!hasPro}
                />
              </div>
            </div>

            {/* In-App Notifications */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                    {t('wizard.step3.attendees.communication.inApp.title')}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                    {t('wizard.step3.attendees.communication.inApp.subtitle')}
                  </p>
                </div>
                <ToggleSwitch checked={settings.inAppNotifications} onChange={(val) => updateSettings({ inAppNotifications: val })} />
              </div>

              {settings.inAppNotifications && (
                <div style={{ marginLeft: '48px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'sessionStart', label: t('wizard.step3.attendees.communication.inApp.options.sessionStart') },
                    { key: 'scheduleChanges', label: t('wizard.step3.attendees.communication.inApp.options.scheduleChanges') },
                    { key: 'b2bReminders', label: t('wizard.step3.attendees.communication.inApp.options.b2bReminders') },
                    { key: 'networking', label: t('wizard.step3.attendees.communication.inApp.options.networking') }
                  ].map((item) => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.inAppTypes[item.key as keyof typeof settings.inAppTypes]}
                        onChange={(e) => updateSettings({
                          inAppTypes: { ...settings.inAppTypes, [item.key]: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: DATA & PRIVACY SETTINGS */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: 'clamp(20px, 4vw, 32px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '80px'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
              {t('wizard.step3.attendees.privacy.title')}
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              {t('wizard.step3.attendees.privacy.subtitle')}
            </p>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Additional Data Fields */}
            <div>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
                {t('wizard.step3.attendees.privacy.additionalData.title')}
              </p>
              <div
                style={{
                  backgroundColor: 'rgba(6,132,245,0.08)',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <Info size={16} style={{ color: '#0684F5', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '12px', color: '#FFFFFF' }}>
                  {t('wizard.step3.attendees.privacy.additionalData.note')}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'companyName', label: t('wizard.step3.attendees.privacy.additionalData.fields.companyName'), sub: '' },
                  { key: 'jobTitle', label: t('wizard.step3.attendees.privacy.additionalData.fields.jobTitle'), sub: '' },
                  { key: 'industry', label: t('wizard.step3.attendees.privacy.additionalData.fields.industry'), sub: '' },
                  { key: 'companySize', label: t('wizard.step3.attendees.privacy.additionalData.fields.companySize'), sub: '' },
                  { key: 'businessGoals', label: t('wizard.step3.attendees.privacy.additionalData.fields.businessGoals'), sub: '' },
                  { key: 'linkedin', label: t('wizard.step3.attendees.privacy.additionalData.fields.linkedin'), sub: t('wizard.step3.attendees.privacy.additionalData.fields.linkedinSub') }
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.additionalData[field.key as keyof typeof settings.additionalData]}
                        onChange={(e) => updateSettings({
                          additionalData: { ...settings.additionalData, [field.key]: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{field.label}</span>
                    </label>
                    {field.sub && (
                      <p style={{ fontSize: '12px', color: '#94A3B8', marginLeft: '30px' }}>
                        {field.sub}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Data Retention */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                  {t('wizard.step3.attendees.privacy.retention.title')}
                </p>
                <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                  {t('wizard.step3.attendees.privacy.retention.subtitle')}
                </p>
              </div>
              <select
                defaultValue="1-year"
                style={{
                  height: '44px',
                  padding: '0 16px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  minWidth: 'min(200px, 100%)'
                }}
              >
                <option value="30-days">{t('wizard.step3.attendees.privacy.retention.options.days30')}</option>
                <option value="90-days">{t('wizard.step3.attendees.privacy.retention.options.days90')}</option>
                <option value="6-months">{t('wizard.step3.attendees.privacy.retention.options.months6')}</option>
                <option value="1-year">{t('wizard.step3.attendees.privacy.retention.options.year1')}</option>
                <option value="2-years">{t('wizard.step3.attendees.privacy.retention.options.year2')}</option>
                <option value="forever">{t('wizard.step3.attendees.privacy.retention.options.forever')}</option>
              </select>
            </div>

            {/* GDPR Compliance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                    {t('wizard.step3.attendees.privacy.gdpr.title')}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                    {t('wizard.step3.attendees.privacy.gdpr.subtitle')}
                  </p>
                </div>
                <ToggleSwitch checked={settings.gdprCompliance} onChange={(val) => updateSettings({ gdprCompliance: val })} />
              </div>

              {settings.gdprCompliance && (
                <div style={{ marginLeft: 'clamp(16px, 6vw, 48px)', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'consent', label: t('wizard.step3.attendees.privacy.gdpr.options.consent') },
                    { key: 'deletion', label: t('wizard.step3.attendees.privacy.gdpr.options.deletion') },
                    { key: 'privacy', label: t('wizard.step3.attendees.privacy.gdpr.options.privacy') }
                  ].map((item) => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.gdprSettings[item.key as keyof typeof settings.gdprSettings]}
                        onChange={(e) => updateSettings({
                          gdprSettings: { ...settings.gdprSettings, [item.key]: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Data Export Access */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                  {t('wizard.step3.attendees.privacy.export.title')}
                </p>
                <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                  {t('wizard.step3.attendees.privacy.export.subtitle')}
                </p>
              </div>
              <ToggleSwitch checked={settings.dataExportAccess} onChange={(val) => updateSettings({ dataExportAccess: val })} />
            </div>
          </div>
        </div>
      </div>

      {/* ADD/EDIT CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div
          style={{
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
          }}
          onClick={() => {
            setShowAddCategoryModal(false);
            setEditingCategory(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(600px, 92vw)',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                    {editingCategory
                      ? t('wizard.step3.attendees.categoryModal.editTitle')
                      : t('wizard.step3.attendees.categoryModal.createTitle')}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                    {t('wizard.step3.attendees.categoryModal.subtitle')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Category Name */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.attendees.categoryModal.fields.name')}
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder={t('wizard.step3.attendees.categoryModal.fields.namePlaceholder')}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', textAlign: 'right' }}>
                  {newCategory.name.length}/50
                </p>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.attendees.categoryModal.fields.description')}
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder={t('wizard.step3.attendees.categoryModal.fields.descriptionPlaceholder')}
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', textAlign: 'right' }}>
                  {newCategory.description.length}/200
                </p>
              </div>

              {/* Category Color */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.attendees.categoryModal.fields.color')}
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['#0684F5', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#EF4444', '#FBBF24'].map((color) => (
                    <div
                      key={color}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: color,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: newCategory.color === color ? '3px solid #FFFFFF' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Assignment Criteria */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', display: 'block', marginBottom: '12px' }}>
                  {t('wizard.step3.attendees.categoryModal.fields.assignment')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { value: 'manual', label: t('wizard.step3.attendees.categoryModal.assignmentOptions.manual') },
                    { value: 'ticket', label: t('wizard.step3.attendees.categoryModal.assignmentOptions.ticket') },
                    { value: 'date', label: t('wizard.step3.attendees.categoryModal.assignmentOptions.date') },
                    { value: 'field', label: t('wizard.step3.attendees.categoryModal.assignmentOptions.field') }
                  ].map((option) => (
                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="assignment"
                        checked={newCategory.assignmentCriteria === option.value}
                        onChange={() => setNewCategory({ ...newCategory, assignmentCriteria: option.value })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              {editingCategory && (
                <button
                  onClick={() => {
                    handleDeleteCategory(editingCategory.id);
                    setShowAddCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  style={{
                    padding: '0 20px',
                    height: '40px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#EF4444',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('wizard.step3.attendees.categoryModal.delete')}
                </button>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  style={{
                    height: '40px',
                    padding: '0 20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('wizard.step3.attendees.categoryModal.cancel')}
                </button>
                <button
                  onClick={handleSaveCategory}
                  style={{
                    height: '44px',
                    padding: '0 24px',
                    backgroundColor: '#0684F5',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={18} />
                  {editingCategory
                    ? t('wizard.step3.attendees.categoryModal.save')
                    : t('wizard.step3.attendees.categoryModal.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
