import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface FeatureSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureSuggestionModal = ({ isOpen, onClose }: FeatureSuggestionModalProps) => {
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Using the correct useAuth hook from AuthContext
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a feature suggestion.",
        variant: "destructive",
      });
      return;
    }

    if (!suggestion.trim()) {
      toast({
        title: "Empty suggestion",
        description: "Please enter your feature suggestion.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("feature_suggestions")
        .insert({
          vendor_id: user.id,
          suggestion_text: suggestion.trim(),
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your feature suggestion has been submitted successfully.",
      });

      setSuggestion("");
      onClose();
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to submit your suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSuggestion("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>💬 Suggest a Feature</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suggestion">Your Feature Suggestion</Label>
            <Textarea
              id="suggestion"
              placeholder="Tell us about a feature you'd love to see in Vendora..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !suggestion.trim()}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Suggestion
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};