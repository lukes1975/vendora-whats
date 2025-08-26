import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  User, 
  Phone, 
  Star,
  MessageSquare,
  Truck
} from 'lucide-react';
import { format } from 'date-fns';

// Add Google Maps type declarations
declare global {
  interface Window {
    google: any;
  }
}

interface DeliveryData {
  id: string;
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
  completed_at?: string;
  proof_of_delivery_url?: string;
  customer_rating?: number;
  delivery_notes?: string;
  rider_sessions?: {
    id: string;
    rider_name: string;
    phone: string;
    current_lat?: number;
    current_lng?: number;
    last_seen_at: string;
  };
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

interface DeliveryTrackingMapProps {
  orderId: string;
  customerId?: string; // For customer view
  riderId?: string; // For rider view
  showControls?: boolean; // Show rider controls
}

export function DeliveryTrackingMap({ 
  orderId, 
  customerId, 
  riderId, 
  showControls = false 
}: DeliveryTrackingMapProps) {
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<{
    pickup?: any;
    delivery?: any;
    rider?: any;
  }>({});

  useEffect(() => {
    fetchDeliveryData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('delivery-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_assignments',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          fetchDeliveryData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rider_sessions'
        },
        (payload) => {
          if (deliveryData?.rider_sessions?.id === (payload.new as any)?.id) {
            setRiderLocation({
              lat: (payload.new as any).current_lat,
              lng: (payload.new as any).current_lng
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Initialize Google Maps
  useEffect(() => {
    if (!deliveryData || !mapRef.current || map) return;

    // Check if Google Maps is loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { 
        lat: deliveryData.pickup_lat, 
        lng: deliveryData.pickup_lng 
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

      setMap(googleMap);
      setupMapMarkers(googleMap);
    } else {
      // Fallback: show static map info without Google Maps
      console.log('Google Maps not loaded, showing static info only');
    }
  }, [deliveryData, map]);

  // Update rider position on map
  useEffect(() => {
    if (!map || !riderLocation || !markers.rider) return;

    markers.rider.setPosition(riderLocation);
    updateETA();
  }, [riderLocation, map, markers.rider]);

  const fetchDeliveryData = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          rider_sessions(
            id,
            rider_name,
            phone,
            current_lat,
            current_lng,
            last_seen_at
          ),
          orders_v2!inner(
            id,
            customer_name,
            customer_phone,
            items,
            total,
            currency
          )
        `)
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Delivery assignment not found');

      setDeliveryData({
        ...data,
        orders_v2: {
          ...data.orders_v2,
          items: Array.isArray(data.orders_v2.items) 
            ? data.orders_v2.items.map((item: any) => ({
                name: item.name || '',
                quantity: item.quantity || 0,
                price: item.price || 0
              }))
            : []
        }
      } as DeliveryData);
      
      if (data.rider_sessions?.current_lat && data.rider_sessions?.current_lng) {
        setRiderLocation({
          lat: data.rider_sessions.current_lat,
          lng: data.rider_sessions.current_lng
        });
      }
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast.error('Failed to load delivery information');
    } finally {
      setLoading(false);
    }
  };

  const setupMapMarkers = (googleMap: any) => {
    if (!deliveryData) return;
    
    // Check if Google Maps is available
    if (!window.google || !window.google.maps) return;

    const newMarkers: any = {};

    // Pickup marker
    newMarkers.pickup = new window.google.maps.Marker({
      position: { 
        lat: deliveryData.pickup_lat, 
        lng: deliveryData.pickup_lng 
      },
      map: googleMap,
      title: 'Pickup Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#10b981" stroke="#065f46" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32)
      }
    });

    // Delivery marker
    newMarkers.delivery = new window.google.maps.Marker({
      position: { 
        lat: deliveryData.delivery_lat, 
        lng: deliveryData.delivery_lng 
      },
      map: googleMap,
      title: 'Delivery Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#ef4444" stroke="#7f1d1d" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32)
      }
    });

    // Rider marker (if location available)
    if (riderLocation) {
      newMarkers.rider = new window.google.maps.Marker({
        position: riderLocation,
        map: googleMap,
        title: 'Rider Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="white" stroke-width="2"/>
              <path d="M12 2L15 8H9L12 2Z" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      });
    }

    setMarkers(newMarkers);

    // Fit map to show all markers
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: deliveryData.pickup_lat, lng: deliveryData.pickup_lng });
    bounds.extend({ lat: deliveryData.delivery_lat, lng: deliveryData.delivery_lng });
    if (riderLocation) {
      bounds.extend(riderLocation);
    }
    googleMap.fitBounds(bounds);
  };

  const updateETA = () => {
    if (!riderLocation || !deliveryData) return;

    // Simple ETA calculation based on distance and average speed
    const distance = calculateDistance(
      riderLocation.lat,
      riderLocation.lng,
      deliveryData.delivery_lat,
      deliveryData.delivery_lng
    );
    
    // Assume 20 km/h average speed in city
    const etaMinutes = Math.max(5, Math.round((distance / 20) * 60));
    setEta(etaMinutes);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      offered: { label: 'Offered', color: 'secondary' },
      queued: { label: 'Queued', color: 'secondary' },
      accepted: { label: 'Accepted', color: 'default' },
      picked_up: { label: 'Picked Up', color: 'default' },
      en_route: { label: 'En Route', color: 'default' },
      delivered: { label: 'Delivered', color: 'default' },
      cancelled: { label: 'Cancelled', color: 'destructive' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'secondary' };
    return <Badge variant={config.color as any}>{config.label}</Badge>;
  };

  const handleCallRider = () => {
    if (deliveryData?.rider_sessions?.phone) {
      window.open(`tel:${deliveryData.rider_sessions.phone}`);
    }
  };

  const handleNavigateToCustomer = () => {
    if (deliveryData) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${deliveryData.delivery_lat},${deliveryData.delivery_lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!deliveryData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Truck className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No delivery information found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Delivery Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Tracking
            </CardTitle>
            {getStatusBadge(deliveryData.status)}
          </div>
          <CardDescription>
            Order: {deliveryData.orders_v2.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Distance</p>
              <p className="text-lg">{deliveryData.distance_km.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-sm font-medium">Delivery Fee</p>
              <p className="text-lg">₦{(deliveryData.delivery_fee_kobo / 100).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ETA
              </p>
              <p className="text-lg">
                {eta ? `${eta} mins` : `${deliveryData.estimated_duration_minutes} mins`}
              </p>
            </div>
          </div>

          {deliveryData.rider_sessions && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{deliveryData.rider_sessions.rider_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Last seen: {format(new Date(deliveryData.rider_sessions.last_seen_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCallRider}
                    className="flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Chat
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showControls && deliveryData.status === 'accepted' && (
            <div className="flex gap-2">
              <Button
                onClick={handleNavigateToCustomer}
                className="flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Navigate to Customer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg"
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="font-medium">Pickup Location</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {deliveryData.pickup_address}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-medium">Delivery Location</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {deliveryData.delivery_address}
              </p>
            </div>
          </div>

          {deliveryData.delivery_notes && (
            <div>
              <p className="font-medium mb-1">Delivery Notes</p>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {deliveryData.delivery_notes}
              </p>
            </div>
          )}

          {deliveryData.proof_of_delivery_url && (
            <div>
              <p className="font-medium mb-2">Proof of Delivery</p>
              <img 
                src={deliveryData.proof_of_delivery_url} 
                alt="Proof of delivery" 
                className="max-w-xs rounded border"
              />
            </div>
          )}

          {deliveryData.customer_rating && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Customer Rating:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${
                      i < deliveryData.customer_rating! 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  ({deliveryData.customer_rating}/5)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}