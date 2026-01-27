import { useState } from 'react';
import { 
  Briefcase, 
  Grid3x3, 
  DollarSign, 
  CheckCircle, 
  LayoutGrid, 
  List, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  Download,
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Edit,
  MoreVertical,
  Star,
  Check,
  X,
  Upload,
  Trash2
} from 'lucide-react';
import { uploadExhibitorLogo } from '../../utils/storage';
import { useExhibitors, Exhibitor } from '../../hooks/useExhibitors';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../../i18n/I18nContext';

type ViewMode = 'grid' | 'list';

interface ExhibitorsTabProps {
  eventId?: string;
}

export default function ExhibitorsTab({ eventId }: ExhibitorsTabProps) {
  const { exhibitors, isLoading, createExhibitor, updateExhibitor, deleteExhibitor } = useExhibitors(eventId);
  const { t } = useI18n();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFormPreviewModal, setShowFormPreviewModal] = useState(false);
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      confirmed: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
      pending: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
      'contract-sent': { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
      declined: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' }
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t('wizard.step3.exhibitors.status.confirmed');
      case 'declined':
        return t('wizard.step3.exhibitors.status.declined');
      case 'contract-sent':
        return t('wizard.step3.exhibitors.status.contractSent');
      case 'pending':
      default:
        return t('wizard.step3.exhibitors.status.pending');
    }
  };

  const filteredExhibitors = exhibitors.filter(ex => {
    const matchesSearch = ex.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleSaveExhibitor = async (data: any, logoFile?: File) => {
    if (!eventId) return;
    
    try {
      let exhibitorId = selectedExhibitor?.id;
      let finalData = { ...data };

      if (selectedExhibitor) {
        // Updating existing
        if (logoFile) {
          const logoUrl = await uploadExhibitorLogo(eventId, exhibitorId!, logoFile);
          if (logoUrl) finalData.logo_url = logoUrl;
        }
        await updateExhibitor(exhibitorId!, finalData);
        toast.success(t('wizard.step3.exhibitors.toasts.updated'));
      } else {
        // Creating new
        const newExhibitor = await createExhibitor(finalData);
        if (newExhibitor && logoFile) {
          const logoUrl = await uploadExhibitorLogo(eventId, newExhibitor.id, logoFile);
          if (logoUrl) {
            await updateExhibitor(newExhibitor.id, { logo_url: logoUrl });
          }
        }
        toast.success(t('wizard.step3.exhibitors.toasts.created'));
      }
      setShowAddModal(false);
      setSelectedExhibitor(null);
    } catch (error) {
      console.error(error);
      toast.error(t('wizard.step3.exhibitors.toasts.saveFailed'));
    }
  };

  const handleDeleteExhibitor = async (id: string) => {
    if (confirm(t('wizard.step3.exhibitors.confirmDelete'))) {
      try {
        await deleteExhibitor(id);
        toast.success(t('wizard.step3.exhibitors.toasts.deleted'));
        if (selectedExhibitor?.id === id) {
          setShowProfileModal(false);
          setShowAddModal(false);
          setSelectedExhibitor(null);
        }
      } catch (error) {
        toast.error(t('wizard.step3.exhibitors.toasts.deleteFailed'));
      }
    }
  };

  if (isLoading) {
    return <div style={{ padding: '40px', color: '#FFFFFF' }}>{t('wizard.step3.exhibitors.loading')}</div>;
  }

  return (
    <div className="exhibitors-container" style={{ backgroundColor: '#0B2641', padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 40px) 80px', minHeight: 'calc(100vh - 200px)' }}>
      <style>{`
        @media (max-width: 1024px) {
          .exhibitors-container { padding: 1rem !important; }
          .exhibitors-header { flex-direction: column !important; gap: 1rem !important; }
          .exhibitors-header-actions { width: 100% !important; justify-content: space-between !important; }
          .exhibitors-add-btn { flex: 1 !important; justify-content: center !important; }
          .exhibitors-search-bar { flex-direction: column !important; align-items: stretch !important; gap: 1rem !important; }
          .exhibitors-search-controls { width: 100% !important; }
          .exhibitors-search-input-wrapper { width: 100% !important; }
          .exhibitors-search-input { width: 100% !important; }
          .exhibitors-grid { grid-template-columns: 1fr !important; }
          .exhibitor-list-view { overflow-x: auto !important; }
          .exhibitor-list-inner { min-width: 800px !important; }
        }
        @media (max-width: 500px) {
          .exhibitors-container { padding: 0.5rem !important; }
          .exhibitors-grid { gap: 1rem !important; }
        }
      `}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div className="exhibitors-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('wizard.step3.exhibitors.title')}
            </h2>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>
              {t('wizard.step3.exhibitors.subtitle')}
            </p>
          </div>
          <div className="exhibitors-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* View Toggle */}
            <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '10px 16px',
                  backgroundColor: viewMode === 'grid' ? '#0684F5' : 'transparent',
                  color: viewMode === 'grid' ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '10px 16px',
                  backgroundColor: viewMode === 'list' ? '#0684F5' : 'transparent',
                  color: viewMode === 'list' ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <List size={18} />
              </button>
            </div>

            {/* Add Exhibitor Button */}
            <button
              onClick={() => setShowChoiceModal(true)}
              className="exhibitors-add-btn"
              style={{
                height: '44px',
                padding: '0 20px',
                backgroundColor: '#0684F5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
            >
              <Plus size={18} />
              {t('wizard.step3.exhibitors.add')}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="exhibitors-search-bar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          {/* Search */}
          <div className="exhibitors-search-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="exhibitors-search-input-wrapper" style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                className="exhibitors-search-input"
                placeholder={t('wizard.step3.exhibitors.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '320px',
                  height: '44px',
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#FFFFFF'
                }}
              />
            </div>

            {/* Filter Button */}
            <button
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Filter size={18} style={{ color: '#94A3B8' }} />
            </button>

            {/* Sort Dropdown */}
            <button
              style={{
                height: '44px',
                padding: '0 16px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#94A3B8'
              }}
            >
              {t('wizard.step3.exhibitors.sortBy')}
              <ChevronDown size={16} />
            </button>

            {/* Export Button */}
            <button
              style={{
                height: '44px',
                padding: '0 16px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: '#94A3B8'
              }}
            >
              <Download size={16} />
              {t('wizard.step3.exhibitors.export')}
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="exhibitors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredExhibitors.map((exhibitor) => (
              <ExhibitorCard
                key={exhibitor.id}
                exhibitor={exhibitor}
                onEdit={() => {
                  setSelectedExhibitor(exhibitor);
                  setShowAddModal(true);
                }}
                onViewProfile={() => {
                  setSelectedExhibitor(exhibitor);
                  setShowProfileModal(true);
                }}
              />
            ))}

            {/* Empty State Card */}
            <div
              style={{
                backgroundColor: '#FAFAFA',
                border: '2px dashed #D1D5DB',
                borderRadius: '12px',
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '400px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setShowAddModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0684F5';
                e.currentTarget.style.backgroundColor = '#F0F9FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
              }}
            >
              <Plus size={64} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#0B2641', marginBottom: '8px' }}>
                {t('wizard.step3.exhibitors.empty.title')}
              </p>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                {t('wizard.step3.exhibitors.empty.subtitle')}
              </p>
              <button
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0684F5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                >
                  <Plus size={16} />
                  {t('wizard.step3.exhibitors.empty.cta')}
                </button>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="exhibitor-list-view" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div className="exhibitor-list-inner">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', width: '3%' }}>
                    <input type="checkbox" />
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', width: '35%', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                    {t('wizard.step3.exhibitors.table.company')}
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', width: '30%', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                    {t('wizard.step3.exhibitors.table.contact')}
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', width: '22%', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                    {t('wizard.step3.exhibitors.table.status')}
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', width: '10%', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                    {t('wizard.step3.exhibitors.table.actions')}
                  </th>
                </tr>
                </thead>
                <tbody>
                {filteredExhibitors.map((exhibitor) => {
                  const statusStyle = getStatusBadgeStyle(exhibitor.status);
                  
                  return (
                    <tr 
                      key={exhibitor.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <input type="checkbox" />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '8px', 
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#94A3B8',
                            overflow: 'hidden'
                          }}>
                            {exhibitor.logo_url ? (
                              <img src={exhibitor.logo_url} alt={exhibitor.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              exhibitor.company.substring(0, 2)
                            )}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                              {exhibitor.company}
                            </p>
                            <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                              {exhibitor.industry}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                          {exhibitor.email}
                        </p>
                        <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                          {exhibitor.phone}
                        </p>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            backgroundColor: statusStyle.dot 
                          }} />
                          {getStatusLabel(exhibitor.status)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          onClick={() => {
                            setSelectedExhibitor(exhibitor);
                            setShowAddModal(true);
                          }}
                        >
                          <MoreVertical size={18} style={{ color: '#6B7280' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Choice Modal - Add Manually or Send Form */}
        {showChoiceModal && (
          <AddChoiceModal
            onClose={() => setShowChoiceModal(false)}
            onManual={() => {
              setShowChoiceModal(false);
              setShowAddModal(true);
            }}
            onSendForm={() => {
              setShowChoiceModal(false);
              setShowFormPreviewModal(true);
            }}
          />
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <AddExhibitorModal
            exhibitor={selectedExhibitor}
            onClose={() => {
              setShowAddModal(false);
              setSelectedExhibitor(null);
            }}
            onSave={handleSaveExhibitor}
          />
        )}

        {/* Form Preview Modal */}
        {showFormPreviewModal && (
          <ExhibitorFormPreviewModal
            onClose={() => setShowFormPreviewModal(false)}
            onSend={() => {
              toast.success(t('wizard.step3.exhibitors.toasts.formSent'));
              setShowFormPreviewModal(false);
            }}
          />
        )}

        {/* Profile Modal */}
        {showProfileModal && selectedExhibitor && (
          <ExhibitorProfileModal
            exhibitor={selectedExhibitor}
            onClose={() => {
              setShowProfileModal(false);
              setSelectedExhibitor(null);
            }}
            onEdit={() => {
              setShowProfileModal(false);
              setShowAddModal(true);
            }}
            onDelete={() => handleDeleteExhibitor(selectedExhibitor.id)}
          />
        )}
      </div>
    </div>
  );
}

// Exhibitor Card Component - MATCHING DASHBOARD DESIGN
function ExhibitorCard({ 
  exhibitor, 
  onEdit, 
  onViewProfile 
}: { 
  exhibitor: Exhibitor;
  onEdit: () => void;
  onViewProfile: () => void;
}) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      confirmed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', dot: '#10B981', label: t('wizard.step3.exhibitors.status.confirmed') },
      pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', dot: '#F59E0B', label: t('wizard.step3.exhibitors.status.pending') },
      'contract-sent': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', dot: '#3B82F6', label: t('wizard.step3.exhibitors.status.contractSent') },
      declined: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', dot: '#EF4444', label: t('wizard.step3.exhibitors.status.declined') }
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const statusStyle = getStatusBadgeStyle(exhibitor.status);

  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.15)',
        overflow: 'hidden',
        transition: 'all 0.2s',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 10px 25px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onViewProfile}
    >
      {/* Header Section */}
      <div
        style={{
          height: '140px',
          background: 'linear-gradient(135deg, #635BFF 0%, #7C75FF 100%)',
          position: 'relative'
        }}
      >
         <div
            style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(11,38,65,0.1) 0%, rgba(11,38,65,0.4) 100%)'
            }}
        />

        {/* Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '4px 10px',
            backgroundColor: statusStyle.bg,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusStyle.dot }} />
          <span style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 600, color: statusStyle.text }}>
            {statusStyle.label}
          </span>
        </div>

        {/* Company Logo */}
        <div
          style={{
            position: 'absolute',
            bottom: '-32px',
            left: '24px',
            width: '80px',
            height: '80px',
            backgroundColor: '#0B2641',
            borderRadius: '12px',
            border: '4px solid #0B2641',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {exhibitor.logo_url ? (
            <img src={exhibitor.logo_url} alt={exhibitor.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
             <span style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{exhibitor.company.substring(0, 2)}</span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '48px 24px 24px' }}>
        <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
          {exhibitor.company}
        </h3>
        
        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
            {exhibitor.industry}
        </p>

        <p
          style={{
            fontFamily: 'Inter',
            fontSize: '14px',
            color: '#D1D5DB',
            lineHeight: 1.5,
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {exhibitor.description || t('wizard.step3.exhibitors.empty.subtitle')}
        </p>

        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {exhibitor.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '13px', color: '#D1D5DB' }}>{exhibitor.email}</span>
                </div>
            )}
            {exhibitor.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={14} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '13px', color: '#0684F5' }}>{exhibitor.website}</span>
                </div>
            )}
        </div>
      </div>

      {/* Card Footer */}
      <div style={{ padding: '16px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          style={{
            height: '36px',
            padding: '0 16px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        >
          <Edit size={14} />
          {t('wizard.step3.exhibitors.card.edit')}
        </button>
      </div>
    </div>
  );
}

function getStatusBadgeStyle(status: string) {
  const styles = {
    confirmed: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
    pending: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
    'contract-sent': { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
    declined: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' }
  };
  return styles[status as keyof typeof styles] || styles.pending;
}

// Add Choice Modal Component
function AddChoiceModal({ 
  onClose, 
  onManual, 
  onSendForm 
}: { 
  onClose: () => void;
  onManual: () => void;
  onSendForm: () => void;
}) {
  const { t } = useI18n();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(600px, 92vw)',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0B2641', marginBottom: '4px' }}>
                {t('wizard.step3.exhibitors.addChoice.title')}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                {t('wizard.step3.exhibitors.addChoice.subtitle')}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={20} style={{ color: '#6B7280' }} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '32px 24px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Manual Option */}
            <button
              onClick={onManual}
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0684F5';
                e.currentTarget.style.backgroundColor = '#F0F9FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Edit size={24} style={{ color: '#0684F5' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B2641', marginBottom: '4px' }}>
                    {t('wizard.step3.exhibitors.addChoice.manual.title')}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                    {t('wizard.step3.exhibitors.addChoice.manual.subtitle')}
                  </p>
                </div>
              </div>
            </button>

            {/* Send Form Option */}
            <button
              onClick={onSendForm}
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0684F5';
                e.currentTarget.style.backgroundColor = '#F0F9FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#EDE9FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Mail size={24} style={{ color: '#8B5CF6' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B2641', marginBottom: '4px' }}>
                    {t('wizard.step3.exhibitors.addChoice.sendForm.title')}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                    {t('wizard.step3.exhibitors.addChoice.sendForm.subtitle')}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Exhibitor Form Preview Modal Component
function ExhibitorFormPreviewModal({ 
  onClose,
  onSend
}: { 
  onClose: () => void;
  onSend: () => void;
}) {
  const { t } = useI18n();
  const [recipientEmail, setRecipientEmail] = useState('');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(900px, 92vw)',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0B2641', marginBottom: '4px' }}>
                {t('wizard.step3.exhibitors.formPreview.title')}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                {t('wizard.step3.exhibitors.formPreview.subtitle')}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={20} style={{ color: '#6B7280' }} />
            </button>
          </div>
        </div>

        {/* Email Input */}
        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
            {t('wizard.step3.exhibitors.formPreview.recipientLabel')}
          </label>
          <input
            type="email"
            placeholder={t('wizard.step3.exhibitors.formPreview.recipientPlaceholder')}
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#0B2641'
            }}
          />
        </div>

        {/* Form Preview */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px', backgroundColor: '#F9FAFB' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B2641', marginBottom: '16px' }}>
              {t('wizard.step3.exhibitors.formPreview.formTitle')}
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              {t('wizard.step3.exhibitors.formPreview.formSubtitle')}
            </p>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.formPreview.fields.companyName')}
                </label>
                <input type="text" disabled style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#F9FAFB' }} />
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.formPreview.fields.industry')}
                </label>
                <input type="text" disabled style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#F9FAFB' }} />
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.formPreview.fields.contactEmail')}
                </label>
                <input type="email" disabled style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#F9FAFB' }} />
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.formPreview.fields.description')}
                </label>
                <textarea disabled rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#F9FAFB', resize: 'none' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              height: '40px',
              padding: '0 20px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6B7280',
              cursor: 'pointer'
            }}
          >
            {t('wizard.step3.exhibitors.modal.cancel')}
          </button>
          <button
            onClick={onSend}
            disabled={!recipientEmail}
            style={{
              height: '40px',
              padding: '0 20px',
              backgroundColor: recipientEmail ? '#0684F5' : '#E5E7EB',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: recipientEmail ? 'pointer' : 'not-allowed'
            }}
          >
            {t('wizard.step3.exhibitors.formPreview.send')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Exhibitor Modal Component - BOOTH DETAILS REMOVED
function AddExhibitorModal({ 
  exhibitor, 
  onClose, 
  onSave 
}: { 
  exhibitor: Exhibitor | null;
  onClose: () => void;
  onSave: (data: any, logoFile?: File) => void;
}) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    company: exhibitor?.company || '',
    industry: exhibitor?.industry || '',
    email: exhibitor?.email || '',
    phone: exhibitor?.phone || '',
    website: exhibitor?.website || '',
    description: exhibitor?.description || '',
    status: exhibitor?.status || 'pending',
    note: exhibitor?.note || ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(exhibitor?.logo_url || null);

  const isFormValid = 
    formData.company.trim() !== '' && 
    formData.industry.trim() !== '' && 
    formData.email.trim() !== '' && 
    formData.status.trim() !== '';

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData, logoFile);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(800px, 92vw)',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0B2641', marginBottom: '4px' }}>
                {exhibitor
                  ? t('wizard.step3.exhibitors.modal.editTitle')
                  : t('wizard.step3.exhibitors.modal.addTitle')}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                {t('wizard.step3.exhibitors.modal.subtitle')}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={20} style={{ color: '#6B7280' }} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Section 1: Company Info */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0B2641', marginBottom: '16px' }}>
                {t('wizard.step3.exhibitors.modal.companySection')}
              </h3>
              
              {/* Logo Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  Company Logo
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #E5E7EB',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Upload size={24} style={{ color: '#9CA3AF' }} />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ display: 'none' }}
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#374151',
                        cursor: 'pointer',
                        display: 'inline-block'
                      }}
                    >
                      Upload Logo
                    </label>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      Max 5MB. PNG, JPG supported.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.modal.fields.companyName')} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder={t('wizard.step3.exhibitors.modal.fields.companyNamePlaceholder')}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#0B2641'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.modal.fields.industry')} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#0B2641',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">{t('wizard.step3.exhibitors.modal.fields.industryPlaceholder')}</option>
                  <option value="Software & Technology">Software & Technology</option>
                  <option value="Marketing & Analytics">Marketing & Analytics</option>
                  <option value="Data & AI">Data & AI</option>
                  <option value="Fintech">Fintech</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Healthcare Tech">Healthcare Tech</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.modal.fields.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('wizard.step3.exhibitors.modal.fields.descriptionPlaceholder')}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#0B2641',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Section 2: Contact Info */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0B2641', marginBottom: '16px' }}>
                {t('wizard.step3.exhibitors.modal.contactSection')}
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.modal.fields.email')} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('wizard.step3.exhibitors.modal.fields.emailPlaceholder')}
                    style={{
                      width: '100%',
                      height: '44px',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0B2641'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.modal.fields.phone')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('wizard.step3.exhibitors.modal.fields.phonePlaceholder')}
                    style={{
                      width: '100%',
                      height: '44px',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0B2641'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.modal.fields.website')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Globe size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder={t('wizard.step3.exhibitors.modal.fields.websitePlaceholder')}
                    style={{
                      width: '100%',
                      height: '44px',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0B2641'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Status - BOOTH DETAILS REMOVED */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0B2641', marginBottom: '16px' }}>
                {t('wizard.step3.exhibitors.modal.statusSection')}
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '12px' }}>
                  {t('wizard.step3.exhibitors.modal.fields.status')} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'confirmed', label: t('wizard.step3.exhibitors.status.confirmed'), color: '#10B981' },
                    { value: 'pending', label: t('wizard.step3.exhibitors.status.pendingContract'), color: '#F59E0B' },
                    { value: 'contract-sent', label: t('wizard.step3.exhibitors.status.contractSent'), color: '#3B82F6' }
                  ].map((status) => (
                    <label
                      key={status.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        border: formData.status === status.value ? `2px solid ${status.color}` : '1px solid #E5E7EB',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: formData.status === status.value ? `${status.color}15` : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={formData.status === status.value}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641' }}>
                        {status.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641', display: 'block', marginBottom: '8px' }}>
                  {t('wizard.step3.exhibitors.modal.fields.notes')}
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder={t('wizard.step3.exhibitors.modal.fields.notesPlaceholder')}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#0B2641',
                    resize: 'vertical'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                  {t('wizard.step3.exhibitors.modal.fields.notesHelper')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              height: '40px',
              padding: '0 20px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6B7280',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              height: '40px',
              padding: '0 20px',
              backgroundColor: '#0684F5',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
          >
            {exhibitor
              ? t('wizard.step3.exhibitors.modal.save')
              : t('wizard.step3.exhibitors.modal.add')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Exhibitor Profile Modal - BOOTH DETAILS REMOVED
function ExhibitorProfileModal({ 
  exhibitor, 
  onClose,
  onEdit,
  onDelete
}: { 
  exhibitor: Exhibitor;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const statusStyle = getStatusBadgeStyle(exhibitor.status);
  const statusLabel =
    exhibitor.status === 'contract-sent'
      ? t('wizard.step3.exhibitors.status.contractSent')
      : exhibitor.status === 'confirmed'
        ? t('wizard.step3.exhibitors.status.confirmed')
        : exhibitor.status === 'declined'
          ? t('wizard.step3.exhibitors.status.declined')
          : t('wizard.step3.exhibitors.status.pending');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(700px, 92vw)',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 32px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            <X size={20} style={{ color: '#FFFFFF' }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
              color: '#667eea',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {exhibitor.company.substring(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {exhibitor.company}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  {exhibitor.industry}
                </span>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.text,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: statusStyle.dot 
                  }} />
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {/* About */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B2641', marginBottom: '12px' }}>
              {t('wizard.step3.exhibitors.profile.about')}
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
              {exhibitor.description}
            </p>
          </div>

          {/* Contact Information */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B2641', marginBottom: '16px' }}>
              {t('wizard.step3.exhibitors.profile.contactTitle')}
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px', 
                  backgroundColor: '#F0F9FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={18} style={{ color: '#0684F5' }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>
                    {t('wizard.step3.exhibitors.profile.email')}
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641' }}>{exhibitor.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px', 
                  backgroundColor: '#F0F9FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Phone size={18} style={{ color: '#0684F5' }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>
                    {t('wizard.step3.exhibitors.profile.phone')}
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#0B2641' }}>{exhibitor.phone}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px', 
                  backgroundColor: '#F0F9FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Globe size={18} style={{ color: '#0684F5' }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>
                    {t('wizard.step3.exhibitors.profile.website')}
                  </p>
                  <a 
                    href={`https://${exhibitor.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '14px', fontWeight: 500, color: '#0684F5', textDecoration: 'none' }}
                  >
                    {exhibitor.website}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          {exhibitor.note && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B2641', marginBottom: '12px' }}>
                {t('wizard.step3.exhibitors.profile.notes')}
              </h3>
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#FEF3C7', 
                borderRadius: '8px',
                border: '1px solid #FDE68A'
              }}>
                <p style={{ fontSize: '14px', color: '#92400E', lineHeight: '1.5' }}>
                  {exhibitor.note}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onDelete}
            style={{
              height: '40px',
              padding: '0 20px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#EF4444',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Trash2 size={16} />
            {t('wizard.step3.exhibitors.profile.delete')}
          </button>
          <button
            onClick={onEdit}
            style={{
              height: '40px',
              padding: '0 20px',
              backgroundColor: '#0684F5',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Edit size={16} />
            {t('wizard.step3.exhibitors.profile.edit')}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
