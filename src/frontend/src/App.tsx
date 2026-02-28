import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </CartProvider>
  );
}
