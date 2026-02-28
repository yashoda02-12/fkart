import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="font-display text-2xl font-bold text-background mb-3">
              F<span className="text-fkart-amber">kart</span>
            </h2>
            <p className="text-sm leading-relaxed text-background/60">
              Your one-stop destination for millions of products across every
              category.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-background text-sm mb-3 uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Electronics",
                "Clothing",
                "Home & Kitchen",
                "Books",
                "Sports",
                "Beauty",
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/products"
                    search={{ category: cat }}
                    className="hover:text-background transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold text-background text-sm mb-3 uppercase tracking-wider">
              Help
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/orders"
                  className="hover:text-background transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="hover:text-background transition-colors"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="hover:text-background transition-colors"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Social / Info */}
          <div>
            <h3 className="font-semibold text-background text-sm mb-3 uppercase tracking-wider">
              About
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-background/60">Built on ICP</span>
              </li>
              <li>
                <span className="text-background/60">
                  Decentralized Shopping
                </span>
              </li>
              <li>
                <span className="text-background/60">Secure Payments</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/50">
          <span>© {year} Fkart. All rights reserved.</span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-background/70 transition-colors"
          >
            Built with{" "}
            <Heart className="h-3 w-3 fill-current text-fkart-amber mx-0.5" />{" "}
            using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
