import { Check, FileText, Palette, Users, Rocket } from 'lucide-react';
import { useState } from 'react';

export function StepperComponent() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { id: 0, label: 'Details', icon: FileText },
    { id: 1, label: 'Design', icon: Palette },
    { id: 2, label: 'Registration', icon: Users },
    { id: 3, label: 'Launch', icon: Rocket }
  ];

  const getStepStatus = (stepId: number) => {
    if (stepId < activeStep) return 'completed';
    if (stepId === activeStep) return 'active';
    return 'upcoming';
  };

  return (
    <section id="stepper">
      <div className="mb-6">
        <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
          Stepper Component
        </h3>
        <p style={{ color: 'var(--muted-foreground)' }}>
          4-step progress indicator for event creation flow
        </p>
      </div>

      <div className="space-y-8">
        {/* Interactive Demo */}
        <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
          <div className="mb-6">
            <p className="text-sm font-medium mb-4">Interactive Demo</p>
            <div className="flex gap-2">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className="px-3 py-1 text-xs rounded-md transition-colors"
                  style={{
                    backgroundColor: activeStep === step.id ? 'var(--primary)' : 'var(--gray-200)',
                    color: activeStep === step.id ? 'var(--primary-foreground)' : 'var(--foreground)'
                  }}
                >
                  Step {step.id + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Horizontal Stepper */}
          <div className="relative">
            <div className="flex items-start justify-between">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1 relative">
                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div
                        className="absolute top-5 left-1/2 h-0.5 transition-all duration-500"
                        style={{
                          width: 'calc(100% - 40px)',
                          marginLeft: '20px',
                          backgroundColor: status === 'completed' ? 'var(--success)' : 'var(--gray-300)'
                        }}
                      />
                    )}

                    {/* Step Circle */}
                    <div className="relative z-10 mb-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          status === 'active' ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor:
                            status === 'completed'
                              ? 'var(--success)'
                              : status === 'active'
                              ? 'var(--primary)'
                              : 'var(--gray-300)',
                          color: status === 'upcoming' ? 'var(--gray-600)' : '#ffffff',
                          boxShadow: status === 'active' ? '0 0 0 4px rgba(0, 212, 212, 0.2)' : 'none'
                        }}
                      >
                        {status === 'completed' ? (
                          <Check size={20} strokeWidth={3} />
                        ) : (
                          <Icon size={20} />
                        )}
                      </div>
                    </div>

                    {/* Step Label */}
                    <div className="text-center">
                      <p
                        className="text-sm transition-colors duration-300"
                        style={{
                          fontWeight: status === 'active' ? 600 : 500,
                          color:
                            status === 'completed' || status === 'active'
                              ? 'var(--foreground)'
                              : 'var(--muted-foreground)'
                        }}
                      >
                        {step.label}
                      </p>
                      {status === 'active' && (
                        <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>
                          In Progress
                        </p>
                      )}
                      {status === 'completed' && (
                        <p className="text-xs mt-1" style={{ color: 'var(--success)' }}>
                          Complete
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* All States Example */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Step States
          </h4>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Completed State */}
            <div className="bg-white rounded-xl p-6 shadow-light border border-[var(--border)]">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'var(--success)', color: '#ffffff' }}
                >
                  <Check size={24} strokeWidth={3} />
                </div>
                <p className="text-sm font-semibold mb-1">Details</p>
                <p className="text-xs" style={{ color: 'var(--success)' }}>
                  Completed
                </p>
              </div>
            </div>

            {/* Active State */}
            <div className="bg-white rounded-xl p-6 shadow-light border border-[var(--border)]">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 animate-pulse"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    boxShadow: '0 0 0 4px rgba(0, 212, 212, 0.2)'
                  }}
                >
                  <Palette size={24} />
                </div>
                <p className="text-sm font-semibold mb-1">Design</p>
                <p className="text-xs" style={{ color: 'var(--primary)' }}>
                  In Progress
                </p>
              </div>
            </div>

            {/* Upcoming State */}
            <div className="bg-white rounded-xl p-6 shadow-light border border-[var(--border)]">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'var(--gray-300)', color: 'var(--gray-600)' }}
                >
                  <Users size={24} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Registration
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Upcoming
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Vertical Stepper */}
        <div>
          <h4 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            Vertical Stepper (Compact)
          </h4>

          <div className="bg-white rounded-xl p-8 shadow-light border border-[var(--border)]">
            <div className="max-w-md">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex gap-4 relative">
                    {/* Vertical Line */}
                    {index < steps.length - 1 && (
                      <div
                        className="absolute left-4 top-10 w-0.5 h-12 transition-all duration-500"
                        style={{
                          backgroundColor: status === 'completed' ? 'var(--success)' : 'var(--gray-300)'
                        }}
                      />
                    )}

                    {/* Step Circle */}
                    <div className="relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                          status === 'active' ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor:
                            status === 'completed'
                              ? 'var(--success)'
                              : status === 'active'
                              ? 'var(--primary)'
                              : 'var(--gray-300)',
                          color: status === 'upcoming' ? 'var(--gray-600)' : '#ffffff',
                          boxShadow: status === 'active' ? '0 0 0 3px rgba(0, 212, 212, 0.2)' : 'none'
                        }}
                      >
                        {status === 'completed' ? (
                          <Check size={16} strokeWidth={3} />
                        ) : (
                          <Icon size={16} />
                        )}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="pb-8 flex-1">
                      <p
                        className="text-sm mb-1"
                        style={{
                          fontWeight: status === 'active' ? 600 : 500,
                          color:
                            status === 'completed' || status === 'active'
                              ? 'var(--foreground)'
                              : 'var(--muted-foreground)'
                        }}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {status === 'completed' && 'Step completed successfully'}
                        {status === 'active' && 'Currently working on this step'}
                        {status === 'upcoming' && 'Not started yet'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
