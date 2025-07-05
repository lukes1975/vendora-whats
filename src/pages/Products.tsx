import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ProductForm from "@/components/ProductForm";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAutoCreateStore } from "@/hooks/useAutoCreateStore";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  status: string;
  created_at: string;
  store_id: string;
}

const Products = () => {
  const { user } = useAuth();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  // Auto-create store if needed
  useAutoCreateStore();

  const { mutate: createProduct } = useMutation(
    async (newProduct: Omit<Product, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct]);
      
      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }
      
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products', user?.id]);
        toast.success("Product created successfully!");
        setShowProductForm(false);
      },
      onError: (error: any) => {
        toast.error(`Failed to create product: ${error.message}`);
      },
    }
  );

  const { mutate: updateProduct } = useMutation(
    async (updatedProduct: Product) => {
      const { data, error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', updatedProduct.id);
      
      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
      
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products', user?.id]);
        toast.success("Product updated successfully!");
        setEditingProduct(null);
        setShowProductForm(false);
      },
      onError: (error: any) => {
        toast.error(`Failed to update product: ${error.message}`);
      },
    }
  );

  const { mutate: deleteProduct } = useMutation(
    async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
      
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products', user?.id]);
        toast.success("Product deleted successfully!");
        setDeletingProduct(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to delete product: ${error.message}`);
      },
    }
  );

  const handleOpenProductForm = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
  };

  const confirmDeleteProduct = async () => {
    if (deletingProduct) {
      await deleteProduct(deletingProduct.id);
    }
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      return data as Product[];
    },
    enabled: !!user?.id,
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl font-bold">
            <Package className="mr-2 inline-block" />
            Products
          </CardTitle>
          <Button onClick={handleOpenProductForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <ProductForm
          open={showProductForm}
          onOpenChange={setShowProductForm}
          product={editingProduct}
          onSuccess={() => {
            queryClient.invalidateQueries(['products', user?.id]);
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />

        <AlertDialog open={!!deletingProduct} onOpenChange={setDeletingProduct}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Are you sure you want to delete "
                {deletingProduct?.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingProduct(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProduct}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>
                    Price: ${product.price.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4 rounded-md"
                  />
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>No products yet</p>
            <p className="text-sm">
              Add your first product to start selling
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Products;
