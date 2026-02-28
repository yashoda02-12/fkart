import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsAdmin, useUserProfile } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalCount } = useCart();
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = !!identity;
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close mobile menu on route change
  const pathname = router.state.location.pathname;
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally depends only on pathname
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      void navigate({
        to: "/products",
        search: (prev) => ({ ...prev, q: searchQuery.trim() }),
      });
      setSearchQuery("");
    }
  };

  const displayName =
    profile?.name || `${identity?.getPrincipal().toString().slice(0, 8)}...`;

  return (
    <header className="sticky top-0 z-50 shadow-nav">
      {/* Main navbar */}
      <nav className="fkart-nav text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-3">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-1">
              <span className="font-display text-2xl font-bold text-white tracking-tight">
                F<span className="text-fkart-amber">kart</span>
              </span>
            </Link>

            {/* Search - desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-2xl mx-4"
            >
              <div className="relative w-full">
                <Input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands and more"
                  className="h-9 rounded-sm bg-white text-foreground placeholder:text-muted-foreground pr-12 border-0 focus-visible:ring-1 focus-visible:ring-fkart-amber"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-9 px-3 bg-fkart-amber text-foreground rounded-r-sm hover:bg-fkart-amber/90 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Login / User menu */}
              {isInitializing ? (
                <div className="h-8 w-20 bg-white/20 animate-pulse rounded" />
              ) : isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/10 flex items-center gap-1 h-8 px-2"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm max-w-[100px] truncate">
                        {displayName}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Settings className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={clear}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  variant="ghost"
                  className="text-white hover:bg-white/10 h-8 px-3 text-sm font-semibold border border-white/40"
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Login
                </Button>
              )}

              {/* Cart */}
              <Link to="/cart" aria-label="Shopping cart">
                <Button
                  variant="ghost"
                  className="relative text-white hover:bg-white/10 h-8 px-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalCount > 0 && (
                    <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-fkart-amber text-foreground border-0 font-bold">
                      {totalCount > 99 ? "99+" : totalCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                className="md:hidden text-white hover:bg-white/10 h-8 px-2"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-2">
            <form onSubmit={handleSearch}>
              <div className="relative w-full">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="h-9 rounded-sm bg-white text-foreground placeholder:text-muted-foreground pr-10 border-0"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-9 px-3 bg-fkart-amber text-foreground rounded-r-sm"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-fkart-blue-dark border-t border-white/10">
            <nav className="flex flex-col px-4 py-3 gap-1">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "All Products" },
                {
                  to: "/products",
                  search: { category: "Electronics" },
                  label: "Electronics",
                },
                {
                  to: "/products",
                  search: { category: "Clothing" },
                  label: "Clothing",
                },
                {
                  to: "/products",
                  search: { category: "Home & Kitchen" },
                  label: "Home & Kitchen",
                },
                {
                  to: "/products",
                  search: { category: "Books" },
                  label: "Books",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  search={item.search}
                  className="text-white/80 hover:text-white py-2 text-sm border-b border-white/10 last:border-0 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </nav>

      {/* Category nav strip - desktop */}
      <div className="hidden md:block bg-fkart-blue-dark/95 text-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-6 h-10 text-sm overflow-x-auto scrollbar-none">
            {[
              "Electronics",
              "Clothing",
              "Home & Kitchen",
              "Books",
              "Sports",
              "Beauty",
            ].map((cat) => (
              <Link
                key={cat}
                to="/products"
                search={{ category: cat }}
                className="whitespace-nowrap hover:text-white transition-colors py-1 border-b border-transparent hover:border-fkart-amber"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
