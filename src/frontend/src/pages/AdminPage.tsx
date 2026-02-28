import type { Product, ProductInput } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAllOrders,
  useAllProducts,
  useCreateProduct,
  useDeleteProduct,
  useIsAdmin,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "@/hooks/useQueries";
import {
  formatDate,
  formatOrderId,
  formatPrice,
  getStatusColor,
} from "@/utils/helpers";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Books",
  "Sports",
  "Beauty",
];
const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  stock: string;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  price: "",
  category: "Electronics",
  imageUrl: "",
  stock: "0",
};

function ProductFormDialog({
  open,
  onClose,
  editProduct,
}: {
  open: boolean;
  onClose: () => void;
  editProduct: Product | null;
}) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [form, setForm] = useState<ProductFormData>(
    editProduct
      ? {
          name: editProduct.name,
          description: editProduct.description,
          price: editProduct.price.toString(),
          category: editProduct.category,
          imageUrl: editProduct.imageUrl,
          stock: editProduct.stock.toString(),
        }
      : emptyForm,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productInput: ProductInput = {
      name: form.name,
      description: form.description,
      price: Number.parseFloat(form.price),
      category: form.category,
      imageUrl: form.imageUrl,
      stock: BigInt(Number.parseInt(form.stock) || 0),
    };

    try {
      if (editProduct) {
        await updateProduct.mutateAsync({
          id: editProduct.id,
          product: productInput,
        });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(productInput);
        toast.success("Product created");
      }
      onClose();
    } catch {
      toast.error("Failed to save product");
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4"
        >
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Product Name *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Sony WH-1000XM5 Headphones"
              required
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Detailed product description..."
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Price (₹) *
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="999.99"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Stock *
              </Label>
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: e.target.value }))
                }
                placeholder="100"
                required
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Image URL
            </Label>
            <Input
              value={form.imageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editProduct ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: products = [], isLoading: productsLoading } = useAllProducts();
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();

  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  if (!identity) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground">
          Please login to access the admin dashboard.
        </p>
      </main>
    );
  }

  if (checkingAdmin) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 rounded-xl" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive/60 mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have admin privileges.
        </p>
      </main>
    );
  }

  const handleDeleteProduct = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (orderId: bigint, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl fkart-nav">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            {products.length} products · {orders.length} orders
          </p>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* ── Products Tab ─────────────────────────────────────────────── */}
        <TabsContent value="products">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEditingProduct(null);
                setProductDialog(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          {productsLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                      <TableHead className="text-right w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-10"
                        >
                          No products yet. Click "Add Product" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product, idx) => (
                        <TableRow key={product.id.toString()}>
                          <TableCell className="text-muted-foreground text-xs">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm text-foreground max-w-48 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground max-w-48 truncate">
                                {product.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-primary">
                            {formatPrice(product.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                Number(product.stock) === 0
                                  ? "text-destructive"
                                  : Number(product.stock) < 10
                                    ? "text-fkart-amber"
                                    : "text-foreground"
                              }
                            >
                              {Number(product.stock)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm text-fkart-amber">
                            ★ {product.rating.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-primary"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setProductDialog(true);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-destructive"
                                onClick={() =>
                                  void handleDeleteProduct(product.id)
                                }
                                disabled={deletingId === product.id}
                              >
                                {deletingId === product.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Orders Tab ───────────────────────────────────────────────── */}
        <TabsContent value="orders">
          {ordersLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-10"
                        >
                          No orders yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...orders]
                        .sort(
                          (a, b) => Number(b.createdAt) - Number(a.createdAt),
                        )
                        .map((order) => (
                          <TableRow key={order.id.toString()}>
                            <TableCell className="font-mono font-semibold text-sm">
                              {formatOrderId(order.id)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-48">
                              <p className="truncate">
                                {order.items.map((i) => i.name).join(", ")}
                              </p>
                              <p className="text-xs">
                                {order.items.length} item
                                {order.items.length !== 1 ? "s" : ""}
                              </p>
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                              {formatPrice(order.totalPrice)}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(v) =>
                                  void handleStatusChange(order.id, v)
                                }
                              >
                                <SelectTrigger className="h-8 w-36 text-xs">
                                  <SelectValue>
                                    <Badge
                                      className={`text-xs border-0 ${getStatusColor(order.status)}`}
                                    >
                                      {order.status}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map((s) => (
                                    <SelectItem
                                      key={s}
                                      value={s}
                                      className="text-sm"
                                    >
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Product form dialog */}
      {productDialog && (
        <ProductFormDialog
          open={productDialog}
          onClose={() => setProductDialog(false)}
          editProduct={editingProduct}
        />
      )}
    </main>
  );
}
