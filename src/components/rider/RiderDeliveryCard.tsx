import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Package, 
  CheckCircle,
  Camera,
  Star,
  User,
  Phone,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface DeliveryAssignment {
  id: string;
  order_id: string;
  status: string;
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  delivery_lat: number;
  delivery_lng: number;
  delivery_address: string;
  distance_km: number;
  delivery_fee_kobo: number;
  estimated_duration_minutes: number;
  offered_at: string;
  accepted_at?: string;
  orders_v2: {
    id: string;
    customer_name: string;
    customer_phone: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    currency: string;
  };
}

interface RiderDeliveryCardProps {
  assignment: DeliveryAssignment;
  onStatusUpdate: () => void;
  showAcceptButton?: boolean;
}

export function RiderDeliveryCard({ 
  assignment, 
  onStatusUpdate, 
  showAcceptButton = false 
}: RiderDeliveryCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [customerRating, setCustomerRating] = useState(5);

  const handleAcceptDelivery = async () => {
    setIsUpdating(true);
    try {
      // Get current location
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { data, error } = await supabase.functions.invoke('delivery-status-update', {
          body: {
            assignment_id: assignment.id,
            status: 'accepted',
            rider_lat: position.coords.latitude,
            rider_lng: position.coords.longitude
          }
        });

        if (error) throw error;

        toast.success('Delivery accepted! Navigate to pickup location.');
        onStatusUpdate();
      }, (error) => {
        toast.error('Unable to get your location. Please enable location services.');
        console.error('Geolocation error:', error);
      });
    } catch (error) {
      console.error('Error accepting delivery:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept delivery');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { data, error } = await supabase.functions.invoke('delivery-status-update', {
          body: {
            assignment_id: assignment.id,
            status: newStatus,
            rider_lat: position.coords.latitude,
            rider_lng: position.coords.longitude
          }
        });

        if (error) throw error;

        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
        onStatusUpdate();
      }, (error) => {
        toast.error('Unable to get your location. Please enable location services.');
        console.error('Geolocation error:', error);
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteDelivery = async () => {
    if (!proofImageUrl) {
      toast.error('Please upload proof of delivery photo');
      return;
    }

    setIsUpdating(true);
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { data, error } = await supabase.functions.invoke('delivery-status-update', {
          body: {
            assignment_id: assignment.id,
            status: 'delivered',
            rider_lat: position.coords.latitude,
            rider_lng: position.coords.longitude,
            proof_of_delivery_url: proofImageUrl,
            delivery_notes: deliveryNotes,
            customer_rating: customerRating
          }
        });

        if (error) throw error;

        toast.success('Delivery completed successfully!');
        setShowDeliveryForm(false);
        onStatusUpdate();
      }, (error) => {
        toast.error('Unable to get your location. Please enable location services.');
        console.error('Geolocation error:', error);
      });
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete delivery');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNavigate = (lat: number, lng: number, label: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
    toast.success(`Opening navigation to ${label}`);
  };

  const handleCallCustomer = () => {
    window.open(`tel:${assignment.orders_v2.customer_phone}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      offered: { label: 'Offered', color: 'secondary' },
      accepted: { label: 'Accepted', color: 'default' },
      picked_up: { label: 'Picked Up', color: 'default' },
      en_route: { label: 'En Route', color: 'default' },
      delivered: { label: 'Delivered', color: 'default' },
      cancelled: { label: 'Cancelled', color: 'destructive' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'secondary' };
    return <Badge variant={config.color as any}>{config.label}</Badge>;
  };

  const getNextAction = () => {
    switch (assignment.status) {
      case 'offered':
        return showAcceptButton ? (
          <Button 
            onClick={handleAcceptDelivery} 
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? 'Accepting...' : 'Accept Delivery'}
          </Button>
        ) : null;
      case 'accepted':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleNavigate(assignment.pickup_lat, assignment.pickup_lng, 'pickup location')}
              variant="outline" 
              className="flex-1"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Navigate to Pickup
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('picked_up')} 
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Updating...' : 'Mark as Picked Up'}
            </Button>
          </div>
        );
      case 'picked_up':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleNavigate(assignment.delivery_lat, assignment.delivery_lng, 'customer')}
              variant="outline" 
              className="flex-1"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Navigate to Customer
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('en_route')} 
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Updating...' : 'Start Delivery'}
            </Button>
          </div>
        );
      case 'en_route':
        return (
          <Button 
            onClick={() => setShowDeliveryForm(true)} 
            className="w-full"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Delivery
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={`${assignment.status === 'offered' ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Delivery #{assignment.order_id.slice(-8)}
          </CardTitle>
          {getStatusBadge(assignment.status)}
        </div>
        <CardDescription>
          Offered {format(new Date(assignment.offered_at), 'PPp')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Earnings</p>
              <p className="text-lg font-semibold">₦{(assignment.delivery_fee_kobo / 100).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Distance</p>
              <p className="text-sm text-muted-foreground">{assignment.distance_km.toFixed(1)} km</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Est. Time</p>
              <p className="text-sm text-muted-foreground">{assignment.estimated_duration_minutes} mins</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-muted p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <div>
                <p className="font-medium">{assignment.orders_v2.customer_name}</p>
                <p className="text-sm text-muted-foreground">{assignment.orders_v2.customer_phone}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCallCustomer}
              className="flex items-center gap-1"
            >
              <Phone className="h-3 w-3" />
              Call
            </Button>
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Pickup</p>
              <p className="text-sm text-muted-foreground">{assignment.pickup_address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Delivery</p>
              <p className="text-sm text-muted-foreground">{assignment.delivery_address}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div>
          <p className="text-sm font-medium mb-2">Items to Deliver</p>
          <div className="space-y-1">
            {assignment.orders_v2.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>₦{(item.price * item.quantity / 100).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-medium text-sm mt-2 pt-2 border-t">
            <span>Total Order Value</span>
            <span>₦{(assignment.orders_v2.total / 100).toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4">
          {getNextAction()}
        </div>

        {/* Delivery Completion Form */}
        {showDeliveryForm && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Complete Delivery</h4>
            
            <div>
              <Label>Proof of Delivery Photo *</Label>
              <ImageUpload
                onImageUpload={setProofImageUrl}
                onImageRemove={() => setProofImageUrl('')}
                currentImageUrl={proofImageUrl}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Take a photo of the delivered items or customer signature
              </p>
            </div>

            <div>
              <Label htmlFor="delivery-notes">Delivery Notes (Optional)</Label>
              <Textarea
                id="delivery-notes"
                placeholder="Any notes about the delivery..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label>Rate Customer Experience</Label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setCustomerRating(rating)}
                    className={`p-1 ${customerRating >= rating ? 'text-amber-400' : 'text-gray-300'}`}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  ({customerRating}/5)
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeliveryForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCompleteDelivery} 
                disabled={isUpdating || !proofImageUrl}
                className="flex-1"
              >
                {isUpdating ? 'Completing...' : 'Complete Delivery'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}