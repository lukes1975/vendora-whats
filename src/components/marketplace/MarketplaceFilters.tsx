import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { X, Filter } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface MarketplaceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface MarketplaceFiltersProps {
  categories: MarketplaceCategory[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

const MarketplaceFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
}: MarketplaceFiltersProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Package;
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            Categories
          </h3>
          <div className="space-y-2">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start h-auto p-3"
              onClick={() => onCategoryChange(null)}
            >
              <LucideIcons.Grid3X3 className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">All Categories</div>
                <div className="text-xs text-muted-foreground">
                  Show everything
                </div>
              </div>
            </Button>
            
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => onCategoryChange(
                    selectedCategory === category.id ? null : category.id
                  )}
                >
                  <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            Price Range
          </h3>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={(value) => onPriceRangeChange([value[0], value[1]])}
              max={100000}
              min={0}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 100000) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Active Filters
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onCategoryChange(null)}
                    />
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                  <Badge variant="secondary" className="gap-1">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onPriceRangeChange([0, 100000])}
                    />
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  onCategoryChange(null);
                  onPriceRangeChange([0, 100000]);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketplaceFilters;