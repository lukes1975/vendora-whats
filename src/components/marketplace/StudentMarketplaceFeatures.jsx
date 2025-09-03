import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Laptop, 
  Utensils, 
  Shirt, 
  TrendingUp,
  Clock,
  MapPin,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StudentMarketplaceFeatures = () => {
  const [semesterTrends, setSemesterTrends] = useState([]);
  const [campusHotspots, setCampusHotspots] = useState([]);
  const [academicCalendar, setAcademicCalendar] = useState([]);

  useEffect(() => {
    fetchMarketplaceFeatures();
  }, []);

  const fetchMarketplaceFeatures = async () => {
    try {
      // Fetch trending categories based on current semester
      const { data: trends } = await supabase
        .from('products')
        .select(`
          marketplace_category_id,
          marketplace_categories (name, icon),
          created_at
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq('status', 'active')
        .limit(100);

      // Group by category and count
      const categoryTrends = {};
      trends?.forEach(product => {
        const categoryName = product.marketplace_categories?.name || 'Other';
        if (!categoryTrends[categoryName]) {
          categoryTrends[categoryName] = { count: 0, icon: product.marketplace_categories?.icon || '📦' };
        }
        categoryTrends[categoryName].count++;
      });

      // Sort by popularity
      const sortedTrends = Object.entries(categoryTrends)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 4)
        .map(([name, data]) => ({ name, ...data }));

      setSemesterTrends(sortedTrends);

      // Mock campus hotspots (in real app, this would be based on location data)
      setCampusHotspots([
        { location: "Main Campus Gate", activity: "High", products: "Electronics, Food" },
        { location: "Faculty of Science", activity: "Medium", products: "Textbooks, Lab Equipment" },
        { location: "Student Hostel Area", activity: "High", products: "Food, Fashion" },
        { location: "Library Complex", activity: "Medium", products: "Study Materials" }
      ]);

      // Mock academic calendar integration
      const currentMonth = new Date().getMonth();
      const academicEvents = [
        { month: 0, event: "New Semester", demand: "Textbooks, Stationery" },
        { month: 3, event: "Mid-Semester", demand: "Study Guides, Electronics" },
        { month: 5, event: "Exam Period", demand: "Past Questions, Energy Drinks" },
        { month: 8, event: "New Session", demand: "Everything!" },
      ];

      setAcademicCalendar(academicEvents.filter(event => event.month >= currentMonth));

    } catch (error) {
      console.error('Error fetching marketplace features:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Semester Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            What's Hot This Semester
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {semesterTrends.map((trend, index) => (
              <div key={trend.name} className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl mb-2">{trend.icon}</div>
                <div className="font-medium text-sm">{trend.name}</div>
                <div className="text-xs text-muted-foreground">{trend.count} new items</div>
                {index === 0 && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    🔥 Hottest
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campus Delivery Zones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Campus Activity Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campusHotspots.map((spot, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{spot.location}</div>
                  <div className="text-xs text-muted-foreground">Popular: {spot.products}</div>
                </div>
                <Badge 
                  variant={spot.activity === 'High' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {spot.activity} Activity
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Calendar Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Academic Calendar Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {academicCalendar.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
                <div>
                  <div className="font-medium text-sm">{event.event} Coming Up</div>
                  <div className="text-xs text-muted-foreground">Students will need: {event.demand}</div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Prepare Stock
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Category Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Smart Selling Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">Peak Hours</div>
                  <div className="text-xs text-muted-foreground">12PM-2PM & 6PM-8PM daily</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <Star className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-medium text-sm">Best Days</div>
                  <div className="text-xs text-muted-foreground">Monday & Thursday for new listings</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">💡 Pro Tips:</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• List textbooks before semester starts</div>
                <div>• Electronics sell best on weekends</div>
                <div>• Food items peak during exam periods</div>
                <div>• Fashion trends follow payday cycles</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMarketplaceFeatures;