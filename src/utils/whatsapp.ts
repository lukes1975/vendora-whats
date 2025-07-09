
import { generateSecureWhatsAppUrl, logSecurityEvent } from './security';

export const generateWhatsAppLink = (
  phoneNumber: string,
  productName?: string,
  storeName?: string
): string => {
  try {
    let message = '';
    
    if (productName && storeName) {
      // Sanitize message content
      const sanitizedProductName = productName.replace(/[<>"\''&]/g, '').trim();
      const sanitizedStoreName = storeName.replace(/[<>"\''&]/g, '').trim();
      message = `Hi! I'm interested in "${sanitizedProductName}" from ${sanitizedStoreName}`;
    }

    return generateSecureWhatsAppUrl(phoneNumber, message);
  } catch (error) {
    logSecurityEvent('WhatsApp URL generation error', { 
      phoneNumber: phoneNumber.substring(0, 5) + '...', // Log partial number for privacy
      error 
    });
    
    // Return a safe fallback
    return `https://wa.me/${phoneNumber.replace(/[^\d+]/g, '')}`;
  }
};

export const validateWhatsAppNumber = (phoneNumber: string): boolean => {
  // Re-export from security utils for consistency
  const { validatePhoneNumber } = require('./security');
  return validatePhoneNumber(phoneNumber);
};
