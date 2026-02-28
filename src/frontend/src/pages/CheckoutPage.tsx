import type { OrderItem, ShippingAddress } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { usePlaceOrder } from "@/hooks/useQueries";
import { formatPrice, getProductImage } from "@/utils/helpers";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddressForm {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export function CheckoutPage() {
  const { cartItems, totalPrice, clearCart, productMap } = useCart();
  const { identity, login } = useInternetIdentity();
  const navigate = useNavigate();
  const placeOrder = usePlaceOrder();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<bigint | null>(null);

  const [address, setAddress] = useState<AddressForm>({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  const [errors, setErrors] = useState<Partial<AddressForm>>({});

  const tax = totalPrice * 0.18;
  const grandTotal = totalPrice + tax;

  const validate = (): boolean => {
    const newErrors: Partial<AddressForm> = {};
    if (!address.street.trim()) newErrors.street = "Street address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.state.trim()) newErrors.state = "State is required";
    if (!address.zip.trim()) newErrors.zip = "ZIP code is required";
    if (!address.country.trim()) newErrors.country = "Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Please login to place an order");
      login();
      return;
    }
    if (!validate()) return;
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const shippingAddress: ShippingAddress = {
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    };

    const items: OrderItem[] = cartItems
      .map((item) => {
        const product = item.product ?? productMap.get(item.productId);
        if (!product) return null;
        return {
          productId: item.productId,
          quantity: BigInt(item.quantity),
          price: product.price,
          name: product.name,
        };
      })
      .filter((item): item is OrderItem => item !== null);

    try {
      const id = await placeOrder.mutateAsync({
        items,
        totalPrice: grandTotal,
        shippingAddress,
      });
      await clearCart();
      setOrderId(id);
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (!identity) {
    return (
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">
          Login to Checkout
        </h2>
        <Button onClick={login}>Login</Button>
      </main>
    );
  }

  if (orderPlaced) {
    return (
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="bg-card rounded-2xl border border-border p-10">
          <CheckCircle className="h-16 w-16 text-fkart-green mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Order Placed!
          </h2>
          <p className="text-muted-foreground mb-2">
            Thank you for your order. We'll notify you when it ships.
          </p>
          {orderId && (
            <p className="text-sm font-mono bg-secondary/60 rounded-lg px-3 py-2 inline-block mb-6">
              Order #{orderId.toString().padStart(6, "0")}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => void navigate({ to: "/orders" })}
              className="bg-primary text-primary-foreground"
            >
              View My Orders
            </Button>
            <Button
              variant="outline"
              onClick={() => void navigate({ to: "/" })}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button onClick={() => void navigate({ to: "/products" })}>
          Shop Now
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        Checkout
      </h1>

      <form
        onSubmit={(e) => {
          void handlePlaceOrder(e);
        }}
      >
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Address form */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-5">
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="street"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Street Address *
                  </Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, street: e.target.value }))
                    }
                    placeholder="123 Main Street, Apartment 4B"
                    className={errors.street ? "border-destructive" : ""}
                  />
                  {errors.street && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.street}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="city"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) =>
                        setAddress((a) => ({ ...a, city: e.target.value }))
                      }
                      placeholder="Mumbai"
                      className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="state"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) =>
                        setAddress((a) => ({ ...a, state: e.target.value }))
                      }
                      placeholder="Maharashtra"
                      className={errors.state ? "border-destructive" : ""}
                    />
                    {errors.state && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="zip"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      ZIP Code *
                    </Label>
                    <Input
                      id="zip"
                      value={address.zip}
                      onChange={(e) =>
                        setAddress((a) => ({ ...a, zip: e.target.value }))
                      }
                      placeholder="400001"
                      className={errors.zip ? "border-destructive" : ""}
                    />
                    {errors.zip && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.zip}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="country"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      Country *
                    </Label>
                    <Input
                      id="country"
                      value={address.country}
                      onChange={(e) =>
                        setAddress((a) => ({ ...a, country: e.target.value }))
                      }
                      placeholder="India"
                      className={errors.country ? "border-destructive" : ""}
                    />
                    {errors.country && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order review */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4">
                Order Review ({cartItems.length} items)
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const product =
                    item.product ?? productMap.get(item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId.toString()} className="flex gap-3">
                      <img
                        src={getProductImage(
                          product.imageUrl,
                          product.category,
                        )}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-muted flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {item.quantity} × {formatPrice(product.price)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-primary whitespace-nowrap">
                        {formatPrice(product.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-fkart-green">
                    {totalPrice >= 499 ? "FREE" : formatPrice(49)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary font-display">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={placeOrder.isPending}
              className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base"
            >
              {placeOrder.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>Place Order — {formatPrice(grandTotal)}</>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              🔒 Your payment is secured and encrypted
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}
