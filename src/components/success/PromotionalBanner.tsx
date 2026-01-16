import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';

export default function PromotionalBanner() {
  const navigate = useNavigate();
  const features = ['Email Campaigns', 'Sponsored Listing', 'Priority Support'];

  return (
    <div 
      className="w-full rounded-xl p-12 mt-12 flex items-center justify-between"
      style={{
        background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE9CC 100%)'
      }}
    >
      {/* Left Side */}
      <div className="flex-1">
        <h3 
          className="text-2xl mb-2"
          style={{ fontWeight: 600, color: '#0B2641' }}
        >
          Boost Your Event
        </h3>
        <p 
          className="text-base mb-4"
          style={{ color: '#6B7280' }}
        >
          Upgrade to Pro for advanced marketing tools
        </p>

        {/* Feature Chips */}
        <div className="flex items-center gap-2">
          {features.map((feature) => (
            <span
              key={feature}
              className="px-3 py-1.5 rounded-full text-sm"
              style={{
                backgroundColor: 'white',
                color: '#0B2641',
                fontWeight: 500,
                border: '1px solid #E5E7EB'
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-col items-end gap-2">
        <button
          className="h-12 px-8 rounded-xl flex items-center gap-2 transition-transform hover:scale-105 text-white"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(255, 165, 0, 0.3)'
          }}
          onClick={() => navigate('/pricing')}
        >
          <Crown size={20} />
          Upgrade to Pro
        </button>
        <span 
          className="text-sm"
          style={{ color: '#6B7280' }}
        >
          Starting at $49/month
        </span>
      </div>
    </div>
  );
}
