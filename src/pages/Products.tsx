
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Package, FolderOpen } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ProductForm from "@/components/ProductForm";
import CategoryForm from "@/components/CategoryForm";
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

interface Category {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  vendor_id: string;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

const Products = () => {
  const { user } = useAuth();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  // Auto-create store if needed
  useAutoCreateStore();

  const { mutate: deleteProduct } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products', user?.id]
      });
      toast.success("Product deleted successfully!");
      setDeletingProduct(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  const { mutate: deleteCategory } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories', user?.id]
      });
      toast.success("Category deleted successfully!");
      setDeletingCategory(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });

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
      deleteProduct(deletingProduct.id);
    }
  };

  const handleOpenCategoryForm = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
  };

  const confirmDeleteCategory = async () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id);
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

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products!category_id(count)
        `)
        .eq('vendor_id', user.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      return (data || []).map(category => ({
        ...category,
        product_count: category.products?.[0]?.count || 0
      })) as Category[];
    },
    enabled: !!user?.id,
  });

  // Organize categories into parent and child
  const parentCategories = categories?.filter(cat => !cat.parent_id) || [];
  const getCategoryChildren = (parentId: string) => {
    return categories?.filter(cat => cat.parent_id === parentId) || [];
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Package className="h-7 w-7 text-primary" />
              </div>
              Your Storefront Items
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage your products and organize them into categories
            </p>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary p-1 rounded-xl h-12">
              <TabsTrigger value="products" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Products</span>
                <span className="sm:hidden">Items</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium">
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Categories</span>
                <span className="sm:hidden">Groups</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl border">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Manage Your Products</h3>
                  <p className="text-muted-foreground mt-1">Showcase what you offer to potential customers</p>
                </div>
                <Button onClick={handleOpenProductForm} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add New Item</span>
                  <span className="sm:hidden">Add Item</span>
                </Button>
              </div>

              <ProductForm
                open={showProductForm}
                onOpenChange={setShowProductForm}
                product={editingProduct}
                onSuccess={() => {
                  queryClient.invalidateQueries({
                    queryKey: ['products', user?.id]
                  });
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
              />

              <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Are you sure you want to remove "
                      {deletingProduct?.name}" from your storefront?
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
                <div className="flex items-center justify-center min-h-[300px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Loading your products...</p>
                  </div>
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md">
                      <div className="relative">
                        {product.image_url && (
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{product.name}</CardTitle>
                        {product.description && (
                          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            className="flex-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Package className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No products yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start building your storefront by adding your first product. Show customers what you offer!
                  </p>
                  <Button onClick={handleOpenProductForm} size="lg" className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Organize Your Products</h3>
                <Button onClick={handleOpenCategoryForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add Category</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>

              <CategoryForm
                open={showCategoryForm}
                onOpenChange={setShowCategoryForm}
                category={editingCategory}
                onSuccess={() => {
                  queryClient.invalidateQueries({
                    queryKey: ['categories', user?.id]
                  });
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
              />

              <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the category "{deletingCategory?.name}" and unassign any products from it. Products will not be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletingCategory(null)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteCategory}>
                      Delete Category
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {categoriesLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
              ) : parentCategories.length > 0 ? (
                <div className="space-y-4">
                  {parentCategories.map((parent) => {
                    const subcategories = getCategoryChildren(parent.id);
                    return (
                      <Card key={parent.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <FolderOpen className="h-5 w-5" />
                                {parent.name}
                              </CardTitle>
                              <CardDescription>
                                {parent.description || "No description"}
                                {parent.product_count !== undefined && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {parent.product_count} products
                                  </span>
                                )}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCategory(parent)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="hidden sm:inline ml-2">Edit</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCategory(parent)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline ml-2">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {subcategories.length > 0 && (
                          <CardContent>
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">Subcategories:</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {subcategories.map((sub) => (
                                  <div key={sub.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                      <span className="text-sm font-medium">{sub.name}</span>
                                      {sub.product_count !== undefined && (
                                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                          {sub.product_count} products
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditCategory(sub)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteCategory(sub)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No product categories yet.</p>
                  <p className="text-sm">
                    Create categories to organize your products and help customers find what they need.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Products;
