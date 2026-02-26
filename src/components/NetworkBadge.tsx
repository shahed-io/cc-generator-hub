import { CardNetwork } from "@/lib/cardUtils";
import { CreditCard } from "lucide-react";

interface NetworkBadgeProps {
  network: CardNetwork;
  size?: "sm" | "md";
}

const networkColors: Record<CardNetwork, string> = {
  visa: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  mastercard: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  amex: "text-sky-400 border-sky-400/30 bg-sky-400/10",
  discover: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  unionpay: "text-red-400 border-red-400/30 bg-red-400/10",
  jcb: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  random: "text-muted-foreground border-border bg-muted/50",
};

const networkLabels: Record<CardNetwork, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  discover: "DISC",
  unionpay: "UP",
  jcb: "JCB",
  random: "AUTO",
};

export function NetworkBadge({ network, size = "sm" }: NetworkBadgeProps) {
  const color = networkColors[network];
  const label = networkLabels[network];

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded font-mono font-semibold ${color} ${
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
      }`}
    >
      <CreditCard className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {label}
    </span>
  );
}
