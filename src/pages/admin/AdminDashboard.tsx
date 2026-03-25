import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import NavbarLoggedIn from '../../components/navigation/NavbarLoggedIn';
import {
  Check, X, ExternalLink, Loader2, Search, Filter,
  ShieldCheck, AlertCircle, Clock, CheckCircle, Calendar,
  Building2, Activity, BarChart3, Eye, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createNotification } from '../../lib/notifications';

interface Event {
  id: string;
  name: string;
  description: string;
  organizer_id: string;
  created_at: string;
  start_date?: string;
  cover_image_url?: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  is_approved: boolean;
}

interface BusinessProfile {
  id: string;
  company_name: string;
  description: string;
  owner_profile_id: string;
  created_at: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_public: boolean;
  logo_url: string;
}

// ── Inline styles ──────────────────────────────────────────────────
const cardBase: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.25s ease',
};

const glassCard: React.CSSProperties = {
  ...cardBase,
  backdropFilter: 'blur(12px)',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'businesses'>('events');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [bizStatusFilter, setBizStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'events') {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setEvents(data || []);
      } else {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setBusinesses(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────
  const pendingEvents = events.filter(e => e.moderation_status === 'pending').length;
  const approvedEvents = events.filter(e => e.moderation_status === 'approved').length;
  const rejectedEvents = events.filter(e => e.moderation_status === 'rejected').length;
  const pendingBiz = businesses.filter(b => b.verification_status === 'pending').length;
  const verifiedBiz = businesses.filter(b => b.verification_status === 'verified').length;
  const rejectedBiz = businesses.filter(b => b.verification_status === 'rejected').length;

  // ── Filters ──────────────────────────────────────────────────────
  const filteredEvents = events
    .filter(evt => {
      if (statusFilter !== 'all' && evt.moderation_status !== statusFilter) return false;
      if (searchQuery && !evt.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.moderation_status === 'pending' && b.moderation_status !== 'pending') return -1;
      if (a.moderation_status !== 'pending' && b.moderation_status === 'pending') return 1;
      return 0;
    });

  const filteredBusinesses = businesses
    .filter(biz => {
      if (bizStatusFilter !== 'all' && biz.verification_status !== bizStatusFilter) return false;
      if (searchQuery && !biz.company_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.verification_status === 'pending' && b.verification_status !== 'pending') return -1;
      if (a.verification_status !== 'pending' && b.verification_status === 'pending') return 1;
      return 0;
    });

  // ── Handlers ─────────────────────────────────────────────────────
  const handleModeration = async (eventId: string, status: 'approved' | 'rejected') => {
    try {
      const isApproved = status === 'approved';
      const updates: any = { moderation_status: status, is_approved: isApproved };
      if (isApproved) updates.is_public = true;

      const { error } = await supabase.from('events').update(updates).eq('id', eventId);
      if (error) throw error;

      const event = events.find(e => e.id === eventId);
      if (event?.organizer_id) {
        try {
          await createNotification({
            recipient_id: event.organizer_id,
            title: isApproved ? `Event Approved: ${event.name}` : `Event Not Approved: ${event.name}`,
            body: isApproved
              ? `Your event "${event.name}" has been approved and is now live on Eventra!`
              : `Your event "${event.name}" was not approved. Please review your event details and resubmit.`,
            type: 'system',
            action_url: `/event/${eventId}`
          });
        } catch { /* notification failure should not block */ }
      }

      toast.success(`Event ${status} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event status');
    }
  };

  const handleBusinessModeration = async (businessId: string, status: 'verified' | 'rejected') => {
    try {
      const updates: any = { verification_status: status };
      if (status === 'verified') updates.is_public = true;

      const { data, error } = await supabase.from('business_profiles').update(updates).eq('id', businessId).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Permission denied or record not found.');

      toast.success(`Business ${status === 'verified' ? 'verified' : 'rejected'} successfully`);
      fetchData();
    } catch (error: any) {
      console.error('Error updating business:', error);
      toast.error(`Failed: ${error.message || 'Update failed'}`);
    }
  };

  const fixPublicStatus = async () => {
    setIsLoading(true);
    try {
      const { data: stuckEvents } = await supabase.from('events').select('id').eq('moderation_status', 'approved').eq('is_public', false);
      if (stuckEvents && stuckEvents.length > 0) {
        const ids = stuckEvents.map(e => e.id);
        const { error } = await supabase.from('events').update({ is_public: true }).in('id', ids);
        if (error) throw error;
        toast.success(`Fixed ${ids.length} events visibility`);
      } else {
        toast.info('All approved events are already public');
      }
    } catch (e) {
      console.error(e);
      toast.error('Fix failed');
    } finally { setIsLoading(false); }
  };

  // ── Status helpers ───────────────────────────────────────────────
  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
      pending: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', icon: <Clock size={12} /> },
      approved: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', icon: <CheckCircle size={12} /> },
      verified: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', icon: <CheckCircle size={12} /> },
      rejected: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', icon: <AlertCircle size={12} /> },
    };
    const c = config[status.toLowerCase()] || config.pending;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
        backgroundColor: c.bg, color: c.color, border: `1px solid ${c.color}22`,
      }}>
        {c.icon} {status === 'verified' ? 'Verified' : status}
      </span>
    );
  };

  // ── Loading state ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#060E1A' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} style={{ color: '#0684F5', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ color: '#64748B', fontSize: '14px' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Stat card helper ─────────────────────────────────────────────
  const StatCard = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) => (
    <div style={{
      ...glassCard,
      padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: '16px',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060E1A', color: '#fff' }}>
      <NavbarLoggedIn currentPage="admin" />

      {/* Background gradient accent */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(6,132,245,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '140px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #0684F5, #8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={20} style={{ color: '#fff' }} />
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Admin Console
              </h1>
            </div>
            <p style={{ color: '#64748B', fontSize: '14px', marginLeft: '52px' }}>
              Platform moderation, event approvals, and business verification.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={fixPublicStatus}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                color: '#94A3B8', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94A3B8'; }}
            >
              <RefreshCw size={14} />
              Fix Visibility
            </button>
            <button
              onClick={fetchData}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '10px',
                border: '1px solid rgba(6,132,245,0.3)',
                backgroundColor: 'rgba(6,132,245,0.1)',
                color: '#0684F5', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(6,132,245,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(6,132,245,0.1)'; }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {activeTab === 'events' ? (
            <>
              <StatCard label="Pending Review" value={pendingEvents} color="#F59E0B" icon={<Clock size={22} style={{ color: '#F59E0B' }} />} />
              <StatCard label="Approved" value={approvedEvents} color="#10B981" icon={<CheckCircle size={22} style={{ color: '#10B981' }} />} />
              <StatCard label="Rejected" value={rejectedEvents} color="#EF4444" icon={<AlertCircle size={22} style={{ color: '#EF4444' }} />} />
              <StatCard label="Total Events" value={events.length} color="#0684F5" icon={<BarChart3 size={22} style={{ color: '#0684F5' }} />} />
            </>
          ) : (
            <>
              <StatCard label="Pending Review" value={pendingBiz} color="#F59E0B" icon={<Clock size={22} style={{ color: '#F59E0B' }} />} />
              <StatCard label="Verified" value={verifiedBiz} color="#10B981" icon={<CheckCircle size={22} style={{ color: '#10B981' }} />} />
              <StatCard label="Rejected" value={rejectedBiz} color="#EF4444" icon={<AlertCircle size={22} style={{ color: '#EF4444' }} />} />
              <StatCard label="Total Businesses" value={businesses.length} color="#8B5CF6" icon={<Building2 size={22} style={{ color: '#8B5CF6' }} />} />
            </>
          )}
        </div>

        {/* ── TABS + FILTERS BAR ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
        }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: '4px', padding: '4px',
            backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {([
              { key: 'events' as const, label: 'Event Requests', icon: <Calendar size={15} />, color: '#0684F5' },
              { key: 'businesses' as const, label: 'Business Profiles', icon: <Building2 size={15} />, color: '#8B5CF6' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '10px', border: 'none',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === tab.key ? tab.color : 'transparent',
                  color: activeTab === tab.key ? '#fff' : '#64748B',
                  boxShadow: activeTab === tab.key ? `0 4px 20px ${tab.color}40` : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.key && (
                  <span style={{
                    fontSize: '11px', fontWeight: 800, padding: '1px 8px',
                    borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.2)',
                  }}>
                    {tab.key === 'events' ? events.length : businesses.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type="text"
                placeholder={activeTab === 'events' ? 'Search events...' : 'Search businesses...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  height: '40px', paddingLeft: '36px', paddingRight: '14px',
                  borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(255,255,255,0.04)', color: '#fff',
                  fontSize: '13px', outline: 'none', width: '260px',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(6,132,245,0.4)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
            {activeTab === 'events' ? (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                style={{
                  height: '40px', padding: '0 32px 0 12px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(255,255,255,0.04)', color: '#94A3B8',
                  fontSize: '13px', cursor: 'pointer', outline: 'none',
                  appearance: 'none' as const,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            ) : (
              <select
                value={bizStatusFilter}
                onChange={e => setBizStatusFilter(e.target.value as any)}
                style={{
                  height: '40px', padding: '0 32px 0 12px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(255,255,255,0.04)', color: '#94A3B8',
                  fontSize: '13px', cursor: 'pointer', outline: 'none',
                  appearance: 'none' as const,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>
        </div>

        {/* ── EVENTS CARD LIST ── */}
        {activeTab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredEvents.length === 0 ? (
              <div style={{
                ...glassCard, padding: '60px 24px', textAlign: 'center',
              }}>
                <Calendar size={40} style={{ color: '#1E293B', margin: '0 auto 16px' }} />
                <p style={{ color: '#475569', fontSize: '15px', fontWeight: 500 }}>No events match your filters.</p>
              </div>
            ) : filteredEvents.map(event => (
              <div
                key={event.id}
                style={{
                  ...glassCard,
                  display: 'flex', alignItems: 'center', gap: '20px',
                  padding: '20px 24px',
                  borderLeftWidth: '3px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: event.moderation_status === 'pending' ? '#F59E0B'
                    : event.moderation_status === 'approved' ? '#10B981' : '#EF4444',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
              >
                {/* Event thumbnail */}
                <div style={{
                  width: '72px', height: '72px', borderRadius: '12px', flexShrink: 0,
                  overflow: 'hidden', backgroundColor: 'rgba(6,132,245,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {event.cover_image_url ? (
                    <img src={event.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Calendar size={28} style={{ color: '#0684F5', opacity: 0.5 }} />
                  )}
                </div>

                {/* Event info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>{event.name}</span>
                    <StatusBadge status={event.moderation_status} />
                  </div>
                  <p style={{ color: '#64748B', fontSize: '13px', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>
                    {event.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#475569' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {event.start_date
                        ? new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'TBD'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      Submitted {new Date(event.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => window.open(`/event/${event.id}/landing`, '_blank')}
                    title="Preview Event"
                    style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      color: '#94A3B8', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(6,132,245,0.15)'; e.currentTarget.style.color = '#0684F5'; e.currentTarget.style.borderColor = 'rgba(6,132,245,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleModeration(event.id, 'approved')}
                    title="Approve Event"
                    style={{
                      height: '38px', padding: '0 16px', borderRadius: '10px', border: 'none',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: event.moderation_status === 'approved' ? '#10B981' : 'rgba(16,185,129,0.12)',
                      color: event.moderation_status === 'approved' ? '#fff' : '#10B981',
                      boxShadow: event.moderation_status === 'approved' ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
                    }}
                    onMouseEnter={e => { if (event.moderation_status !== 'approved') { e.currentTarget.style.backgroundColor = '#10B981'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseLeave={e => { if (event.moderation_status !== 'approved') { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.12)'; e.currentTarget.style.color = '#10B981'; } }}
                  >
                    <Check size={15} strokeWidth={3} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleModeration(event.id, 'rejected')}
                    title="Reject Event"
                    style={{
                      width: '38px', height: '38px', borderRadius: '10px', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                      backgroundColor: event.moderation_status === 'rejected' ? '#EF4444' : 'rgba(239,68,68,0.12)',
                      color: event.moderation_status === 'rejected' ? '#fff' : '#EF4444',
                      boxShadow: event.moderation_status === 'rejected' ? '0 4px 16px rgba(239,68,68,0.3)' : 'none',
                    }}
                    onMouseEnter={e => { if (event.moderation_status !== 'rejected') { e.currentTarget.style.backgroundColor = '#EF4444'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseLeave={e => { if (event.moderation_status !== 'rejected') { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#EF4444'; } }}
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BUSINESSES CARD LIST ── */}
        {activeTab === 'businesses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredBusinesses.length === 0 ? (
              <div style={{
                ...glassCard, padding: '60px 24px', textAlign: 'center',
              }}>
                <Building2 size={40} style={{ color: '#1E293B', margin: '0 auto 16px' }} />
                <p style={{ color: '#475569', fontSize: '15px', fontWeight: 500 }}>No businesses match your filters.</p>
              </div>
            ) : filteredBusinesses.map(biz => (
              <div
                key={biz.id}
                style={{
                  ...glassCard,
                  display: 'flex', alignItems: 'center', gap: '20px',
                  padding: '20px 24px',
                  borderLeftWidth: '3px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: biz.verification_status === 'pending' ? '#F59E0B'
                    : biz.verification_status === 'verified' ? '#10B981' : '#EF4444',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
              >
                {/* Business logo */}
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
                  overflow: 'hidden', backgroundColor: 'rgba(139,92,246,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.08)',
                }}>
                  {biz.logo_url ? (
                    <img src={biz.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#8B5CF6' }}>{biz.company_name.charAt(0)}</span>
                  )}
                </div>

                {/* Business info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>{biz.company_name}</span>
                    <StatusBadge status={biz.verification_status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#475569' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      Submitted {new Date(biz.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => window.open(`/business/${biz.id}`, '_blank')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'none', border: 'none', color: '#0684F5',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0,
                      }}
                    >
                      <ExternalLink size={11} /> View Profile
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleBusinessModeration(biz.id, 'verified')}
                    title="Verify Business"
                    style={{
                      height: '38px', padding: '0 16px', borderRadius: '10px', border: 'none',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: biz.verification_status === 'verified' ? '#10B981' : 'rgba(16,185,129,0.12)',
                      color: biz.verification_status === 'verified' ? '#fff' : '#10B981',
                      boxShadow: biz.verification_status === 'verified' ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
                    }}
                    onMouseEnter={e => { if (biz.verification_status !== 'verified') { e.currentTarget.style.backgroundColor = '#10B981'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseLeave={e => { if (biz.verification_status !== 'verified') { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.12)'; e.currentTarget.style.color = '#10B981'; } }}
                  >
                    <CheckCircle size={15} />
                    Verify
                  </button>
                  <button
                    onClick={() => handleBusinessModeration(biz.id, 'rejected')}
                    title="Reject Business"
                    style={{
                      width: '38px', height: '38px', borderRadius: '10px', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                      backgroundColor: biz.verification_status === 'rejected' ? '#EF4444' : 'rgba(239,68,68,0.12)',
                      color: biz.verification_status === 'rejected' ? '#fff' : '#EF4444',
                      boxShadow: biz.verification_status === 'rejected' ? '0 4px 16px rgba(239,68,68,0.3)' : 'none',
                    }}
                    onMouseEnter={e => { if (biz.verification_status !== 'rejected') { e.currentTarget.style.backgroundColor = '#EF4444'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseLeave={e => { if (biz.verification_status !== 'rejected') { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#EF4444'; } }}
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        select option {
          background-color: #0B1929;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
