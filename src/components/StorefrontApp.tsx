import { useEffect } from "react";
import Storefront from "@/pages/Storefront";

interface StorefrontAppProps {
  storeSlug: string;
}

/**
 * Subdomain-based storefront application
 * Renders a storefront for a specific store slug
 */
const StorefrontApp = ({ storeSlug }: StorefrontAppProps) => {
  useEffect(() => {
    // Set document title for SEO
    document.title = `${storeSlug} - Powered by Vendora`;
    
    // Add meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `Shop at ${storeSlug} - Powered by Vendora`);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = `Shop at ${storeSlug} - Powered by Vendora`;
      document.head.appendChild(meta);
    }
  }, [storeSlug]);

  return <Storefront storeSlug={storeSlug} />;
};

export default StorefrontApp;