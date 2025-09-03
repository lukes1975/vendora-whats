import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Clock, Users, Navigation } from "lucide-react";

const CampusDeliveryMap = () => {
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [activeRiders, setActiveRiders] = useState(12);
  const [averageDeliveryTime, setAverageDeliveryTime] = useState(15);

  useEffect(() => {
    // Mock delivery zones data (in real app, this would come from API)
    setDeliveryZones([
      {
        id: 1,
        name: "Main Campus",
        areas: ["Faculty Buildings", "Admin Block", "Library"],
        deliveryTime: "10-15 mins",
        fee: "₦200",
        availability: "High",
        riderCount: 5,
        color: "green"
      },
      {
        id: 2,
        name: "Student Hostels",
        areas: ["Male Hostel", "Female Hostel", "New Hostel"],
        deliveryTime: "5-10 mins",
        fee: "₦150",
        availability: "High",
        riderCount: 4,
        color: "blue"
      },
      {
        id: 3,
        name: "Staff Quarters",
        areas: ["Senior Staff Quarters", "Junior Staff Quarters"],
        deliveryTime: "15-20 mins",
        fee: "₦300",
        availability: "Medium",
        riderCount: 2,
        color: "orange"
      },
      {
        id: 4,
        name: "Off-Campus Areas",
        areas: ["Oye Town", "Nearby Communities"],
        deliveryTime: "20-30 mins",
        fee: "₦500",
        availability: "Low",
        riderCount: 1,
        color: "red"
      }
    ]);
  }, []);

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'High': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Low': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Campus Delivery Network
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            {activeRiders} Riders Online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-primary">{averageDeliveryTime}min</div>
            <div className="text-xs text-muted-foreground">Avg Delivery</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-green-600">95%</div>
            <div className="text-xs text-muted-foreground">On-Time Rate</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-blue-600">24/7</div>
            <div className="text-xs text-muted-foreground">Service Hours</div>
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="space-y-3">
          {deliveryZones.map((zone) => (
            <div key={zone.id} className="p-4 border border-border rounded-lg hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{zone.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getAvailabilityColor(zone.availability)}>
                    {zone.availability}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {zone.riderCount} riders
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>{zone.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    <span>{zone.fee}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs">Covers:</div>
                  <div className="text-xs">{zone.areas.join(", ")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Tips */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            🚀 Smart Delivery Tips
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            <div>• Bundle orders from same area for faster delivery</div>
            <div>• Peak hours: 12PM-2PM and 6PM-8PM (expect delays)</div>
            <div>• Free delivery available for orders above ₦5,000</div>
            <div>• Schedule deliveries during class hours for faster service</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <MapPin className="h-4 w-4 mr-2" />
            Check My Area
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Join as Rider
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampusDeliveryMap;