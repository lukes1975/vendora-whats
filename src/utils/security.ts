
/**
 * Security utilities for input validation and sanitization
 */

// Generate UUID v4 using crypto.randomUUID()
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

// Redact phone number for logging (show only first 6 digits)
export const redactPhone = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.length <= 6) return cleaned;
  return cleaned.substring(0, 6) + '...';
};

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

// Validate phone number format (E.164-like)
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  // E.164 format: +[country code][number] with 8-15 digits total
  const e164Regex = /^\+?\d{8,15}$/;
  
  const trimmedPhone = phone.trim();
  return e164Regex.test(trimmedPhone);
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

// Enhanced security logging with correlation ID and PII redaction
export const logSecurityEvent = (event: string, details?: any) => {
  // In production, this would send to a proper logging service
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Security] ${event}:`, details);
  }
};

// Safe logging wrapper with automatic PII redaction and correlation ID
export const safeLog = (
  event: string, 
  meta?: Record<string, any>, 
  correlationId?: string
) => {
  const sanitizedMeta = meta ? { ...meta } : {};
  
  // Redact phone numbers
  if (sanitizedMeta.to) {
    sanitizedMeta.to = redactPhone(sanitizedMeta.to);
  }
  if (sanitizedMeta.phone) {
    sanitizedMeta.phone = redactPhone(sanitizedMeta.phone);
  }
  if (sanitizedMeta.phoneNumber) {
    sanitizedMeta.phoneNumber = redactPhone(sanitizedMeta.phoneNumber);
  }
  
  // Remove message bodies
  if (sanitizedMeta.message) {
    delete sanitizedMeta.message;
    sanitizedMeta.hasMessage = true;
  }
  
  // Add correlation ID
  if (correlationId) {
    sanitizedMeta.correlationId = correlationId;
  }
  
  logSecurityEvent(event, sanitizedMeta);
};
