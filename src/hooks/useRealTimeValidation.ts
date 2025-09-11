import { useState, useEffect, useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  ValidationResult,
  AsyncValidationResult,
  ValidatorFunction,
  ValidationRule,
  validateEmailDomain,
  validatePostalCode,
  validatePhoneNumber,
  validateCreditCard,
  validatePasswordStrength,
  validators
} from '../utils/validators';

export interface FieldValidationState {
  isValid: boolean;
  isValidating: boolean;
  error?: string;
  suggestion?: string;
  lastValidated?: Date;
}

export interface ValidationConfig {
  debounceMs?: number;
  enableCaching?: boolean;
  enableOfflineMode?: boolean;
  rateLimitMs?: number;
  maxRetries?: number;
}

export interface FieldConfig {
  rules: ValidationRule[];
  realTime?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  dependencies?: string[];
}

interface ValidationCache {
  [key: string]: {
    result: ValidationResult;
    timestamp: number;
    value: string;
  };
}

interface RateLimitState {
  [fieldName: string]: {
    lastCall: number;
    callCount: number;
  };
}

const DEFAULT_CONFIG: ValidationConfig = {
  debounceMs: 300,
  enableCaching: true,
  enableOfflineMode: true,
  rateLimitMs: 1000,
  maxRetries: 3
};

export const useRealTimeValidation = (
  fieldsConfig: Record<string, FieldConfig>,
  config: ValidationConfig = {}
) => {
  const formContext = useFormContext();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [validationStates, setValidationStates] = useState<Record<string, FieldValidationState>>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const validationCache = useRef<ValidationCache>({});
  const rateLimitState = useRef<RateLimitState>({});
  const retryAttempts = useRef<Record<string, number>>({});

  // Initialize validation states
  useEffect(() => {
    const initialStates: Record<string, FieldValidationState> = {};
    Object.keys(fieldsConfig).forEach(fieldName => {
      initialStates[fieldName] = {
        isValid: true,
        isValidating: false
      };
    });
    setValidationStates(initialStates);
  }, [fieldsConfig]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Rate limiting check
  const isRateLimited = useCallback((fieldName: string): boolean => {
    if (!mergedConfig.rateLimitMs) return false;
    
    const now = Date.now();
    const state = rateLimitState.current[fieldName];
    
    if (!state) {
      rateLimitState.current[fieldName] = { lastCall: now, callCount: 1 };
      return false;
    }
    
    if (now - state.lastCall < mergedConfig.rateLimitMs!) {
      state.callCount++;
      return state.callCount > 5; // Max 5 calls per rate limit window
    }
    
    rateLimitState.current[fieldName] = { lastCall: now, callCount: 1 };
    return false;
  }, [mergedConfig.rateLimitMs]);

  // Cache management
  const getCachedResult = useCallback((fieldName: string, value: string): ValidationResult | null => {
    if (!mergedConfig.enableCaching) return null;
    
    const cacheKey = `${fieldName}_${value}`;
    const cached = validationCache.current[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minute cache
      return cached.result;
    }
    
    return null;
  }, [mergedConfig.enableCaching]);

  const setCachedResult = useCallback((fieldName: string, value: string, result: ValidationResult) => {
    if (!mergedConfig.enableCaching) return;
    
    const cacheKey = `${fieldName}_${value}`;
    validationCache.current[cacheKey] = {
      result,
      timestamp: Date.now(),
      value
    };
  }, [mergedConfig.enableCaching]);

  // Execute validation rules
  const executeValidation = useCallback(async (
    fieldName: string,
    value: string,
    rules: ValidationRule[]
  ): Promise<ValidationResult> => {
    // Check cache first
    const cachedResult = getCachedResult(fieldName, value);
    if (cachedResult) {
      return cachedResult;
    }

    // Check rate limiting
    if (isRateLimited(fieldName)) {
      return {
        isValid: false,
        error: 'Validation rate limit exceeded. Please wait.'
      };
    }

    // Execute synchronous validations first
    for (const rule of rules.filter(r => !r.async)) {
      try {
        const result = await rule.validator(value);
        if (!result.isValid) {
          setCachedResult(fieldName, value, result);
          return result;
        }
      } catch (error) {
        return {
          isValid: false,
          error: rule.message || 'Validation failed'
        };
      }
    }

    // Execute asynchronous validations
    const asyncRules = rules.filter(r => r.async);
    if (asyncRules.length === 0) {
      const result = { isValid: true };
      setCachedResult(fieldName, value, result);
      return result;
    }

    // Handle offline mode
    if (!isOnline && mergedConfig.enableOfflineMode) {
      return {
        isValid: true,
        suggestion: 'Validation will complete when online'
      };
    }

    for (const rule of asyncRules) {
      try {
        const result = await rule.validator(value);
        setCachedResult(fieldName, value, result);
        
        if (!result.isValid) {
          return result;
        }
      } catch (error) {
        // Retry logic
        const currentRetries = retryAttempts.current[fieldName] || 0;
        if (currentRetries < mergedConfig.maxRetries!) {
          retryAttempts.current[fieldName] = currentRetries + 1;
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, currentRetries) * 1000));
          return executeValidation(fieldName, value, [rule]);
        }
        
        return {
          isValid: false,
          error: rule.message || 'Validation service unavailable'
        };
      }
    }

    const result = { isValid: true };
    setCachedResult(fieldName, value, result);
    return result;
  }, [getCachedResult, setCachedResult, isRateLimited, isOnline, mergedConfig]);

  // Debounced validation
  const validateField = useCallback((fieldName: string, value: string) => {
    const fieldConfig = fieldsConfig[fieldName];
    if (!fieldConfig) return;

    // Clear existing timeout
    if (timeoutRefs.current[fieldName]) {
      clearTimeout(timeoutRefs.current[fieldName]);
    }

    // Set validation state to loading
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isValidating: true
      }
    }));

    // Debounced validation
    timeoutRefs.current[fieldName] = setTimeout(async () => {
      try {
        const result = await executeValidation(fieldName, value, fieldConfig.rules);
        
        setValidationStates(prev => ({
          ...prev,
          [fieldName]: {
            isValid: result.isValid,
            isValidating: false,
            error: result.error,
            suggestion: result.suggestion,
            lastValidated: new Date()
          }
        }));

        // Reset retry attempts on success
        if (result.isValid) {
          retryAttempts.current[fieldName] = 0;
        }
      } catch (error) {
        setValidationStates(prev => ({
          ...prev,
          [fieldName]: {
            isValid: false,
            isValidating: false,
            error: 'Validation failed',
            lastValidated: new Date()
          }
        }));
      }
    }, mergedConfig.debounceMs);
  }, [fieldsConfig, executeValidation, mergedConfig.debounceMs]);

  // Validate all fields
  const validateAllFields = useCallback(async (): Promise<Record<string, FieldValidationState>> => {
    const results: Record<string, FieldValidationState> = {};
    
    for (const [fieldName, fieldConfig] of Object.entries(fieldsConfig)) {
      const value = formContext?.getValues(fieldName) || '';
      
      try {
        const result = await executeValidation(fieldName, value, fieldConfig.rules);
        results[fieldName] = {
          isValid: result.isValid,
          isValidating: false,
          error: result.error,
          suggestion: result.suggestion,
          lastValidated: new Date()
        };
      } catch (error) {
        results[fieldName] = {
          isValid: false,
          isValidating: false,
          error: 'Validation failed',
          lastValidated: new Date()
        };
      }
    }
    
    setValidationStates(results);
    return results;
  }, [fieldsConfig, formContext, executeValidation]);

  // Clear validation for a field
  const clearValidation = useCallback((fieldName: string) => {
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: {
        isValid: true,
        isValidating: false,
        error: undefined,
        suggestion: undefined
      }
    }));

    if (timeoutRefs.current[fieldName]) {
      clearTimeout(timeoutRefs.current[fieldName]);
      delete timeoutRefs.current[fieldName];
    }
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Check if form is valid
  const isFormValid = useCallback((): boolean => {
    return Object.values(validationStates).every(state => state.isValid && !state.isValidating);
  }, [validationStates]);

  // Get validation state for a field
  const getFieldValidation = useCallback((fieldName: string): FieldValidationState => {
    return validationStates[fieldName] || {
      isValid: true,
      isValidating: false
    };
  }, [validationStates]);

  return {
    validateField,
    validateAllFields,
    clearValidation,
    isFormValid,
    getFieldValidation,
    validationStates,
    isOnline,
    
    // Pre-configured validators for common use cases
    validators: {
      email: (value: string) => validateField('email', value),
      emailWithDomain: (value: string) => {
        fieldsConfig.email = {
          rules: [
            { validator: validators.required },
            { validator: validators.email },
            { validator: validateEmailDomain, async: true }
          ],
          realTime: true
        };
        validateField('email', value);
      },
      
      postalCode: (value: string, countryCode: string) => {
        fieldsConfig.postalCode = {
          rules: [
            { validator: validators.required },
            { validator: (val) => validatePostalCode(val, countryCode) }
          ],
          realTime: true
        };
        validateField('postalCode', value);
      },
      
      phoneNumber: (value: string, countryCode?: string) => {
        fieldsConfig.phoneNumber = {
          rules: [
            { validator: validators.required },
            { validator: (val) => validatePhoneNumber(val, countryCode) }
          ],
          realTime: true
        };
        validateField('phoneNumber', value);
      },
      
      creditCard: (value: string) => {
        fieldsConfig.creditCard = {
          rules: [
            { validator: validators.required },
            { validator: validateCreditCard }
          ],
          realTime: true
        };
        validateField('creditCard', value);
      },
      
      password: (value: string) => {
        fieldsConfig.password = {
          rules: [
            { validator: validators.required },
            { validator: validatePasswordStrength }
          ],
          realTime: true
        };
        validateField('password', value);
      }
    }
  };
};

// Pre-built field configurations
export const commonFieldConfigs = {
  email: {
    rules: [
      { validator: validators.required },
      { validator: validators.email },
      { validator: validateEmailDomain, async: true }
    ],
    realTime: true,
    validateOnBlur: true
  },
  
  phone: {
    rules: [
      { validator: validators.required },
      { validator: (value: string) => validatePhoneNumber(value) }
    ],
    realTime: true,
    validateOnBlur: true
  },
  
  postalCode: {
    rules: [
      { validator: validators.required },
      { validator: (value: string, country: string) => validatePostalCode(value, country) }
    ],
    realTime: true,
    validateOnBlur: true,
    dependencies: ['country']
  },
  
  creditCard: {
    rules: [
      { validator: validators.required },
      { validator: validateCreditCard }
    ],
    realTime: true,
    validateOnChange: true
  },
  
  password: {
    rules: [
      { validator: validators.required },
      { validator: validatePasswordStrength }
    ],
    realTime: true,
    validateOnChange: true
  },
  
  confirmPassword: {
    rules: [
      { validator: validators.required },
      { 
        validator: (value: string, originalPassword: string) => ({
          isValid: value === originalPassword,
          error: value === originalPassword ? undefined : 'Passwords do not match'
        })
      }
    ],
    realTime: true,
    validateOnChange: true,
    dependencies: ['password']
  }
};