import { useState } from 'react';
import {
  Plus,
  Link as LinkIcon,
  Search,
  ChevronDown,
  Mail,
  Calendar,
  Download,
  Trash2,
  List,
  Grid3x3,
  MoreVertical,
  Eye,
  Edit,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Minus,
  Users,
  X,
  Copy,
  Check,
  MessageCircle,
  Linkedin,
  QrCode,
  Upload,
  Camera
} from 'lucide-react';
import { countries } from '../../data/countries';

type ViewMode = 'table' | 'grid';
type SpeakerStatus = 'confirmed' | 'pending' | 'declined';

interface Speaker {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  status: SpeakerStatus;
  sessions: string[];
}

export default function EventSpeakersTabLight() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedSpeakers, setSelectedSpeakers] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [linkCopied, setLinkCopied] = useState(false);

  const speakers: Speaker[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      bio: 'Leading AI researcher with 15+ years...',
      title: 'Chief Technology Officer',
      company: 'TechCorp International',
      email: 'sarah.j@techcorp.com',
      phone: '+1 (555) 123-4567',
      status: 'confirmed',
      sessions: ['Opening Keynote', 'AI Panel']
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      bio: 'Innovation strategist and startup advisor...',
      title: 'Director of Innovation',
      company: 'Future Labs Inc',
      email: 'mchen@futurelabs.com',
      phone: '+1 (555) 234-5678',
      status: 'confirmed',
      sessions: ['Workshop: Design Thinking']
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      bio: 'Marketing expert with proven track record...',
      title: 'VP of Marketing',
      company: 'Growth Dynamics',
      email: 'emily@growthdynamics.com',
      phone: '+1 (555) 345-6789',
      status: 'pending',
      sessions: ['Marketing Trends Panel']
    },
    {
      id: '4',
      name: 'David Park',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      bio: 'Product management thought leader...',
      title: 'Head of Product',
      company: 'Innovate Solutions',
      email: 'david@innovate.io',
      phone: '+1 (555) 456-7890',
      status: 'confirmed',
      sessions: []
    },
    {
      id: '5',
      name: 'Jessica Thompson',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
      bio: 'Sustainability advocate and consultant...',
      title: 'Sustainability Director',
      company: 'EcoTech Global',
      email: 'jessica@ecotech.com',
      phone: '+1 (555) 567-8901',
      status: 'confirmed',
      sessions: ['Sustainability Workshop']
    },
    {
      id: '6',
      name: 'Alex Kumar',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      bio: 'Data science expert and educator...',
      title: 'Lead Data Scientist',
      company: 'DataWorks AI',
      email: 'alex@dataworks.ai',
      phone: '+1 (555) 678-9012',
      status: 'pending',
      sessions: ['Data Analytics Panel']
    },
    {
      id: '7',
      name: 'Rachel Green',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bio: 'HR transformation specialist...',
      title: 'Chief People Officer',
      company: 'TalentFirst Corp',
      email: 'rachel@talentfirst.com',
      phone: '+1 (555) 789-0123',
      status: 'confirmed',
      sessions: ['Future of Work', 'Leadership Panel']
    },
    {
      id: '8',
      name: 'James Wilson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      bio: 'Fintech pioneer and investor...',
      title: 'CEO & Founder',
      company: 'FinanceNext',
      email: 'james@financenext.com',
      phone: '+1 (555) 890-1234',
      status: 'declined',
      sessions: []
    },
    {
      id: '9',
      name: 'Maria Garcia',
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200',
      bio: 'Cybersecurity expert and author...',
      title: 'CISO',
      company: 'SecureNet Systems',
      email: 'maria@securenet.com',
      phone: '+1 (555) 901-2345',
      status: 'confirmed',
      sessions: ['Cybersecurity Workshop']
    },
    {
      id: '10',
      name: 'Robert Lee',
      avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200',
      bio: 'E-commerce strategist...',
      title: 'Director of E-Commerce',
      company: 'ShopTech Solutions',
      email: 'robert@shoptech.com',
      phone: '+1 (555) 012-3456',
      status: 'pending',
      sessions: ['E-Commerce Panel']
    },
    {
      id: '11',
      name: 'Linda Martinez',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      bio: 'Healthcare innovation leader...',
      title: 'VP of Innovation',
      company: 'HealthTech Plus',
      email: 'linda@healthtech.com',
      phone: '+1 (555) 123-4567',
      status: 'confirmed',
      sessions: ['Healthcare Innovation']
    },
    {
      id: '12',
      name: 'Thomas Anderson',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      bio: 'Blockchain technology expert...',
      title: 'CTO',
      company: 'BlockChain Innovations',
      email: 'thomas@blockchain.io',
      phone: '+1 (555) 234-5678',
      status: 'pending',
      sessions: []
    }
  ];

  const stats = {
    total: speakers.length,
    confirmed: speakers.filter(s => s.status === 'confirmed').length,
    pending: speakers.filter(s => s.status === 'pending').length
  };

  const handleSelectAll = () => {
    if (selectedSpeakers.size === speakers.length) {
      setSelectedSpeakers(new Set());
    } else {
      setSelectedSpeakers(new Set(speakers.map(s => s.id)));
    }
  };

  const handleSelectSpeaker = (id: string) => {
    const newSelected = new Set(selectedSpeakers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSpeakers(newSelected);
  };

  const handleCopyLink = () => {
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div style={{ padding: '32px', paddingBottom: '80px', backgroundColor: '#FAFBFC', minHeight: '100vh' }}>
      {/* TAB HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        {/* Left Side: Title & Stats */}
        <div>
          <h1 style={{ fontFamily: 'Inter', fontSize: '32px', fontWeight: 700, color: '#1A1D1F', marginBottom: '8px' }}>
            Speakers
          </h1>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#6F767E' }}>
              Total: <span style={{ color: '#635BFF', fontWeight: 600 }}>{stats.total}</span> speakers
            </span>
            <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#6F767E' }}>
              Confirmed: <span style={{ color: '#635BFF', fontWeight: 600 }}>{stats.confirmed}</span>
            </span>
            <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#6F767E' }}>
              Pending: <span style={{ color: '#635BFF', fontWeight: 600 }}>{stats.pending}</span>
            </span>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowShareModal(true)}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #635BFF',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              color: '#635BFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F7FF'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            <LinkIcon size={18} />
            Generate Invite Link
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: '#635BFF',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7C75FF';
              e.currentTarget.style.boxShadow = '0px 4px 12px rgba(99, 91, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#635BFF';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={18} />
            Add Speaker
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        {/* Left Side: Search Input */}
        <div style={{ position: 'relative', width: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9A9FA5' }} />
          <input
            type="text"
            placeholder="Search speakers by name, title, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '44px',
              paddingRight: '16px',
              backgroundColor: '#F4F5F6',
              border: '1px solid #E9EAEB',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '14px',
              color: '#1A1D1F',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = '2px solid #635BFF';
              e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(99, 91, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = '1px solid #E9EAEB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Right Side: Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Status Filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '140px',
                height: '40px',
                padding: '0 40px 0 16px',
                backgroundColor: '#F4F5F6',
                border: '1px solid #E9EAEB',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                color: '#6F767E',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6F767E', pointerEvents: 'none' }} />
          </div>

          {/* Session Filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              style={{
                width: '160px',
                height: '40px',
                padding: '0 40px 0 16px',
                backgroundColor: '#F4F5F6',
                border: '1px solid #E9EAEB',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                color: '#6F767E',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none'
              }}
            >
              <option value="all">All Sessions</option>
              <option value="keynote">Keynote</option>
              <option value="panel">Panel Discussion</option>
              <option value="workshop">Workshop</option>
              <option value="unassigned">Unassigned</option>
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6F767E', pointerEvents: 'none' }} />
          </div>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || sessionFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setSessionFilter('all');
                setSearchQuery('');
              }}
              style={{
                height: '40px',
                padding: '0 16px',
                backgroundColor: 'transparent',
                border: 'none',
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 500,
                color: '#635BFF',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F4F5F6', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: viewMode === 'table' ? '0px 2px 4px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <List size={18} style={{ color: viewMode === 'table' ? '#635BFF' : '#6F767E' }} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: viewMode === 'grid' ? '0px 2px 4px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Grid3x3 size={18} style={{ color: viewMode === 'grid' ? '#635BFF' : '#6F767E' }} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {viewMode === 'table' ? (
        <TableView
          speakers={speakers}
          selectedSpeakers={selectedSpeakers}
          onSelectAll={handleSelectAll}
          onSelectSpeaker={handleSelectSpeaker}
        />
      ) : (
        <GridView
          speakers={speakers}
          selectedSpeakers={selectedSpeakers}
          onSelectSpeaker={handleSelectSpeaker}
        />
      )}

      {/* MODALS */}
      {showAddModal && <AddSpeakerModal onClose={() => setShowAddModal(false)} />}
      {showShareModal && (
        <ShareLinkModal
          onClose={() => setShowShareModal(false)}
          linkCopied={linkCopied}
          onCopyLink={handleCopyLink}
        />
      )}
    </div>
  );
}

// Table View Component
function TableView({ speakers, selectedSpeakers, onSelectAll, onSelectSpeaker }: {
  speakers: Speaker[];
  selectedSpeakers: Set<string>;
  onSelectAll: () => void;
  onSelectSpeaker: (id: string) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getStatusStyle = (status: SpeakerStatus) => {
    const styles = {
      confirmed: {
        bg: '#E6F4EA',
        text: '#1F7A3E',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      pending: {
        bg: '#FFF3E0',
        text: '#B54708',
        icon: Clock,
        label: 'Pending'
      },
      declined: {
        bg: '#FEE2E2',
        text: '#DC2626',
        icon: XCircle,
        label: 'Declined'
      }
    };
    return styles[status];
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
      {/* Table Header */}
      <div
        style={{
          backgroundColor: '#F4F5F6',
          height: '48px',
          padding: '0 24px',
          borderBottom: '1px solid #E9EAEB',
          display: 'grid',
          gridTemplateColumns: '40px 300px 220px 180px 120px 140px 100px',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <input
          type="checkbox"
          checked={selectedSpeakers.size === speakers.length && speakers.length > 0}
          onChange={onSelectAll}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#635BFF' }}
        />
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#6F767E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          SPEAKER
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#6F767E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          TITLE & COMPANY
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#6F767E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          SESSIONS
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#6F767E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          STATUS
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#6F767E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          CONTACT
        </span>
        <div></div>
      </div>

      {/* Table Body */}
      {speakers.map((speaker) => {
        const statusStyle = getStatusStyle(speaker.status);
        const StatusIcon = statusStyle.icon;
        const isSelected = selectedSpeakers.has(speaker.id);

        return (
          <div
            key={speaker.id}
            style={{
              height: '80px',
              padding: '0 24px',
              borderBottom: '1px solid #E9EAEB',
              display: 'grid',
              gridTemplateColumns: '40px 300px 220px 180px 120px 140px 100px',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: isSelected ? '#F8F7FF' : 'transparent',
              borderLeft: isSelected ? '4px solid #635BFF' : '4px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = '#FAFBFC';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectSpeaker(speaker.id)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#635BFF' }}
            />

            {/* Speaker Info */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img
                src={speaker.avatar}
                alt={speaker.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #E9EAEB', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 600, color: '#1A1D1F', marginBottom: '2px' }}>
                  {speaker.name}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '13px',
                    color: '#9A9FA5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px'
                  }}
                >
                  {speaker.bio}
                </div>
              </div>
            </div>

            {/* Title & Company */}
            <div>
              <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', marginBottom: '4px' }}>
                {speaker.title}
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
                {speaker.company}
              </div>
            </div>

            {/* Sessions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {speaker.sessions.length > 0 ? (
                <>
                  {speaker.sessions.slice(0, 2).map((session, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        height: '24px',
                        padding: '0 10px',
                        backgroundColor: '#E0E7FF',
                        borderRadius: '12px',
                        alignItems: 'center',
                        width: 'fit-content'
                      }}
                    >
                      <span style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#635BFF' }}>
                        {session}
                      </span>
                    </div>
                  ))}
                  {speaker.sessions.length > 2 && (
                    <div
                      style={{
                        display: 'inline-flex',
                        height: '24px',
                        padding: '0 10px',
                        backgroundColor: '#F4F5F6',
                        borderRadius: '12px',
                        alignItems: 'center',
                        width: 'fit-content'
                      }}
                    >
                      <span style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#6F767E' }}>
                        +{speaker.sessions.length - 2} more
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Minus size={14} style={{ color: '#9A9FA5' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#9A9FA5' }}>
                    Not assigned
                  </span>
                </div>
              )}
            </div>

            {/* Status */}
            <div
              style={{
                display: 'inline-flex',
                height: '28px',
                padding: '0 12px',
                backgroundColor: statusStyle.bg,
                borderRadius: '6px',
                alignItems: 'center',
                gap: '6px',
                width: 'fit-content'
              }}
            >
              <StatusIcon size={14} style={{ color: statusStyle.text }} />
              <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: statusStyle.text }}>
                {statusStyle.label}
              </span>
            </div>

            {/* Contact */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                title={speaker.email}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#F4F5F6',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#635BFF';
                  (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F4F5F6';
                  (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Mail size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
              </button>
              <button
                title={speaker.phone}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#F4F5F6',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#635BFF';
                  (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F4F5F6';
                  (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Phone size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === speaker.id ? null : speaker.id);
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <MoreVertical size={18} style={{ color: '#6F767E' }} />
              </button>

              {/* Dropdown Menu */}
              {openMenuId === speaker.id && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    backgroundColor: '#FFFFFF',
                    padding: '8px',
                    borderRadius: '8px',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                    width: '180px',
                    zIndex: 10
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {[
                    { icon: Eye, label: 'View Profile', color: '#1A1D1F' },
                    { icon: Edit, label: 'Edit Details', color: '#1A1D1F' },
                    { icon: Calendar, label: 'Assign to Session', color: '#1A1D1F' },
                    { icon: MessageSquare, label: 'Send Message', color: '#1A1D1F' },
                    { icon: Download, label: 'Download vCard', color: '#1A1D1F' },
                    null,
                    { icon: Trash2, label: 'Remove Speaker', color: '#DC2626' }
                  ].map((item, idx) => {
                    if (item === null) {
                      return <div key={idx} style={{ height: '1px', backgroundColor: '#E9EAEB', margin: '4px 0' }} />;
                    }
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 12px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          fontFamily: 'Inter',
                          fontSize: '14px',
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Icon size={16} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Grid View Component
function GridView({ speakers, selectedSpeakers, onSelectSpeaker }: {
  speakers: Speaker[];
  selectedSpeakers: Set<string>;
  onSelectSpeaker: (id: string) => void;
}) {
  const getStatusStyle = (status: SpeakerStatus) => {
    const styles = {
      confirmed: { bg: '#E6F4EA', text: '#1F7A3E', icon: CheckCircle, label: 'Confirmed' },
      pending: { bg: '#FFF3E0', text: '#B54708', icon: Clock, label: 'Pending' },
      declined: { bg: '#FEE2E2', text: '#DC2626', icon: XCircle, label: 'Declined' }
    };
    return styles[status];
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '24px' }}>
      {speakers.map((speaker) => {
        const statusStyle = getStatusStyle(speaker.status);
        const StatusIcon = statusStyle.icon;
        const isSelected = selectedSpeakers.has(speaker.id);

        return (
          <div
            key={speaker.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
              padding: '24px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: isSelected ? '2px solid #635BFF' : '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0, 0, 0, 0.12)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectSpeaker(speaker.id)}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: '#635BFF',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            />

            {/* Status Badge */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'inline-flex',
                height: '28px',
                padding: '0 12px',
                backgroundColor: statusStyle.bg,
                borderRadius: '6px',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <StatusIcon size={14} style={{ color: statusStyle.text }} />
              <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: statusStyle.text }}>
                {statusStyle.label}
              </span>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '16px' }}>
              <img
                src={speaker.avatar}
                alt={speaker.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #E9EAEB', objectFit: 'cover' }}
              />
            </div>

            {/* Name */}
            <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#1A1D1F', textAlign: 'center', marginBottom: '8px' }}>
              {speaker.name}
            </h3>

            {/* Title */}
            <p style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#6F767E', textAlign: 'center', marginBottom: '4px' }}>
              {speaker.title}
            </p>

            {/* Company */}
            <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#9A9FA5', textAlign: 'center', marginBottom: '16px' }}>
              {speaker.company}
            </p>

            {/* Sessions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '16px', minHeight: '32px' }}>
              {speaker.sessions.length > 0 ? (
                <>
                  {speaker.sessions.slice(0, 2).map((session, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        height: '24px',
                        padding: '0 10px',
                        backgroundColor: '#E0E7FF',
                        borderRadius: '12px',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#635BFF' }}>
                        {session}
                      </span>
                    </div>
                  ))}
                  {speaker.sessions.length > 2 && (
                    <div
                      style={{
                        display: 'inline-flex',
                        height: '24px',
                        padding: '0 10px',
                        backgroundColor: '#F4F5F6',
                        borderRadius: '12px',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#6F767E' }}>
                        +{speaker.sessions.length - 2} more
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#9A9FA5' }}>
                  Not assigned
                </span>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop: '1px solid #E9EAEB',
                paddingTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {/* Contact Icons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  title={speaker.email}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#F4F5F6',
                    border: 'none',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#635BFF';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F4F5F6';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                </button>
                <button
                  title={speaker.phone}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#F4F5F6',
                    border: 'none',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#635BFF';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F4F5F6';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                </button>
              </div>

              {/* Action Menu */}
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={18} style={{ color: '#6F767E' }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Add Speaker Modal Component
function AddSpeakerModal({ onClose }: { onClose: () => void }) {
  const [sendInvitation, setSendInvitation] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('+1');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 29, 31, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '600px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 10,
            borderRadius: '16px 16px 0 0'
          }}
        >
          <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#1A1D1F' }}>
            Add New Speaker
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} style={{ color: '#6F767E' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
          {/* Section 1: Basic Information */}
          <div style={{ marginBottom: '32px' }}>
            {/* Profile Photo Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#F4F5F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Camera size={32} style={{ color: '#9A9FA5' }} />
              </div>
              <div>
                <button
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1A1D1F',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  <Upload size={16} />
                  Upload Photo
                </button>
                <p style={{ fontFamily: 'Inter', fontSize: '12px', color: '#9A9FA5', marginTop: '8px' }}>
                  JPG or PNG, max 2MB
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                Full Name*
              </label>
              <input
                type="text"
                placeholder="e.g., Dr. Sarah Johnson"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  backgroundColor: '#F4F5F6',
                  border: '1px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#1A1D1F',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid #635BFF';
                  e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(99, 91, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid #E9EAEB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                Title*
              </label>
              <input
                type="text"
                placeholder="e.g., Chief Technology Officer"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  backgroundColor: '#F4F5F6',
                  border: '1px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#1A1D1F',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid #635BFF';
                  e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(99, 91, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid #E9EAEB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Company/Organization */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                Company/Organization
              </label>
              <input
                type="text"
                placeholder="e.g., TechCorp International"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  backgroundColor: '#F4F5F6',
                  border: '1px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#1A1D1F',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid #635BFF';
                  e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(99, 91, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid #E9EAEB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                Email Address*
              </label>
              <input
                type="email"
                placeholder="speaker@example.com"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  backgroundColor: '#F4F5F6',
                  border: '1px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#1A1D1F',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid #635BFF';
                  e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(99, 91, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid #E9EAEB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ position: 'relative', width: '140px' }}>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 32px 0 12px',
                      backgroundColor: '#F4F5F6',
                      border: '1px solid #E9EAEB',
                      borderRadius: '8px',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      color: '#1A1D1F',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {countries.map((country) => (
                      <option key={`${country.code}-${country.phoneCode}`} value={country.phoneCode}>
                        {country.code} ({country.phoneCode})
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={16} 
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6F767E', 
                      pointerEvents: 'none' 
                    }} 
                  />
                </div>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  style={{
                    flex: 1,
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    color: '#1A1D1F',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #635BFF';
                    e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(99, 91, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid #E9EAEB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Professional Information */}
          <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '32px', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, color: '#1A1D1F', marginBottom: '20px' }}>
              Professional Information
            </h3>

            {/* Bio */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                Speaker Bio
              </label>
              <textarea
                placeholder="Write a brief bio about the speaker's background and expertise..."
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '12px 16px',
                  backgroundColor: '#F4F5F6',
                  border: '1px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#1A1D1F',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid #635BFF';
                  e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(99, 91, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid #E9EAEB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#9A9FA5' }}>
                  0 / 500
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Session Assignment */}
          <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '32px' }}>
            <h3 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, color: '#1A1D1F', marginBottom: '16px' }}>
              Session Assignment
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Opening Keynote', time: 'Dec 20, 9:00 AM' },
                { name: 'AI Panel Discussion', time: 'Dec 20, 2:00 PM' },
                { name: 'Workshop: Design Thinking', time: 'Dec 21, 10:00 AM' }
              ].map((session, idx) => (
                <label
                  key={idx}
                  style={{
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '2px solid transparent',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
                >
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#635BFF' }}
                  />
                  <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', flex: 1 }}>
                    {session.name}
                  </span>
                  <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#9A9FA5' }}>
                    {session.time}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '20px 32px',
            borderTop: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: '0 0 16px 16px'
          }}
        >
          {/* Left Side: Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={sendInvitation}
              onChange={(e) => setSendInvitation(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#635BFF' }}
            />
            <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
              Send invitation email to speaker
            </span>
          </label>

          {/* Right Side: Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E9EAEB',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6F767E',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              Cancel
            </button>
            <button
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#635BFF',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C75FF'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#635BFF'}
            >
              Add Speaker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Share Link Modal Component
function ShareLinkModal({ onClose, linkCopied, onCopyLink }: {
  onClose: () => void;
  linkCopied: boolean;
  onCopyLink: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 29, 31, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '500px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.2)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#1A1D1F' }}>
            Share Speaker Invite Link
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} style={{ color: '#6F767E' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '32px' }}>
          {/* Description */}
          <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6F767E', marginBottom: '24px', lineHeight: 1.6 }}>
            Share this unique link with speakers so they can fill out their own profiles. Each speaker will need to create an account or log in to complete their information.
          </p>

          {/* Link Display Box */}
          <div
            style={{
              backgroundColor: '#F4F5F6',
              padding: '16px',
              borderRadius: '8px',
              border: '2px dashed #E9EAEB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}
          >
            <span
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 500,
                color: '#635BFF',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              https://eventra.app/speaker-invite/evt-2025-4782
            </span>
            <button
              onClick={onCopyLink}
              style={{
                height: '36px',
                padding: '0 16px',
                backgroundColor: linkCopied ? '#1F7A3E' : '#635BFF',
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: '12px',
                transition: 'all 0.2s'
              }}
            >
              {linkCopied ? (
                <>
                  <Check size={14} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Sharing Options */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 500, color: '#6F767E', display: 'block', marginBottom: '16px' }}>
              Or share via:
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { icon: Mail, label: 'Email' },
                { icon: MessageCircle, label: 'WhatsApp' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: QrCode, label: 'QR Code' }
              ].map((option, idx) => {
                const Icon = option.icon;
                return (
                  <button
                    key={idx}
                    title={option.label}
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#F4F5F6',
                      border: 'none',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#635BFF';
                      (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F4F5F6';
                      (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                    }}
                  >
                    <Icon size={20} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Section */}
          <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '24px' }}>
            <label style={{ display: 'flex', gap: '10px', alignItems: 'start', marginBottom: '12px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#635BFF', marginTop: '2px' }} />
              <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
                Require approval before speakers appear publicly
              </span>
            </label>
            <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#635BFF', marginTop: '2px' }} />
              <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
                Send me email notification when someone registers
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '20px 32px',
            borderTop: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              height: '44px',
              padding: '0 24px',
              backgroundColor: '#635BFF',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C75FF'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#635BFF'}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
