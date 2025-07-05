
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";

interface Product {
  id?: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  category?: string;
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Product>({
    name: "",
    price: 0,
    description: "",
    image_url: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description || "",
        image_url: product.image_url || "",
        category: product.category || "",
      });
    } else {
      setFormData({
        name: "",
        price: 0,
        description: "",
        image_url: "",
        category: "",
      });
    }
  }, [product, open]);

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  const handleImageRemove = () => {
    setFormData({ ...formData, image_url: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Price must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Get user's store
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .eq('vendor_id', user.id)
        .limit(1);

      if (!stores || stores.length === 0) {
        toast({
          title: 'Error',
          description: 'No store found. Please create a store first.',
          variant: 'destructive',
        });
        return;
      }

      const storeId = stores[0].id;

      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name.trim(),
            price: formData.price,
            description: formData.description?.trim() || null,
            image_url: formData.image_url || null,
            category: formData.category?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Product updated successfully!',
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: formData.name.trim(),
            price: formData.price,
            description: formData.description?.trim() || null,
            image_url: formData.image_url || null,
            category: formData.category?.trim() || null,
            vendor_id: user.id,
            store_id: storeId,
            status: 'active',
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Product created successfully!',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUpload
        currentImageUrl={formData.image_url}
        onImageUpload={handleImageUpload}
        onImageRemove={handleImageRemove}
      />

      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.price || ""}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g., Electronics, Clothing"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your product..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : product?.id ? 'Update Product' : 'Add Product'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>
              {product?.id ? 'Edit Product' : 'Add New Product'}
            </DrawerTitle>
            <DrawerDescription>
              {product?.id ? 'Update your product details' : 'Fill in the details for your new product'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            <FormContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product?.id ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {product?.id ? 'Update your product details' : 'Fill in the details for your new product'}
          </DialogDescription>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
