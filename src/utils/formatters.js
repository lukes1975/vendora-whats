import { CURRENCY } from './constants';

/**
 * Format currency value
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    symbol = CURRENCY.SYMBOL,
    decimalPlaces = 0,
    showSymbol = true
  } = options;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? `${symbol}0` : '0';
  }

  const formatted = amount.toLocaleString('en-NG', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });

  return showSymbol ? `${symbol}${formatted}` : formatted;
};

/**
 * Format date relative to now
 */
export const formatDateRelative = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const inputDate = new Date(date);
  const diffInMs = now - inputDate;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    return inputDate.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

/**
 * Format date in standard format
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const {
    includeTime = false,
    format = 'standard'
  } = options;
  
  const inputDate = new Date(date);
  
  const dateOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric'
  };
  
  if (includeTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
  }
  
  return inputDate.toLocaleDateString('en-NG', dateOptions);
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle Nigerian phone numbers
  if (digits.startsWith('234')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  } else if (digits.startsWith('0') && digits.length === 11) {
    return `+234 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  
  return phone;
};

/**
 * Format distance
 */
export const formatDistance = (distanceInKm) => {
  if (typeof distanceInKm !== 'number' || isNaN(distanceInKm)) {
    return '0 km';
  }
  
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  
  return `${distanceInKm.toFixed(1)} km`;
};

/**
 * Format delivery time estimate
 */
export const formatDeliveryTime = (distanceInKm, avgSpeedKmh = 20) => {
  if (typeof distanceInKm !== 'number' || isNaN(distanceInKm)) {
    return 'N/A';
  }
  
  const timeInHours = distanceInKm / avgSpeedKmh;
  const timeInMinutes = Math.round(timeInHours * 60);
  
  if (timeInMinutes < 60) {
    return `${timeInMinutes} mins`;
  }
  
  const hours = Math.floor(timeInMinutes / 60);
  const remainingMinutes = timeInMinutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format order reference
 */
export const formatOrderReference = (orderId, prefix = 'VDR') => {
  if (!orderId) return '';
  
  const shortId = orderId.slice(-6).toUpperCase();
  return `${prefix}-${shortId}`;
};

/**
 * Format product SKU
 */
export const formatProductSKU = (storeId, productId) => {
  if (!storeId || !productId) return '';
  
  const storeCode = storeId.slice(-4).toUpperCase();
  const productCode = productId.slice(-4).toUpperCase();
  
  return `${storeCode}-${productCode}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimalPlaces = 1) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  
  return `${value.toFixed(decimalPlaces)}%`;
};

/**
 * Format count with K/M suffixes
 */
export const formatCount = (count) => {
  if (typeof count !== 'number' || isNaN(count)) return '0';
  
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  
  return `${(count / 1000000).toFixed(1)}M`;
};