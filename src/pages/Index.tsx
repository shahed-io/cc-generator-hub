import { Link } from "react-router-dom";
import {
  CreditCard, Zap, Download, BookOpen, ChevronRight, Shield,
  Hash, Clock, CheckCircle2, ArrowRight, Code2, Lock, Cpu
} from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const FEATURES = [
  {
    icon: <Cpu className="w-5 h-5" />,
    title: "Luhn Algorithm",
    desc: "Every number mathematically passes the Luhn mod-10 checksum — the same validation banks use.",
    accent: "bg-primary/10 text-primary border-primary/20",
  },
  {
    icon: <Hash className="w-5 h-5" />,
    title: "BIN / IIN Prefix",
    desc: "Specify a 6–8 digit BIN. The generator validates it against brand patterns before generating.",
    accent: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Bulk Generation",
    desc: "Generate 1 to 100 test card numbers in one click with random or custom expiry and CVV.",
    accent: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "Export CSV & TXT",
    desc: "Download generated test cards as CSV or plain text for automation pipelines and test suites.",
    accent: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Brand Validation",
    desc: "Auto-validates BIN prefix patterns for Visa, Mastercard, Amex, and Discover instantly.",
    accent: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Local History",
    desc: "Last 50 batches saved privately in your browser's localStorage. Reload or delete anytime.",
    accent: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
];

const BRAND_CARDS = [
  { brand: "Visa", prefix: "4xxxxxxx", length: "16 digits", cvv: "3-digit CVV", color: "from-primary to-primary-glow", dot: "bg-primary" },
  { brand: "Mastercard", prefix: "51–55 / 2221–2720", length: "16 digits", cvv: "3-digit CVV", color: "from-orange-500 to-amber-500", dot: "bg-orange-500" },
  { brand: "Amex", prefix: "34 / 37", length: "15 digits", cvv: "4-digit CID", color: "from-sky-500 to-blue-600", dot: "bg-sky-500" },
  { brand: "Discover", prefix: "6011 / 65 / 644–649", length: "16 digits", cvv: "3-digit CVV", color: "from-amber-500 to-orange-400", dot: "bg-amber-500" },
];

const STATS = [
  { value: "100%", label: "Client-side" },
  { value: "Luhn ✓", label: "Valid numbers" },
  { value: "0 bytes", label: "Data sent" },
  { value: "4 brands", label: "Supported" },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(ellipse, hsl(var(--primary)) 0%, transparent 70%)" }} />

        <div className="relative container mx-auto px-4 text-center max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary text-sm font-semibold mb-8 backdrop-blur-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            Test Card Generator · Luhn Algorithm
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-5 tracking-tight">
            <span className="gradient-text">CC Generator</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2 leading-relaxed max-w-2xl mx-auto">
            Generate <strong className="text-foreground font-semibold">mathematically valid</strong> credit card numbers
            for testing, education, and development.
          </p>
          <p className="text-sm font-medium mb-10" style={{ color: "hsl(var(--warning))" }}>
            ⚠️ For testing &amp; education only — NOT real cards, cannot be used for transactions
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              to="/generator"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 glow-primary"
            >
              <Zap className="w-4 h-4" />
              Start Generating
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/bins"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:border-primary/40 hover:bg-accent/40 transition-all hover:-translate-y-0.5"
            >
              <Hash className="w-4 h-4" />
              Browse BIN Presets
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-secondary/80 text-foreground font-semibold text-sm hover:bg-secondary transition-all hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4" />
              Learn Luhn
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <div className="container mx-auto px-4 max-w-3xl -mt-6 mb-16">
        <DisclaimerBanner />
      </div>

      {/* ── Supported Brands ── */}
      <section className="container mx-auto px-4 max-w-5xl pb-16">
        <div className="text-center mb-8">
          <span className="badge-primary text-xs uppercase tracking-wider mb-3 inline-flex">Supported Brands</span>
          <h2 className="text-2xl font-bold">All major card networks</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {BRAND_CARDS.map((b) => (
            <Link
              key={b.brand}
              to="/generator"
              className="group p-4 rounded-2xl bg-card border border-border card-hover-subtle flex flex-col gap-2 relative overflow-hidden"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${b.color} flex items-center justify-center mb-1 shadow-md group-hover:scale-110 transition-transform`}>
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <p className="font-bold text-foreground">{b.brand}</p>
              <div className="space-y-0.5">
                <p className="text-xs font-mono text-muted-foreground">{b.prefix}</p>
                <p className="text-xs text-muted-foreground">{b.length} · {b.cvv}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="container mx-auto px-4 max-w-5xl pb-16">
        <div className="text-center mb-10">
          <span className="badge-primary text-xs uppercase tracking-wider mb-3 inline-flex">Features</span>
          <h2 className="text-2xl font-bold">Everything you need for card testing</h2>
          <p className="text-muted-foreground text-sm mt-2">Professional-grade tools for developers and QA engineers</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-5 rounded-2xl bg-card border border-border card-hover-subtle group">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${f.accent} group-hover:scale-105 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="font-bold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="container mx-auto px-4 max-w-5xl pb-16">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-6 md:p-8 bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <span className="badge-primary text-xs uppercase tracking-wider mb-3 inline-flex">How it works</span>
            <h2 className="text-xl font-bold">Luhn-valid numbers in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              { step: "01", title: "Pick a brand & BIN", desc: "Select Visa, Mastercard, Amex, or Discover. Optionally enter a 6–8 digit BIN prefix.", icon: <CreditCard className="w-5 h-5" /> },
              { step: "02", title: "Configure options", desc: "Set quantity (1–100), expiry date, CVV preference, and cardholder name.", icon: <Zap className="w-5 h-5" /> },
              { step: "03", title: "Generate & export", desc: "Get Luhn-valid numbers instantly. Copy, export CSV/TXT, or save to history.", icon: <Download className="w-5 h-5" /> },
            ].map((item) => (
              <div key={item.step} className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl font-black text-primary/20">{item.step}</span>
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{item.icon}</div>
                </div>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick nav CTA ── */}
      <section className="container mx-auto px-4 max-w-5xl pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: "/generator", label: "Open Generator", sub: "Generate test cards now", icon: <Zap className="w-5 h-5" />, primary: true },
            { to: "/bins", label: "BIN Presets", sub: "Quick-start with a preset", icon: <Hash className="w-5 h-5" />, primary: false },
            { to: "/history", label: "View History", sub: "Browse previous batches", icon: <Clock className="w-5 h-5" />, primary: false },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center justify-between p-5 rounded-2xl border transition-all hover:-translate-y-1 ${
                link.primary
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                  : "bg-card border-border hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${link.primary ? "bg-white/20" : "bg-secondary"}`}>
                  {link.icon}
                </div>
                <div>
                  <p className="font-bold text-sm">{link.label}</p>
                  <p className={`text-xs mt-0.5 ${link.primary ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{link.sub}</p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${link.primary ? "text-primary-foreground/70" : "text-muted-foreground"}`} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
