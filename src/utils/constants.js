/**
 * Application constants for Vendora
 */

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  RIDER: 'rider',
  ADMIN: 'admin'
};

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// Payment methods
export const PAYMENT_METHODS = {
  PAYSTACK: 'paystack',
  BANK_TRANSFER: 'bank_transfer',
  WHATSAPP: 'whatsapp',
  CASH_ON_DELIVERY: 'cash_on_delivery'
};

// Delivery statuses
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKUP: 'pickup',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed'
};

// File upload limits
export const FILE_LIMITS = {
  PRODUCT_IMAGE: {
    MAX_SIZE_MB: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  STORE_IMAGE: {
    MAX_SIZE_MB: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  PAYMENT_PROOF: {
    MAX_SIZE_MB: 10,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
  }
};

// Currency
export const CURRENCY = {
  SYMBOL: '₦',
  CODE: 'NGN',
  NAME: 'Nigerian Naira'
};

// Distance and delivery
export const DELIVERY = {
  BASE_FEE_PER_3KM: 1000, // ₦1,000 per 3km
  MAX_DELIVERY_DISTANCE: 50, // 50km max delivery distance
  AVERAGE_SPEED_KMH: 20 // Average rider speed in urban areas
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// URL patterns
export const URL_PATTERNS = {
  STORE_SUBDOMAIN: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
  PHONE_NIGERIA: /^(\+234|0)[7-9][0-1][0-9]{8}$/
};

// WhatsApp
export const WHATSAPP = {
  BASE_URL: 'https://wa.me/',
  BUSINESS_ACCOUNT: '+2348000000000' // Replace with actual business number
};

// Notification types
export const NOTIFICATION_TYPES = {
  ORDER_CREATED: 'order_created',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_RECEIVED: 'payment_received',
  DELIVERY_ASSIGNED: 'delivery_assigned'
};

// Local storage keys
export const STORAGE_KEYS = {
  CART: 'vendora_cart',
  USER_PREFERENCES: 'vendora_preferences',
  LAST_LOCATION: 'vendora_last_location',
  GUEST_SESSION: 'vendora_guest_session'
};

// API endpoints (for external services)
export const API_ENDPOINTS = {
  PAYSTACK_BASE: 'https://api.paystack.co',
  GOOGLE_MAPS_BASE: 'https://maps.googleapis.com/maps/api'
};

// Default values
export const DEFAULTS = {
  PRODUCT_IMAGE: '/images/product-placeholder.png',
  STORE_LOGO: '/images/store-placeholder.png',
  AVATAR: '/images/avatar-placeholder.png',
  LOCATION: {
    LAT: 6.5244, // Lagos, Nigeria
    LNG: 3.3792
  }
};

// App configuration
export const APP_CONFIG = {
  NAME: 'Vendora',
  DESCRIPTION: 'Zero-login commerce marketplace with location-aware delivery',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@vendora.app',
  SUPPORT_PHONE: '+2348000000000'
};