import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  MapPin,
  Award
} from "lucide-react";
import StudentMarketplaceFeatures from "@/components/marketplace/StudentMarketplaceFeatures";
import CampusDeliveryMap from "@/components/marketplace/CampusDeliveryMap";
import StudentSuccessStories from "@/components/marketplace/StudentSuccessStories";

const MarketplaceDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Marketplace Dashboard</h2>
          <p className="text-muted-foreground">
            Advanced insights and tools for serious student entrepreneurs
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Target className="h-4 w-4" />
            Smart Insights
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Network
          </TabsTrigger>
          <TabsTrigger value="community" className="gap-2">
            <Award className="h-4 w-4" />
            Success Stories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campus Reach</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">
                  Students reached this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.3%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12-2 PM</div>
                <p className="text-xs text-muted-foreground">
                  Lunch break rush hour
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[65, 78, 82, 91, 88, 95, 71].map((value, index) => (
                    <div key={index} className="bg-muted rounded p-2 text-center">
                      <div className="text-sm font-medium">{value}%</div>
                      <div className="text-xs text-muted-foreground">activity</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <StudentMarketplaceFeatures />
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <CampusDeliveryMap />
          
          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-muted-foreground">On-time delivery</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">11 min</div>
                  <div className="text-sm text-muted-foreground">Avg delivery time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">4.9/5</div>
                  <div className="text-sm text-muted-foreground">Customer rating</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">15</div>
                  <div className="text-sm text-muted-foreground">Active riders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <StudentSuccessStories />
          
          <Card>
            <CardHeader>
              <CardTitle>Community Rankings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Top performing student entrepreneurs this semester
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "David O.", department: "Business Admin", revenue: "₦120K", badge: "👑 Food King" },
                  { name: "Sarah A.", department: "Computer Science", revenue: "₦85K", badge: "🔥 Tech Queen" },
                  { name: "Blessing O.", department: "Mass Comm", revenue: "₦65K", badge: "✨ Style Guru" },
                  { name: "Michael E.", department: "Engineering", revenue: "₦45K", badge: "🛠️ Gadget Pro" },
                  { name: "Peace I.", department: "Agriculture", revenue: "₦38K", badge: "🌱 Fresh Supplier" }
                ].map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm text-green-600">{student.revenue}</div>
                      <div className="text-xs">{student.badge}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplaceDashboard;