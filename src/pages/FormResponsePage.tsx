import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

interface EventForm {
  id: string;
  title: string;
  description: string;
  event_id: string;
  schema: {
    fields: FormField[];
  };
}

export default function FormResponsePage() {
  const { formId } = useParams();
  const { t } = useI18n();
  const [form, setForm] = useState<EventForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formId) fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_forms')
        .select('*')
        .eq('id', formId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Form not found');

      setForm(data);
    } catch (err: any) {
      console.error('Error fetching form:', err);
      setError(err.message || t('formResponse.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Basic Validation
    const missing = form.schema.fields.filter(
      (f) => f.required && !formData[f.id]
    );
    if (missing.length > 0) {
      toast.error(t('formResponse.errors.missingFields', { fields: missing.map(f => f.label).join(', ') }));
      return;
    }

    try {
      setSubmitting(true);
      
      const submissionData: Record<string, any> = {};
      form.schema.fields.forEach(f => {
        submissionData[f.label] = formData[f.id] || '';
      });

      const { error } = await supabase
        .from('event_form_submissions')
        .insert([{
          form_id: form.id,
          event_id: form.event_id,
          data: submissionData
        }]);

      if (error) throw error;

      setSubmitted(true);
      toast.success(t('formResponse.toasts.submitSuccess'));
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(t('formResponse.toasts.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const containerStyle = {
    backgroundColor: '#0B2641',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif"
  };

  const cardStyle = {
    maxWidth: '640px',
    width: '100%',
    backgroundColor: '#0D3052',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '48px 40px',
    background: 'linear-gradient(135deg, #0684F5 0%, #0570D6 100%)',
    position: 'relative' as const,
    color: '#FFFFFF'
  };

  const inputStyle = {
    width: '100%',
    height: '48px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1.5px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '0 16px',
    color: '#FFFFFF',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#E2E8F0',
    marginBottom: '8px',
    letterSpacing: '0.02em'
  };

  const submitButtonStyle = {
    width: '100%',
    height: '56px',
    backgroundColor: '#0684F5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 10px 20px -5px rgba(6, 132, 245, 0.4)'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <Loader2 size={40} style={{ color: '#0684F5' }} className="animate-spin" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <AlertCircle size={64} style={{ color: '#EF4444', marginBottom: '24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>{t('formResponse.unavailable.title')}</h2>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>{error || t('formResponse.unavailable.description')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 32px' }}>
              <CheckCircle size={40} style={{ color: '#10B981', margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px' }}>{t('formResponse.success.title')}</h2>
            <p style={{ fontSize: '18px', color: '#94A3B8', marginBottom: '40px', lineHeight: 1.6 }}>{t('formResponse.success.description')}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: 'none', border: 'none', color: '#0684F5', fontWeight: 600, fontSize: '16px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {t('formResponse.success.submitAnother')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>{form.title}</h1>
            <p style={{ fontSize: '17px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>{form.description}</p>
          </div>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1 }}></div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {form.schema.fields.map((field) => (
              <div key={field.id}>
                <label style={labelStyle}>
                  {field.label}
                  {field.required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
                </label>
                
                {field.helpText && (
                  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>{field.helpText}</p>
                )}

                {field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    placeholder={field.placeholder}
                    style={{ ...inputStyle, height: '140px', padding: '16px', resize: 'vertical' }}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  />
                ) : (field.type === 'select' || field.type === 'dropdown') ? (
                  <div style={{ position: 'relative' }}>
                    <select
                      required={field.required}
                      style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      defaultValue=""
                    >
                      <option value="" disabled style={{ color: '#64748B' }}>{t('formResponse.selectOption')}</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt} style={{ backgroundColor: '#0D3052', color: '#FFFFFF' }}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  </div>
                ) : field.type === 'radio' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {field.options?.map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          required={field.required}
                          style={{ width: '18px', height: '18px', accentColor: '#0684F5' }}
                          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        />
                        <span style={{ color: '#FFFFFF', fontSize: '15px' }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (field.type === 'checkbox' || field.type === 'multichoice') ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {field.options?.map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                          type="checkbox"
                          value={opt}
                          style={{ width: '18px', height: '18px', accentColor: '#0684F5' }}
                          onChange={(e) => {
                            const current = formData[field.id] || [];
                            const updated = e.target.checked
                              ? [...current, opt]
                              : current.filter((v: string) => v !== opt);
                            setFormData({ ...formData, [field.id]: updated });
                          }}
                        />
                        <span style={{ color: '#FFFFFF', fontSize: '15px' }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    style={inputStyle}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  />
                )}
              </div>
            ))}

            <div style={{ marginTop: '16px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...submitButtonStyle,
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {t('formResponse.submitting')}
                  </>
                ) : (
                  t('formResponse.submit')
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer Branding */}
        <div style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            {t('formResponse.poweredBy')} <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Eventra</span>
          </p>
        </div>
      </div>
    </div>
  );
}