
/**
 * WhatsApp utility functions for Vendora
 */

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export interface Store {
  name: string;
  whatsappNumber: string;
}

/**
 * Generate a WhatsApp link for product inquiry
 */
export const generateProductWhatsAppLink = (
  product: Product,
  store: Store,
  customMessage?: string
): string => {
  const defaultMessage = `Hi ${store.name}! I'm interested in your ${product.name} for $${product.price}. Can you tell me more about it?`;
  const message = customMessage || defaultMessage;
  
  // Remove + from phone number and ensure it's clean
  const cleanNumber = store.whatsappNumber.replace(/[^\d]/g, '');
  
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate a WhatsApp link for general store inquiry
 */
export const generateStoreWhatsAppLink = (
  store: Store,
  customMessage?: string
): string => {
  const defaultMessage = `Hi ${store.name}! I'd like to know more about your products.`;
  const message = customMessage || defaultMessage;
  
  const cleanNumber = store.whatsappNumber.replace(/[^\d]/g, '');
  
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

/**
 * Validate WhatsApp number format
 */
export const validateWhatsAppNumber = (number: string): boolean => {
  // Remove all non-digit characters
  const cleanNumber = number.replace(/[^\d]/g, '');
  
  // Check if it's a valid length (7-15 digits as per E.164 standard)
  return cleanNumber.length >= 7 && cleanNumber.length <= 15;
};

/**
 * Format WhatsApp number for display
 */
export const formatWhatsAppNumber = (number: string): string => {
  const cleanNumber = number.replace(/[^\d]/g, '');
  
  // Format based on common patterns
  if (cleanNumber.length === 10) {
    // US format: (XXX) XXX-XXXX
    return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`;
  } else if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
    // US with country code: +1 (XXX) XXX-XXXX
    return `+1 (${cleanNumber.slice(1, 4)}) ${cleanNumber.slice(4, 7)}-${cleanNumber.slice(7)}`;
  } else {
    // International format: +XXXX XXXX XXXX
    return `+${cleanNumber.slice(0, 2)} ${cleanNumber.slice(2, 6)} ${cleanNumber.slice(6)}`;
  }
};

/**
 * Check if WhatsApp is available on the device
 */
export const isWhatsAppAvailable = (): boolean => {
  // Check if we're on mobile and WhatsApp might be installed
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return isMobile;
};

/**
 * Generate WhatsApp link that works best for the current device
 */
export const generateOptimalWhatsAppLink = (
  product: Product,
  store: Store,
  customMessage?: string
): string => {
  const baseLink = generateProductWhatsAppLink(product, store, customMessage);
  
  // On mobile, use whatsapp:// protocol if available, otherwise use web link
  if (isWhatsAppAvailable()) {
    return baseLink.replace('https://wa.me/', 'whatsapp://send?phone=');
  }
  
  return baseLink;
};
