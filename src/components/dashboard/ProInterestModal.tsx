
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProInterestModalProps {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

const ProInterestModal = ({ trigger, children }: ProInterestModalProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('pro_interest')
        .insert({
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp || null,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "We'll notify you as soon as paid plans are available.",
      });

      setFormData({ name: '', email: '', whatsapp: '' });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      Want Pro features after Early Access?
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Get notified about Pro plans</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
            <div className="flex">
              <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md border-input">
                <span className="text-sm font-medium text-foreground">+234</span>
              </div>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData(prev => ({ ...prev, whatsapp: value ? `+234${value}` : '' }));
                }}
                placeholder="8012345678"
                className="rounded-l-none"
                maxLength={10}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Notify Me'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProInterestModal;
