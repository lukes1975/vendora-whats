import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Zap, 
  Database, 
  Wifi,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  threshold: number;
}

interface PerformanceMonitorProps {
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ className = "" }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Monitor network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Performance monitoring
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const domTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      const currentTime = performance.now();

      const newMetrics: PerformanceMetric[] = [
        {
          label: 'Page Load Time',
          value: Math.round(loadTime),
          unit: 'ms',
          status: loadTime < 2000 ? 'excellent' : 
                 loadTime < 4000 ? 'good' : 'warning',
          threshold: 2000
        },
        {
          label: 'DOM Content Loaded',
          value: Math.round(domTime),
          unit: 'ms',
          status: domTime < 1500 ? 'excellent' : 
                 domTime < 3000 ? 'good' : 'warning',
          threshold: 1500
        },
        {
          label: 'Current Response Time',
          value: Math.round(currentTime),
          unit: 'ms',
          status: currentTime < 1000 ? 'excellent' : 
                 currentTime < 2000 ? 'good' : 'warning',
          threshold: 1000
        }
      ];

      // Add memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        newMetrics.push({
          label: 'Memory Usage',
          value: Math.round(memoryUsage),
          unit: '%',
          status: memoryUsage < 50 ? 'excellent' : 
                 memoryUsage < 75 ? 'good' : 
                 memoryUsage < 90 ? 'warning' : 'poor',
          threshold: 50
        });
      }

      setMetrics(newMetrics);
    };

    // Initial measurement
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Periodic updates
    const interval = setInterval(() => {
      measurePerformance();
    }, 30000); // Update every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('load', measurePerformance);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'warning':
      case 'poor':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getProgressValue = (metric: PerformanceMetric) => {
    if (metric.unit === '%') return 100 - metric.value;
    
    const ratio = metric.threshold / metric.value;
    return Math.min(100, ratio * 100);
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const averageScore = metrics.length > 0 
    ? metrics.reduce((acc, metric) => {
        const score = metric.status === 'excellent' ? 4 : 
                     metric.status === 'good' ? 3 : 
                     metric.status === 'warning' ? 2 : 1;
        return acc + score;
      }, 0) / metrics.length
    : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Activity className="h-5 w-5 mr-2" />
            Performance Monitor
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Badge 
              variant={averageScore > 3 ? "default" : averageScore > 2 ? "secondary" : "destructive"}
              className="text-xs"
            >
              Score: {averageScore.toFixed(1)}/4
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={getStatusColor(metric.status)}>
                    {getStatusIcon(metric.status)}
                  </div>
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono">
                    {metric.value}{metric.unit}
                  </span>
                  <Badge 
                    variant={metric.status === 'excellent' || metric.status === 'good' ? "default" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {metric.status}
                  </Badge>
                </div>
              </div>
              <div className="relative">
                <Progress 
                  value={getProgressValue(metric)} 
                  className="h-2"
                />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(metric.status)}`}
                  style={{ width: `${getProgressValue(metric)}%` }}
                />
              </div>
            </div>
          ))}

          {metrics.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Collecting performance data...</p>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Zap className="h-4 w-4 mr-1" />
            Performance Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Page loads under 2s provide the best user experience</li>
            <li>• Keep memory usage below 75% for optimal performance</li>
            <li>• Poor performance may indicate network or system issues</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};