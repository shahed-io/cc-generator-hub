import { AlertTriangle } from "lucide-react";

interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs" style={{
        background: "hsl(var(--warning) / 0.08)",
        borderColor: "hsl(var(--warning) / 0.3)",
        color: "hsl(var(--warning))",
      }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>
          <strong>Testing only.</strong> This is NOT real payment card data. Do NOT use for real transactions.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm" style={{
      background: "hsl(var(--warning) / 0.08)",
      borderColor: "hsl(var(--warning) / 0.3)",
      color: "hsl(var(--warning))",
    }}>
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <div>
        <strong>⚠️ For Testing &amp; Education Only.</strong> Generated numbers are mathematically valid (Luhn)
        but are <em>not real credit cards</em>. They cannot be used for purchases, fraud, or any real-world
        transaction. Using fake card data for fraud is illegal.
      </div>
    </div>
  );
}
