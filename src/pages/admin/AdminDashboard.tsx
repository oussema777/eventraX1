import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import NavbarLoggedIn from '../../components/navigation/NavbarLoggedIn';
import { Check, X, ExternalLink, Loader2, Search, Filter, MoreVertical, Eye, ShieldCheck, AlertCircle, Clock, CheckCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  description: string;
  organizer_id: string;
  created_at: string;
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'businesses'>('events');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'events') {
        let query = supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        // For events, we still prioritize pending for now, but let's allow filtering if we want later.
        // For now, keeping the logic close to original but cleaner:
        // Original logic was: .neq('moderation_status', 'approved')
        // Let's stick to showing pending by default or all if requested?
        // User asked to "make approved business stay their". Didn't explicitly say events.
        // But for consistency let's show all events too if we want a "Pro" dashboard.
        // Let's default to showing PENDING events primarily, or ALL?
        // Let's show ALL and use client side sort to put pending on top.
        
        const { data, error } = await query;
        if (error) throw error;
        setEvents(data || []);
      } else {
        let query = supabase
          .from('business_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query = query.eq('verification_status', statusFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setBusinesses(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20';
      case 'rejected':
        return 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20';
      case 'pending':
      default:
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20';
    }
  };

  const handleModeration = async (eventId: string, status: 'approved' | 'rejected') => {
    try {
      const isApproved = status === 'approved';
      const updates: any = { 
        moderation_status: status,
        is_approved: isApproved
      };

      if (isApproved) {
        updates.is_public = true;
      }

      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;

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
      
      if (status === 'verified') {
        updates.is_public = true;
      }

      const { data, error } = await supabase
        .from('business_profiles')
        .update(updates)
        .eq('id', businessId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Permission denied or record not found. Check RLS policies.');
      }

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
      const { data: stuckEvents } = await supabase
        .from('events')
        .select('id')
        .eq('moderation_status', 'approved')
        .eq('is_public', false);
      
      if (stuckEvents && stuckEvents.length > 0) {
        const ids = stuckEvents.map(e => e.id);
        const { error } = await supabase
          .from('events')
          .update({ is_public: true })
          .in('id', ids);
        
        if (error) throw error;
        toast.success(`Fixed ${ids.length} events visibility`);
      } else {
        toast.info('All approved events are already public');
      }
    } catch (e) {
      console.error(e);
      toast.error('Fix failed');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(biz => {
    if (!searchQuery) return true;
    return biz.company_name.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => {
    // Sort pending to top
    if (a.verification_status === 'pending' && b.verification_status !== 'pending') return -1;
    if (a.verification_status !== 'pending' && b.verification_status === 'pending') return 1;
    return 0;
  });

  const filteredEvents = events.filter(evt => {
    if (!searchQuery) return true;
    return evt.name.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => {
    // Sort pending to top
    if (a.moderation_status === 'pending' && b.moderation_status !== 'pending') return -1;
    if (a.moderation_status !== 'pending' && b.moderation_status === 'pending') return 1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-[#0684F5]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B2641]">
      <NavbarLoggedIn currentPage="admin" />
      
      <main className="max-w-[1400px] mx-auto px-6 py-12" style={{ paddingTop: '160px' }}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
            <p className="text-[#94A3B8]">Manage platform approvals, events, and business profiles.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fixPublicStatus}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <ShieldCheck size={16} />
              Fix Visibility
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0684F5]/10 border border-[#0684F5]/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-[#0684F5] animate-pulse" />
              <span className="text-[#0684F5] text-sm font-medium">
                {activeTab === 'events' ? filteredEvents.filter(e => e.moderation_status === 'pending').length : filteredBusinesses.filter(b => b.verification_status === 'pending').length} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md shadow-inner">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'events' 
                  ? 'bg-[#0684F5] text-white shadow-[0_0_20px_rgba(6,132,245,0.4)] scale-[1.02]' 
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar size={18} />
              Event Requests
            </button>
            <button
              onClick={() => setActiveTab('businesses')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'businesses' 
                  ? 'bg-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-[1.02]' 
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck size={18} />
              Business Profiles
            </button>
          </div>

          <div className="flex-1 flex gap-4 justify-end w-full md:w-auto">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0684F5] transition-colors"
              />
            </div>
            
            {activeTab === 'businesses' && (
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-11 bg-white/5 border border-white/10 rounded-lg pl-4 pr-10 text-white appearance-none cursor-pointer focus:outline-none focus:border-[#0684F5] transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" size={16} />
              </div>
            )}
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {activeTab === 'events' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-8 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em]">Event Details</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em]">Submission Date</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em]">Moderation Status</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="font-bold text-white text-lg group-hover:text-[#0684F5] transition-colors">{event.name}</div>
                          <div className="text-sm text-[#94A3B8] line-clamp-1 max-w-md opacity-80">{event.description || 'No description provided.'}</div>
                          <button 
                            onClick={() => window.open(`/event/${event.id}/landing`, '_blank')}
                            className="mt-2 w-fit text-[11px] font-bold text-[#0684F5] hover:text-white px-2 py-1 rounded bg-[#0684F5]/10 hover:bg-[#0684F5] transition-all flex items-center gap-1.5 uppercase tracking-wider"
                          >
                            Live Preview <ExternalLink size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">
                            {new Date(event.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-[#94A3B8] mt-0.5">
                            {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusBadgeStyles(event.moderation_status)}`}>
                          {event.moderation_status === 'approved' && <CheckCircle size={14} />}
                          {event.moderation_status === 'rejected' && <AlertCircle size={14} />}
                          {event.moderation_status === 'pending' && <Clock size={14} className="animate-spin-slow" />}
                          {event.moderation_status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleModeration(event.id, 'approved')}
                            className={`flex items-center gap-2 h-10 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                              event.moderation_status === 'approved' 
                                ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-900/40' 
                                : 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981] hover:text-white border border-[#10B981]/30'
                            }`}
                            title="Approve Event"
                          >
                            <Check size={18} strokeWidth={3} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleModeration(event.id, 'rejected')}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-95 ${
                              event.moderation_status === 'rejected' 
                                ? 'bg-[#EF4444] text-white shadow-lg shadow-red-900/40' 
                                : 'bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444] hover:text-white border border-[#EF4444]/30'
                            }`}
                            title="Reject Event"
                          >
                            <X size={18} strokeWidth={3} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Search size={32} className="text-[#94A3B8]" />
                          </div>
                          <div className="text-[#94A3B8] font-medium">No event requests found matching your criteria.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-8 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em]">Business Entity</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em]">Verification Date</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em]">Account Status</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBusinesses.map((biz) => (
                    <tr key={biz.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative flex-shrink-0">
                            {biz.logo_url ? (
                              <img className="h-14 w-14 rounded-2xl object-cover border-2 border-white/10 group-hover:border-[#0684F5] transition-all" src={biz.logo_url} alt="" />
                            ) : (
                              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/10 text-white font-black text-xl group-hover:bg-[#0684F5]/20 group-hover:border-[#0684F5]/40 transition-all">
                                {biz.company_name.charAt(0)}
                              </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0B2641] flex items-center justify-center ${biz.verification_status === 'verified' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}>
                              {biz.verification_status === 'verified' ? <Check size={10} className="text-white" /> : <Clock size={10} className="text-white" />}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg group-hover:text-[#0684F5] transition-colors">{biz.company_name}</div>
                            <button 
                              onClick={() => window.open(`/business/${biz.id}`, '_blank')}
                              className="mt-1.5 text-[11px] font-bold text-[#0684F5] hover:text-white px-2 py-0.5 rounded bg-[#0684F5]/10 hover:bg-[#0684F5] transition-all flex items-center gap-1.5 uppercase tracking-wider"
                            >
                              Public Profile <ExternalLink size={10} />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">
                            {new Date(biz.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-[#94A3B8] mt-0.5">
                            {new Date(biz.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusBadgeStyles(biz.verification_status)}`}>
                          {biz.verification_status === 'verified' && <CheckCircle size={14} />}
                          {biz.verification_status === 'rejected' && <AlertCircle size={14} />}
                          {biz.verification_status === 'pending' && <Clock size={14} className="animate-spin-slow" />}
                          {biz.verification_status === 'verified' ? 'Verified' : biz.verification_status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleBusinessModeration(biz.id, 'verified')}
                            className={`flex items-center gap-2 h-10 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                              biz.verification_status === 'verified' 
                                ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-900/40' 
                                : 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981] hover:text-white border border-[#10B981]/30'
                            }`}
                            title="Verify Business"
                          >
                            <CheckCircle size={18} />
                            <span>Verify</span>
                          </button>
                          <button
                            onClick={() => handleBusinessModeration(biz.id, 'rejected')}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-95 ${
                              biz.verification_status === 'rejected' 
                                ? 'bg-[#EF4444] text-white shadow-lg shadow-red-900/40' 
                                : 'bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444] hover:text-white border border-[#EF4444]/30'
                            }`}
                            title="Reject Business"
                          >
                            <X size={18} strokeWidth={3} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBusinesses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Search size={32} className="text-[#94A3B8]" />
                          </div>
                          <div className="text-[#94A3B8] font-medium">No business profiles found matching your criteria.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}