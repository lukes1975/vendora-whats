import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRiderSession } from "@/hooks/useRiderSession";
import { MapPin, Phone, Package, Clock, Route } from "lucide-react";

const BikeDelivery: React.FC = () => {
  const {
    rider,
    assignment,
    loading,
    error,
    registerRider,
    updateLocation,
    fetchNearestAssignment,
    updateAssignmentStatus,
  } = useRiderSession();

  const [riderName, setRiderName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLat(position.coords.latitude);
          setCurrentLng(position.coords.longitude);
          
          // Auto-update location if rider is already registered
          if (rider && position.coords.latitude && position.coords.longitude) {
            updateLocation(position.coords.latitude, position.coords.longitude);
          }
        },
        (error) => console.error("Location error:", error),
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
      );
    }
  }, [rider, updateLocation]);

  // Periodically update location
  useEffect(() => {
    if (rider && rider.is_available) {
      const interval = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              updateLocation(position.coords.latitude, position.coords.longitude);
            },
            undefined,
            { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
          );
        }
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [rider, updateLocation]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      await registerRider(riderName, phone, currentLat || undefined, currentLng || undefined);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAvailabilityToggle = async (available: boolean) => {
    if (currentLat && currentLng) {
      await updateLocation(currentLat, currentLng, available);
    }
  };

  const handleAcceptAssignment = async () => {
    if (assignment && currentLat && currentLng) {
      try {
        await updateAssignmentStatus(assignment.id, "accepted", currentLat, currentLng);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleStatusUpdate = async (status: "picked_up" | "en_route" | "delivered") => {
    if (assignment && currentLat && currentLng) {
      try {
        await updateAssignmentStatus(assignment.id, status, currentLat, currentLng);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rider dashboard...</p>
        </div>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">🚴‍♂️ Vendora Delivery</CardTitle>
            <p className="text-center text-muted-foreground">Join our delivery network</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                  required
                />
              </div>
              
              {error && (
                <Alert>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isRegistering || !currentLat || !currentLng}
              >
                {isRegistering ? "Registering..." : "Start Delivery Work"}
              </Button>
              
              {!currentLat || !currentLng ? (
                <p className="text-sm text-muted-foreground text-center">
                  📍 Enable location access to continue
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">🚴‍♂️ Delivery Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {rider.rider_name}!</p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Rider Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Available for deliveries</span>
              <Switch
                checked={rider.is_available}
                onCheckedChange={handleAvailabilityToggle}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">{rider.phone}</span>
            </div>
            
            {rider.current_lat && rider.current_lng && (
              <div className="text-xs text-muted-foreground">
                📍 Location: {rider.current_lat.toFixed(4)}, {rider.current_lng.toFixed(4)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Card */}
        {rider.is_available && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Next Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignment ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Customer:</span>
                      <p>{assignment.customer_name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Store:</span>
                      <p>{assignment.store_name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Distance:</span>
                      <p>{assignment.distance_km.toFixed(1)} km</p>
                    </div>
                    <div>
                      <span className="font-medium">Est. Time:</span>
                      <p>{assignment.estimated_duration_minutes} min</p>
                    </div>
                    <div>
                      <span className="font-medium">Order Total:</span>
                      <p>₦{(assignment.total / 100).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAcceptAssignment}
                      className="flex-1"
                    >
                      Accept Delivery
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`tel:${assignment.customer_phone}`)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No deliveries available</p>
                  <Button onClick={fetchNearestAssignment} variant="outline">
                    Check for Orders
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default BikeDelivery;