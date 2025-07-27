import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Bell, MessageSquare, Monitor, Mail } from 'lucide-react';

interface NotificationPreferencesFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const NotificationPreferencesForm: React.FC<NotificationPreferencesFormProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    whatsapp_notifications: true,
    dashboard_notifications: true,
    email_notifications: false
  });

  useEffect(() => {
    if (open && user) {
      loadExistingPreferences();
    }
  }, [open, user]);

  const loadExistingPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setPreferences({
          whatsapp_notifications: data.whatsapp_notifications,
          dashboard_notifications: data.dashboard_notifications,
          email_notifications: data.email_notifications
        });
      }
    } catch (error) {
      console.log('No existing notification preferences found');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          whatsapp_notifications: preferences.whatsapp_notifications,
          dashboard_notifications: preferences.dashboard_notifications,
          email_notifications: preferences.email_notifications
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Notification preferences saved successfully!');
      onComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-sm font-medium">WhatsApp Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Get order alerts on WhatsApp
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.whatsapp_notifications}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, whatsapp_notifications: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Monitor className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label className="text-sm font-medium">Dashboard Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        See notifications in your dashboard
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.dashboard_notifications}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, dashboard_notifications: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive order alerts via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPreferencesForm;