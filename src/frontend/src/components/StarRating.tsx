import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({
  rating,
  max = 5,
  size = "md",
  showNumber = false,
  count,
  className,
}: StarRatingProps) {
  const sizes = { sm: 12, md: 16, lg: 20 };
  const px = sizes[size];

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: star index represents ordinal position
            <span key={`star-${i}`} className="relative inline-flex">
              <Star
                size={px}
                className="text-muted-foreground/30"
                fill="currentColor"
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: partial ? `${(rating % 1) * 100}%` : "100%" }}
                >
                  <Star
                    size={px}
                    className="text-fkart-amber"
                    fill="currentColor"
                  />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {showNumber && (
        <span className="text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
          {count !== undefined && (
            <span className="ml-1 text-xs">({count.toLocaleString()})</span>
          )}
        </span>
      )}
    </span>
  );
}
