import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface ErrorBoundaryDashboardProps {
  error?: Error;
  retry?: () => void;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ProductionErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<ErrorBoundaryDashboardProps> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<ErrorBoundaryDashboardProps> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Dashboard Error:', error, errorInfo);
    
    // You could send to a logging service here
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.sendBeacon) {
      const errorData = {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      try {
        navigator.sendBeacon('/api/errors', JSON.stringify(errorData));
      } catch (e) {
        // Silently fail if error reporting fails
      }
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorBoundaryFallback;
      return (
        <FallbackComponent 
          error={this.state.error} 
          retry={this.retry}
        />
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryDashboardProps> = ({ 
  error, 
  retry 
}) => {
  const navigate = useNavigate();

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                We encountered an unexpected error while loading your dashboard
              </p>
            </div>

            {isDevelopment && error && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium text-destructive hover:text-destructive/80">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                    {error.message}
                    {error.stack && (
                      <>
                        <br />
                        <br />
                        {error.stack}
                      </>
                    )}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={retry}
                className="flex-1"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="flex-1"
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                If this problem persists, please contact support or try refreshing your browser.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for handling async errors in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error) => {
    // Re-throw the error to be caught by the nearest error boundary
    throw error;
  }, []);

  return handleError;
};