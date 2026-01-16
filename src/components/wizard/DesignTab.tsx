import { useState, useEffect } from 'react';
import DesignControls from './DesignControls';
import LivePreview from './LivePreview';
import { useEventWizard } from '../../hooks/useEventWizard';

export default function DesignTab() {
  const { eventData, saveDraft, isLoading } = useEventWizard();
  
  const [primaryColor, setPrimaryColor] = useState('#0684F5');
  const [secondaryColor, setSecondaryColor] = useState('#10B981');
  const [cornerRadius, setCornerRadius] = useState(8);
  const [headingFont, setHeadingFont] = useState('Inter');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [backgroundStyle, setBackgroundStyle] = useState<'solid' | 'gradient' | 'image'>('solid');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  useEffect(() => {
    if (eventData.branding_settings) {
      setPrimaryColor(eventData.branding_settings.primaryColor || eventData.primary_color || '#0684F5');
      setSecondaryColor(eventData.branding_settings.secondaryColor || eventData.secondary_color || '#10B981');
      setCornerRadius(eventData.branding_settings.cornerRadius || 8);
      setHeadingFont(eventData.branding_settings.headingFont || 'Inter');
      setBodyFont(eventData.branding_settings.bodyFont || 'Inter');
      setBackgroundStyle(eventData.branding_settings.backgroundStyle || 'solid');
      setSelectedTemplate(eventData.branding_settings.selectedTemplate || 'modern');
    } else if (eventData.primary_color) {
        setPrimaryColor(eventData.primary_color);
    }
  }, [eventData.branding_settings, eventData.primary_color, eventData.secondary_color]);

  const handleSaveBranding = (updates: any) => {
    const newBranding = {
      ...eventData.branding_settings,
      ...updates
    };
    saveDraft({ 
        branding_settings: newBranding,
        primary_color: newBranding.primaryColor,
        secondary_color: newBranding.secondaryColor
    });
  };

  if (isLoading) return <div className="p-20 text-center font-bold">Loading Studio...</div>;

  return (
    <div className="flex h-[calc(100vh-250px)] overflow-hidden bg-[#0B2641] rounded-2xl border border-white/10">
      {/* Left: Controls */}
      <div className="w-[400px] border-r border-white/10 overflow-y-auto custom-scrollbar">
        <DesignControls 
          primaryColor={primaryColor}
          setPrimaryColor={(c) => { setPrimaryColor(c); handleSaveBranding({ primaryColor: c }); }}
          secondaryColor={secondaryColor}
          setSecondaryColor={(c) => { setSecondaryColor(c); handleSaveBranding({ secondaryColor: c }); }}
          cornerRadius={cornerRadius}
          setCornerRadius={(r) => { setCornerRadius(r); handleSaveBranding({ cornerRadius: r }); }}
          headingFont={headingFont}
          setHeadingFont={(f) => { setHeadingFont(f); handleSaveBranding({ headingFont: f }); }}
          bodyFont={bodyFont}
          setBodyFont={(f) => { setBodyFont(f); handleSaveBranding({ bodyFont: f }); }}
          backgroundStyle={backgroundStyle}
          setBackgroundStyle={(s) => { setBackgroundStyle(s); handleSaveBranding({ backgroundStyle: s }); }}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={(t) => { setSelectedTemplate(t); handleSaveBranding({ selectedTemplate: t }); }}
        />
      </div>

      {/* Right: Live Preview */}
      <div className="flex-1 bg-[#0F172A] overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-[900px]">
          <LivePreview 
             primaryColor={primaryColor}
             cornerRadius={cornerRadius}
             headingFont={headingFont}
             bodyFont={bodyFont}
             template={selectedTemplate}
          />
        </div>
      </div>
    </div>
  );
}
