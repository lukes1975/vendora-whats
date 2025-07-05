
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: {
    id: string;
    name: string;
    price: number;
    description: string;
    image_url: string;
    store_id: string;
  } | null;
  onSuccess: () => void;
}

const ProductForm = ({ open, onOpenChange, product, onSuccess }: ProductFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(product?.image_url || "");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      description: product?.description || "",
      image_url: product?.image_url || "",
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    if (!user?.id) {
      toast.error("You must be logged in to create products");
      return;
    }

    setIsLoading(true);

    try {
      // First, ensure the user has a store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('vendor_id', user.id)
        .maybeSingle();

      if (storeError) {
        console.error('Error checking store:', storeError);
        toast.error("Error checking store information");
        return;
      }

      let storeId = storeData?.id;

      // If no store exists, create one automatically
      if (!storeId) {
        const defaultStoreName = user.email?.split('@')[0] || 'My Store';
        
        const { data: newStore, error: createStoreError } = await supabase
          .from('stores')
          .insert({
            vendor_id: user.id,
            name: defaultStoreName,
            slug: `${defaultStoreName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
            description: '',
            whatsapp_number: '',
            is_active: true
          })
          .select('id')
          .single();

        if (createStoreError) {
          console.error('Error creating store:', createStoreError);
          toast.error("Error creating store");
          return;
        }

        storeId = newStore.id;
      }

      const productData = {
        name: data.name,
        price: data.price,
        description: data.description || "",
        image_url: uploadedImageUrl,
        vendor_id: user.id,
        store_id: storeId,
      };

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success("Product updated successfully!");
      } else {
        // Create new product - pass single object, not array
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success("Product created successfully!");
      }

      reset();
      setUploadedImageUrl("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error("Error saving product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setUploadedImageUrl(url);
    setValue("image_url", url);
  };

  const handleImageRemove = () => {
    setUploadedImageUrl("");
    setValue("image_url", "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update your product here." : "Create a new product here."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" placeholder="Product name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              placeholder="0.00"
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Product description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <ImageUpload
            currentImageUrl={uploadedImageUrl}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
