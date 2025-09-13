

import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Store, Users, MessageSquare } from "lucide-react";

const DashboardStorefront = () => {
  const { user } = useAuth();

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (error) {
        console.log('Store fetch error:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!store) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Store Found</h2>
          <p className="text-gray-600">Please set up your store first.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Generate the branded store URL using vendora.business domain
  const storeUrl = store.slug 
    ? `https://vendora.business/${store.slug}`
    : `https://vendora.business/${store.id}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Your Branded Storefront</h1>
          <p className="text-gray-600">Customize your brand and manage how buyers see your business</p>
        </div>

        {/* Store Preview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Store className="h-5 w-5" />
                <CardTitle>{store.name}</CardTitle>
                <Badge variant={store.is_active ? "default" : "secondary"}>
                  {store.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Button asChild>
                <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Your Storefront
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <p className="text-gray-600 mb-4">{store.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Store Contact: {store.whatsapp_number || "Not configured"}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Branded Store Link: {storeUrl}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardStorefront;

