import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logSecurityEvent } from "@/utils/security";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const ImageUpload = ({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      logSecurityEvent('Invalid file type upload attempt', { 
        userId: user?.id, 
        fileType: file.type,
        fileName: file.name 
      });
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or WebP image.',
        variant: 'destructive',
      });
      return false;
    }

    if (file.size > maxSize) {
      logSecurityEvent('Oversized file upload attempt', { 
        userId: user?.id, 
        fileSize: file.size,
        fileName: file.name 
      });
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!validateFile(file)) return;

    setUploading(true);
    try {
      // Create secure filename with timestamp and user ID
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase Storage with enhanced security
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // Prevent overwriting existing files
        });

      if (error) {
        logSecurityEvent('File upload error', { 
          userId: user.id, 
          error: error.message,
          filePath 
        });
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onImageUpload(publicUrl);

      logSecurityEvent('File uploaded successfully', { 
        userId: user.id, 
        filePath: data.path 
      });

      toast({
        title: 'Success',
        description: 'Image uploaded successfully!',
      });
    } catch (error) {
      logSecurityEvent('File upload exception', { 
        userId: user.id, 
        error 
      });
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (currentImageUrl && user) {
      try {
        // Extract file path from URL for secure deletion
        const url = new URL(currentImageUrl);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const filePath = `${user.id}/${fileName}`;

        // Verify user owns the file before deletion
        const { data: fileExists } = await supabase.storage
          .from('product-images')
          .list(user.id, {
            search: fileName
          });

        if (fileExists && fileExists.length > 0) {
          await supabase.storage
            .from('product-images')
            .remove([filePath]);
          
          logSecurityEvent('File deleted', { 
            userId: user.id, 
            filePath 
          });
        }
      } catch (error) {
        logSecurityEvent('File deletion error', { 
          userId: user.id, 
          error 
        });
        // Don't show error to user for deletion failures
      }
    }

    setPreview(null);
    onImageRemove();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Product Image</Label>
      
      {preview ? (
        <div className="relative">
          <div className="aspect-square w-full max-w-sm mx-auto rounded-lg overflow-hidden border">
            <img
              src={preview}
              alt="Product preview"
              className="w-full h-full object-cover"
              onError={() => {
                logSecurityEvent('Image load error', { 
                  userId: user?.id, 
                  imageUrl: preview 
                });
                setPreview(null);
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-4">
            Upload a product image (JPG, PNG, WebP - Max 2MB)
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveImage}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;