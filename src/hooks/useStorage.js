import { useState } from 'react';
import * as storageService from '@/services/storage';

/**
 * Hook for file upload operations
 */
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file, path, onProgress = null) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const progressCallback = onProgress || setProgress;
      const url = await storageService.uploadFile(file, path, progressCallback);
      
      return url;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadProductImage = async (file, productId, onProgress = null) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const progressCallback = onProgress || setProgress;
      const url = await storageService.uploadProductImage(file, productId, progressCallback);
      
      return url;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadStoreImage = async (file, storeId, type = 'logo', onProgress = null) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const progressCallback = onProgress || setProgress;
      const url = await storageService.uploadStoreImage(file, storeId, type, progressCallback);
      
      return url;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  return {
    uploadFile,
    uploadProductImage,
    uploadStoreImage,
    uploading,
    progress,
    error,
    reset
  };
};

/**
 * Hook for file validation
 */
export const useFileValidation = () => {
  const validateFile = (file, options = {}) => {
    const {
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxSizeMB = 5
    } = options;

    const errors = [];

    // Check file type
    if (!storageService.validateFileType(file, allowedTypes)) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    if (!storageService.validateFileSize(file, maxSizeMB)) {
      errors.push(`File size too large. Maximum size: ${maxSizeMB}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return { validateFile };
};

/**
 * Hook for image compression
 */
export const useImageCompression = () => {
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState(null);

  const compressImage = async (file, options = {}) => {
    try {
      setCompressing(true);
      setError(null);

      const { maxWidth = 1024, quality = 0.8 } = options;
      const compressedFile = await storageService.compressImage(file, maxWidth, quality);
      
      return compressedFile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCompressing(false);
    }
  };

  return {
    compressImage,
    compressing,
    error
  };
};