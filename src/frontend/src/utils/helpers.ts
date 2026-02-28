// ── Image helpers ─────────────────────────────────────────────────────────────

const CATEGORY_IMAGES: Record<string, string> = {
  electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
  clothing:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
  "home & kitchen":
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
  home: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
  books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
  sports: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400",
  beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
};

export function getProductImage(imageUrl: string, category: string): string {
  if (imageUrl?.startsWith("http")) {
    return imageUrl;
  }
  const key = category.toLowerCase();
  return (
    CATEGORY_IMAGES[key] ??
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
  );
}

// ── Formatting helpers ─────────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(ms));
}

export function formatOrderId(id: bigint): string {
  return `#${id.toString().padStart(6, "0")}`;
}

// ── Status colors ──────────────────────────────────────────────────────────────

export function getStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === "delivered")
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (s === "shipped")
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  if (s === "processing" || s === "confirmed")
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  if (s === "cancelled" || s === "canceled")
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
}

// ── Truncate text ───────────────────────────────────────────────────────────────
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

// ── Sample products for seeding demo content ───────────────────────────────────
export const SAMPLE_PRODUCTS = [
  {
    name: "Sony WH-1000XM5 Headphones",
    description:
      "Industry-leading noise cancellation with 30-hour battery life. Crystal-clear calls in any environment.",
    price: 24990,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    stock: BigInt(50),
    rating: 4.8,
  },
  {
    name: "Levi's 501 Original Jeans",
    description:
      "The original jean since 1873. Straight fit with iconic button fly.",
    price: 3999,
    category: "Clothing",
    imageUrl:
      "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400",
    stock: BigInt(200),
    rating: 4.5,
  },
  {
    name: "Instant Pot Duo 7-in-1",
    description:
      "Electric pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.",
    price: 8499,
    category: "Home & Kitchen",
    imageUrl:
      "https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400",
    stock: BigInt(75),
    rating: 4.7,
  },
  {
    name: "Atomic Habits by James Clear",
    description:
      "The no.1 New York Times bestseller. Tiny changes, remarkable results.",
    price: 499,
    category: "Books",
    imageUrl:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
    stock: BigInt(150),
    rating: 4.9,
  },
];
