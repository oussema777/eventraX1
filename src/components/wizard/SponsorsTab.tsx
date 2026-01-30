import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  LayoutGrid, 
  List, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  Download,
  Globe,
  ExternalLink,
  Edit,
  MoreVertical,
  Star,
  X,
  XCircle,
  Upload,
  Trash2,
  Mail,
  Check,
  Settings,
  Crown,
  Users,
  Loader2
} from 'lucide-react';
import { useSponsors, Sponsor, SponsorPackage } from '../../hooks/useSponsors';
import { toast } from 'sonner';
import { usePlan } from '../../hooks/usePlan';
import { useI18n } from '../../i18n/I18nContext';

type ViewMode = 'grid' | 'list';
type TierFilter = 'all' | string;

export default function SponsorsTab() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { sponsors, packages, isLoading, createSponsor, updateSponsor, deleteSponsor, updatePackages } = useSponsors();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFormPreviewModal, setShowFormPreviewModal] = useState(false);
  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const statusLabels: Record<string, string> = {
    confirmed: t('wizard.step3.sponsors.status.confirmed'),
    pending: t('wizard.step3.sponsors.status.pending'),
    'contract-sent': t('wizard.step3.sponsors.status.contractSent')
  };

  const getTierBadgeStyle = (tier: string) => {
    // Find package color if available
    const pkg = packages.find(p => p.id === tier);
    const color = pkg ? pkg.color : '#CD7F32';
    
    // Determine style based on tier ID or just return dynamic style
    // For standard tiers, we can keep the fancy gradients, otherwise fallback to package color
    const styles: Record<string, any> = {
      platinum: { bg: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)', text: '#FFFFFF', border: '#C0C0C0' },
      gold: { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', text: '#FFFFFF', border: '#FFD700' },
      silver: { bg: 'linear-gradient(135deg, #A8A8A8 0%, #C8C8C8 100%)', text: '#FFFFFF', border: '#A8A8A8' },
      bronze: { bg: '#CD7F32', text: '#FFFFFF', border: '#CD7F32' }
    };

    if (styles[tier]) return styles[tier];

    return { 
        bg: color, 
        text: '#FFFFFF', 
        border: color 
    };
  };

  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      confirmed: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
      pending: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
      'contract-sent': { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' }
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  // Get sponsors in a specific package
  const getSponsorsInPackage = (packageId: string) => {
    return sponsors.filter(sponsor => sponsor.tier === packageId);
  };

  const filteredSponsors = sponsors.filter(sponsor => {
    // If a package is selected, filter by that package
    if (selectedPackage) {
      if (sponsor.tier !== selectedPackage) return false;
    }
    
    // Apply tier filter
    const matchesTier = tierFilter === 'all' || sponsor.tier === tierFilter;
    const matchesSearch = sponsor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const handleSaveSponsor = async (data: any) => {
    if (selectedSponsor) {
        await updateSponsor(selectedSponsor.id, data);
    } else {
        await createSponsor(data);
    }
    setShowAddModal(false);
    setSelectedSponsor(null);
  };

  const handleDeleteSponsor = async (id: string) => {
      if(window.confirm(t('wizard.step3.sponsors.confirmDelete'))) {
          await deleteSponsor(id);
      }
  }

  if (isLoading) {
      return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-white" size={32} /></div>;
  }

  return (
    <div style={{ backgroundColor: '#0B2641', padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 40px) 80px', minHeight: 'calc(100vh - 200px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('wizard.step3.sponsors.title')}
            </h2>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>
              {t('wizard.step3.sponsors.subtitle')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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

            {/* Manage Packages Button */}
            <button
              onClick={() => setShowPackagesModal(true)}
              style={{
                height: '44px',
                padding: '0 20px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              <Settings size={18} />
              {t('wizard.step3.sponsors.actions.managePackages')}
            </button>

            {/* Add Sponsor Button */}
            <button
              onClick={() => setShowAddModal(true)}
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
              {t('wizard.step3.sponsors.actions.addSponsor')}
            </button>
          </div>
        </div>

        {/* Sponsorship Packages Section - CLICKABLE CARDS */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('wizard.step3.sponsors.packages.title')}
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              {t('wizard.step3.sponsors.packages.subtitle')}
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {packages.map((pkg) => {
              const sponsorsInPackage = getSponsorsInPackage(pkg.id);
              const isSelected = selectedPackage === pkg.id;
              
              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    if (selectedPackage === pkg.id) {
                      setSelectedPackage(null);
                      setTierFilter('all');
                    } else {
                      setSelectedPackage(pkg.id);
                      setTierFilter(pkg.id as TierFilter);
                    }
                  }}
                  style={{
                    backgroundColor: isSelected ? 'rgba(6,132,245,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isSelected ? '#0684F5' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#0684F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={14} style={{ color: '#FFFFFF' }} />
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        background: pkg.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px'
                      }}
                    >
                      <Award size={24} style={{ color: '#FFFFFF' }} />
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                      {pkg.name}
                    </h4>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#0684F5' }}>
                      ${pkg.value.toLocaleString()}
                    </p>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(6,132,245,0.1)',
                    borderRadius: '6px',
                    marginBottom: '12px'
                  }}>
                    <Users size={16} style={{ color: '#0684F5' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0684F5' }}>
                      {t('wizard.step3.sponsors.packages.sponsorCount', { count: sponsorsInPackage.length })}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: '1.6' }}>
                    {pkg.benefits.slice(0, 3).map((benefit, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Check size={12} style={{ color: '#10B981', flexShrink: 0 }} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                    {pkg.benefits.length > 3 && (
                      <p style={{ marginTop: '4px', fontSize: '11px', color: '#6B7280' }}>
                        {t('wizard.step3.sponsors.packages.moreBenefits', { count: pkg.benefits.length - 3 })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedPackage && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px 16px', 
              backgroundColor: 'rgba(6,132,245,0.1)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} style={{ color: '#0684F5' }} />
                <span style={{ fontSize: '14px', color: '#0684F5', fontWeight: 500 }}>
                  {t('wizard.step3.sponsors.packages.filterActive', {
                    count: filteredSponsors.length,
                    tier: packages.find(p => p.id === selectedPackage)?.name || ''
                  })}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPackage(null);
                  setTierFilter('all');
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#0684F5',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <X size={14} />
                {t('wizard.step3.sponsors.packages.clearFilter')}
              </button>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setTierFilter('all');
                setSelectedPackage(null);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: tierFilter === 'all' ? '#0684F5' : 'rgba(255,255,255,0.05)',
                color: tierFilter === 'all' ? '#FFFFFF' : '#94A3B8',
                border: tierFilter === 'all' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {t('wizard.step3.sponsors.filters.all')}
            </button>
            
            {packages.map(pkg => (
                <button
                key={pkg.id}
                onClick={() => {
                    setTierFilter(pkg.id);
                    setSelectedPackage(pkg.id);
                }}
                style={{
                    padding: '10px 20px',
                    backgroundColor: tierFilter === pkg.id ? '#0684F5' : 'rgba(255,255,255,0.05)',
                    color: tierFilter === pkg.id ? '#FFFFFF' : '#94A3B8', // pkg.color for text if we want colored labels
                    border: tierFilter === pkg.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize'
                }}
                >
                {pkg.name}
                </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '0 1 300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder={t('wizard.step3.sponsors.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
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
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {filteredSponsors.map(sponsor => (
              <SponsorCard 
                key={sponsor.id} 
                sponsor={sponsor}
                packages={packages}
                onEdit={() => {
                  setSelectedSponsor(sponsor);
                  setShowAddModal(true);
                }}
              />
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                      {t('wizard.step3.sponsors.table.sponsor')}
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                      {t('wizard.step3.sponsors.table.tier')}
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                      {t('wizard.step3.sponsors.table.packageValue')}
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                      {t('wizard.step3.sponsors.table.website')}
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                      {t('wizard.step3.sponsors.table.status')}
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                      {t('wizard.step3.sponsors.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSponsors.map((sponsor, index) => {
                    const tierStyle = getTierBadgeStyle(sponsor.tier);
                    const statusStyle = getStatusBadgeStyle(sponsor.status);
                    const pkgName = packages.find(p => p.id === sponsor.tier)?.name || sponsor.tier;

                    return (
                      <tr key={sponsor.id} style={{ borderBottom: index < filteredSponsors.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                        <td style={{ padding: '16px' }}>
                          <div className="flex items-center gap-3">
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              background: tierStyle.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {sponsor.logoUrl ? (
                                <img src={sponsor.logoUrl} alt={sponsor.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                              ) : (
                                <Award size={20} style={{ color: tierStyle.text }} />
                              )}
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                              {sponsor.name}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '6px 12px',
                            background: tierStyle.bg,
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: tierStyle.text,
                            textTransform: 'capitalize'
                          }}>
                            {pkgName}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                            ${sponsor.contributionAmount.toLocaleString()}
                          </p>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {sponsor.websiteUrl && (
                            <a
                              href={sponsor.websiteUrl.startsWith('http') ? sponsor.websiteUrl : `https://${sponsor.websiteUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '14px', color: '#0684F5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              {sponsor.websiteUrl.replace(/^https?:\/\//, '')}
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            backgroundColor: statusStyle.bg,
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: statusStyle.text
                          }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusStyle.dot }} />
                            {statusLabels[sponsor.status] || sponsor.status}
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedSponsor(sponsor);
                                setShowAddModal(true);
                              }}
                              className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSponsor(sponsor.id)}
                              className="p-2 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddSponsorModal
            sponsor={selectedSponsor}
            packages={packages}
            onClose={() => {
              setShowAddModal(false);
              setSelectedSponsor(null);
            }}
            onSave={handleSaveSponsor}
          />
        )}

        {showFormPreviewModal && (
          <SponsorFormPreviewModal
            onClose={() => setShowFormPreviewModal(false)}
            onSend={() => {
              toast.success(t('wizard.step3.sponsors.formPreview.toastSent'));
              setShowFormPreviewModal(false);
            }}
          />
        )}

        {showPackagesModal && (
          <ManagePackagesModal
            packages={packages}
            onClose={() => setShowPackagesModal(false)}
            onSave={(updatedPackages) => {
              updatePackages(updatedPackages);
              setShowPackagesModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Sponsor Card Component
function SponsorCard({ sponsor, packages, onEdit }: { sponsor: Sponsor; packages: SponsorPackage[]; onEdit: () => void; }) {
  const { t } = useI18n();
  const getTierBadgeStyle = (tier: string) => {
    const pkg = packages.find(p => p.id === tier);
    const color = pkg ? pkg.color : '#CD7F32';
    
    const styles: Record<string, any> = {
      platinum: { bg: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)', text: '#FFFFFF', border: '#C0C0C0' },
      gold: { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', text: '#FFFFFF', border: '#FFD700' },
      silver: { bg: 'linear-gradient(135deg, #A8A8A8 0%, #C8C8C8 100%)', text: '#FFFFFF', border: '#A8A8A8' },
      bronze: { bg: '#CD7F32', text: '#FFFFFF', border: '#CD7F32' }
    };
    if (styles[tier]) return styles[tier];
    return { bg: color, text: '#FFFFFF', border: color };
  };

  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      confirmed: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
      pending: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
      'contract-sent': { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' }
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const tierStyle = getTierBadgeStyle(sponsor.tier);
  const statusStyle = getStatusBadgeStyle(sponsor.status);
  const pkgName = packages.find(p => p.id === sponsor.tier)?.name || sponsor.tier;
  const statusLabels: Record<string, string> = {
    confirmed: t('wizard.step3.sponsors.status.confirmed'),
    pending: t('wizard.step3.sponsors.status.pending'),
    'contract-sent': t('wizard.step3.sponsors.status.contractSent')
  };
  const statusLabel = statusLabels[sponsor.status] || sponsor.status;

  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.2s'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Tier Banner */}
      <div style={{ 
        background: tierStyle.bg,
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '120px'
      }}>
        {sponsor.logoUrl ? (
            <img src={sponsor.logoUrl} alt={sponsor.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
            <Award size={48} style={{ color: tierStyle.text }} />
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
          {sponsor.name}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            padding: '4px 10px',
            background: tierStyle.bg,
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            color: tierStyle.text,
            textTransform: 'uppercase'
          }}>
            {pkgName}
          </div>
          <div style={{
            padding: '4px 10px',
            backgroundColor: statusStyle.bg,
            color: statusStyle.text,
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusStyle.dot }} />
            {statusLabel}
          </div>
        </div>

        <p style={{ fontSize: '20px', fontWeight: 700, color: '#0684F5', marginBottom: '12px' }}>
          ${sponsor.contributionAmount.toLocaleString()}
        </p>

        {sponsor.websiteUrl && (
            <a 
            href={sponsor.websiteUrl.startsWith('http') ? sponsor.websiteUrl : `https://${sponsor.websiteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
                fontSize: '13px', 
                color: '#94A3B8', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '16px'
            }}
            >
            <Globe size={14} />
            {sponsor.websiteUrl.replace(/^https?:\/\//, '')}
            </a>
        )}

        <button
          onClick={onEdit}
          style={{
            width: '100%',
            height: '40px',
            backgroundColor: 'rgba(6,132,245,0.1)',
            border: '1px solid rgba(6,132,245,0.3)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#0684F5',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(6,132,245,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(6,132,245,0.1)';
          }}
        >
          <Edit size={16} />
          {t('wizard.step3.sponsors.actions.editSponsor')}
        </button>
      </div>
    </div>
  );
}

function AddSponsorModal({ sponsor, packages, onClose, onSave }: { sponsor: Sponsor | null, packages: SponsorPackage[], onClose: () => void, onSave: (data: any) => void }) {
    const { t } = useI18n();
    const [name, setName] = useState(sponsor?.name || '');
    const [tier, setTier] = useState(sponsor?.tier || (packages.length > 0 ? packages[0].id : 'gold'));
    const [websiteUrl, setWebsiteUrl] = useState(sponsor?.websiteUrl || '');
    const [contributionAmount, setContributionAmount] = useState(sponsor?.contributionAmount?.toString() || '');
    const [status, setStatus] = useState(sponsor?.status || 'confirmed');
    const [logoUrl, setLogoUrl] = useState(sponsor?.logoUrl || '');
    const [description, setDescription] = useState(sponsor?.description || '');

    useEffect(() => {
        const nextTier = sponsor?.tier || (packages.length > 0 ? packages[0].id : 'gold');
        setName(sponsor?.name || '');
        setTier(nextTier);
        setWebsiteUrl(sponsor?.websiteUrl || '');
        setContributionAmount(
            sponsor?.contributionAmount?.toString() ||
            (sponsor ? '' : (packages.find(p => p.id === nextTier)?.value?.toString() || ''))
        );
        setStatus(sponsor?.status || 'confirmed');
        setLogoUrl(sponsor?.logoUrl || '');
        setDescription(sponsor?.description || '');
    }, [sponsor, packages]);

    // Set default value based on tier if new sponsor
    const handleTierChange = (newTier: string) => {
        setTier(newTier);
        if(!sponsor) {
            const pkg = packages.find(p => p.id === newTier);
            if(pkg) {
                setContributionAmount(pkg.value.toString());
            }
        }
    };

    const handleSave = () => {
        if(!name) {
            toast.error(t('wizard.step3.sponsors.form.nameRequired'));
            return;
        }
        onSave({
            name,
            tier,
            websiteUrl,
            contributionAmount: parseFloat(contributionAmount) || 0,
            status,
            logoUrl,
            description
        });
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
          width: 'min(600px, 92vw)',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#0B2641', fontWeight: 600 }}>
          {sponsor ? t('wizard.step3.sponsors.form.editTitle') : t('wizard.step3.sponsors.form.addTitle')}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  {t('wizard.step3.sponsors.form.nameLabel')}
                </label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0B2641',
                        outline: 'none'
                    }}
                    placeholder={t('wizard.step3.sponsors.form.namePlaceholder')}
                />
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  {t('wizard.step3.sponsors.form.tierLabel')}
                </label>
                <select 
                    value={tier}
                    onChange={(e) => handleTierChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0B2641',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {packages.map(p => (
                        <option key={p.id} value={p.id}>{t('wizard.step3.sponsors.form.tierOption', { name: p.name, value: p.value.toLocaleString() })}</option>
                    ))}
                </select>
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  {t('wizard.step3.sponsors.form.contributionLabel')}
                </label>
                <input 
                    type="number" 
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0B2641',
                        outline: 'none'
                    }}
                />
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  {t('wizard.step3.sponsors.form.statusLabel')}
                </label>
                <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0B2641',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option value="confirmed">{t('wizard.step3.sponsors.status.confirmed')}</option>
                    <option value="pending">{t('wizard.step3.sponsors.status.pending')}</option>
                    <option value="contract-sent">{t('wizard.step3.sponsors.status.contractSent')}</option>
                </select>
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  {t('wizard.step3.sponsors.form.websiteLabel')}
                </label>
                <input 
                    type="text" 
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0B2641',
                        outline: 'none'
                    }}
                    placeholder={t('wizard.step3.sponsors.form.websitePlaceholder')}
                />
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  {t('wizard.step3.sponsors.form.logoLabel')}
                </label>
                <input 
                    type="text" 
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0B2641',
                        outline: 'none'
                    }}
                    placeholder={t('wizard.step3.sponsors.form.logoPlaceholder')}
                />
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  {t('wizard.step3.sponsors.form.descriptionLabel')}
                </label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#0B2641',
                        outline: 'none',
                        resize: 'vertical'
                    }}
                    rows={3}
                />
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
            onClick={onClose}
            style={{
                padding: '10px 20px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#6B7280',
                cursor: 'pointer'
            }}
            >
            {t('wizard.step3.sponsors.form.cancel')}
            </button>
            <button
            onClick={handleSave}
            style={{
                padding: '10px 20px',
                backgroundColor: '#0684F5',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer'
            }}
            >
            {t('wizard.step3.sponsors.form.save')}
            </button>
        </div>
      </div>
    </div>
  );
}

function SponsorFormPreviewModal({ onClose, onSend }: any) {
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
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(600px, 92vw)',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0B2641' }}>
          {t('wizard.step3.sponsors.formPreview.title')}
        </h2>
        <div style={{ padding: '20px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginBottom: '20px', color: '#4B5563' }}>
            <p className="mb-2"><strong>{t('wizard.step3.sponsors.formPreview.to')}</strong> [Sponsor Email]</p>
            <p className="mb-2"><strong>{t('wizard.step3.sponsors.formPreview.subject')}</strong> {t('wizard.step3.sponsors.formPreview.subjectLine')}</p>
            <p>{t('wizard.step3.sponsors.formPreview.body')}</p>
        </div>
        <div className="flex justify-end gap-3">
            <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
            {t('wizard.step3.sponsors.formPreview.cancel')}
            </button>
            <button
            onClick={onSend}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
            {t('wizard.step3.sponsors.formPreview.send')}
            </button>
        </div>
      </div>
    </div>
  );
}

// Manage Packages Modal with PRO restrictions
function ManagePackagesModal({ 
  packages, 
  onClose, 
  onSave 
}: { 
  packages: SponsorPackage[];
  onClose: () => void;
  onSave: (updatedPackages: SponsorPackage[]) => void;
}) {
  const { t } = useI18n();
  const [formData, setFormData] = useState(packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    value: pkg.value,
    benefits: pkg.benefits,
    color: pkg.color
  })));
  
  const [showProModal, setShowProModal] = useState(false);
  const { isPro: hasPro } = usePlan();
  const maxFreePackages = 2;

  const handleInputChange = (index: number, field: string, value: any) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const handleAddPackage = () => {
    // Check if user is free and has reached limit
    if (!hasPro && formData.length >= maxFreePackages) {
      setShowProModal(true);
      return;
    }

    const newPackage = {
      id: `custom-${Date.now()}`,
      name: '',
      value: 0,
      benefits: [],
      color: '#0684F5'
    };
    setFormData([...formData, newPackage]);
  };

  const handleRemovePackage = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const handleAddBenefit = (pkgIndex: number, benefit: string) => {
    if (!benefit.trim()) return;
    const updated = [...formData];
    const existing = updated[pkgIndex].benefits || [];
    if (!existing.includes(benefit.trim())) {
      updated[pkgIndex].benefits = [...existing, benefit.trim()];
      setFormData(updated);
    }
  };

  const handleRemoveBenefit = (pkgIndex: number, benefitIndex: number) => {
    const updated = [...formData];
    updated[pkgIndex].benefits = updated[pkgIndex].benefits.filter((_, i) => i !== benefitIndex);
    setFormData(updated);
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
          backgroundColor: '#0B2641',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                {t('wizard.step3.sponsors.packages.manageTitle')}
              </h2>
              <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                {hasPro
                  ? t('wizard.step3.sponsors.packages.manageSubtitle')
                  : t('wizard.step3.sponsors.packages.manageSubtitleFree', {
                      current: formData.length,
                      max: maxFreePackages
                    })}
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
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={20} style={{ color: '#94A3B8' }} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {formData.map((pkg, index) => (
              <div key={pkg.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '24px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Delete Button for Custom Packages */}
                {pkg.id.startsWith('custom-') && (
                  <button
                    onClick={() => handleRemovePackage(index)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '32px',
                      height: '32px',
                      border: 'none',
                      backgroundColor: 'rgba(239,68,68,0.2)',
                      color: '#EF4444',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Package Name */}
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                      {t('wizard.step3.sponsors.packages.fields.name')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('wizard.step3.sponsors.packages.fields.namePlaceholder')}
                      value={pkg.name}
                      onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Package Value */}
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                      {t('wizard.step3.sponsors.packages.fields.value')}
                    </label>
                    <input
                      type="number"
                      placeholder={t('wizard.step3.sponsors.packages.fields.valuePlaceholder')}
                      value={pkg.value}
                      onChange={(e) => handleInputChange(index, 'value', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                      {t('wizard.step3.sponsors.packages.fields.color')}
                    </label>
                    <input
                      type="color"
                      value={pkg.color}
                      onChange={(e) => handleInputChange(index, 'color', e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '4px',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  {/* Benefits */}
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                      {t('wizard.step3.sponsors.packages.fields.benefits')}
                    </label>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        placeholder={t('wizard.step3.sponsors.packages.fields.benefitsPlaceholder')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBenefit(index, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        style={{
                          flex: 1,
                          height: '44px',
                          padding: '0 16px',
                          fontSize: '14px',
                          color: '#FFFFFF',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1.5px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = (e.currentTarget.previousSibling as HTMLInputElement);
                          handleAddBenefit(index, input.value);
                          input.value = '';
                        }}
                        style={{
                          width: '44px',
                          height: '44px',
                          backgroundColor: '#0684F5',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {pkg.benefits.map((benefit, bIndex) => (
                        <div
                          key={bIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '20px',
                            fontSize: '12px',
                            color: '#FFFFFF'
                          }}
                        >
                          <span>{benefit}</span>
                          <button
                            onClick={() => handleRemoveBenefit(index, bIndex)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: 'rgba(255,255,255,0.5)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Package Button with PRO restriction */}
            <button
              onClick={handleAddPackage}
              style={{
                width: '100%',
                height: '60px',
                backgroundColor: (!hasPro && formData.length >= maxFreePackages) 
                  ? 'rgba(245,158,11,0.15)' 
                  : 'rgba(255,255,255,0.05)',
                border: `2px dashed ${(!hasPro && formData.length >= maxFreePackages) 
                  ? '#F59E0B' 
                  : 'rgba(255,255,255,0.2)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: (!hasPro && formData.length >= maxFreePackages) 
                  ? '#F59E0B' 
                  : '#94A3B8',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!(!hasPro && formData.length >= maxFreePackages)) {
                  e.currentTarget.style.borderColor = '#0684F5';
                  e.currentTarget.style.backgroundColor = 'rgba(6,132,245,0.1)';
                  e.currentTarget.style.color = '#0684F5';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!hasPro && formData.length >= maxFreePackages)) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              {(!hasPro && formData.length >= maxFreePackages) ? (
                <>
                  <Crown size={20} />
                  {t('wizard.step3.sponsors.packages.upgradePrompt')}
                </>
              ) : (
                <>
                  <Plus size={20} />
                  {t('wizard.step3.sponsors.packages.addPackage')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: 'rgba(255,255,255,0.03)'
        }}>
          <button
            onClick={onClose}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          >
            {t('wizard.step3.sponsors.form.cancel')}
          </button>
          <button
            onClick={() => onSave(formData)}
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
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
          >
            <Check size={18} />
            {t('wizard.step3.sponsors.packages.savePackages')}
          </button>
        </div>

        {/* Pro Upgrade Modal */}
        {showProModal && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px'
            }}
            onClick={() => setShowProModal(false)}
          >
            <div
              style={{
                backgroundColor: '#0B2641',
                border: '2px solid #F59E0B',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '400px',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Crown size={48} style={{ color: '#F59E0B', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                {t('wizard.step3.sponsors.packages.upgradeTitle')}
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px', lineHeight: '1.6' }}>
                {t('wizard.step3.sponsors.packages.upgradeSubtitle', { max: maxFreePackages })}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowProModal(false)}
                  style={{
                    flex: 1,
                    height: '44px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  {t('wizard.step3.sponsors.form.cancel')}
                </button>
                <button
                  style={{
                    flex: 1,
                    height: '44px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onClick={() => navigate('/pricing')}
                >
                  <Crown size={16} />
                  {t('wizard.step3.sponsors.packages.upgradeNow')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
