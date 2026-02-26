import { Link } from "react-router-dom";
import { CreditCard, Zap, Download, BookOpen, ChevronRight, Shield, Hash, LayoutList, Clock } from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const features = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Luhn Algorithm",
    desc: "Every generated number passes the Luhn check — the same math banks use to validate card numbers.",
  },
  {
    icon: <Hash className="w-5 h-5" />,
    title: "BIN/IIN Prefix",
    desc: "Optionally specify a 6–8 digit BIN to generate numbers matching a specific card format.",
  },
  {
    icon: <LayoutList className="w-5 h-5" />,
    title: "Bulk Generate",
    desc: "Generate up to 100 test card numbers in one click with random or fixed expiry and CVV.",
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "Export CSV / TXT",
    desc: "Download generated test cards as CSV or plain text for use in test suites and automation.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Brand Validation",
    desc: "Validates that BINs match the selected card brand's prefix patterns before generation.",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "History",
    desc: "Last 50 batches saved locally in your browser. Reload or delete anytime.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 gradient-hero opacity-10 dark:opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(221_83%_53%/0.08)_0%,transparent_70%)]" />
        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <CreditCard className="w-4 h-4" />
            Test Card Number Generator
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 bg-gradient-to-br from-primary to-accent-foreground bg-clip-text text-transparent">
            CC Generator
          </h1>
          <p className="text-xl text-muted-foreground mb-3 leading-relaxed">
            Generate <strong className="text-foreground">mathematically valid</strong> credit card numbers
            using the Luhn algorithm — for testing, education, and software development.
          </p>
          <p className="text-sm font-semibold text-warning mb-8" style={{color: "hsl(var(--warning))"}}>
            ⚠️ For testing & education only. These are NOT real cards.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/generator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4" />
              Generate Test Cards
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/80 border border-border transition-all hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4" />
              Learn About Luhn
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container mx-auto px-4 max-w-3xl -mt-4 mb-12">
        <DisclaimerBanner />
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 max-w-5xl pb-20">
        <h2 className="text-2xl font-bold text-center mb-10">Everything you need for card testing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-xl bg-card border border-border card-hover"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: "/generator", label: "Open Generator", icon: <CreditCard className="w-4 h-4" /> },
            { to: "/bins", label: "BIN Presets", icon: <Hash className="w-4 h-4" /> },
            { to: "/history", label: "View History", icon: <Clock className="w-4 h-4" /> },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between px-5 py-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-accent/50 transition-all group"
            >
              <span className="flex items-center gap-2 font-medium text-sm">
                {link.icon}
                {link.label}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
