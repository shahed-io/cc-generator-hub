import { Shield, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">CC Generator</span>
            <span>— For testing &amp; education only</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            {["/", "/generator", "/bins", "/history", "/about"].map((path, i) => (
              <Link
                key={path}
                to={path}
                className="hover:text-foreground transition-colors"
              >
                {["Home", "Generator", "BIN Presets", "History", "About"][i]}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> All generated numbers are for testing/educational use only.
            They are NOT real credit cards and CANNOT be used for any transactions.
            Fraud is illegal — use responsibly.
          </span>
        </div>
      </div>
    </footer>
  );
}
