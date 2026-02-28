import type { Product } from "@/backend.d";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAllProducts } from "@/hooks/useQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Headphones,
  RotateCcw,
  Shield,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const CATEGORIES = [
  {
    name: "Electronics",
    icon: "💻",
    color:
      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  {
    name: "Clothing",
    icon: "👗",
    color:
      "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700",
    textColor: "text-pink-700 dark:text-pink-300",
  },
  {
    name: "Home & Kitchen",
    icon: "🏠",
    color:
      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  {
    name: "Books",
    icon: "📚",
    color:
      "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  {
    name: "Sports",
    icon: "⚽",
    color:
      "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
    textColor: "text-orange-700 dark:text-orange-300",
  },
  {
    name: "Beauty",
    icon: "💄",
    color:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700",
    textColor: "text-purple-700 dark:text-purple-300",
  },
];

const FEATURES = [
  { icon: Truck, title: "Free Delivery", desc: "On orders over ₹499" },
  { icon: Shield, title: "Secure Payment", desc: "100% safe & encrypted" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

export function HomePage() {
  const { data: products = [], isLoading } = useAllProducts();
  const { setProductMap } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // populate product map
  useEffect(() => {
    if (products.length > 0) {
      const map = new Map<bigint, Product>(products.map((p) => [p.id, p]));
      setProductMap(map);
    }
  }, [products, setProductMap]);

  const topRated = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  const trending = [...products]
    .sort((a, b) => Number(b.numReviews) - Number(a.numReviews))
    .slice(0, 8);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      void navigate({ to: "/products", search: { q: searchQuery.trim() } });
    }
  };

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden fkart-nav">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('/assets/generated/fkart-hero-banner.dim_1600x500.jpg')`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="text-fkart-amber font-semibold text-sm uppercase tracking-widest mb-3">
              Welcome to Fkart
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Millions of Products.
              <br />
              <span className="text-fkart-amber">One Cart.</span>
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Shop the best deals on electronics, fashion, home goods, and more
              — delivered fast.
            </p>

            <form onSubmit={handleHeroSearch} className="flex gap-2 max-w-lg">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search millions of products..."
                className="flex-1 h-12 px-4 rounded-lg bg-white text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-fkart-amber"
              />
              <Button
                type="submit"
                className="h-12 px-6 bg-fkart-amber text-foreground hover:bg-fkart-amber/90 font-semibold rounded-lg"
              >
                Search
              </Button>
            </form>

            <div className="flex gap-4 mt-6">
              <Link to="/products">
                <Button
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 hover:border-white"
                >
                  Shop All Products <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features strip ───────────────────────────────────────────────── */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 py-4 px-4">
                <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Shop by Category
          </h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map(({ name, icon, color, textColor }) => (
            <motion.div
              key={name}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/products"
                search={{ category: name }}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border ${color} hover:shadow-md transition-all duration-200`}
              >
                <span className="text-2xl sm:text-3xl">{icon}</span>
                <span
                  className={`text-xs sm:text-sm font-semibold text-center leading-tight ${textColor}`}
                >
                  {name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Top Rated Products ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Top Rated
            </h2>
            <p className="text-muted-foreground text-sm">
              Loved by thousands of shoppers
            </p>
          </div>
          <Link
            to="/products"
            search={{ sort: "rating" }}
            className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <div key={i} className="flex-shrink-0 w-52">
                  <ProductCardSkeleton />
                </div>
              ))
            : topRated.map((product) => (
                <div key={product.id.toString()} className="flex-shrink-0 w-52">
                  <ProductCard product={product} />
                </div>
              ))}
          {!isLoading && topRated.length === 0 && (
            <div className="w-full py-12 text-center text-muted-foreground">
              <p>No products available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Trending Deals ───────────────────────────────────────────────── */}
      <section className="bg-secondary/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Trending Deals
              </h2>
              <p className="text-muted-foreground text-sm">
                Hot picks with the most reviews
              </p>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                  <ProductCardSkeleton key={i} />
                ))
              : trending.map((product) => (
                  <ProductCard key={product.id.toString()} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="fkart-nav rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              Ready to Start Shopping?
            </h2>
            <p className="text-white/70 text-lg mb-6 max-w-xl mx-auto">
              Explore millions of products from top brands. New deals every day.
            </p>
            <Link to="/products">
              <Button className="bg-fkart-amber text-foreground hover:bg-fkart-amber/90 font-semibold h-12 px-8 text-base rounded-lg">
                Shop Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
