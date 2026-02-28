import type { Product } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { formatPrice, getProductImage } from "@/utils/helpers";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Zap } from "lucide-react";
import { StarRating } from "./StarRating";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const imageUrl = getProductImage(product.imageUrl, product.category);
  const inStock = Number(product.stock) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock) {
      void addToCart(product.id, 1, product);
    }
  };

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id.toString() }}
      className="block"
    >
      <div
        className={cn(
          "product-card bg-card rounded-lg border border-border overflow-hidden group cursor-pointer",
          className,
        )}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
            }}
          />
          {!inStock && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Badge variant="secondary" className="text-xs font-medium">
                Out of Stock
              </Badge>
            </div>
          )}
          {inStock && Number(product.stock) < 10 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs">
              Only {Number(product.stock)} left
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <Badge
            variant="outline"
            className="text-xs border-primary/30 text-primary capitalize"
          >
            {product.category}
          </Badge>

          <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5">
            <StarRating rating={product.rating} size="sm" />
            <span className="text-xs text-muted-foreground">
              ({Number(product.numReviews)})
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-primary font-display">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
              Add to Cart
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs bg-fkart-amber hover:bg-fkart-amber/90 text-foreground font-semibold"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              <Zap className="h-3.5 w-3.5 mr-1" />
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-20" />
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-6 bg-muted animate-pulse rounded w-24" />
        <div className="flex gap-2">
          <div className="h-8 bg-muted animate-pulse rounded flex-1" />
          <div className="h-8 bg-muted animate-pulse rounded flex-1" />
        </div>
      </div>
    </div>
  );
}
