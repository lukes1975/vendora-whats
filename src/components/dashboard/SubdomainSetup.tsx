import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ExternalLink, Loader2 } from 'lucide-react';

const SubdomainSetup = () => {
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [currentSubdomain, setCurrentSubdomain] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkSubdomainAvailability = async (value: string) => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subdomain')
        .eq('subdomain', value.toLowerCase())
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows found - subdomain is available
        setIsAvailable(true);
      } else if (data) {
        // Subdomain exists
        setIsAvailable(false);
      }
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setIsAvailable(null);
    }
  };

  const handleSubdomainChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(cleanValue);
    
    // Debounce the availability check
    const timeoutId = setTimeout(() => {
      checkSubdomainAvailability(cleanValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const saveSubdomain = async () => {
    if (!user || !subdomain || !isAvailable) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subdomain: subdomain.toLowerCase() })
        .eq('id', user.id);

      if (error) throw error;

      setCurrentSubdomain(subdomain);
      toast({
        title: 'Subdomain saved!',
        description: `Your store is now available at ${subdomain}.vendora.business`,
      });
    } catch (error: any) {
      console.error('Error saving subdomain:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save subdomain',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Custom Domain Setup
        </CardTitle>
        <CardDescription>
          Set up your custom subdomain for easy store access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSubdomain ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-800 font-medium">
                Your store is live at: 
                <a 
                  href={`https://${currentSubdomain}.vendora.business`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:text-green-700"
                >
                  {currentSubdomain}.vendora.business
                </a>
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label htmlFor="subdomain" className="text-sm font-medium">
                Choose your subdomain
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  placeholder="yourstorename"
                  value={subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  className={`flex-1 ${
                    isAvailable === true ? 'border-green-500' : 
                    isAvailable === false ? 'border-red-500' : ''
                  }`}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  .vendora.business
                </span>
              </div>
              
              {isAvailable === true && (
                <p className="text-sm text-green-600">
                  ✓ Available! Your store will be accessible at {subdomain}.vendora.business
                </p>
              )}
              
              {isAvailable === false && (
                <p className="text-sm text-red-600">
                  ✗ This subdomain is already taken. Please try another.
                </p>
              )}
            </div>

            <Button 
              onClick={saveSubdomain}
              disabled={!subdomain || !isAvailable || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Set Up Subdomain'
              )}
            </Button>
          </>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Pro tip:</strong> Your subdomain will make it easy for customers to find and 
            remember your store. Choose something short and related to your business name.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubdomainSetup;