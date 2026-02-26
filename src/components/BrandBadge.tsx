import { CardBrand, BRAND_CONFIGS } from "@/lib/cardUtils";

interface BrandBadgeProps {
  brand: CardBrand;
  size?: "sm" | "md" | "lg";
}

const brandStyles: Record<CardBrand, string> = {
  visa: "bg-primary/10 text-primary border-primary/20",
  mastercard: "bg-accent border-border text-accent-foreground",
  amex: "bg-secondary text-secondary-foreground border-border",
  discover: "bg-muted text-muted-foreground border-border",
};

export function BrandBadge({ brand, size = "sm" }: BrandBadgeProps) {
  const config = BRAND_CONFIGS[brand];
  const padding = size === "lg" ? "px-3 py-1 text-sm" : size === "md" ? "px-2.5 py-0.5 text-xs" : "px-2 py-0.5 text-xs";
  return (
    <span className={`badge-brand font-semibold rounded-full border ${brandStyles[brand]} ${padding}`}>
      {config.label}
    </span>
  );
}
