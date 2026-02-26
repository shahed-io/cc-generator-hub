import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: "icon" | "full";
  label?: string;
}

export function CopyButton({ text, className, variant = "icon", label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === "full") {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
          copied
            ? "bg-primary/20 text-primary border border-primary/40"
            : "bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-primary/40",
          className
        )}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : label}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded-md transition-all duration-200",
        copied
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
        className
      )}
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
