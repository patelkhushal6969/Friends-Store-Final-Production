import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";

// Helper function to get image path
const getImagePath = (imageName: string) => {
  try {
    // For new products from database, check if it's a full URL
    if (imageName.startsWith('http')) return imageName;
    // For existing products with just filename
    return new URL(`/src/assets/${imageName}`, import.meta.url).href;
  } catch {
    return imageName;
  }
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.original_price!) * 100) 
    : 0;

  return (
    <div 
      className="group animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Link to={`/products/${product.id}`}>
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-soft hover-lift">
          {/* Image */}
          <div className="aspect-[4/5] overflow-hidden bg-muted/50">
            <img
              src={getImagePath(product.images[0])}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Tags */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {hasDiscount && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground">
                -{discountPercent}%
              </span>
            )}
            {product.tags.includes("bestseller") && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                Bestseller
              </span>
            )}
            {product.tags.includes("new") && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-leaf text-primary-foreground">
                New
              </span>
            )}
          </div>

          {/* Buy Now Button */}
          <div className="absolute bottom-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Link to={`/purchase/${product.id}`} onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="default" className="rounded-full shadow-card">
                Buy Now
              </Button>
            </Link>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-4 px-1">
        <div className="flex items-center gap-1 mb-1">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="text-xs font-medium text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">For reviews, go through our socials.</span>
        </div>
        
        <Link to={`/products/${product.id}`}>
          <h3 className="font-display text-lg font-medium text-foreground hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="font-display text-lg font-semibold text-foreground">
            ₹{product.price}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.original_price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
