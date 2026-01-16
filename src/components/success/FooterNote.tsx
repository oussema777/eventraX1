import { Info } from 'lucide-react';

export default function FooterNote() {
  return (
    <div 
      className="w-full max-w-[600px] rounded-lg p-4 mt-8 flex items-start gap-3"
      style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)' }}
    >
      <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
      <p 
        className="text-xs"
        style={{ color: '#FFFFFF', lineHeight: 1.5 }}
      >
        You&apos;ll receive email notifications when attendees register. You can manage all notifications in Settings.
      </p>
    </div>
  );
}