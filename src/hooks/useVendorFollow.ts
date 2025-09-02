import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useVendorFollow = () => {
  const [followedVendors, setFollowedVendors] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFollowedVendors = useCallback(async () => {
    if (!user) {
      setFollowedVendors(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('following_vendor_id')
        .eq('follower_id', user.id);

      if (error) throw error;
      
      const vendorIds = new Set(data?.map(item => item.following_vendor_id) || []);
      setFollowedVendors(vendorIds);
    } catch (error) {
      console.error('Error fetching followed vendors:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFollowedVendors();
  }, [fetchFollowedVendors]);

  const followVendor = useCallback(async (vendorId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to follow vendors",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_vendor_id: vendorId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Following",
            description: "You are already following this vendor",
          });
          return false;
        }
        throw error;
      }

      setFollowedVendors(prev => new Set([...prev, vendorId]));
      
      toast({
        title: "Following Vendor",
        description: "You will now receive updates from this vendor",
      });
      
      return true;
    } catch (error) {
      console.error('Error following vendor:', error);
      toast({
        title: "Error",
        description: "Failed to follow vendor",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  const unfollowVendor = useCallback(async (vendorId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_vendor_id', vendorId);

      if (error) throw error;

      setFollowedVendors(prev => {
        const newSet = new Set(prev);
        newSet.delete(vendorId);
        return newSet;
      });
      
      toast({
        title: "Unfollowed Vendor",
        description: "You will no longer receive updates from this vendor",
      });
      
      return true;
    } catch (error) {
      console.error('Error unfollowing vendor:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow vendor",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  const isFollowing = useCallback((vendorId: string) => {
    return followedVendors.has(vendorId);
  }, [followedVendors]);

  return {
    followedVendors,
    loading,
    followVendor,
    unfollowVendor,
    isFollowing,
    refetch: fetchFollowedVendors
  };
};