import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Loader2, Share2, ArrowLeft, Building, Mail, User, MessageSquare, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import { useI18n } from '../i18n/I18nContext';

export default function SponsorshipInquiryPage() {
  const { eventId, packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  
  const [event, setEvent] = useState<any>(null);
  const [pkg, setPkg] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    company: '',
    email: user?.email || '',
    message: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (!eventId || !packageId) return;
      setIsLoading(true);
      try {
        const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
        if (eventData) {
          setEvent(eventData);
          const packages = eventData.sponsorship_settings || [];
          const foundPkg = packages.find((p: any) => p.id === packageId || p.name === packageId);
          setPkg(foundPkg);
        }
      } catch (error) {
        console.error('Error loading inquiry data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [eventId, packageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('event_sponsorship_inquiries')
        .insert({
          event_id: eventId,
          package_id: pkg.id || pkg.name,
          full_name: formData.name,
          company_name: formData.company,
          email: formData.email,
          message: formData.message,
          status: 'new'
        });

      if (error) throw error;

      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      toast.error('Failed to submit request: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B2641] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0684F5]" size={40} />
      </div>
    );
  }

  if (!event || !pkg) {
    return (
      <div className="min-h-screen bg-[#0B2641] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Inquiry details not found</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#0684F5] rounded-lg">Go Back</button>
      </div>
    );
  }

  const brandColor = event?.branding_settings?.design_studio?.brandColor || '#0684F5';

  return (
    <div style={{ backgroundColor: '#0B2641', minHeight: '100vh', color: '#FFFFFF' }}>
      {user ? <NavbarLoggedIn /> : <NavbarLoggedOut />}
      
      <div style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '1000px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
        
        {/* Back Link */}
        <button 
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '32px' }}
        >
          <ArrowLeft size={20} /> Back to Event
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '1.2fr 1fr', gap: '60px', alignItems: 'start' }}>
          
          {/* Left Column: Context & Package Info */}
          <div>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'inline-flex', padding: '6px 16px', borderRadius: '100px', background: `${brandColor}15`, border: `1px solid ${brandColor}30`, color: brandColor, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
                SPONSORSHIP INQUIRY
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
                Partner with <span style={{ color: brandColor }}>{event.name}</span>
              </h1>
              <p style={{ fontSize: '18px', color: '#94A3B8', lineHeight: 1.6 }}>
                You've selected the <strong>{pkg.name}</strong> tier. Complete the details below to receive your official sponsorship proposal and payment instructions.
              </p>
            </div>

            {/* Package Summary Card */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: brandColor, textTransform: 'uppercase' }}>Selected Tier</span>
                <span style={{ fontSize: '24px', fontWeight: 800 }}>{typeof pkg.value === 'number' ? `$${pkg.value.toLocaleString()}` : pkg.price}</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>{pkg.name} Benefits:</h3>
              <div className="space-y-4">
                {(pkg.benefits || pkg.features || []).map((b: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '12px' }}>
                    <Check size={18} style={{ color: '#10B981', flexShrink: 0 }} strokeWidth={3} />
                    <span style={{ fontSize: '15px', color: '#E2E8F0' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Conversion Flow */}
          <div>
            {step === 'form' ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '32px', padding: '40px', color: '#0B2641', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Business Details</h2>
                <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '32px' }}>Help us prepare your customized contract.</p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>CONTACT NAME</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', height: '52px', paddingLeft: '44px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px' }} placeholder="Your Name" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>COMPANY NAME</label>
                    <div style={{ position: 'relative' }}>
                      <Building size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', height: '52px', paddingLeft: '44px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px' }} placeholder="Brand or Company" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>BUSINESS EMAIL</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', height: '52px', paddingLeft: '44px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px' }} placeholder="corporate@email.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>NOTES</label>
                    <textarea rows={3} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ width: '100%', padding: '14px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', resize: 'none' }} placeholder="Any special requests?" />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    style={{ width: '100%', height: '56px', background: brandColor, color: '#FFFFFF', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', marginTop: '10px' }}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Inquiry'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', padding: '40px', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <div style={{ width: '80px', height: '80px', background: '#10B98120', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Check size={40} style={{ color: '#10B981' }} strokeWidth={3} />
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '12px' }}>Request Successful</h2>
                  <p style={{ color: '#94A3B8', fontSize: '16px' }}>We've sent the pro-forma invoice to <strong>{formData.email}</strong>.</p>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', marginBottom: '32px' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard size={20} style={{ color: brandColor }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Transfer Information</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex justify-between border-b border-white/5 pb-3">
                      <span style={{ color: '#94A3B8', fontSize: '14px' }}>Bank Name</span>
                      <span style={{ fontWeight: 600 }}>Eventra International Bank</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-3">
                      <span style={{ color: '#94A3B8', fontSize: '14px' }}>Account Holder</span>
                      <span style={{ fontWeight: 600 }}>Eventra Platform Ltd</span>
                    </div>
                    <div className="space-y-2">
                      <span style={{ color: '#94A3B8', fontSize: '14px' }}>IBAN</span>
                      <div 
                        onClick={() => { navigator.clipboard.writeText('GB82 EVNT 0042 9918 2203 01'); toast.success('IBAN Copied!'); }}
                        style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: `1px solid ${brandColor}40`, color: brandColor, fontFamily: 'monospace', fontWeight: 700, fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        GB82 EVNT 0042 9918 2203 01
                        <Share2 size={14} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span style={{ color: '#94A3B8', fontSize: '14px' }}>SWIFT / BIC</span>
                      <div 
                        onClick={() => { navigator.clipboard.writeText('EVNTGB2LXXX'); toast.success('SWIFT Copied!'); }}
                        style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: `1px solid ${brandColor}40`, color: brandColor, fontFamily: 'monospace', fontWeight: 700, fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        EVNTGB2LXXX
                        <Share2 size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => navigate(`/event/${eventId}/landing`)} style={{ width: '100%', height: '52px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#FFFFFF', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Return to Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
