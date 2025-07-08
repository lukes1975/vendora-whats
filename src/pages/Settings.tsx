
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Store, 
  Phone, 
  Upload, 
  Palette, 
  Save,
  Loader2,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [storeName, setStoreName] = useState('My Store');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('#012C6D');

  const themeColors = [
    { name: 'Deep Blue', color: '#012C6D' },
    { name: 'Royal Purple', color: '#6B46C1' },
    { name: 'Forest Green', color: '#059669' },
    { name: 'Crimson Red', color: '#DC2626' },
    { name: 'Orange', color: '#EA580C' },
    { name: 'Teal', color: '#0D9488' },
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    // Future: Add actual save logic here
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Settings</h1>
          <p className="text-gray-600">Customize your storefront information and branding</p>
        </div>

        {/* Settings Form */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Enter your store name"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="whatsappNumber"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                Store Logo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logoPreview ? (
                  <div className="relative">
                    <div className="aspect-square w-32 mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={logoPreview}
                        alt="Store logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setLogoPreview(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Upload your store logo (JPG, PNG - Max 2MB)
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
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
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Colors - Full width on mobile, spans both columns on larger screens */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-600" />
                Theme Color
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {themeColors.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setSelectedTheme(theme.color)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      selectedTheme === theme.color
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded-md mb-2"
                      style={{ backgroundColor: theme.color }}
                    />
                    <p className="text-xs text-gray-600">{theme.name}</p>
                    {selectedTheme === theme.color && (
                      <CheckCircle className="absolute top-1 right-1 h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button - Sticky on mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:relative lg:bg-transparent lg:border-t-0 lg:p-0 lg:mt-8">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Add bottom padding on mobile to account for sticky button */}
        <div className="h-20 lg:h-0" />
      </div>
    </DashboardLayout>
  );
};

export default Settings;
