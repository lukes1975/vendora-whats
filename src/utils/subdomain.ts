/**
 * Utility functions for handling subdomain-based routing
 */

export interface SubdomainInfo {
  isSubdomain: boolean;
  subdomain: string | null;
  isMainDomain: boolean;
}

/**
 * Extracts subdomain information from the current hostname
 */
export const getSubdomainInfo = (): SubdomainInfo => {
  const hostname = window.location.hostname;
  
  // For development - check Lovable domains first to avoid conflicts
  if (hostname === 'localhost' || 
      hostname.includes('127.0.0.1') || 
      hostname.includes('lovableproject.com') || 
      hostname.includes('lovable.app') || 
      hostname.includes('id-preview--')) {
    return {
      isSubdomain: false,
      subdomain: null,
      isMainDomain: true
    };
  }
  
  // For production: vendora.business domain
  const parts = hostname.split('.');
  
  // If it's exactly vendora.business or www.vendora.business
  if (hostname === 'vendora.business' || hostname === 'www.vendora.business') {
    return {
      isSubdomain: false,
      subdomain: null,
      isMainDomain: true
    };
  }
  
  // If it's a subdomain like store1.vendora.business
  if (parts.length === 3 && parts[1] === 'vendora' && parts[2] === 'business') {
    return {
      isSubdomain: true,
      subdomain: parts[0],
      isMainDomain: false
    };
  }
  
  // Default fallback - treat as main domain to avoid routing conflicts
  return {
    isSubdomain: false,
    subdomain: null,
    isMainDomain: true
  };
};

/**
 * Generates a store URL for a given store slug
 */
export const getStoreUrl = (storeSlug: string): string => {
  const { hostname, protocol } = window.location;
  
  // For development, use path-based routing
  if (hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('lovableproject.com') || hostname.includes('lovable.app')) {
    return `${protocol}//${hostname}/${storeSlug}`;
  }
  
  // For production, use path-based routing on vendora.business
  return `${protocol}//vendora.business/${storeSlug}`;
};

/**
 * Redirects to the main dashboard domain if on a subdomain
 */
export const redirectToMainDomain = (path: string = '/dashboard') => {
  const { protocol } = window.location;
  window.location.href = `${protocol}//www.vendora.business${path}`;
};