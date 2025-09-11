import { useEffect, useCallback, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { encryptionService, SecurityLevel, FIELD_SECURITY_LEVELS, EncryptedData } from '@/utils/encryption';
import { useDebounce } from '@/hooks/useDebounce';

interface UseFormPersistenceOptions {
  storageKey: string;
  watch: any[];
  form: UseFormReturn<any>;
  enabled?: boolean;
  formType?: string;
  autoCleanup?: boolean;
  expirationHours?: number;
  onDataFound?: (data: any) => void;
  encryptSensitiveFields?: boolean;
}

interface SavedFormMetadata {
  timestamp: number;
  fieldCount: number;
  secureFields: number;
  formType: string;
  hasEncryptedData: boolean;
}

interface FormFieldState {
  [fieldName: string]: {
    hasSavedData: boolean;
    securityLevel: SecurityLevel;
    lastSaved: number;
  };
}

export const useFormPersistence = ({ 
  storageKey, 
  watch, 
  form, 
  enabled = true,
  formType = 'form',
  autoCleanup = true,
  expirationHours = 24,
  onDataFound,
  encryptSensitiveFields = true
}: UseFormPersistenceOptions) => {
  const [fieldStates, setFieldStates] = useState<FormFieldState>({});
  const [isRecoveryAvailable, setIsRecoveryAvailable] = useState(false);
  const [savedMetadata, setSavedMetadata] = useState<SavedFormMetadata | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedData = useRef<any>(null);

  // Debounced save function (500ms delay)
  const debouncedSave = useCallback((data: any) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        await saveFormData(data);
      } catch (error) {
        console.error('Failed to save form data:', error);
      }
    }, 500);
  }, []);

  // Determine security level for a field
  const getFieldSecurityLevel = (fieldName: string): SecurityLevel => {
    if (!encryptSensitiveFields) return SecurityLevel.NONE;
    
    // Check exact match first
    if (FIELD_SECURITY_LEVELS[fieldName]) {
      return FIELD_SECURITY_LEVELS[fieldName];
    }
    
    // Check partial matches for nested fields
    for (const [pattern, level] of Object.entries(FIELD_SECURITY_LEVELS)) {
      if (fieldName.toLowerCase().includes(pattern.toLowerCase())) {
        return level;
      }
    }
    
    return SecurityLevel.LOW;
  };

  // Save form data with selective encryption
  const saveFormData = async (data: any) => {
    if (!data || typeof data !== 'object') return;

    const timestamp = Date.now();
    const encryptedFields: Record<string, EncryptedData> = {};
    const plainFields: Record<string, any> = {};
    const fieldStates: FormFieldState = {};
    let secureFieldCount = 0;

    // Process each field based on security level
    for (const [fieldName, value] of Object.entries(data)) {
      if (value === undefined || value === null || value === '') continue;

      const securityLevel = getFieldSecurityLevel(fieldName);
      
      fieldStates[fieldName] = {
        hasSavedData: true,
        securityLevel,
        lastSaved: timestamp
      };

      if (securityLevel === SecurityLevel.NONE) {
        plainFields[fieldName] = value;
      } else {
        try {
          encryptedFields[fieldName] = await encryptionService.encrypt(
            value,
            securityLevel,
            { 
              compress: typeof value === 'string' && value.length > 100,
              expirationHours
            }
          );
          secureFieldCount++;
        } catch (error) {
          console.error(`Failed to encrypt field ${fieldName}:`, error);
          plainFields[fieldName] = value; // Fallback to plain storage
        }
      }
    }

    // Create storage structure
    const storageData = {
      timestamp,
      formType,
      plainFields,
      encryptedFields,
      fieldCount: Object.keys(data).length,
      secureFields: secureFieldCount,
      hasEncryptedData: secureFieldCount > 0
    };

    // Save to localStorage
    localStorage.setItem(`_form_${storageKey}`, JSON.stringify(storageData));
    
    // Update metadata
    setSavedMetadata({
      timestamp,
      fieldCount: storageData.fieldCount,
      secureFields: secureFieldCount,
      formType,
      hasEncryptedData: secureFieldCount > 0
    });

    setFieldStates(fieldStates);
    lastSavedData.current = data;
  };

  // Load and decrypt form data
  const loadFormData = async (): Promise<any | null> => {
    try {
      const saved = localStorage.getItem(`_form_${storageKey}`);
      if (!saved) return null;

      const storageData = JSON.parse(saved);
      
      // Check expiration
      if (expirationHours && storageData.timestamp) {
        const expirationTime = storageData.timestamp + (expirationHours * 60 * 60 * 1000);
        if (Date.now() > expirationTime) {
          clearSavedData();
          return null;
        }
      }

      const restoredData: any = { ...storageData.plainFields };
      const fieldStates: FormFieldState = {};

      // Decrypt encrypted fields
      if (storageData.encryptedFields) {
        for (const [fieldName, encryptedData] of Object.entries(storageData.encryptedFields)) {
          try {
            const securityLevel = getFieldSecurityLevel(fieldName);
            const decryptedValue = await encryptionService.decrypt(
              encryptedData as EncryptedData,
              securityLevel
            );
            restoredData[fieldName] = decryptedValue;
            
            fieldStates[fieldName] = {
              hasSavedData: true,
              securityLevel,
              lastSaved: storageData.timestamp
            };
          } catch (error) {
            console.error(`Failed to decrypt field ${fieldName}:`, error);
          }
        }
      }

      // Add plain fields to field states
      Object.keys(storageData.plainFields || {}).forEach(fieldName => {
        fieldStates[fieldName] = {
          hasSavedData: true,
          securityLevel: SecurityLevel.NONE,
          lastSaved: storageData.timestamp
        };
      });

      setFieldStates(fieldStates);
      setSavedMetadata({
        timestamp: storageData.timestamp,
        fieldCount: storageData.fieldCount || Object.keys(restoredData).length,
        secureFields: storageData.secureFields || 0,
        formType: storageData.formType || formType,
        hasEncryptedData: storageData.hasEncryptedData || false
      });

      return restoredData;
    } catch (error) {
      console.error('Failed to load form data:', error);
      return null;
    }
  };

  // Check for saved data on mount
  useEffect(() => {
    if (!enabled) return;

    const checkForSavedData = async () => {
      const savedData = await loadFormData();
      if (savedData && Object.keys(savedData).length > 0) {
        setIsRecoveryAvailable(true);
        onDataFound?.(savedData);
      }
    };

    checkForSavedData();
  }, [storageKey, enabled]);

  // Watch for form changes and save with debouncing
  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch((data) => {
      // Skip if data hasn't changed
      if (JSON.stringify(data) === JSON.stringify(lastSavedData.current)) {
        return;
      }

      debouncedSave(data);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [form, enabled, debouncedSave]);

  // Auto-cleanup on successful form submission
  useEffect(() => {
    if (!autoCleanup) return;

    const handleBeforeUnload = () => {
      // Clear sensitive data when user leaves
      if (savedMetadata?.hasEncryptedData) {
        encryptionService.clearKeys();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoCleanup, savedMetadata]);

  // Restore saved data to form
  const restoreData = useCallback(async () => {
    const savedData = await loadFormData();
    if (savedData) {
      Object.keys(savedData).forEach(key => {
        form.setValue(key, savedData[key]);
      });
      setIsRecoveryAvailable(false);
      return true;
    }
    return false;
  }, [form]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(`_form_${storageKey}`);
      setFieldStates({});
      setSavedMetadata(null);
      setIsRecoveryAvailable(false);
      lastSavedData.current = null;
      
      // Clear encryption keys if this was encrypted data
      if (savedMetadata?.hasEncryptedData) {
        encryptionService.clearKeys();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear form data:', error);
      return false;
    }
  }, [storageKey, savedMetadata]);

  // Force save current form data
  const forceSave = useCallback(async () => {
    const currentData = form.getValues();
    await saveFormData(currentData);
  }, [form]);

  return {
    // Backward compatibility
    clearSavedData,
    
    // New features
    restoreData,
    forceSave,
    isRecoveryAvailable,
    savedMetadata,
    fieldStates,
    
    // Form field indicators
    getFieldIndicator: (fieldName: string) => fieldStates[fieldName] || null,
    
    // Manual control
    setRecoveryAvailable: setIsRecoveryAvailable
  };
};