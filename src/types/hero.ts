/**
 * Hero Slideshow Types and Interfaces
 */

export enum HeroSlideStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired'
}

export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  webpUrl?: string;
  altText: string;
  linkUrl?: string;
  linkTarget: '_blank' | '_self';
  linkText?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  order: number;
  clickCount: number;
  impressions: number;
  createdAt: string;
  updatedAt: string;
  
  // Enhanced CTA button configuration
  ctaPosition?: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';
  ctaSize?: 'sm' | 'default' | 'lg';
  ctaVariant?: 'default' | 'secondary' | 'outline' | 'ghost';
  ctaStyle?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    shadow?: boolean;
    animation?: 'none' | 'pulse' | 'bounce' | 'fade';
  };
}

export interface HeroSlideFormData {
  title: string;
  description: string;
  altText: string;
  linkUrl?: string;
  linkTarget: '_blank' | '_self';
  linkText?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  imageFile?: File;
  ctaPosition?: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';
  ctaSize?: 'sm' | 'default' | 'lg';
  ctaVariant?: 'default' | 'secondary' | 'outline' | 'ghost';
  ctaStyle?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    shadow?: boolean;
    animation?: 'none' | 'pulse' | 'bounce' | 'fade';
  };
}

export interface HeroAnalytics {
  totalSlides: number;
  activeSlides: number;
  totalClicks: number;
  totalImpressions: number;
  clickThroughRate: number;
  topPerformingSlide?: {
    id: string;
    title: string;
    clicks: number;
    impressions: number;
    ctr: number;
  };
  recentActivity: {
    slideId: string;
    title: string;
    action: 'created' | 'updated' | 'activated' | 'deactivated';
    timestamp: string;
  }[];
}

export interface ImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  file?: File;
  preview?: string;
}

export interface ImageOptimizationOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'webp' | 'png';
}

export interface LinkConfiguration {
  url?: string;
  target?: '_blank' | '_self';
  text?: string;
  position?: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  style?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    shadow?: boolean;
    animation?: 'none' | 'pulse' | 'bounce' | 'fade';
  };
}

export interface SlidePerformanceMetrics {
  id: string;
  title: string;
  clicks: number;
  impressions: number;
  ctr: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}