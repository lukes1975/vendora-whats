import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  getMetadata
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Storage paths
 */
export const STORAGE_PATHS = {
  PRODUCTS: 'products',
  STORES: 'stores',
  PROFILES: 'profiles',
  PROOFS: 'payment-proofs'
};

/**
 * Upload file to Firebase Storage
 */
export const uploadFile = async (file, path, onProgress = null) => {
  try {
    const fileRef = ref(storage, path);
    
    if (onProgress) {
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } else {
      // Simple upload
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Upload product image
 */
export const uploadProductImage = async (file, productId, onProgress = null) => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${productId}_${timestamp}.${fileExtension}`;
  const path = `${STORAGE_PATHS.PRODUCTS}/${fileName}`;
  
  return await uploadFile(file, path, onProgress);
};

/**
 * Upload store logo/banner
 */
export const uploadStoreImage = async (file, storeId, type = 'logo', onProgress = null) => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${storeId}_${type}_${timestamp}.${fileExtension}`;
  const path = `${STORAGE_PATHS.STORES}/${fileName}`;
  
  return await uploadFile(file, path, onProgress);
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (file, userId, onProgress = null) => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}_${timestamp}.${fileExtension}`;
  const path = `${STORAGE_PATHS.PROFILES}/${fileName}`;
  
  return await uploadFile(file, path, onProgress);
};

/**
 * Upload payment proof
 */
export const uploadPaymentProof = async (file, orderId, onProgress = null) => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${orderId}_${timestamp}.${fileExtension}`;
  const path = `${STORAGE_PATHS.PROOFS}/${fileName}`;
  
  return await uploadFile(file, path, onProgress);
};

/**
 * Delete file from storage
 */
export const deleteFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    return await getMetadata(fileRef);
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error('Failed to get file metadata');
  }
};

/**
 * Generate unique filename
 */
export const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  
  return `${prefix}${timestamp}_${random}.${extension}`;
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size (in MB)
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Compress image before upload
 */
export const compressImage = async (file, maxWidth = 1024, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          }));
        },
        file.type,
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};