import { Check, Eye, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: 'checkout' | 'preview' | 'whatsapp';
  className?: string;
}

export const ProgressIndicator = ({ currentStep, className }: ProgressIndicatorProps) => {
  const steps = [
    { id: 'checkout', label: 'Checkout', icon: Check },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="relative flex items-center justify-between">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ 
              width: currentStep === 'checkout' ? '0%' : 
                     currentStep === 'preview' ? '50%' : '100%' 
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex flex-col items-center">
              {/* Step Circle */}
              <div 
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  "bg-background shadow-[var(--shadow-elevation-2)]",
                  status === 'completed' && "bg-primary border-primary text-primary-foreground",
                  status === 'current' && "border-primary bg-primary/10 text-primary animate-pulse",
                  status === 'pending' && "border-muted-foreground/30 text-muted-foreground"
                )}
                style={{
                  animation: status === 'current' ? 'fade-in 0.5s ease-out' : undefined
                }}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Step Label */}
              <span 
                className={cn(
                  "text-xs font-medium mt-2 transition-colors duration-300",
                  status === 'completed' && "text-primary",
                  status === 'current' && "text-primary font-semibold",
                  status === 'pending' && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};