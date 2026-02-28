import type { Product } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useAllProducts } from "@/hooks/useQueries";
import { formatPrice, getProductImage } from "@/utils/helpers";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect } from "react";

export function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalPrice,
    setProductMap,
    productMap,
  } = useCart();
  const { data: allProducts = [] } = useAllProducts();
  const { identity, login } = useInternetIdentity();
  const navigate = useNavigate();

  // populate product map
  useEffect(() => {
    if (allProducts.length > 0) {
      const map = new Map<bigint, Product>(allProducts.map((p) => [p.id, p]));
      setProductMap(map);
    }
  }, [allProducts, setProductMap]);

  const tax = totalPrice * 0.18;
  const grandTotal = totalPrice + tax;

  if (!identity) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Login to view your cart
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to add items to your cart and checkout.
          </p>
          <Button onClick={login} className="gap-2">
            <LogIn className="h-4 w-4" />
            Login to Continue
          </Button>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/products">
            <Button className="bg-primary text-primary-foreground">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        Shopping Cart ({cartItems.length}{" "}
        {cartItems.length === 1 ? "item" : "items"})
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => {
            const product: Product | undefined =
              item.product ?? productMap.get(item.productId);
            if (!product) {
              return (
                <div
                  key={item.productId.toString()}
                  className="bg-card rounded-lg border border-border p-4 animate-pulse"
                >
                  <div className="h-16 bg-muted rounded" />
                </div>
              );
            }

            const imageUrl = getProductImage(
              product.imageUrl,
              product.category,
            );
            const subtotal = product.price * item.quantity;

            return (
              <div
                key={item.productId.toString()}
                className="bg-card rounded-lg border border-border p-4 flex gap-4"
              >
                {/* Product image */}
                <Link
                  to="/products/$id"
                  params={{ id: product.id.toString() }}
                  className="flex-shrink-0"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted/30">
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
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to="/products/$id"
                    params={{ id: product.id.toString() }}
                  >
                    <h3 className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground capitalize mb-2">
                    {product.category}
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Quantity stepper */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          void updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="h-8 w-10 flex items-center justify-center text-sm font-medium border-x border-border">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors"
                        disabled={item.quantity >= Number(product.stock)}
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary font-display">
                        {formatPrice(subtotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => void removeFromCart(item.productId)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border p-5 sticky top-24">
            <h2 className="font-semibold text-foreground mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-fkart-green">
                  {totalPrice >= 499 ? "FREE" : formatPrice(49)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (18% GST)</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary font-display text-lg">
                  {formatPrice(grandTotal)}
                </span>
              </div>
              {totalPrice < 499 && (
                <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                  Add ₹{formatPrice(499 - totalPrice)} more to get free delivery
                </p>
              )}
            </div>

            <Button
              className="w-full mt-5 h-12 bg-primary text-primary-foreground font-semibold text-base"
              onClick={() => void navigate({ to: "/checkout" })}
            >
              Proceed to Checkout
            </Button>

            <Link to="/products">
              <Button
                variant="ghost"
                className="w-full mt-2 text-sm text-muted-foreground"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
