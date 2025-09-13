// Basic WhatsApp utilities (simplified)

export const generateWhatsAppLink = (
  phoneNumber: string,
  message?: string,
  storeName?: string
): string => {
  if (!phoneNumber) return '#';
  
  // Remove any non-digit characters and ensure it starts with country code
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const formattedNumber = cleanNumber.startsWith('234') ? cleanNumber : `234${cleanNumber}`;
  
  // Generate message if not provided
  const whatsappMessage = message || `Hi ${storeName || 'there'}! I'm interested in your products.`;
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(whatsappMessage);
  
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Format as Nigerian number
  if (cleanNumber.startsWith('234')) {
    return `+${cleanNumber}`;
  } else if (cleanNumber.startsWith('0')) {
    return `+234${cleanNumber.slice(1)}`;
  } else {
    return `+234${cleanNumber}`;
  }
};