import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMyOrders } from "@/hooks/useQueries";
import {
  formatDate,
  formatOrderId,
  formatPrice,
  getStatusColor,
} from "@/utils/helpers";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  LogIn,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";

export function OrdersPage() {
  const { identity, login } = useInternetIdentity();
  const { data: orders = [], isLoading } = useMyOrders();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!identity) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Package className="h-20 w-20 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Login to view your orders
        </h2>
        <p className="text-muted-foreground mb-6">
          Sign in to see your order history.
        </p>
        <Button onClick={login} className="gap-2">
          <LogIn className="h-4 w-4" />
          Login
        </Button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">
          My Orders
        </h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          No orders yet
        </h2>
        <p className="text-muted-foreground mb-6">
          You haven't placed any orders yet.
        </p>
        <Link to="/products">
          <Button className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Start Shopping
          </Button>
        </Link>
      </main>
    );
  }

  const sortedOrders = [...orders].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        My Orders ({orders.length})
      </h1>

      <div className="space-y-4">
        {sortedOrders.map((order) => {
          const isExpanded = expandedOrders.has(order.id.toString());
          return (
            <div
              key={order.id.toString()}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              {/* Order header */}
              <button
                type="button"
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/30 transition-colors w-full text-left"
                onClick={() => toggleExpand(order.id.toString())}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground font-mono">
                        {formatOrderId(order.id)}
                      </span>
                      <Badge
                        className={`text-xs border-0 ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(order.createdAt)} · {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-sm">
                      {order.items.map((i) => i.name).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-bold text-primary font-display">
                    {formatPrice(order.totalPrice)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-border">
                  {/* Items */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Order Items
                    </h3>
                    {order.items.map((item) => (
                      <div
                        key={item.productId.toString()}
                        className="flex justify-between items-start text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Qty: {Number(item.quantity)} ×{" "}
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="font-semibold text-foreground ml-4">
                          {formatPrice(item.price * Number(item.quantity))}
                        </span>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between font-bold text-foreground">
                      <span>Total</span>
                      <span className="text-primary font-display">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Shipping address */}
                  <div className="px-5 pb-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      Shipping Address
                    </h3>
                    <div className="text-sm text-muted-foreground bg-secondary/40 rounded-lg p-3">
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.zip}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
