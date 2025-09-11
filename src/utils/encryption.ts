/**
 * Browser-native encryption utilities with fallback support
 * Uses Web Crypto API with crypto-js fallback for older browsers
 */

import * as CryptoJS from 'crypto-js';
import * as LZString from 'lz-string';

export interface EncryptionOptions {
  compress?: boolean;
  expirationHours?: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  timestamp: number;
  expirationTime?: number;
  hmac: string;
  compressed: boolean;
}

// Security levels for different types of data
export enum SecurityLevel {
  NONE = 'none',        // No encryption (form state, preferences)
  LOW = 'low',          // Basic encryption (non-sensitive form data)
  MEDIUM = 'medium',    // Standard encryption (personal info)
  HIGH = 'high'         // Strong encryption (payment, addresses)
}

class EncryptionService {
  private static instance: EncryptionService;
  private isWebCryptoSupported: boolean;
  private masterKey: string | null = null;

  constructor() {
    this.isWebCryptoSupported = this.checkWebCryptoSupport();
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  private checkWebCryptoSupport(): boolean {
    return !!(window.crypto && window.crypto.subtle);
  }

  /**
   * Generate or retrieve master key for encryption
   */
  private async getMasterKey(): Promise<string> {
    if (this.masterKey) return this.masterKey;

    // Try to get existing key from sessionStorage
    const storedKey = sessionStorage.getItem('_mk');
    if (storedKey) {
      this.masterKey = storedKey;
      return storedKey;
    }

    // Generate new key from device fingerprint + session data
    const fingerprint = await this.generateDeviceFingerprint();
    const sessionId = this.getOrCreateSessionId();
    
    this.masterKey = CryptoJS.SHA256(fingerprint + sessionId).toString();
    
    // Store in session (not localStorage for security)
    sessionStorage.setItem('_mk', this.masterKey);
    
    return this.masterKey;
  }

  /**
   * Generate device fingerprint for key derivation
   */
  private async generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 10, 50);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 0
    ].join('|');

    return CryptoJS.SHA256(fingerprint).toString();
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('_sid');
    if (!sessionId) {
      sessionId = CryptoJS.lib.WordArray.random(16).toString();
      sessionStorage.setItem('_sid', sessionId);
    }
    return sessionId;
  }

  /**
   * Generate cryptographically secure random salt
   */
  private generateSalt(): string {
    if (this.isWebCryptoSupported) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    return CryptoJS.lib.WordArray.random(16).toString();
  }

  /**
   * Derive encryption key from master key and salt
   */
  private async deriveKey(salt: string, securityLevel: SecurityLevel): Promise<string> {
    const masterKey = await this.getMasterKey();
    const iterations = this.getIterations(securityLevel);
    
    return CryptoJS.PBKDF2(masterKey, salt, {
      keySize: 256 / 32,
      iterations
    }).toString();
  }

  /**
   * Get iteration count based on security level
   */
  private getIterations(securityLevel: SecurityLevel): number {
    switch (securityLevel) {
      case SecurityLevel.HIGH: return 100000;
      case SecurityLevel.MEDIUM: return 50000;
      case SecurityLevel.LOW: return 10000;
      default: return 1000;
    }
  }

  /**
   * Encrypt data with specified security level
   */
  async encrypt(
    data: any, 
    securityLevel: SecurityLevel = SecurityLevel.MEDIUM,
    options: EncryptionOptions = {}
  ): Promise<EncryptedData> {
    if (securityLevel === SecurityLevel.NONE) {
      throw new Error('Use regular storage for unencrypted data');
    }

    const salt = this.generateSalt();
    const key = await this.deriveKey(salt, securityLevel);
    const iv = CryptoJS.lib.WordArray.random(16).toString();
    
    let payload = JSON.stringify(data);
    
    // Compress if requested or data is large
    const shouldCompress = options.compress || payload.length > 1000;
    if (shouldCompress) {
      payload = LZString.compress(payload) || payload;
    }

    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(payload, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const timestamp = Date.now();
    const expirationTime = options.expirationHours 
      ? timestamp + (options.expirationHours * 60 * 60 * 1000)
      : undefined;

    // Generate HMAC for integrity verification
    const hmacData = `${encrypted.toString()}|${iv}|${salt}|${timestamp}`;
    const hmac = CryptoJS.HmacSHA256(hmacData, key).toString();

    return {
      data: encrypted.toString(),
      iv,
      salt,
      timestamp,
      expirationTime,
      hmac,
      compressed: shouldCompress
    };
  }

  /**
   * Decrypt data with integrity verification
   */
  async decrypt(
    encryptedData: EncryptedData, 
    securityLevel: SecurityLevel = SecurityLevel.MEDIUM
  ): Promise<any> {
    // Check expiration
    if (encryptedData.expirationTime && Date.now() > encryptedData.expirationTime) {
      throw new Error('Encrypted data has expired');
    }

    const key = await this.deriveKey(encryptedData.salt, securityLevel);

    // Verify HMAC integrity
    const hmacData = `${encryptedData.data}|${encryptedData.iv}|${encryptedData.salt}|${encryptedData.timestamp}`;
    const expectedHmac = CryptoJS.HmacSHA256(hmacData, key).toString();
    
    if (expectedHmac !== encryptedData.hmac) {
      throw new Error('Data integrity check failed');
    }

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
      iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    let payload = decrypted.toString(CryptoJS.enc.Utf8);

    // Decompress if needed
    if (encryptedData.compressed) {
      payload = LZString.decompress(payload) || payload;
    }

    return JSON.parse(payload);
  }

  /**
   * Securely delete encryption keys from memory
   */
  clearKeys(): void {
    this.masterKey = null;
    sessionStorage.removeItem('_mk');
    sessionStorage.removeItem('_sid');
  }

  /**
   * Clean up expired encrypted data from storage
   */
  static cleanupExpiredData(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('_enc_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.expirationTime && Date.now() > data.expirationTime) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Remove corrupted data
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// Field sensitivity configuration
export const FIELD_SECURITY_LEVELS: Record<string, SecurityLevel> = {
  // High security - payment and personal data
  'cardNumber': SecurityLevel.HIGH,
  'cvv': SecurityLevel.HIGH,
  'ssn': SecurityLevel.HIGH,
  'bankAccount': SecurityLevel.HIGH,
  
  // Medium security - addresses and personal info
  'address': SecurityLevel.MEDIUM,
  'street': SecurityLevel.MEDIUM,
  'city': SecurityLevel.MEDIUM,
  'zipCode': SecurityLevel.MEDIUM,
  'phone': SecurityLevel.MEDIUM,
  'email': SecurityLevel.MEDIUM,
  'firstName': SecurityLevel.MEDIUM,
  'lastName': SecurityLevel.MEDIUM,
  
  // Low security - general form data
  'preferences': SecurityLevel.LOW,
  'settings': SecurityLevel.LOW,
  'notes': SecurityLevel.LOW,
  
  // No encryption - non-sensitive data
  'theme': SecurityLevel.NONE,
  'language': SecurityLevel.NONE,
  'sortOrder': SecurityLevel.NONE
};

export const encryptionService = EncryptionService.getInstance();

// Initialize cleanup on app start
if (typeof window !== 'undefined') {
  EncryptionService.cleanupExpiredData();
  
  // Run cleanup every hour
  setInterval(() => {
    EncryptionService.cleanupExpiredData();
  }, 60 * 60 * 1000);
}