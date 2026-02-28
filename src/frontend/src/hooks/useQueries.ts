import type {
  OrderItem,
  ProductInput,
  ShippingAddress,
  UserProfile,
} from "@/backend.d";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ── Products ─────────────────────────────────────────────────────────────────

export function useAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useProduct(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useProductsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
    staleTime: 60_000,
  });
}

export function useSearchProducts(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products", "search", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchProducts(searchTerm);
    },
    enabled: !!actor && !isFetching && !!searchTerm.trim(),
  });
}

export function useProductReviews(productId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["reviews", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return [];
      return actor.getProductReviews(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

// ── Orders ───────────────────────────────────────────────────────────────────

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      items,
      totalPrice,
      shippingAddress,
    }: {
      items: OrderItem[];
      totalPrice: number;
      shippingAddress: ShippingAddress;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(items, totalPrice, shippingAddress);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      rating,
      comment,
      userName,
    }: {
      productId: bigint;
      rating: number;
      comment: string;
      userName: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addReview(productId, BigInt(rating), comment, userName);
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: ["reviews", vars.productId.toString()],
      });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: ProductInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProduct(product);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      product,
    }: { id: bigint; product: ProductInput }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(id, product);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["all-orders"] });
    },
  });
}
