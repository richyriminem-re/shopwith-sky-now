import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const PhoneInput = ({ value, onChange, error, disabled = false }: PhoneInputProps) => {
  const countryCode = '+234';
  const [phoneNumber, setPhoneNumber] = useState('');

  // Parse and format existing value on mount
  useEffect(() => {
    if (value) {
      let phoneDigits = value;
      if (value.startsWith('+234')) {
        phoneDigits = value.substring(4);
      }
      setPhoneNumber(formatPhoneNumber(phoneDigits));
    }
  }, [value]);

  const formatPhoneNumber = (input: string) => {
    // Remove non-digits
    let digits = input.replace(/\D/g, '');
    
    // Remove leading 0 only when followed by another digit (for display)
    if (digits.length > 1 && digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    
    // Format as XXX XXX XXXX (10 digits max)
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (input: string) => {
    const formatted = formatPhoneNumber(input);
    setPhoneNumber(formatted);
    // Strip all non-digits, then remove leading 0 if present
    const cleanDigits = input.replace(/\D/g, '').replace(/^0/, '');
    
    // Limit to 10 digits maximum
    const limitedDigits = cleanDigits.slice(0, 10);
    
    // Only pass complete 10-digit numbers as valid
    if (limitedDigits.length === 10) {
      onChange(`${countryCode}${limitedDigits}`);
    } else if (limitedDigits.length === 0) {
      onChange('');
    } else {
      // Keep partial number for display but don't trigger onChange with incomplete number
      onChange('');
    }
  };

  return (
    <FormItem>
      <FormLabel>Phone Number (+234)</FormLabel>
      <FormControl>
        <Input
          type="tel"
          placeholder="801 234 5678"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className={`neu-input ${disabled ? 'bg-muted/50 pr-10 sm:pr-12' : ''}`}
          maxLength={13}
          disabled={disabled}
        />
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};