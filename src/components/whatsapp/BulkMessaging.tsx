import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';
import { 
  Send, 
  Clock, 
  Users, 
  Zap, 
  Calendar as CalendarIcon,
  MessageSquare,
  Plus,
  Edit,
  Trash
} from 'lucide-react';

interface BulkMessagingProps {
  store: any;
}

export const BulkMessaging: React.FC<BulkMessagingProps> = ({ store }) => {
  const { toast } = useToast();
  const { templates, addTemplate, updateTemplate, deleteTemplate, generateMessage } = useWhatsAppTemplates();
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    message: '',
    type: 'promotion' as 'welcome' | 'followup' | 'promotion' | 'order_status'
  });

  const [campaign, setCampaign] = useState({
    name: '',
    message: '',
    templateId: '',
    recipients: [] as string[],
    scheduledDate: new Date(),
    immediatelySend: false
  });

  const [creditBalance, setCreditBalance] = useState(1250);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.message) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in template name and message',
        variant: 'destructive'
      });
      return;
    }

    addTemplate({
      name: newTemplate.name,
      message: newTemplate.message,
      type: newTemplate.type
    });

    setNewTemplate({
      name: '',
      message: '',
      type: 'promotion'
    });
  };

  const calculateEstimatedCost = (recipientCount: number) => {
    // Assuming 1 credit per message
    return recipientCount * 1;
  };

  const handleSendCampaign = async () => {
    if (!campaign.message || campaign.recipients.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide message and recipients',
        variant: 'destructive'
      });
      return;
    }

    const cost = calculateEstimatedCost(campaign.recipients.length);
    
    if (cost > creditBalance) {
      toast({
        title: 'Insufficient Credits',
        description: 'You need more credits to send this campaign',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Here you would integrate with your WhatsApp bulk messaging API
      toast({
        title: 'Campaign Scheduled',
        description: `Campaign "${campaign.name}" has been scheduled for ${campaign.recipients.length} recipients`,
      });

      // Reset form
      setCampaign({
        name: '',
        message: '',
        templateId: '',
        recipients: [],
        scheduledDate: new Date(),
        immediatelySend: false
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send campaign',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Credit Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Messaging Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{creditBalance.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Credits remaining</p>
            </div>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">124</div>
              <p className="text-xs text-muted-foreground">Used this month</p>
            </div>
            <div>
              <div className="text-lg font-semibold">8</div>
              <p className="text-xs text-muted-foreground">Campaigns sent</p>
            </div>
            <div>
              <div className="text-lg font-semibold">3.2%</div>
              <p className="text-xs text-muted-foreground">Response rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Create Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={campaign.name}
                    onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Weekend Sale Promo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-select">Use Template (Optional)</Label>
                  <Select
                    value={campaign.templateId}
                    onValueChange={(value) => {
                      setCampaign(prev => ({ ...prev, templateId: value }));
                      const template = templates.find(t => t.id === value);
                      if (template) {
                        setCampaign(prev => ({ ...prev, message: template.message }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-message">Message</Label>
                <Textarea
                  id="campaign-message"
                  value={campaign.message}
                  onChange={(e) => setCampaign(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Write your message here..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  {campaign.message.length}/1000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Input
                  id="recipients"
                  placeholder="Paste phone numbers separated by commas"
                  onChange={(e) => {
                    const numbers = e.target.value.split(',').map(n => n.trim()).filter(n => n);
                    setCampaign(prev => ({ ...prev, recipients: numbers }));
                    setEstimatedCost(calculateEstimatedCost(numbers.length));
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  {campaign.recipients.length} recipients selected
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Estimated Cost</div>
                  <p className="text-sm text-muted-foreground">
                    {estimatedCost} credits for {campaign.recipients.length} messages
                  </p>
                </div>
                <Badge variant={estimatedCost <= creditBalance ? 'default' : 'destructive'}>
                  {estimatedCost <= creditBalance ? 'Affordable' : 'Insufficient Credits'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSendCampaign} disabled={estimatedCost > creditBalance}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Template */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Weekend Sale"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-type">Template Type</Label>
                  <Select
                    value={newTemplate.type}
                    onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="order_status">Order Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-message">Message Template</Label>
                  <Textarea
                    id="template-message"
                    value={newTemplate.message}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Use {storeName}, {productName}, {price} for dynamic content"
                    rows={4}
                  />
                </div>

                <Button onClick={handleCreateTemplate} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>

            {/* Template List */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {template.type}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {template.message.substring(0, 100)}...
                      </p>
                    </div>
                  ))}

                  {templates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No templates created yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Messages Sent</span>
                </div>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Response Rate</span>
                </div>
                <div className="text-2xl font-bold">3.2%</div>
                <p className="text-sm text-muted-foreground">Average response</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Credits Used</span>
                </div>
                <div className="text-2xl font-bold">456</div>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Weekend Sale', sent: 500, responses: 16, date: '2024-01-15' },
                  { name: 'New Product Launch', sent: 320, responses: 12, date: '2024-01-12' },
                  { name: 'Thank You Message', sent: 180, responses: 8, date: '2024-01-10' }
                ].map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">{campaign.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{campaign.sent} sent</div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.responses} responses ({((campaign.responses / campaign.sent) * 100).toFixed(1)}%)
                      </div>
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