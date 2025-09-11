import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export interface AsyncValidationResult extends ValidationResult {
  isLoading?: boolean;
}

// Email domain validation using DNS lookup simulation
export const validateEmailDomain = async (email: string): Promise<ValidationResult> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  const domain = email.split('@')[1];
  
  // Common invalid domains
  const invalidDomains = ['test.com', 'example.com', 'fake.com', 'invalid.com'];
  if (invalidDomains.includes(domain.toLowerCase())) {
    return { isValid: false, error: 'Please use a valid email domain' };
  }

  // Simulate DNS lookup with common domains
  const commonDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'aol.com', 'protonmail.com', 'live.com', 'msn.com', 'yandex.com'
  ];

  // Add artificial delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 200));

  if (commonDomains.includes(domain.toLowerCase())) {
    return { isValid: true };
  }

  // For other domains, assume valid (in real app, would do actual DNS lookup)
  return { isValid: true };
};

// Postal code validation by country
export const validatePostalCode = (postalCode: string, countryCode: string): ValidationResult => {
  const patterns: Record<string, { regex: RegExp; format: string }> = {
    US: { regex: /^\d{5}(-\d{4})?$/, format: '12345 or 12345-6789' },
    CA: { regex: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, format: 'A1A 1A1' },
    UK: { regex: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, format: 'SW1A 1AA' },
    DE: { regex: /^\d{5}$/, format: '12345' },
    FR: { regex: /^\d{5}$/, format: '12345' },
    AU: { regex: /^\d{4}$/, format: '1234' },
    JP: { regex: /^\d{3}-?\d{4}$/, format: '123-4567' },
    IN: { regex: /^\d{6}$/, format: '123456' },
    BR: { regex: /^\d{5}-?\d{3}$/, format: '12345-678' },
    MX: { regex: /^\d{5}$/, format: '12345' },
  };

  const pattern = patterns[countryCode.toUpperCase()];
  if (!pattern) {
    return { isValid: true }; // Assume valid for unsupported countries
  }

  if (pattern.regex.test(postalCode)) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: `Invalid postal code format`,
    suggestion: `Expected format: ${pattern.format}`
  };
};

// Phone number validation with international support
export const validatePhoneNumber = (phoneNumber: string, countryCode?: string): ValidationResult => {
  try {
    if (!phoneNumber.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Special validation for Nigerian numbers (+234)
    if (phoneNumber.startsWith('+234')) {
      const digits = phoneNumber.substring(4);
      if (digits.length !== 10) {
        return { 
          isValid: false, 
          error: 'Nigerian phone number must be exactly 10 digits after +234' 
        };
      }
      if (!/^\d{10}$/.test(digits)) {
        return { 
          isValid: false, 
          error: 'Phone number can only contain digits' 
        };
      }
      return { isValid: true };
    }

    // Parse phone number for other countries
    const parsedNumber = parsePhoneNumber(phoneNumber, countryCode as any);
    
    if (!parsedNumber) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    if (!isValidPhoneNumber(phoneNumber, countryCode as any)) {
      return {
        isValid: false,
        error: 'Invalid phone number',
        suggestion: `Try format: ${parsedNumber.formatInternational()}`
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid phone number format',
      suggestion: 'Include country code (e.g., +1 234 567 8900)'
    };
  }
};

// Credit card validation using Luhn algorithm
export const validateCreditCard = (cardNumber: string): ValidationResult => {
  // Remove spaces and non-digits
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { isValid: false, error: 'Card number must be 13-19 digits' };
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return { isValid: false, error: 'Invalid card number' };
  }

  // Detect card type
  const cardType = detectCardType(cleaned);
  return { isValid: true, suggestion: `${cardType} card detected` };
};

// Detect credit card type
const detectCardType = (cardNumber: string): string => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    dinersclub: /^3[0689]/,
    jcb: /^35/
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  return 'Unknown';
};

// Password strength validation
export const validatePasswordStrength = (password: string): ValidationResult & { strength: 'weak' | 'medium' | 'strong' } => {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters',
      strength: 'weak'
    };
  }

  let score = 0;
  const checks = {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noCommon: !isCommonPassword(password)
  };

  score = Object.values(checks).filter(Boolean).length;

  let strength: 'weak' | 'medium' | 'strong';
  let isValid = true;
  let error: string | undefined;

  if (score < 3) {
    strength = 'weak';
    isValid = false;
    error = 'Password is too weak';
  } else if (score < 5) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  const suggestions = [];
  if (!checks.length) suggestions.push('Use at least 12 characters');
  if (!checks.lowercase) suggestions.push('Add lowercase letters');
  if (!checks.uppercase) suggestions.push('Add uppercase letters');
  if (!checks.numbers) suggestions.push('Add numbers');
  if (!checks.symbols) suggestions.push('Add special characters');
  if (!checks.noCommon) suggestions.push('Avoid common passwords');

  return {
    isValid,
    error,
    strength,
    suggestion: suggestions.length > 0 ? suggestions.join(', ') : undefined
  };
};

// Check for common passwords
const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
};

// Generic validation function type
export type ValidatorFunction<T = string> = (value: T, ...args: any[]) => ValidationResult | Promise<ValidationResult>;

// Validation rule configuration
export interface ValidationRule {
  validator: ValidatorFunction;
  message?: string;
  async?: boolean;
  dependencies?: string[];
}

// Built-in validators
export const validators = {
  required: (value: any): ValidationResult => ({
    isValid: value !== undefined && value !== null && value !== '',
    error: value ? undefined : 'This field is required'
  }),
  
  minLength: (value: string, min: number): ValidationResult => ({
    isValid: value.length >= min,
    error: value.length >= min ? undefined : `Minimum ${min} characters required`
  }),
  
  maxLength: (value: string, max: number): ValidationResult => ({
    isValid: value.length <= max,
    error: value.length <= max ? undefined : `Maximum ${max} characters allowed`
  }),
  
  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(value),
      error: emailRegex.test(value) ? undefined : 'Invalid email format'
    };
  },
  
  url: (value: string): ValidationResult => {
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  },
  
  numeric: (value: string): ValidationResult => {
    const isNumeric = /^\d+$/.test(value);
    return {
      isValid: isNumeric,
      error: isNumeric ? undefined : 'Only numbers allowed'
    };
  },
  
  alphanumeric: (value: string): ValidationResult => {
    const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(value);
    return {
      isValid: isAlphanumeric,
      error: isAlphanumeric ? undefined : 'Only letters and numbers allowed'
    };
  }
};