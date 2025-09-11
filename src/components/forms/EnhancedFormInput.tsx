/**
 * Enhanced Form Input with Persistence Indicators
 * Wrapper for form inputs that shows persistence status
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { FormFieldIndicator } from './FormFieldIndicator';
import { cn } from '@/lib/utils';
import { SecurityLevel } from '@/utils/encryption';

interface EnhancedFormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fieldName: string;
  hasSavedData?: boolean;
  securityLevel?: SecurityLevel;
  lastSaved?: number;
  showIndicator?: boolean;
}

export const EnhancedFormInput: React.FC<EnhancedFormInputProps> = ({
  fieldName,
  hasSavedData = false,
  securityLevel,
  lastSaved,
  showIndicator = true,
  className,
  ...props
}) => {
  return (
    <div className="relative">
      <Input
        {...props}
        className={cn(
          hasSavedData && showIndicator && 'pr-8',
          className
        )}
      />
      {showIndicator && (
        <FormFieldIndicator
          hasSavedData={hasSavedData}
          securityLevel={securityLevel}
          lastSaved={lastSaved}
        />
      )}
    </div>
  );
};