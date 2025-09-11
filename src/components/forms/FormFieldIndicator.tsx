/**
 * Form Field Indicator Component
 * Shows visual indicators for fields with saved data
 */

import React from 'react';
import { Save, Shield, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SecurityLevel } from '@/utils/encryption';

interface FormFieldIndicatorProps {
  hasSavedData: boolean;
  securityLevel?: SecurityLevel;
  lastSaved?: number;
  className?: string;
}

export const FormFieldIndicator: React.FC<FormFieldIndicatorProps> = ({
  hasSavedData,
  securityLevel,
  lastSaved,
  className
}) => {
  if (!hasSavedData) return null;

  const getIcon = () => {
    if (securityLevel === SecurityLevel.HIGH || securityLevel === SecurityLevel.MEDIUM) {
      return <Shield className="h-3 w-3" />;
    }
    return <Save className="h-3 w-3" />;
  };

  const getTooltipContent = () => {
    let content = 'This field has saved data';
    
    if (securityLevel === SecurityLevel.HIGH) {
      content += ' (encrypted with high security)';
    } else if (securityLevel === SecurityLevel.MEDIUM) {
      content += ' (encrypted)';
    }
    
    if (lastSaved) {
      const timeAgo = new Date(lastSaved).toLocaleString();
      content += `\nLast saved: ${timeAgo}`;
    }
    
    return content;
  };

  const getIndicatorColor = () => {
    switch (securityLevel) {
      case SecurityLevel.HIGH:
        return 'text-red-500';
      case SecurityLevel.MEDIUM:
        return 'text-yellow-500';
      case SecurityLevel.LOW:
        return 'text-blue-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none',
            getIndicatorColor(),
            className
          )}>
            {getIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          <div className="whitespace-pre-line">
            {getTooltipContent()}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};