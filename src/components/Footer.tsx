import { Shield, CreditCard, Github, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/generator", label: "Generator" },
  { to: "/bins", label: "BIN Presets" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold gradient-text">CC Generator</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A free educational tool for generating Luhn-valid test card numbers. 
              100% client-side — no data leaves your browser.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pages</p>
            <div className="flex flex-col gap-1.5">
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Disclaimer</p>
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(var(--warning))" }} />
              <p className="text-xs text-muted-foreground leading-relaxed">
                All numbers generated are for <strong className="text-foreground">testing &amp; educational</strong> use only. 
                They are NOT real credit cards and CANNOT be used for any transactions. 
                Using fake card data for fraud is illegal.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-destructive fill-destructive" /> for developers & testers
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CC Generator — Educational Use Only
          </p>
        </div>
      </div>
    </footer>
  );
}
