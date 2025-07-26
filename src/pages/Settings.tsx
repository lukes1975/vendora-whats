
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import UpgradePlanButton from '@/components/dashboard/UpgradePlanButton';
import { useSecureForm, commonValidationRules } from '@/hooks/useSecureForm';
import { sanitizeTextInput, logSecurityEvent } from '@/utils/security';
import { 
  Store, 
  Phone, 
  Upload, 
  Palette, 
  Save,
  Loader2,
  Image as ImageIcon,
  CheckCircle,
  X
} from 'lucide-react';

interface StoreSettings {
  store_name: string;
  whatsapp_number: string;
  logo_url: string | null;
  primary_color: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const themeColors = [
    { name: 'Deep Blue', color: '#012C6D' },
    { name: 'Royal Purple', color: '#6B46C1' },
    { name: 'Forest Green', color: '#059669' },
    { name: 'Crimson Red', color: '#DC2626' },
    { name: 'Orange', color: '#EA580C' },
    { name: 'Teal', color: '#0D9488' },
  ];

  const {
    values,
    errors,
    isSubmitting,
    setValue,
    handleSubmit,
  } = useSecureForm<StoreSettings>(
    {
      store_name: '',
      whatsapp_number: '',
      logo_url: null,
      primary_color: '#012C6D',
    },
    {
      store_name: commonValidationRules.storeName,
      whatsapp_number: commonValidationRules.whatsappNumber,
    }
  );

  // Load current settings on component mount
  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      setIsLoadingData(true);
      const { data, error } = await supabase
        .from('stores')
        .select('name, whatsapp_number, logo_url')
        .eq('vendor_id', user.id)
        .maybeSingle();

      if (error) {
        logSecurityEvent('Settings load error', { userId: user.id, error });
        toast({
          title: 'Error',
          description: 'Failed to load store settings.',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setValue('store_name', sanitizeTextInput(data.name || ''));
        // Extract phone number without +234 prefix for display
        const whatsappNumber = data.whatsapp_number || '';
        const displayNumber = whatsappNumber.startsWith('+234') ? whatsappNumber.slice(4) : whatsappNumber;
        setPhoneNumber(displayNumber);
        setValue('whatsapp_number', whatsappNumber); // Keep full number in form
        setValue('logo_url', data.logo_url);
        setLogoPreview(data.logo_url);
      }
    } catch (error) {
      logSecurityEvent('Settings load exception', { userId: user.id, error });
      toast({
        title: 'Error',
        description: 'Failed to load store settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user) return values.logo_url;

    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, logoFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      logSecurityEvent('Logo uploaded', { userId: user.id, filePath });
      return publicUrl;
    } catch (error) {
      logSecurityEvent('Logo upload error', { userId: user.id, error });
      toast({
        title: 'Upload Error',
        description: 'Failed to upload logo. Please try again.',
        variant: 'destructive',
      });
      return values.logo_url;
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        logSecurityEvent('Invalid file type upload attempt', { userId: user?.id, fileType: file.type });
        toast({
          title: 'Invalid file type',
          description: 'Please upload a JPG, PNG, or WebP image.',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > maxSize) {
        logSecurityEvent('Oversized file upload attempt', { userId: user?.id, fileSize: file.size });
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 2MB.',
          variant: 'destructive',
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    await handleSubmit(async (formValues) => {
      try {
        // Upload logo if changed
        const logoUrl = await uploadLogo();

        // Update store settings with sanitized data
        const fullWhatsAppNumber = phoneNumber ? `+234${phoneNumber}` : '';
        const { error } = await supabase
          .from('stores')
          .update({
            name: formValues.store_name, // Already sanitized by form
            whatsapp_number: fullWhatsAppNumber,
            logo_url: logoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('vendor_id', user.id);

        if (error) throw error;

        logSecurityEvent('Settings updated', { userId: user.id });
        toast({
          title: 'Success',
          description: 'Store settings updated successfully!',
        });

        // Clear logo file after successful save
        setLogoFile(null);
        setValue('logo_url', logoUrl);
      } catch (error) {
        logSecurityEvent('Settings update error', { userId: user.id, error });
        throw error; // Re-throw to be handled by handleSubmit
      }
    });
  };

  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="max-w-5xl mx-auto space-y-8 p-4">
        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Palette className="h-7 w-7 text-primary" />
              </div>
              Customize Your Brand
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Professional branding that builds trust with your customers
            </p>
          </div>
          <div className="sm:hidden">
            <UpgradePlanButton />
          </div>
        </div>

        {/* Settings Form */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Store Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                Business Information
              </CardTitle>
              <p className="text-muted-foreground">Essential details for your storefront</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storeName">Business Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="storeName"
                    value={values.store_name}
                    onChange={(e) => setValue('store_name', e.target.value)}
                    placeholder="Enter your business name"
                    className="pl-10"
                    required
                  />
                  {errors.store_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.store_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <div className="relative flex">
                  <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md border-input">
                    <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm font-medium text-foreground">+234</span>
                  </div>
                  <Input
                    id="whatsappNumber"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneNumber(value);
                      setValue('whatsapp_number', value ? `+234${value}` : '');
                    }}
                    placeholder="8012345678"
                    className="rounded-l-none"
                    maxLength={10}
                    required
                  />
                </div>
                {(errors.whatsapp_number || (phoneNumber && phoneNumber.length < 10)) && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.whatsapp_number || 'Please enter a valid 10-digit number'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Store Logo */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                Brand Logo
              </CardTitle>
              <p className="text-muted-foreground">Upload your professional logo</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logoPreview ? (
                  <div className="relative">
                    <div className="aspect-square w-32 mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={logoPreview}
                        alt="Brand logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Upload your brand logo (JPG, PNG - Max 2MB)
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logoUpload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logoUpload')?.click()}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {logoPreview ? 'Change Brand Logo' : 'Upload Brand Logo'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Colors */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                Brand Colors
              </CardTitle>
              <p className="text-muted-foreground">Choose colors that represent your brand</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {themeColors.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setValue('primary_color', theme.color)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      values.primary_color === theme.color
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded-md mb-2"
                      style={{ backgroundColor: theme.color }}
                    />
                    <p className="text-xs text-gray-600">{theme.name}</p>
                    {values.primary_color === theme.color && (
                      <CheckCircle className="absolute top-1 right-1 h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:relative lg:bg-transparent lg:border-t-0 lg:p-0 lg:mt-8">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={handleSaveSettings}
              disabled={isSubmitting}
              className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Brand Settings
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Add bottom padding on mobile to account for sticky button */}
        <div className="h-20 lg:h-0" />
        </div>
      </ScrollArea>
    </DashboardLayout>
  );
};

export default Settings;
