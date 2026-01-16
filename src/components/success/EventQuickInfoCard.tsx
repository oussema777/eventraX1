import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function EventQuickInfoCard() {
  const [copied, setCopied] = useState(false);
  const eventUrl = 'eventra.app/events/saas-summit-2024';

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${eventUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="w-full max-w-[600px] rounded-xl p-8 border mt-8"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="space-y-5">
        {/* Event URL */}
        <div>
          <div 
            className="text-sm mb-2"
            style={{ fontWeight: 500, color: '#6B7280' }}
          >
            Event Page
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="flex-1 px-5 py-3 rounded-full text-base"
              style={{ 
                backgroundColor: 'rgba(6, 132, 245, 0.1)',
                color: 'var(--primary)',
                fontWeight: 500
              }}
            >
              {eventUrl}
            </div>
            <button
              onClick={handleCopy}
              className="relative h-10 px-4 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#0B2641'
              }}
            >
              <Copy size={16} />
              {copied && (
                <div 
                  className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap"
                  style={{ backgroundColor: '#0B2641', color: 'white' }}
                >
                  Copied!
                </div>
              )}
            </button>
            <button
              className="h-10 px-4 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#0B2641'
              }}
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* Status */}
        <div>
          <div 
            className="text-sm mb-2"
            style={{ fontWeight: 500, color: '#6B7280' }}
          >
            Status
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
            <span className="text-sm" style={{ color: 'var(--success)', fontWeight: 600 }}>
              Live
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <div 
            className="text-sm mb-3"
            style={{ fontWeight: 500, color: '#6B7280' }}
          >
            Quick Stats
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div 
                className="text-base mb-1"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                8 Speakers
              </div>
              <div 
                className="text-sm"
                style={{ color: '#6B7280' }}
              >
                Confirmed
              </div>
            </div>
            <div>
              <div 
                className="text-base mb-1"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                12 Exhibitors
              </div>
              <div 
                className="text-sm"
                style={{ color: '#6B7280' }}
              >
                Registered
              </div>
            </div>
            <div>
              <div 
                className="text-base mb-1"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                15 Sessions
              </div>
              <div 
                className="text-sm"
                style={{ color: '#6B7280' }}
              >
                Scheduled
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}