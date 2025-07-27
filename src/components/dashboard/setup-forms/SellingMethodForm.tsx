import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MessageSquare, Globe, Layers } from 'lucide-react';

interface SellingMethodFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const SellingMethodForm: React.FC<SellingMethodFormProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('both');

  useEffect(() => {
    if (open && user) {
      loadExistingMethod();
    }
  }, [open, user]);

  const loadExistingMethod = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('selling_methods')
        .select('method')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setSelectedMethod(data.method);
      }
    } catch (error) {
      console.log('No existing selling method found');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('selling_methods')
        .upsert({
          user_id: user.id,
          method: selectedMethod
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Selling method saved successfully!');
      onComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving selling method:', error);
      toast.error('Failed to save selling method');
    } finally {
      setLoading(false);
    }
  };

  const methods = [
    {
      value: 'whatsapp_only',
      title: 'WhatsApp Only',
      description: 'Customers order directly through WhatsApp messages',
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      value: 'website_only',
      title: 'Website Storefront Only',
      description: 'Customers order through your online store',
      icon: Globe,
      color: 'text-blue-600'
    },
    {
      value: 'both',
      title: 'Both Channels',
      description: 'Accept orders via WhatsApp and your website',
      icon: Layers,
      color: 'text-purple-600'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Choose Your Selling Method
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            <div className="space-y-3">
              {methods.map((method) => (
                <Card key={method.value} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={method.value} id={method.value} />
                      <div className="flex items-center space-x-3 flex-1">
                        <method.icon className={`h-6 w-6 ${method.color}`} />
                        <div className="flex-1">
                          <Label 
                            htmlFor={method.value} 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {method.title}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Method'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SellingMethodForm;