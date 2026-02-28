import type { Product } from "@/backend.d";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useAllProducts } from "@/hooks/useQueries";
import { useSearch } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Books",
  "Sports",
  "Beauty",
];
const ITEMS_PER_PAGE = 12;

type SortOption = "default" | "price-asc" | "price-desc" | "rating";

interface FiltersState {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
}

function FilterPanel({
  filters,
  maxPrice,
  onChange,
  onReset,
}: {
  filters: FiltersState;
  maxPrice: number;
  onChange: (f: Partial<FiltersState>) => void;
  onReset: () => void;
}) {
  const toggleCategory = (cat: string) => {
    const cats = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ categories: cats });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-primary h-7 text-xs"
        >
          Reset all
        </Button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Category</h4>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat}`}
                checked={filters.categories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <Label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Price Range
        </h4>
        <div className="px-1">
          <Slider
            min={0}
            max={maxPrice || 100000}
            step={100}
            value={filters.priceRange}
            onValueChange={(val) =>
              onChange({ priceRange: val as [number, number] })
            }
            className="mb-3"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>₹{filters.priceRange[0].toLocaleString()}</span>
            <span>₹{filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() =>
                onChange({ minRating: filters.minRating === r ? 0 : r })
              }
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm text-left transition-colors ${
                filters.minRating === r
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <span className="text-fkart-amber">{"★".repeat(r)}</span>
              <span className="text-muted-foreground">{"☆".repeat(5 - r)}</span>
              <span className="text-xs text-muted-foreground ml-1">& up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const searchParams = useSearch({ from: "/products" });
  const { data: allProducts = [], isLoading } = useAllProducts();

  const [sort, setSort] = useState<SortOption>(
    ((searchParams as { sort?: string }).sort as SortOption) ?? "default",
  );
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    categories: (searchParams as { category?: string }).category
      ? [(searchParams as { category?: string }).category!]
      : [],
    priceRange: [0, 100000],
    minRating: 0,
  });

  const searchQuery = (searchParams as { q?: string }).q ?? "";

  // sync category from URL param
  useEffect(() => {
    const cat = (searchParams as { category?: string }).category;
    if (cat) {
      setFilters((f) => ({ ...f, categories: [cat] }));
    }
    const sortParam = (searchParams as { sort?: string }).sort as SortOption;
    if (sortParam) setSort(sortParam);
    setPage(1);
  }, [searchParams]);

  const maxPrice = useMemo(
    () => Math.max(...allProducts.map((p) => p.price), 100000),
    [allProducts],
  );

  // update price range max when products load
  useEffect(() => {
    setFilters((f) => ({ ...f, priceRange: [0, maxPrice] }));
  }, [maxPrice]);

  const filteredProducts = useMemo(() => {
    let prods: Product[] = allProducts;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      prods = prods.filter((p) =>
        filters.categories.some(
          (c) => c.toLowerCase() === p.category.toLowerCase(),
        ),
      );
    }

    // Price filter
    prods = prods.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
    );

    // Rating filter
    if (filters.minRating > 0) {
      prods = prods.filter((p) => p.rating >= filters.minRating);
    }

    // Sort
    if (sort === "price-asc")
      prods = [...prods].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc")
      prods = [...prods].sort((a, b) => b.price - a.price);
    else if (sort === "rating")
      prods = [...prods].sort((a, b) => b.rating - a.rating);

    return prods;
  }, [allProducts, searchQuery, filters, sort]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleFilterChange = (f: Partial<FiltersState>) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ categories: [], priceRange: [0, maxPrice], minRating: 0 });
    setSort("default");
    setPage(1);
  };

  const activeFilterCount =
    filters.categories.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Title */}
      <div className="mb-6">
        {searchQuery ? (
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Search: "<span className="text-primary">{searchQuery}</span>"
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredProducts.length} results found
            </p>
          </div>
        ) : (
          <h1 className="font-display text-2xl font-bold text-foreground">
            {filters.categories.length === 1
              ? filters.categories[0]
              : "All Products"}
          </h1>
        )}

        {/* Active filter badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {cat}
              <button
                type="button"
                onClick={() =>
                  handleFilterChange({
                    categories: filters.categories.filter((c) => c !== cat),
                  })
                }
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              ≥ {filters.minRating} stars
              <button
                type="button"
                onClick={() => handleFilterChange({ minRating: 0 })}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - desktop */}
        <aside className="hidden md:block w-60 flex-shrink-0">
          <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
            <FilterPanel
              filters={filters}
              maxPrice={maxPrice}
              onChange={handleFilterChange}
              onReset={resetFilters}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort + mobile filter bar */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${filteredProducts.length} products`}
            </p>
            <div className="flex items-center gap-2">
              {/* Mobile filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="md:hidden gap-1.5"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="h-4 min-w-4 px-1 text-[10px] bg-primary">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel
                      filters={filters}
                      maxPrice={maxPrice}
                      onChange={handleFilterChange}
                      onReset={resetFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select
                value={sort}
                onValueChange={(v) => {
                  setSort(v as SortOption);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-44 h-9 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Relevance</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-xl font-semibold text-foreground mb-2">
                No products found
              </p>
              <p className="text-sm mb-4">
                Try adjusting your filters or search query.
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
