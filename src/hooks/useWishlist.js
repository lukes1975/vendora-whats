import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchWishlist = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          product_id,
          created_at,
          products (
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
        .eq('user_id', user.id);

      if (error) throw error;

      // Fix the data structure to match expected format
      const formattedData = data?.map(item => ({
        id: item.id,
        product_id: item.product_id,
        created_at: item.created_at,
        products: item.products ? {
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          image_url: item.products.image_url,
          vendor_id: item.products.vendor_id,
          stores: Array.isArray(item.products.stores) && item.products.stores.length > 0 
            ? {
                name: item.products.stores[0].name,
                slug: item.products.stores[0].slug
              }
            : null
        } : null
      })) || [];

      setWishlist(formattedData);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wishlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user?.id) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to add items to wishlist',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;

      toast({
        title: 'Added to wishlist',
        description: 'Item has been added to your wishlist',
      });

      await fetchWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to wishlist',
        variant: 'destructive',
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist',
      });

      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist',
        variant: 'destructive',
      });
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?.id]);

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist,
  };
};