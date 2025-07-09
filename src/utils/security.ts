
/**
 * Security utilities for input validation and sanitization
 */

// XSS protection - sanitize HTML content
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Remove potential XSS characters and HTML tags
  return input
    .replace(/[<>\"'&]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// Validate phone number format
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  // International format: +country code followed by 6-14 digits
  const phoneRegex = /^\+[1-9]\d{6,14}$/;
  return phoneRegex.test(phone.trim());
};

// Sanitize text input to prevent XSS
export const sanitizeTextInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>\"'&]/g, '')
    .trim()
    .substring(0, 500); // Limit length to prevent excessive data
};

// Validate store name
export const validateStoreName = (name: string): boolean => {
  if (!name) return false;
  
  const sanitized = sanitizeTextInput(name);
  return sanitized.length >= 2 && sanitized.length <= 100;
};

// Generate secure WhatsApp URL server-side style
export const generateSecureWhatsAppUrl = (phone: string, message?: string): string => {
  if (!validatePhoneNumber(phone)) {
    throw new Error('Invalid phone number format');
  }
  
  const sanitizedPhone = phone.replace(/[^\d+]/g, '');
  const sanitizedMessage = message ? encodeURIComponent(sanitizeTextInput(message)) : '';
  
  return `https://wa.me/${sanitizedPhone}${sanitizedMessage ? `?text=${sanitizedMessage}` : ''}`;
};

// Log security events (replace console.log for production)
export const logSecurityEvent = (event: string, details?: any) => {
  // In production, this would send to a proper logging service
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Security] ${event}:`, details);
  }
};
