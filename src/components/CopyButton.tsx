import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: "icon" | "ghost" | "outline";
  label?: string;
  successMsg?: string;
}

const copiedStyle = "border-border" // overridden inline

export function CopyButton({
  text,
  className,
  variant = "icon",
  label = "Copy",
  successMsg = "Copied!",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: successMsg, duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive", duration: 2000 });
    }
  };

  if (variant === "outline") {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
          copied
            ? "border-primary/60 text-primary bg-primary/10"
            : "border-border text-muted-foreground bg-card hover:border-primary/50 hover:text-foreground",
          className
        )}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : label}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
          copied
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary",
          className
        )}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : label}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className={cn(
        "p-1.5 rounded-md transition-all",
        copied
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
        className
      )}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
