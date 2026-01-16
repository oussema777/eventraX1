import { Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';

interface ProgressStepperProps {
  currentStep: number;
}

export default function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const stepBase = eventId ? `/create/details/${eventId}` : ROUTES.WIZARD_STEP_1;
  const routes = {
    1: stepBase,
    2: eventId ? `/create/design/${eventId}` : ROUTES.WIZARD_STEP_1,
    3: eventId ? `/create/registration/${eventId}` : ROUTES.WIZARD_STEP_1,
    4: eventId ? `/create/launch/${eventId}` : ROUTES.WIZARD_STEP_1
  };

  const steps = [
    { number: 1, label: 'Details', route: routes[1] },
    { number: 2, label: 'Design Studio', route: routes[2] },
    { number: 3, label: 'Registration', route: routes[3] },
    { number: 4, label: 'Launch', route: routes[4] }
  ];

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'upcoming';
  };

  const handleStepClick = (route: string) => {
    navigate(route);
  };

  return (
    <div 
      className="w-full border-b"
      style={{ 
        borderColor: 'var(--border)',
        padding: '32px 40px',
        backgroundColor: 'var(--card)'
      }}
    >
      <div className="max-w-[800px] mx-auto">
        <div className="relative flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.number);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.number} className="flex-1 flex items-center">
                {/* Step Circle & Label */}
                <div className="relative flex flex-col items-center">
                  {/* Circle - Now clickable */}
                  <button
                    onClick={() => handleStepClick(step.route)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 cursor-pointer hover:scale-110"
                    style={{
                      backgroundColor: status === 'active' || status === 'completed' 
                        ? 'var(--primary)' 
                        : 'transparent',
                      border: status === 'upcoming' ? '2px solid var(--border)' : 'none',
                      boxShadow: status === 'active' 
                        ? '0 0 0 4px rgba(6, 132, 245, 0.2)' 
                        : 'none',
                      animation: status === 'active' ? 'pulse 2s infinite' : 'none'
                    }}
                  >
                    {status === 'completed' ? (
                      <Check size={20} style={{ color: 'white' }} />
                    ) : (
                      <span
                        className="text-lg"
                        style={{
                          fontWeight: 700,
                          color: status === 'upcoming' ? 'var(--muted-foreground)' : 'white'
                        }}
                      >
                        {step.number}
                      </span>
                    )}
                  </button>

                  {/* Label - Also clickable */}
                  <button
                    onClick={() => handleStepClick(step.route)}
                    className="mt-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      fontWeight: 500,
                      color: status === 'active' || status === 'completed'
                        ? 'var(--primary)'
                        : 'var(--muted-foreground)'
                    }}
                  >
                    {step.label}
                  </button>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div 
                    className="flex-1 h-0.5 mx-4 transition-all duration-300"
                    style={{
                      backgroundColor: step.number < currentStep 
                        ? 'var(--primary)' 
                        : 'var(--border)',
                      marginBottom: '28px'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(6, 132, 245, 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(6, 132, 245, 0.3);
          }
        }
      `}</style>
    </div>
  );
}
