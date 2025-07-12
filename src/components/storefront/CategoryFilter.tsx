import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  product_count?: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  className?: string;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  className = "" 
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const parentCategories = categories.filter(cat => !cat.parent_id);
  const getSubcategories = (parentId: string) => 
    categories.filter(cat => cat.parent_id === parentId);

  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.name;

  const handleCategorySelect = (categoryId: string | null) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  // Desktop view - horizontal tabs
  const DesktopView = () => (
    <div className={`hidden md:flex items-center gap-2 flex-wrap ${className}`}>
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className="rounded-full"
      >
        All Products
      </Button>
      {parentCategories.map((parent) => {
        const subcategories = getSubcategories(parent.id);
        const isParentSelected = selectedCategory === parent.id;
        const hasSelectedChild = subcategories.some(sub => sub.id === selectedCategory);
        
        return (
          <div key={parent.id} className="flex items-center gap-1">
            <Button
              variant={isParentSelected || hasSelectedChild ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(parent.id)}
              className="rounded-full"
            >
              {parent.name}
              {parent.product_count !== undefined && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {parent.product_count}
                </Badge>
              )}
            </Button>
            {subcategories.length > 0 && (hasSelectedChild || isParentSelected) && (
              <div className="flex gap-1 ml-2">
                {subcategories.map((sub) => (
                  <Button
                    key={sub.id}
                    variant={selectedCategory === sub.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategoryChange(sub.id)}
                    className="rounded-full text-xs"
                  >
                    {sub.name}
                    {sub.product_count !== undefined && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {sub.product_count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Mobile view - sheet with filter options
  const MobileView = () => (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>
                {selectedCategoryName ? `Category: ${selectedCategoryName}` : "All Categories"}
              </span>
            </div>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryChange(null);
                }}
                className="h-auto p-1"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>Filter by Category</SheetTitle>
            <SheetDescription>
              Choose a category to filter products
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleCategorySelect(null)}
            >
              All Products
            </Button>
            {parentCategories.map((parent) => {
              const subcategories = getSubcategories(parent.id);
              
              return (
                <div key={parent.id} className="space-y-2">
                  <Button
                    variant={selectedCategory === parent.id ? "default" : "outline"}
                    className="w-full justify-between"
                    onClick={() => handleCategorySelect(parent.id)}
                  >
                    <span>{parent.name}</span>
                    {parent.product_count !== undefined && (
                      <Badge variant="secondary">
                        {parent.product_count}
                      </Badge>
                    )}
                  </Button>
                  {subcategories.length > 0 && (
                    <div className="pl-4 space-y-1">
                      {subcategories.map((sub) => (
                        <Button
                          key={sub.id}
                          variant={selectedCategory === sub.id ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-between"
                          onClick={() => handleCategorySelect(sub.id)}
                        >
                          <span>└ {sub.name}</span>
                          {sub.product_count !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              {sub.product_count}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <div className={className}>
      <DesktopView />
      <MobileView />
    </div>
  );
}