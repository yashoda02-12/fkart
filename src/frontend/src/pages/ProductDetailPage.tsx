import { StarRating } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAddReview,
  useProduct,
  useProductReviews,
  useUserProfile,
} from "@/hooks/useQueries";
import { formatDate, formatPrice, getProductImage } from "@/utils/helpers";
import { Link, useParams } from "@tanstack/react-router";
import {
  ChevronRight,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProductDetailPage() {
  const { id } = useParams({ from: "/products/$id" });
  const productId = BigInt(id);

  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: reviews = [], isLoading: reviewsLoading } =
    useProductReviews(productId);
  const { addToCart } = useCart();
  const { identity, login } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const addReview = useAddReview();

  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const handleAddToCart = () => {
    if (product) {
      void addToCart(product.id, quantity, product);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Please login to submit a review");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    try {
      await addReview.mutateAsync({
        productId,
        rating: reviewRating,
        comment: reviewComment,
        userName: profile?.name || "Anonymous",
      });
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
    } catch {
      toast.error("Failed to submit review");
    }
  };

  if (productLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Product Not Found
        </h2>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </main>
    );
  }

  const imageUrl = getProductImage(product.imageUrl, product.category);
  const inStock = Number(product.stock) > 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/products" className="hover:text-primary transition-colors">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          to="/products"
          search={{ category: product.category }}
          className="hover:text-primary transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate max-w-48">
          {product.name}
        </span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
              }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <Badge
              variant="outline"
              className="border-primary/30 text-primary text-xs capitalize mb-2"
            >
              {product.category}
            </Badge>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} size="md" showNumber />
            <span className="text-muted-foreground text-sm">
              {Number(product.numReviews)} reviews
            </span>
          </div>

          {/* Price */}
          <div>
            <span className="font-display text-4xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Inclusive of all taxes
            </p>
          </div>

          {/* Stock */}
          {inStock ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
              ✓ In Stock ({Number(product.stock)} units available)
            </Badge>
          ) : (
            <Badge variant="destructive">Out of Stock</Badge>
          )}

          {/* Quantity selector */}
          {inStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                Quantity:
              </span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="h-9 w-12 flex items-center justify-center text-sm font-medium border-x border-border">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(Number(product.stock), q + 1))
                  }
                  className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold h-12"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              className="flex-1 bg-fkart-amber text-foreground hover:bg-fkart-amber/90 font-semibold h-12"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <Zap className="h-4 w-4 mr-2" />
              Buy Now
            </Button>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Extra info */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
            {[
              { icon: "🚚", text: "Free delivery on orders above ₹499" },
              { icon: "🔄", text: "Easy 30-day returns" },
              { icon: "🔒", text: "Secure payment guaranteed" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">
          Customer Reviews
        </h2>

        {/* Rating summary */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-display text-5xl font-bold text-foreground">
                {product.rating.toFixed(1)}
              </div>
              <StarRating rating={product.rating} size="lg" className="mt-1" />
              <p className="text-sm text-muted-foreground mt-1">
                {Number(product.numReviews)} reviews
              </p>
            </div>
            <Separator orientation="vertical" className="h-20" />
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(
                  (r) => Number(r.rating) === star,
                ).length;
                const pct =
                  reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-muted-foreground">{star}★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-fkart-amber rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Add review form */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Write a Review</h3>
          {!identity ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">
                Login to write a review
              </p>
              <Button onClick={login} variant="outline">
                Login
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                void handleSubmitReview(e);
              }}
              className="space-y-4"
            >
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Your Rating
                </Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        star <= reviewRating
                          ? "text-fkart-amber"
                          : "text-muted-foreground/30"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label
                  htmlFor="review-comment"
                  className="text-sm font-medium mb-2 block"
                >
                  Comment
                </Label>
                <Textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={addReview.isPending}
                className="bg-primary text-primary-foreground"
              >
                {addReview.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Submit Review
              </Button>
            </form>
          )}
        </div>

        {/* Reviews list */}
        {reviewsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id.toString()}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {review.userName}
                    </p>
                    <StarRating
                      rating={Number(review.rating)}
                      size="sm"
                      className="mt-0.5"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
