import { CardBrand, BRAND_CONFIGS } from "@/lib/cardUtils";

interface BrandBadgeProps {
  brand: CardBrand;
  size?: "sm" | "md" | "lg";
}

const brandStyles: Record<CardBrand, string> = {
  visa: "bg-primary/10 text-primary border-primary/30",
  mastercard: "border-border text-foreground",
  amex: "border-border text-foreground",
  discover: "border-border text-foreground",
};

const brandDots: Record<CardBrand, string> = {
  visa: "bg-primary",
  mastercard: "bg-orange-500",
  amex: "bg-sky-500",
  discover: "bg-amber-500",
};

export function BrandBadge({ brand, size = "sm" }: BrandBadgeProps) {
  const config = BRAND_CONFIGS[brand];
  const padding = size === "lg" ? "px-3 py-1 text-sm" : size === "md" ? "px-2.5 py-0.5 text-xs" : "px-2 py-0.5 text-xs";
  return (
    <span className={`badge-brand bg-secondary font-semibold ${brandStyles[brand]} ${padding}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${brandDots[brand]}`} />
      {config.label}
    </span>
  );
}
