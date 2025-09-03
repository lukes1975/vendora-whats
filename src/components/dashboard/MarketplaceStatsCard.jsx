import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Store, ExternalLink, Settings, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MarketplaceStatsCard = () => {
  const { user } = useAuth();
  const [marketplaceStats, setMarketplaceStats] = useState({
    totalProducts: 0,
    totalStores: 0,
    verifiedStudents: 0,
    myRanking: 0
  });
  const [individualStoreEnabled, setIndividualStoreEnabled] = useState(false);

  useEffect(() => {
    fetchMarketplaceStats();
    checkStoreSettings();
  }, []);

  const fetchMarketplaceStats = async () => {
    try {
      const [
        { count: totalProducts },
        { count: totalStores },
        { count: verifiedStudents }
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('stores')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('student_verifications_enhanced')
          .select('*', { count: 'exact', head: true })
          .eq('verification_status', 'verified')
      ]);

      // Get user's marketplace ranking based on product count
      if (user?.id) {
        const { data: userProducts, error: productsError } = await supabase
          .from('products')
          .select('id')
          .eq('vendor_id', user.id)
          .eq('status', 'active');

        if (!productsError) {
          const userProductCount = userProducts?.length || 0;
          
          // Get vendors with more products than current user
          const { count: betterVendors } = await supabase
            .from('products')
            .select('vendor_id', { count: 'exact', head: true })
            .eq('status', 'active')
            .group('vendor_id')
            .having('count(*)', 'gt', userProductCount);

          setMarketplaceStats({
            totalProducts: totalProducts || 0,
            totalStores: totalStores || 0,
            verifiedStudents: verifiedStudents || 0,
            myRanking: (betterVendors || 0) + 1
          });
        }
      } else {
        setMarketplaceStats({
          totalProducts: totalProducts || 0,
          totalStores: totalStores || 0,
          verifiedStudents: verifiedStudents || 0,
          myRanking: 0
        });
      }
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
    }
  };

  const checkStoreSettings = async () => {
    if (!user?.id) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('individual_store_enabled')
      .eq('id', user.id)
      .single();

    setIndividualStoreEnabled(profileData?.individual_store_enabled || false);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Your FUOYE Marketplace Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg border">
            <div className="text-2xl font-bold text-primary">{marketplaceStats.totalProducts}</div>
            <div className="text-sm text-muted-foreground">Products Available</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{marketplaceStats.verifiedStudents}</div>
            <div className="text-sm text-muted-foreground">Verified Students</div>
          </div>
        </div>

        {marketplaceStats.myRanking > 0 && (
          <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">#{marketplaceStats.myRanking}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Your Campus Ranking</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link to="/fuoye-market">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Market
            </Button>
          </Link>
          
          <Link to="/dashboard/settings">
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Optional Individual Store Feature */}
        {!individualStoreEnabled && (
          <div className="p-3 bg-muted/30 rounded-lg border border-dashed">
            <div className="text-sm font-medium text-foreground mb-2">
              🚀 Want Your Own Website Too?
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              Enable individual storefront to get your own professional website alongside marketplace selling.
            </div>
            <Link to="/dashboard/settings">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Enable Individual Store
              </Button>
            </Link>
          </div>
        )}

        <div className="text-center">
          <div className="text-xs text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Active marketplace sellers get 3x more visibility than inactive ones. Keep posting products!
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketplaceStatsCard;