/**
 * Image Upload Utilities for Hero Slideshow Management
 */

import type { ImageValidationResult, ImageOptimizationOptions, ImageUploadProgress } from '@/types/hero';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_OPTIMIZATION_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'webp'
};

/**
 * Validate uploaded image file
 */
export const validateImageFile = (file: File): ImageValidationResult => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Please upload JPEG, PNG, or WebP images only.' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` 
    };
  }

  return { 
    isValid: true, 
    file,
    preview: URL.createObjectURL(file)
  };
};

/**
 * Create image preview from file
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Optimize image and convert to WebP format
 */
export const optimizeImage = (
  file: File, 
  options: Partial<ImageOptimizationOptions> = {}
): Promise<{ original: Blob; webp: Blob }> => {
  const opts = { ...DEFAULT_OPTIMIZATION_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > opts.maxWidth) {
        width = opts.maxWidth;
        height = width / aspectRatio;
      }

      if (height > opts.maxHeight) {
        height = opts.maxHeight;
        width = height * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;
      
      // Draw and optimize
      ctx.drawImage(img, 0, 0, width, height);
      
      // Create original optimized version
      canvas.toBlob(
        (originalBlob) => {
          if (!originalBlob) {
            reject(new Error('Failed to create original blob'));
            return;
          }

          // Create WebP version
          canvas.toBlob(
            (webpBlob) => {
              if (!webpBlob) {
                reject(new Error('Failed to create WebP blob'));
                return;
              }

              resolve({ original: originalBlob, webp: webpBlob });
            },
            'image/webp',
            opts.quality
          );
        },
        `image/${opts.format}`,
        opts.quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Handle drag and drop file upload
 */
export const handleDropUpload = (
  event: DragEvent,
  onProgress?: (progress: ImageUploadProgress) => void
): Promise<ImageValidationResult[]> => {
  event.preventDefault();
  
  const files = Array.from(event.dataTransfer?.files || []);
  const results: Promise<ImageValidationResult>[] = files.map(async (file, index) => {
    if (onProgress) {
      onProgress({
        loaded: index,
        total: files.length,
        percentage: (index / files.length) * 100
      });
    }

    return validateImageFile(file);
  });

  return Promise.all(results);
};

/**
 * Upload image with progress tracking
 */
export const uploadImageWithProgress = (
  file: File,
  uploadUrl: string,
  onProgress?: (progress: ImageUploadProgress) => void
): Promise<{ url: string; webpUrl?: string }> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('image', file);

    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: (e.loaded / e.total) * 100
          });
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });

    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
};

/**
 * Batch process multiple images
 */
export const batchProcessImages = async (
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<{ original: Blob; webp: Blob }[]> => {
  const results: { original: Blob; webp: Blob }[] = [];
  
  for (let i = 0; i < files.length; i++) {
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
    
    const validation = validateImageFile(files[i]);
    if (!validation.isValid || !validation.file) {
      throw new Error(`Invalid file at index ${i}: ${validation.error}`);
    }
    
    const optimized = await optimizeImage(validation.file);
    results.push(optimized);
  }
  
  return results;
};

/**
 * Get image dimensions
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};