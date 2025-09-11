import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function isOnSale(originalPrice?: number, currentPrice?: number): boolean {
  return !!(originalPrice && currentPrice && originalPrice > currentPrice);
}

export function formatCurrency(amount: number, currency: string = 'NGN', locale: string = 'en-NG'): string {
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback for NGN currency only
    return `₦${Math.round(amount)}`;
  }
}

export function formatDate(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  // Format as DD-MMM-YYYY (e.g., 29-Aug-2025)
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/\s/g, '-');
}

export function formatDateTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  // Format as DD-MMM-YYYY, HH:MM (e.g., 29-Aug-2025, 14:30)
  const dateStr = formatDate(dateObj);
  const timeStr = dateObj.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${dateStr}, ${timeStr}`;
}
