import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Truck, Plus, Trash2 } from 'lucide-react';

interface DeliveryOption {
  id?: string;
  location_name: string;
  delivery_fee: number;
  is_free_shipping: boolean;
}

interface DeliveryOptionsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const DeliveryOptionsForm: React.FC<DeliveryOptionsFormProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([
    { location_name: '', delivery_fee: 0, is_free_shipping: false }
  ]);

  useEffect(() => {
    if (open && user) {
      loadExistingDeliveryOptions();
    }
  }, [open, user]);

  const loadExistingDeliveryOptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (data && data.length > 0 && !error) {
        setDeliveryOptions(data.map(item => ({
          id: item.id,
          location_name: item.location_name,
          delivery_fee: Number(item.delivery_fee),
          is_free_shipping: item.is_free_shipping
        })));
      }
    } catch (error) {
      console.log('No existing delivery options found');
    }
  };

  const addDeliveryOption = () => {
    setDeliveryOptions(prev => [
      ...prev,
      { location_name: '', delivery_fee: 0, is_free_shipping: false }
    ]);
  };

  const removeDeliveryOption = (index: number) => {
    setDeliveryOptions(prev => prev.filter((_, i) => i !== index));
  };

  const updateDeliveryOption = (index: number, field: keyof DeliveryOption, value: any) => {
    setDeliveryOptions(prev => prev.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validOptions = deliveryOptions.filter(option => 
      option.location_name.trim() !== ''
    );

    if (validOptions.length === 0) {
      toast.error('Please add at least one delivery location');
      return;
    }

    setLoading(true);
    try {
      // Delete existing options
      await supabase
        .from('delivery_options')
        .delete()
        .eq('user_id', user.id);

      // Insert new options
      const { error } = await supabase
        .from('delivery_options')
        .insert(validOptions.map(option => ({
          user_id: user.id,
          location_name: option.location_name,
          delivery_fee: option.delivery_fee,
          is_free_shipping: option.is_free_shipping,
          is_active: true
        })));

      if (error) throw error;

      toast.success('Delivery options saved successfully!');
      onComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving delivery options:', error);
      toast.error('Failed to save delivery options');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Options
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {deliveryOptions.map((option, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Location {index + 1}
                    </Label>
                    {deliveryOptions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliveryOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`location_${index}`}>Location Name</Label>
                    <Input
                      id={`location_${index}`}
                      value={option.location_name}
                      onChange={(e) => updateDeliveryOption(index, 'location_name', e.target.value)}
                      placeholder="e.g., Lagos Island, Abuja, etc."
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={option.is_free_shipping}
                      onCheckedChange={(checked) => updateDeliveryOption(index, 'is_free_shipping', checked)}
                    />
                    <Label className="text-sm">Free shipping</Label>
                  </div>

                  {!option.is_free_shipping && (
                    <div className="space-y-2">
                      <Label htmlFor={`fee_${index}`}>Delivery Fee (₦)</Label>
                      <Input
                        id={`fee_${index}`}
                        type="number"
                        min="0"
                        step="1"
                        value={option.delivery_fee}
                        onChange={(e) => updateDeliveryOption(index, 'delivery_fee', Number(e.target.value))}
                        placeholder="0"
                        required
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addDeliveryOption}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Location
          </Button>

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
              {loading ? 'Saving...' : 'Save Options'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryOptionsForm;