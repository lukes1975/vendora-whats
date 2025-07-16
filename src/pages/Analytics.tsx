
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Track your store performance and customer insights
            </p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="grid gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardContent className="pt-12 pb-12">
              <div className="text-center max-w-md mx-auto">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <BarChart3 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Advanced Analytics Coming Soon
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Get detailed insights into your store performance, customer behavior, and sales trends. 
                  Track what matters most to grow your business.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Sales Analytics
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Customer Insights
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Product Performance
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Revenue Tracking
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
