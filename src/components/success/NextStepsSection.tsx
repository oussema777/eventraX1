import { Share2, BarChart3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NextStepsSection() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Share2,
      iconBg: 'rgba(6, 132, 245, 0.1)',
      iconColor: 'var(--primary)',
      title: 'Share Your Event',
      description: 'Spread the word on social media and email',
      buttonText: 'Share Now',
      buttonStyle: 'primary' as const,
      onClick: () => {
        // Could open share modal
        console.log('Share event');
      }
    },
    {
      icon: BarChart3,
      iconBg: '#D1FAE5',
      iconColor: 'var(--success)',
      title: 'Monitor Performance',
      description: 'Track registrations and engagement',
      buttonText: 'View Analytics',
      buttonStyle: 'secondary' as const,
      onClick: () => navigate('/event/saas-summit-2024')
    },
    {
      icon: Users,
      iconBg: '#E9D5FF',
      iconColor: '#9333EA',
      title: 'Review Registrations',
      description: 'See who signed up and manage attendees',
      buttonText: 'View Registrations',
      buttonStyle: 'secondary' as const,
      onClick: () => navigate('/event/saas-summit-2024?tab=attendees')
    }
  ];

  return (
    <div className="w-full mt-12">
      <h2 
        className="text-3xl mb-6 text-center"
        style={{ fontWeight: 600, color: '#FFFFFF' }}
      >
        What&apos;s Next?
      </h2>

      <div className="grid grid-cols-3 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          
          return (
            <div
              key={index}
              className="rounded-xl p-6 border flex flex-col"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
            >
              {/* Icon */}
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: step.iconBg }}
              >
                <Icon size={32} style={{ color: step.iconColor }} />
              </div>

              {/* Title */}
              <h3 
                className="text-lg mb-2"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p 
                className="text-sm mb-6 flex-1"
                style={{ color: '#6B7280' }}
              >
                {step.description}
              </p>

              {/* Button */}
              <button
                className="w-full h-11 px-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: step.buttonStyle === 'primary' ? 'var(--primary)' : 'transparent',
                  color: step.buttonStyle === 'primary' ? 'white' : '#0B2641',
                  border: step.buttonStyle === 'secondary' ? '1px solid #E5E7EB' : 'none',
                  fontWeight: 600
                }}
                onClick={step.onClick}
              >
                {step.buttonText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}