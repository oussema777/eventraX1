import { useEffect, useState, useRef } from 'react';
import { 
  Download, 
  Palette, 
  User, 
  QrCode, 
  Upload, 
  ArrowLeft,
  CheckSquare,
  AlertCircle,
  Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

interface BadgeSettings {
  logoUrl: string | null;
  brandColor: string;
  selectedFields: string[]; // Max 2 fields
}

interface BadgeEditorSimpleProps {
  eventId: string;
  onBack?: () => void;
}

export default function BadgeEditorSimple({ eventId, onBack }: BadgeEditorSimpleProps) {
  const { t } = useI18n();
  const [settings, setSettings] = useState<BadgeSettings>({
    logoUrl: null,
    brandColor: '#0684F5',
    selectedFields: [] 
  });
  
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!eventId) return;
    loadData();
  }, [eventId]);

  const loadData = async () => {
    // 1. Load Event Details
    const { data: eventData } = await supabase
      .from('events')
      .select('name, start_date, location_address, badge_settings')
      .eq('id', eventId)
      .single();
    
    if (eventData) {
      setEventDetails(eventData);
      if (eventData.badge_settings) {
        setSettings(prev => ({ ...prev, ...eventData.badge_settings }));
      }
    }

    // 2. Load Registration Fields STRICTLY from custom forms
    const { data: forms } = await supabase
      .from('event_forms')
      .select('schema')
      .eq('event_id', eventId)
      .eq('status', 'active');

    // Prioritize 'registration' type form
    const registrationForm = forms?.find((f: any) => f.schema?.fields); 
    
    if (registrationForm?.schema?.fields) {
      const labels = registrationForm.schema.fields
        .map((f: any) => f.label)
        .filter((label: string) => label !== 'Full Name' && label !== 'Email Address'); // Name is already prominent
      
      setAvailableFields(labels);
      
      // If settings were empty, pick first two as defaults
      if (!eventData?.badge_settings?.selectedFields || eventData.badge_settings.selectedFields.length === 0) {
        setSettings(prev => ({ ...prev, selectedFields: labels.slice(0, 2) }));
      }
    }

    // 3. Load Attendees for Printing
    const { data: attendeesData } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'approved'); // Only print approved badges usually
    
    if (attendeesData) {
      setAttendees(attendeesData);
    }
  };

  const saveSettings = async (newSettings: BadgeSettings) => {
    setSettings(newSettings);
    await supabase
      .from('events')
      .update({ badge_settings: newSettings })
      .eq('id', eventId);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        saveSettings({ ...settings, logoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleField = (field: string) => {
    let newFields = [...settings.selectedFields];
    if (newFields.includes(field)) {
      newFields = newFields.filter(f => f !== field);
    } else {
      if (newFields.length >= 2) {
        newFields.shift(); // Remove oldest
      }
      newFields.push(field);
    }
    saveSettings({ ...settings, selectedFields: newFields });
  };

  const handlePrint = () => {
    if (attendees.length === 0) {
      alert("No approved attendees found to print.");
      return;
    }

    const w = window.open('', '_blank');
    if (!w) return;
    
    // Generate HTML for ALL attendees
    const badgesHtml = attendees.map(attendee => {
      // Resolve dynamic fields from meta
      const field1Label = settings.selectedFields[0];
      const field1Value = field1Label ? (attendee.meta?.[field1Label] || '') : '';
      
      const field2Label = settings.selectedFields[1];
      const field2Value = field2Label ? (attendee.meta?.[field2Label] || '') : '';

      // QR Code URL (using a public API for simplicity in print view, or generate locally)
      // For production, better to use a local library or data URI to ensure it works offline/fast
      const qrData = attendee.id; // Or confirmation code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

      return `
        <div class="badge">
          <div class="badge-header" style="background-color: ${settings.brandColor}"></div>
          <div class="badge-body">
            <div class="badge-logo">
              ${settings.logoUrl ? `<img src="${settings.logoUrl}" />` : '<span style="color:#ccc; font-size:10px;">LOGO</span>'}
            </div>
            <div class="attendee-info">
              <h2 class="attendee-name">${attendee.name || 'Unknown'}</h2>
              ${field1Value ? `<p class="field-primary">${field1Value}</p>` : ''}
              ${field2Value ? `<p class="field-secondary">${field2Value}</p>` : ''}
            </div>
            <div class="qr-code">
              <img src="${qrUrl}" />
            </div>
          </div>
          <div class="badge-footer">
            <p class="event-name">${eventDetails?.name || ''}</p>
            <p class="event-date">${eventDetails?.start_date ? new Date(eventDetails.start_date).toLocaleDateString() : ''} • ${eventDetails?.location_address || ''}</p>
          </div>
        </div>
      `;
    }).join('');
    
    const html = `
      <html>
        <head>
          <title>Print Badges (${attendees.length})</title>
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; background: #fff; }
            .badge-page { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 0; /* Removing gap for precise cutting lines if needed, or keep for spacing */
              justify-content: flex-start;
              padding: 20px;
            }
            .badge { 
              border: 1px solid #ddd; 
              width: 300px;
              height: 450px;
              position: relative;
              page-break-inside: avoid;
              margin: 10px;
              border-radius: 12px;
              overflow: hidden;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
            }
            .badge-header { height: 16px; width: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .badge-body { flex: 1; padding: 24px; display: flex; flex-direction: column; align-items: center; text-align: center; }
            .badge-logo { height: 60px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; }
            .badge-logo img { max-height: 100%; max-width: 100%; object-fit: contain; }
            .attendee-info { margin-bottom: auto; width: 100%; }
            .attendee-name { font-size: 26px; font-weight: 800; color: #000; margin: 0 0 8px 0; line-height: 1.1; word-wrap: break-word; }
            .field-primary { font-size: 16px; color: #444; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .field-secondary { font-size: 14px; color: #666; margin: 4px 0 0 0; }
            .qr-code img { width: 100px; height: 100px; }
            .badge-footer { padding: 12px; background-color: #F3F4F6; border-top: 1px solid #E5E7EB; text-align: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .event-name { font-size: 10px; font-weight: bold; color: #111827; margin: 0; text-transform: uppercase; }
            .event-date { font-size: 9px; color: #6B7280; margin: 2px 0 0 0; }
            
            @media print {
              body { background: none; }
              .badge { box-shadow: none; border: 1px dashed #ccc; }
              @page { margin: 0.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="badge-page">
             ${badgesHtml}
          </div>
          <script>
            // Wait images to load
            window.onload = () => { setTimeout(() => window.print(), 1000); };
          </script>
        </body>
      </html>
    `;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">Badge Generator</h2>
            <p className="text-sm text-gray-400">Design QR badges for your attendees</p>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0684F5] text-white rounded-lg font-semibold hover:bg-[#0573D9] transition-colors"
        >
          <Download size={18} />
          Print {attendees.length > 0 ? `(${attendees.length})` : ''} Badges
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Brand Settings */}
          <div className="bg-[#0B2236] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Palette size={14} /> Branding
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Brand Color</label>
                <div className="flex flex-wrap gap-2">
                  {['#0684F5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => saveSettings({ ...settings, brandColor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.brandColor === color ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Event Logo</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload}
                    className="hidden" 
                    id="logo-upload"
                  />
                  <label 
                    htmlFor="logo-upload"
                    className="flex items-center justify-center gap-2 w-full h-10 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer text-sm text-gray-300 transition-colors"
                  >
                    <Upload size={14} /> {settings.logoUrl ? 'Change Logo' : 'Upload Logo'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div className="bg-[#0B2236] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckSquare size={14} /> Custom Fields
            </h3>
            
            <div className="mb-3">
               <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                 <AlertCircle size={12} /> Select up to 2 fields from your form
               </p>
            </div>

            {availableFields.length === 0 ? (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs italic">
                No custom fields found in your registration form.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {availableFields.map(field => {
                  const isSelected = settings.selectedFields.includes(field);
                  return (
                    <label 
                      key={field} 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-[#0684F5]/10 border border-[#0684F5]/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                    >
                      <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {field}
                      </span>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#0684F5] border-[#0684F5]' : 'border-gray-600'}`}>
                         {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleField(field)}
                        className="hidden"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="lg:col-span-8 flex items-center justify-center bg-[#0B2236] border border-white/10 rounded-xl p-8 min-h-[600px]">
          {/* BADGE PREVIEW */}
          <div 
            ref={badgeRef}
            style={{
              width: '320px',
              height: '480px',
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {/* Header Strip */}
            <div style={{ height: '16px', backgroundColor: settings.brandColor, width: '100%' }} />
            
            <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {/* Logo Area */}
              <div style={{ height: '70px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ color: '#ccc', fontSize: '12px', border: '1px dashed #ddd', width: '100px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>Logo</div>
                )}
              </div>

              {/* Attendee Name */}
              <div style={{ marginBottom: 'auto', width: '100%' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#000', margin: '0 0 8px 0', lineHeight: '1.1' }}>
                  Alex <br/> Mercer
                </h2>
                
                {/* Dynamic Fields */}
                <div className="space-y-2 mt-4">
                  {settings.selectedFields.map((field, idx) => (
                    <p key={idx} style={{ 
                      fontSize: idx === 0 ? '16px' : '14px', 
                      color: idx === 0 ? '#444' : '#666', 
                      fontWeight: idx === 0 ? '600' : '400', 
                      margin: 0, 
                      textTransform: idx === 0 ? 'uppercase' : 'none', 
                      letterSpacing: idx === 0 ? '0.5px' : 'normal' 
                    }}>
                      {/* Sample data fallback based on common label names */}
                      {field.toLowerCase().includes('company') || field.toLowerCase().includes('organization') ? 'TechFlow Solutions' :
                       field.toLowerCase().includes('title') || field.toLowerCase().includes('position') || field.toLowerCase().includes('job') ? 'Senior Product Manager' :
                       `Sample [${field}]`}
                    </p>
                  ))}
                </div>
              </div>

              {/* QR Code */}
              <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px' }}>
                <QrCode size={110} color="#000" />
              </div>
            </div>

            {/* Footer / Event Info */}
            <div style={{ padding: '16px', backgroundColor: '#F3F4F6', borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#111827', margin: 0, textTransform: 'uppercase' }}>
                {eventDetails?.name || 'Event Name'}
              </p>
              <p style={{ fontSize: '10px', color: '#6B7280', margin: '4px 0 0 0' }}>
                {eventDetails?.start_date ? new Date(eventDetails.start_date).toLocaleDateString() : 'Date'} • {eventDetails?.location_address || 'Location'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
