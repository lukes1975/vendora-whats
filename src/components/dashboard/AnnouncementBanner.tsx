
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('vendora-announcement-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('vendora-announcement-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-900">
      <Sparkles className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm font-medium">
          🎉 Vendora Early Access is live — invite 5 sellers and earn rewards!
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 hover:bg-blue-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default AnnouncementBanner;
