import { Link, useLocation } from "react-router-dom";
import { CreditCard, Hash, Clock, BookOpen, Home, Sun, Moon, Menu, X, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
  { to: "/generator", label: "Generator", icon: <Zap className="w-4 h-4" /> },
  { to: "/bins", label: "BIN Presets", icon: <Hash className="w-4 h-4" /> },
  { to: "/history", label: "History", icon: <Clock className="w-4 h-4" /> },
  { to: "/about", label: "About", icon: <BookOpen className="w-4 h-4" /> },
];

export function Navbar() {
  const location = useLocation();
  const { prefs, setPref } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-base group">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="gradient-text font-bold tracking-tight text-lg">CC Generator</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {link.icon}
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setPref("darkMode", !prefs.darkMode)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
              title="Toggle dark mode"
              aria-label="Toggle dark mode"
            >
              {prefs.darkMode
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </button>

            {/* CTA button (desktop) */}
            <Link
              to="/generator"
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/30 hover:-translate-y-0.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Generate
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-border space-y-0.5">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 pb-1">
              <Link
                to="/generator"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                <Zap className="w-4 h-4" />
                Generate Cards Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
