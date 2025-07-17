/**
 * Upcoming features roadmap for internal reference
 * This file contains all planned features organized by timeline
 */

export const upcomingFeatures = {
  comingThisMonth: [
    "AI Order Assistant for WhatsApp – Smart agent that takes orders conversationally.",
    "Product Variants (Size, Color, etc.) – Add multiple options under one product.",
    "Store Analytics Dashboard – See views, orders, revenue, and product performance.",
    "WhatsApp Catalog Auto-Sync – Auto-update your WhatsApp Business catalog from your Vendora store.",
    "Custom Store URL (Subdomain) – Your own branded store like: peckycakes.vendora.business"
  ],
  
  comingSoon: [
    "Inventory Management – Set stock levels and get low-stock alerts.",
    "Multi-Store Management – Manage multiple stores from one dashboard.",
    "Custom Themes & Branding – Upload logos, customize colors, fonts.",
    "Payment Integration (Paystack/Flutterwave) – Accept card payments directly.",
    "Shipping Calculator – Auto-calculate shipping costs for customers.",
    "Abandoned Cart Recovery – WhatsApp reminders for incomplete orders.",
    "Customer Database – Store customer info and order history.",
    "Discount Codes & Coupons – Create promotional offers.",
    "Bulk Product Import – Upload products via CSV/Excel.",
    "Product Reviews & Ratings – Let customers leave feedback."
  ],
  
  inRnD: [
    "Mobile App (iOS/Android) – Native mobile experience for store management.",
    "Voice Orders via WhatsApp – Customers can send voice notes to place orders.",
    "Smart Pricing Suggestions – AI-powered pricing recommendations.",
    "Social Media Auto-Posting – Auto-share new products on Instagram/Facebook.",
    "Multi-Language Support – Serve customers in different languages.",
    "Advanced Analytics – Customer behavior insights and sales forecasting.",
    "Email Marketing Integration – Send newsletters and promotional emails.",
    "Live Chat Widget – Real-time customer support on your store."
  ],
  
  futureAddOns: [
    "White-Label Solution – Remove Vendora branding, use your own.",
    "API Access – Integrate Vendora with external systems.",
    "Subscription Products – Recurring billing for subscription businesses.",
    "Marketplace Integration – List products on Jumia, Konga automatically.",
    "POS Integration – Connect with physical store systems.",
    "Advanced Reporting – Custom reports and data exports.",
    "Team Management – Add staff with different permission levels.",
    "Advanced Automation – Complex workflow automation for large businesses."
  ]
};

export type FeatureCategory = keyof typeof upcomingFeatures;