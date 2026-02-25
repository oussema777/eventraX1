import { useState, useEffect } from 'react';
import { X, Check, CreditCard, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface SponsorshipInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: any;
  brandColor: string;
  currentUser: any;
}

export default function SponsorshipInquiryModal({ isOpen, onClose, pkg, brandColor, currentUser }: SponsorshipInquiryModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: currentUser?.user_metadata?.full_name || '',
    company: '',
    email: currentUser?.email || '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setFormData({
        name: currentUser?.user_metadata?.full_name || '',
        company: '',
        email: currentUser?.email || '',
        message: ''
      });
    }
  }, [isOpen, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call to save lead
      await new Promise(resolve => setTimeout(resolve, 1200));
      setStep('success');
      toast.success('Inquiry submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !pkg) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[560px] rounded-3xl overflow-hidden"
        style={{ backgroundColor: '#0B2641', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
              {step === 'form' ? `Partner as ${pkg.name}` : 'Next Steps'}
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>{pkg.tier || pkg.name} Sponsorship Tier</p>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8' }} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Full Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', height: '48px', padding: '0 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px' }}
                  />
                </div>
                <div className="space-y-2">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Company Name</label>
                  <input 
                    required
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    style={{ width: '100%', height: '48px', padding: '0 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Business Email</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', height: '48px', padding: '0 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px' }}
                />
              </div>

              <div className="space-y-2">
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Additional Notes (Optional)</label>
                <textarea 
                  rows={3}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="Ask about specific benefits or custom requirements..."
                  style={{ width: '100%', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', resize: 'none' }}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                style={{ width: '100%', height: '52px', backgroundColor: brandColor, color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 8px 20px ${brandColor}40` }}
              >
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Request Sponsorship Invoice'}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <div style={{ width: '64px', height: '64px', backgroundColor: '#10B98120', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Check size={32} style={{ color: '#10B981' }} strokeWidth={3} />
                </div>
                <h4 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>Request Received!</h4>
                <p style={{ fontSize: '14px', color: '#94A3B8' }}>We've sent a confirmation and the pro-forma invoice to <strong>{formData.email}</strong>.</p>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px' }}>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={18} style={{ color: brandColor }} />
                  <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '1px' }}>Bank Transfer Details</h5>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>Bank Name</span>
                    <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>Eventra International Bank</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>Account Holder</span>
                    <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>Eventra Platform Ltd</span>
                  </div>
                  <div className="space-y-1">
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>IBAN / Account Number</span>
                    <div 
                      onClick={() => { navigator.clipboard.writeText('GB82 EVNT 0042 9918 2203 01'); toast.success('IBAN Copied!'); }}
                      style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: brandColor, fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      GB82 EVNT 0042 9918 2203 01
                      <Share2 size={14} />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                style={{ width: '100%', height: '52px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close & Return to Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
