import type { Product } from "@/backend.d";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

export interface CartItem {
  productId: bigint;
  quantity: number;
  product?: Product;
}

interface CartContextValue {
  cartItems: CartItem[];
  totalCount: number;
  totalPrice: number;
  isLoading: boolean;
  addToCart: (
    productId: bigint,
    quantity?: number,
    product?: Product,
  ) => Promise<void>;
  removeFromCart: (productId: bigint) => Promise<void>;
  updateQuantity: (productId: bigint, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  productMap: Map<bigint, Product>;
  setProductMap: (map: Map<bigint, Product>) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productMap, setProductMap] = useState<Map<bigint, Product>>(new Map());

  const refreshCart = useCallback(async () => {
    if (!actor || !identity) {
      setCartItems([]);
      return;
    }
    try {
      setIsLoading(true);
      const items = await actor.getCart();
      setCartItems(
        items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
      );
    } catch {
      // ignore silently
    } finally {
      setIsLoading(false);
    }
  }, [actor, identity]);

  useEffect(() => {
    if (!isFetching && actor && identity) {
      void refreshCart();
    } else if (!identity) {
      setCartItems([]);
    }
  }, [actor, isFetching, identity, refreshCart]);

  const addToCart = useCallback(
    async (productId: bigint, quantity = 1, product?: Product) => {
      if (!actor || !identity) {
        toast.error("Please login to add items to cart");
        return;
      }
      try {
        await actor.addToCart(productId, BigInt(quantity));
        setCartItems((prev) => {
          const existing = prev.find((item) => item.productId === productId);
          if (existing) {
            return prev.map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    product: product ?? item.product,
                  }
                : item,
            );
          }
          return [...prev, { productId, quantity, product }];
        });
        toast.success(
          product ? `"${product.name}" added to cart` : "Item added to cart",
        );
      } catch {
        toast.error("Failed to add item to cart");
      }
    },
    [actor, identity],
  );

  const removeFromCart = useCallback(
    async (productId: bigint) => {
      if (!actor) return;
      try {
        await actor.removeFromCart(productId);
        setCartItems((prev) =>
          prev.filter((item) => item.productId !== productId),
        );
        toast.success("Item removed from cart");
      } catch {
        toast.error("Failed to remove item");
      }
    },
    [actor],
  );

  const updateQuantity = useCallback(
    async (productId: bigint, quantity: number) => {
      if (!actor) return;
      try {
        if (quantity <= 0) {
          await actor.removeFromCart(productId);
          setCartItems((prev) =>
            prev.filter((item) => item.productId !== productId),
          );
        } else {
          await actor.updateCartQuantity(productId, BigInt(quantity));
          setCartItems((prev) =>
            prev.map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            ),
          );
        }
      } catch {
        toast.error("Failed to update quantity");
      }
    },
    [actor],
  );

  const clearCart = useCallback(async () => {
    if (!actor) return;
    try {
      await actor.clearCart();
      setCartItems([]);
    } catch {
      toast.error("Failed to clear cart");
    }
  }, [actor]);

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const product = item.product ?? productMap.get(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalCount,
        totalPrice,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        productMap,
        setProductMap,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
