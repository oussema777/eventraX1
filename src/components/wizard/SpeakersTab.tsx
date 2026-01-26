import { useState } from 'react';
import {
  Users,
  Star,
  Calendar,
  Plus,
  Grid3x3,
  List,
  Edit2,
  Eye,
  MoreVertical,
  Mail,
  Trash2,
  Download,
  Mic,
  Layers
} from 'lucide-react';
import AddEditSpeakerModal from './modals/AddEditSpeakerModal';
import SpeakerProfileModal from './modals/SpeakerProfileModal';
import ImportSpeakersModal from './modals/ImportSpeakersModal';
import SuccessToast from './SuccessToast';
import { useSpeakers, Speaker } from '../../hooks/useSpeakers';
import { useI18n } from '../../i18n/I18nContext';

export default function SpeakersTab() {
  const { speakers, isLoading, createSpeaker, updateSpeaker, deleteSpeaker } = useSpeakers();
  const { t } = useI18n();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<'all' | 'keynote' | 'panel' | 'workshop'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [viewingSpeaker, setViewingSpeaker] = useState<Speaker | null>(null);
  const [selectedSpeakers, setSelectedSpeakers] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [deletingSpeaker, setDeletingSpeaker] = useState<string | null>(null);

  const handleSelectSpeaker = (id: string) => {
    const newSelected = new Set(selectedSpeakers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSpeakers(newSelected);
  };

  const handleEditSpeaker = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setIsAddModalOpen(true);
  };

  const handleViewProfile = (speaker: Speaker) => {
    setViewingSpeaker(speaker);
    setIsProfileModalOpen(true);
  };

  const handleSaveSpeaker = async (data: any) => {
    // Map form data to Speaker type
    // The modal likely returns a form object. We need to align it with Supabase schema.
    const payload: Partial<Speaker> = {
      full_name: data.name,
      title: data.title,
      company: data.company,
      bio: data.bio,
      photo: data.photo,
      linkedin_url: data.linkedin,
      twitter_url: data.twitter,
      website_url: data.website,
      phone: data.phone,
      email: data.email,
      type: data.type,
      status: data.status,
      tags: data.tags
    };

    if (editingSpeaker?.id) {
      await updateSpeaker(editingSpeaker.id, payload);
      setToastMessage(t('manageEvent.speakers.toasts.updateSuccess'));
    } else {
      await createSpeaker(payload);
      setToastMessage(t('manageEvent.speakers.toasts.addSuccess'));
    }

    setShowToast(true);
    setEditingSpeaker(null);
    setIsAddModalOpen(false);
  };

  const handleDeleteSpeaker = async (id: string) => {
      if(confirm(t('manageEvent.speakers.toasts.removeConfirm', { name: 'this speaker' }))) {
        await deleteSpeaker(id);
        setToastMessage(t('manageEvent.speakers.toasts.removeSuccess'));
        setShowToast(true);
      }
      setDeletingSpeaker(null);
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      keynote: { label: t('manageEvent.speakers.allSpeakers.filters.keynote').toUpperCase(), bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', icon: Star },
      panel: { label: t('manageEvent.speakers.allSpeakers.filters.panel').toUpperCase(), bg: '#0684F5', icon: Users },
      workshop: { label: t('manageEvent.speakers.allSpeakers.filters.workshop').toUpperCase(), bg: '#8B5CF6', icon: Calendar },
      regular: null
    };
    return badges[type as keyof typeof badges] || badges.regular;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: { label: t('manageEvent.speakers.stats.confirmed'), color: 'var(--success)' },
      pending: { label: t('manageEvent.speakers.allSpeakers.filters.pending'), color: '#F59E0B' },
      declined: { label: t('manageEvent.attendees.filters.declined'), color: '#EF4444' }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const filteredSpeakers = speakers.filter(speaker => {
    if (activeFilter === 'all') return true;
    return speaker.type === activeFilter;
  });

  return (
    <div 
      className="speakers-container mx-auto"
      style={{ 
        backgroundColor: '#0B2641',
        maxWidth: '1200px',
        padding: '40px 40px 80px 40px',
        minHeight: 'calc(100vh - 300px)'
      }}
    >
      <style>{`
        @media (max-width: 1024px) {
          .speakers-container { padding: 1rem !important; }
          .speakers-header { flex-direction: column !important; gap: 1rem !important; }
          .speakers-header-actions { width: 100% !important; }
          .speakers-add-btn { flex: 1 !important; justify-content: center !important; }
          .speakers-filter-bar { flex-direction: column !important; align-items: stretch !important; gap: 1rem !important; }
          .speakers-filter-tabs { overflow-x: auto !important; padding-bottom: 0.5rem !important; }
          .speakers-filter-tabs button { white-space: nowrap !important; }
          .speakers-grid { grid-template-columns: 1fr !important; }
          .speaker-list-view { overflow-x: auto !important; }
          .speaker-list-inner { min-width: 800px !important; }
          .speaker-bulk-bar { flex-direction: column !important; gap: 1rem !important; }
          .speaker-bulk-actions { width: 100% !important; justify-content: center !important; flex-wrap: wrap !important; }
          .speaker-bulk-btn { flex: 1 1 auto !important; min-width: 120px !important; justify-content: center !important; }
        }
        @media (max-width: 500px) {
          .speakers-container { padding: 0.5rem !important; }
          .speakers-grid { gap: 1rem !important; }
        }
      `}</style>
      {/* PAGE HEADER */}
      <div className="speakers-header flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
            {t('manageEvent.speakers.header.title')}
          </h2>
          <p className="text-base" style={{ color: '#94A3B8' }}>
            {t('manageEvent.speakers.header.subtitle')}
          </p>
        </div>
        <div className="speakers-header-actions flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-0 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="w-10 h-10 rounded flex items-center justify-center transition-colors"
              style={{
                backgroundColor: viewMode === 'grid' ? '#0684F5' : 'transparent',
                color: viewMode === 'grid' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="w-10 h-10 rounded flex items-center justify-center transition-colors"
              style={{
                backgroundColor: viewMode === 'list' ? '#0684F5' : 'transparent',
                color: viewMode === 'list' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              <List size={18} />
            </button>
          </div>
          
          {/* Add Speaker Button */}
          <button
            onClick={() => {
              setEditingSpeaker(null);
              setIsAddModalOpen(true);
            }}
            className="speakers-add-btn flex items-center gap-2 px-5 h-11 rounded-lg transition-transform hover:scale-105"
            style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF', fontWeight: 600 }}
          >
            <Plus size={18} />
            {t('manageEvent.speakers.header.add')}
          </button>
        </div>
      </div>

      {/* FILTER BAR - Icons Only */}
      <div className="speakers-filter-bar flex items-center justify-start mb-6">
        <div className="speakers-filter-tabs flex items-center gap-2">
          {[
            { id: 'all', icon: Layers, label: t('manageEvent.speakers.tabs.all') },
            { id: 'keynote', icon: Star, label: t('manageEvent.speakers.allSpeakers.filters.keynote') },
            { id: 'panel', icon: Mic, label: t('manageEvent.speakers.allSpeakers.filters.panel') },
            { id: 'workshop', icon: Calendar, label: t('manageEvent.speakers.allSpeakers.filters.workshop') }
          ].map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                title={filter.label}
                className="w-11 h-11 rounded-lg flex items-center justify-center transition-all"
                style={{
                  backgroundColor: activeFilter === filter.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: activeFilter === filter.id ? '#FFFFFF' : '#94A3B8',
                  border: activeFilter === filter.id ? 'none' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>
      </div>

      {/* SPEAKERS GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="speakers-grid grid grid-cols-3 gap-6">
          {filteredSpeakers.map((speaker) => {
            const typeColors: Record<string, string> = {
              keynote: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              panel: '#0684F5',
              workshop: '#8B5CF6',
              regular: '#6B7280'
            };
            const statusColors: Record<string, { bg: string; text: string }> = {
              confirmed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
              pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
              declined: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' }
            };
            
            const badge = getTypeBadge(speaker.type);
            const statusStyle = statusColors[speaker.status] || statusColors.pending;

            return (
              <div
                key={speaker.id}
                onClick={() => handleViewProfile(speaker)}
                className="rounded-xl overflow-hidden border transition-all hover:shadow-lg cursor-pointer group"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(0)',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'visible'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header Image Section */}
                <div 
                  className="relative flex items-center justify-center"
                  style={{ 
                    height: '180px',
                    background: speaker.type === 'keynote'
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #0684F5 100%)'
                        : speaker.type === 'panel'
                        ? 'linear-gradient(135deg, #0684F5 0%, #06B6D4 100%)'
                        : speaker.type === 'workshop'
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                        : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                    position: 'relative',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px'
                  }}
                >
                   <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(11,38,65,0.3) 0%, rgba(11,38,65,0.7) 100%)',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px'
                    }}
                    />

                  {/* Profile Photo */}
                  <div 
                    className="absolute"
                    style={{ 
                      top: '120px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '120px', 
                      height: '120px', 
                      borderRadius: '50%', 
                      border: '4px solid #FFFFFF',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                      backgroundColor: '#0B2641',
                      zIndex: 10,
                      overflow: 'hidden'
                    }}
                  >
                    {speaker.photo ? (
                        <img src={speaker.photo} alt={speaker.full_name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#0B2641]">
                            <Users size={48} style={{ color: '#9CA3AF' }} />
                        </div>
                    )}
                  </div>

                  {/* Type Badge */}
                  {badge && (
                    <div 
                      className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-xl"
                      style={{ 
                        background: typeColors[speaker.type] || typeColors.regular,
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '11px',
                        letterSpacing: '0.5px',
                        boxShadow: '0px 2px 8px rgba(0,0,0,0.3)'
                      }}
                    >
                      <badge.icon size={12} />
                      {badge.label}
                    </div>
                  )}
                  
                  {/* Select Checkbox */}
                   <input
                    type="checkbox"
                    checked={selectedSpeakers.has(speaker.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectSpeaker(speaker.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#0684F5',
                      zIndex: 20
                    }}
                  />
                </div>

                {/* Content Section */}
                <div style={{ padding: '80px 24px 24px' }}>
                  {/* Name & Title */}
                  <div className="text-center mb-4">
                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                      {speaker.full_name}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '2px' }}>{speaker.title}</p>
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>{speaker.company}</p>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
                    {(speaker.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: 'rgba(6, 132, 245, 0.15)',
                          color: '#0684F5',
                          fontSize: '11px',
                          fontWeight: 500,
                          borderRadius: '12px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div 
                    className="flex items-center justify-between pt-4 mt-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {/* Status Badge */}
                    <span 
                        className="px-3 py-1 rounded-full text-xs flex items-center gap-1.5"
                        style={{ 
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        fontWeight: 600
                        }}
                    >
                        <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: statusStyle.text }}
                        />
                        {speaker.status}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                        <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditSpeaker(speaker);
                        }}
                        className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/10"
                        title="Edit"
                        >
                        <Edit2 size={14} style={{ color: '#94A3B8' }} />
                        </button>
                        <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(speaker);
                        }}
                        className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/10"
                        title="View Profile"
                        >
                        <Eye size={14} style={{ color: '#94A3B8' }} />
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSpeaker(speaker.id);
                            }}
                            className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/10"
                            title="Delete"
                        >
                        <Trash2 size={14} style={{ color: '#EF4444' }} />
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State Card */}
          <div
            className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-8 transition-colors hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
            style={{ 
              borderColor: '#E5E7EB',
              backgroundColor: '#FAFAFA',
              minHeight: '420px'
            }}
            onClick={() => {
              setEditingSpeaker(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={64} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
            <h3 className="text-lg mb-2" style={{ fontWeight: 600, color: '#0B2641' }}>
              {t('manageEvent.speakers.allSpeakers.empty.title')}
            </h3>
            <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
              {t('manageEvent.speakers.allSpeakers.empty.subtitle')}
            </p>
            <button 
              className="px-5 h-10 rounded-lg border transition-colors hover:bg-white"
              style={{ borderColor: '#E5E7EB', fontWeight: 600 }}
            >
              + {t('manageEvent.speakers.allSpeakers.empty.cta')}
            </button>
          </div>
        </div>
      )}

      {/* SPEAKERS LIST VIEW */}
      {viewMode === 'list' && (
        <div className="speaker-list-view rounded-xl overflow-hidden border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="speaker-list-inner">
            {/* Table Header */}
            <div 
              className="grid grid-cols-12 gap-4 p-4"
              style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}
            >
              <div className="col-span-1 flex items-center">
                <input type="checkbox" className="w-5 h-5" style={{ accentColor: 'var(--primary)' }} />
              </div>
              <div className="col-span-4">
                <span className="text-sm" style={{ fontWeight: 600, color: '#0B2641' }}>{t('manageEvent.speakers.materials.columns.speaker')}</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm" style={{ fontWeight: 600, color: '#0B2641' }}>Title & Company</span>
              </div>
              <div className="col-span-1">
                <span className="text-sm" style={{ fontWeight: 600, color: '#0B2641' }}>{t('manageEvent.speakers.detailModal.tabs.sessions')}</span>
              </div>
              <div className="col-span-1">
                <span className="text-sm" style={{ fontWeight: 600, color: '#0B2641' }}>{t('manageEvent.speakers.materials.columns.status')}</span>
              </div>
              <div className="col-span-1">
                <span className="text-sm" style={{ fontWeight: 600, color: '#0B2641' }}>Type</span>
              </div>
              <div className="col-span-1 text-right">
                <span className="text-sm" style={{ fontWeight: 600, color: '#0B2641' }}>{t('manageEvent.speakers.bySession.columns.actions')}</span>
              </div>
            </div>

            {/* Table Rows */}
            {filteredSpeakers.map((speaker) => {
              const badge = getTypeBadge(speaker.type);
              const statusBadge = getStatusBadge(speaker.status);

              return (
                <div
                  key={speaker.id}
                  className="grid grid-cols-12 gap-4 p-4 transition-colors hover:bg-gray-50"
                  style={{ borderBottom: '1px solid #E5E7EB' }}
                >
                  <div className="col-span-1 flex items-center">
                    <input 
                      type="checkbox"
                      checked={selectedSpeakers.has(speaker.id)}
                      onChange={() => handleSelectSpeaker(speaker.id)}
                      className="w-5 h-5"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: '#F3F4F6' }}
                    >
                      {speaker.photo ? (
                          <img src={speaker.photo} alt={speaker.full_name} className="w-full h-full object-cover" />
                      ) : (
                          <Users size={20} style={{ color: '#9CA3AF' }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm" style={{ fontWeight: 600, color: '#0B2641' }}>{speaker.full_name}</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>{speaker.email}</p>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      {speaker.title}, {speaker.company}
                    </p>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <p className="text-sm" style={{ color: '#0B2641' }}>{speaker.sessions}</p>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span 
                      className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      style={{ 
                        backgroundColor: `${statusBadge.color}15`,
                        color: statusBadge.color,
                        fontWeight: 600
                      }}
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: statusBadge.color }}
                      />
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    {badge && (
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{ 
                          background: badge.bg,
                          color: '#FFFFFF',
                          fontWeight: 600
                        }}
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <button className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-gray-200">
                      <MoreVertical size={16} style={{ color: '#6B7280' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BULK ACTIONS BAR */}
      {selectedSpeakers.size > 0 && (
        <div 
          className="speaker-bulk-bar fixed bottom-0 left-0 right-0 p-4 flex items-center justify-between shadow-lg"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E5E7EB',
            zIndex: 50
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: '#0B2641', fontWeight: 500 }}>
              {t('manageEvent.speakers.bulk.selected', { count: selectedSpeakers.size })}
            </span>
            <button
              onClick={() => setSelectedSpeakers(new Set())}
              className="text-xs transition-colors hover:underline"
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              {t('manageEvent.speakers.bulk.deselect')}
            </button>
          </div>
          <div className="speaker-bulk-actions flex items-center gap-2">
            <button className="speaker-bulk-btn flex items-center gap-2 px-4 h-9 rounded-lg transition-colors hover:bg-gray-50">
              <Download size={16} style={{ color: '#6B7280' }} />
              <span className="text-sm" style={{ color: '#6B7280', fontWeight: 600 }}>{t('manageEvent.speakers.bulk.export')}</span>
            </button>
            <button className="speaker-bulk-btn flex items-center gap-2 px-4 h-9 rounded-lg transition-colors hover:bg-gray-50">
              <Mail size={16} style={{ color: '#6B7280' }} />
              <span className="text-sm" style={{ color: '#6B7280', fontWeight: 600 }}>{t('manageEvent.speakers.bulk.sendEmail')}</span>
            </button>
            <button className="speaker-bulk-btn flex items-center gap-2 px-4 h-9 rounded-lg transition-colors hover:bg-red-50">
              <Trash2 size={16} style={{ color: '#EF4444' }} />
              <span className="text-sm" style={{ color: '#EF4444', fontWeight: 600 }}>{t('manageEvent.speakers.bulk.delete')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditSpeakerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSpeaker(null);
        }}
        onSave={handleSaveSpeaker}
        speaker={editingSpeaker}
      />

      <SpeakerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setViewingSpeaker(null);
        }}
        speaker={viewingSpeaker}
      />

      <ImportSpeakersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(data) => {
          setToastMessage(t('manageEvent.speakers.toasts.importSuccess'));
          setShowToast(true);
        }}
      />

      {/* Toast */}
      <SuccessToast
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />
    </div>
  );
}