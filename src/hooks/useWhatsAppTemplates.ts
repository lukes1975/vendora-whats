
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MessageTemplate {
  id: string;
  name: string;
  message: string;
  type: 'welcome' | 'followup' | 'promotion' | 'order_status';
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Welcome Message',
    message: 'Welcome to {storeName}! Thanks for your interest in {productName}. How can I help you today?',
    type: 'welcome',
  },
  {
    id: '2',
    name: 'Follow-up Message',
    message: 'Hi! I noticed you were interested in {productName}. Do you have any questions about it?',
    type: 'followup',
  },
  {
    id: '3',
    name: 'Promotion Alert',
    message: '🔥 Special offer on {productName}! Get it now for just ₦{price}. Limited time only!',
    type: 'promotion',
  },
  {
    id: '4',
    name: 'Order Confirmation',
    message: 'Thank you for your order! Your {productName} order has been received. We\'ll get back to you shortly.',
    type: 'order_status',
  },
];

export const useWhatsAppTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates);
  const { toast } = useToast();

  const addTemplate = (template: Omit<MessageTemplate, 'id'>) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    toast({
      title: 'Template Added',
      description: 'Your message template has been saved successfully.',
    });
  };

  const updateTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ));
    toast({
      title: 'Template Updated',
      description: 'Your message template has been updated successfully.',
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
    toast({
      title: 'Template Deleted',
      description: 'Your message template has been deleted.',
    });
  };

  const generateMessage = (templateId: string, variables: Record<string, string>) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return '';

    let message = template.message;
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return message;
  };

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    generateMessage,
  };
};
