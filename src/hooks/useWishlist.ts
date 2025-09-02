import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketplaceAnalytics } from './useMarketplaceAnalytics';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    vendor_id: string;
    stores: {
      name: string;
      slug: string;
    };
  };
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackWishlistAdd } = useMarketplaceAnalytics();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_wishlists')
        .select(`
          id,
          product_id,
          created_at,
          products!inner (
            id,
            name,
            price,
            image_url,
            vendor_id,
            stores (
              name,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = useCallback(async (productId: string, vendorId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_wishlists')
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already in Wishlist",
            description: "This item is already in your wishlist",
          });
          return false;
        }
        throw error;
      }

      await trackWishlistAdd(productId, vendorId);
      await fetchWishlist();
      
      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist",
      });
      
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, trackWishlistAdd, fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await fetchWishlist();
      
      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist",
      });
      
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, fetchWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  }, [wishlistItems]);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist
  };
};