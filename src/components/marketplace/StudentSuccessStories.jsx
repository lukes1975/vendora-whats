import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Award, Crown } from "lucide-react";

const StudentSuccessStories = () => {
  const successStories = [
    {
      id: 1,
      name: "Sarah Adebayo",
      department: "Computer Science",
      level: "300L",
      business: "Tech & Accessories",
      monthlyRevenue: 85000,
      topProducts: "Phone cases, Chargers, Earphones",
      achievement: "Top Electronics Seller",
      rating: 4.9,
      orders: 156,
      avatar: "/api/placeholder/40/40",
      quote: "Started with ₦20K, now making ₦85K monthly selling tech accessories to students!"
    },
    {
      id: 2,
      name: "David Okafor",
      department: "Business Administration",
      level: "400L", 
      business: "Campus Eats",
      monthlyRevenue: 120000,
      topProducts: "Jollof rice, Snacks, Drinks",
      achievement: "Food King 👑",
      rating: 4.8,
      orders: 312,
      avatar: "/api/placeholder/40/40",
      quote: "My food business feeds 100+ students daily. From hostel cooking to campus empire!"
    },
    {
      id: 3,
      name: "Blessing Okoye",
      department: "Mass Communication",
      level: "200L",
      business: "Fashion Forward",
      monthlyRevenue: 65000,
      topProducts: "Thrift clothes, Shoes, Bags",
      achievement: "Style Influencer",
      rating: 4.7,
      orders: 89,
      avatar: "/api/placeholder/40/40",
      quote: "Turned my fashion sense into a thriving business. Students love affordable style!"
    }
  ];

  const getAchievementIcon = (achievement) => {
    if (achievement.includes("👑") || achievement.includes("King")) return <Crown className="h-4 w-4 text-yellow-600" />;
    if (achievement.includes("Top")) return <Award className="h-4 w-4 text-blue-600" />;
    return <Star className="h-4 w-4 text-purple-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Student Success Stories
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real FUOYE students building profitable businesses on our platform
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {successStories.map((story) => (
          <div key={story.id} className="p-4 bg-gradient-to-br from-background to-muted/30 border border-border rounded-lg hover:border-primary/20 transition-colors">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={story.avatar} alt={story.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {story.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{story.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {story.department} • {story.level}
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getAchievementIcon(story.achievement)}
                    {story.achievement}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="mb-3 p-3 bg-primary/5 border-l-4 border-primary rounded-r-lg">
              <p className="text-sm italic text-muted-foreground">
                "{story.quote}"
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  ₦{(story.monthlyRevenue / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-muted-foreground">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {story.orders}
                </div>
                <div className="text-xs text-muted-foreground">Orders Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600 flex items-center justify-center gap-1">
                  {story.rating}
                  <Star className="h-3 w-3 fill-current" />
                </div>
                <div className="text-xs text-muted-foreground">Average Rating</div>
              </div>
            </div>

            {/* Business Info */}
            <div className="text-xs text-muted-foreground">
              <div className="mb-1">
                <span className="font-medium">Business:</span> {story.business}
              </div>
              <div>
                <span className="font-medium">Top Products:</span> {story.topProducts}
              </div>
            </div>
          </div>
        ))}

        {/* Inspiration Message */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg text-center">
          <div className="text-sm font-medium text-foreground mb-2">
            🌟 Ready to Write Your Success Story?
          </div>
          <div className="text-xs text-muted-foreground">
            Join 500+ FUOYE students who are already earning while studying. 
            Your business journey starts with just one product listing!
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentSuccessStories;