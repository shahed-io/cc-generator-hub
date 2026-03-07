import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardBrand, BRAND_CONFIGS, GeneratorFormValues, getDefaultLength } from "@/lib/cardUtils";
import { BrandBadge } from "@/components/BrandBadge";
import { Hash, ArrowRight, Info, Search, Zap } from "lucide-react";

interface BinPreset {
  brand: CardBrand;
  bin: string;
  label: string;
  description: string;
  tag?: string;
}

const BIN_PRESETS: BinPreset[] = [
  { brand: "visa", bin: "400000", label: "Visa Generic", description: "Generic Visa test prefix — 16 digits", tag: "Popular" },
  { brand: "visa", bin: "411111", label: "Visa 411111", description: "Common sandbox Visa BIN used in dev documentation" },
  { brand: "visa", bin: "424242", label: "Visa 424242", description: "Widely used Visa test BIN in payment sandboxes", tag: "Popular" },
  { brand: "visa", bin: "426355", label: "Visa 426355", description: "Generic Visa 4263xx test range" },
  { brand: "mastercard", bin: "510000", label: "Mastercard 51xxxx", description: "Generic MC 51-range test prefix — 16 digits", tag: "Popular" },
  { brand: "mastercard", bin: "520000", label: "Mastercard 52xxxx", description: "Generic MC 52-range test prefix" },
  { brand: "mastercard", bin: "530000", label: "Mastercard 53xxxx", description: "Generic MC 53-range test prefix" },
  { brand: "mastercard", bin: "540000", label: "Mastercard 54xxxx", description: "Generic MC 54-range test prefix" },
  { brand: "mastercard", bin: "550000", label: "Mastercard 55xxxx", description: "Generic MC 55-range test prefix" },
  { brand: "mastercard", bin: "222100", label: "Mastercard 2-series", description: "New MC 2-series 2221xx range — 16 digits", tag: "New" },
  { brand: "amex", bin: "340000", label: "Amex 34xxxx", description: "Generic Amex 34-prefix — 15 digits, 4-digit CID", tag: "15 digits" },
  { brand: "amex", bin: "370000", label: "Amex 37xxxx", description: "Generic Amex 37-prefix — 15 digits, 4-digit CID", tag: "15 digits" },
  { brand: "discover", bin: "601100", label: "Discover 6011xx", description: "Generic Discover 6011xx range — 16 digits", tag: "Popular" },
  { brand: "discover", bin: "650000", label: "Discover 65xxxx", description: "Generic Discover 65xx range — 16 digits" },
  { brand: "discover", bin: "644000", label: "Discover 644xxx", description: "Discover 644–649 range — 16 digits" },
];

const TAG_COLORS: Record<string, string> = {
  Popular: "bg-primary/10 text-primary border-primary/20",
  New: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  "15 digits": "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
};

export default function BinsPage() {
  const [filter, setFilter] = useState<CardBrand | "all">("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = BIN_PRESETS.filter((p) => {
    const brandMatch = filter === "all" || p.brand === filter;
    const searchMatch = !search ||
      p.bin.includes(search) ||
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.includes(search.toLowerCase());
    return brandMatch && searchMatch;
  });

  const usePreset = (preset: BinPreset) => {
    const form: GeneratorFormValues = {
      brand: preset.brand,
      bin: preset.bin,
      length: getDefaultLength(preset.brand),
      quantity: 10,
      expMonth: "01",
      expYear: "27",
      cvv: "123",
      name: "TEST USER",
      randomExp: true,
      randomCvv: true,
    };
    sessionStorage.setItem("ccgen_preset", JSON.stringify(form));
    navigate("/generator");
  };

  const brandCounts = BIN_PRESETS.reduce((acc, p) => {
    acc[p.brand] = (acc[p.brand] || 0) + 1;
    return acc;
  }, {} as Record<CardBrand, number>);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                <Hash className="w-6 h-6 text-primary" />
                BIN Presets
              </h1>
              <p className="text-sm text-muted-foreground">
                {BIN_PRESETS.length} curated test BIN patterns. Click any preset to open in Generator.
              </p>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm mb-6"
          style={{
            background: "hsl(var(--primary) / 0.05)",
            borderColor: "hsl(var(--primary) / 0.2)",
            color: "hsl(var(--foreground) / 0.8)",
          }}>
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            These BIN patterns are provided for <strong>testing card number formats only</strong> and do not represent
            real issuing banks. All generated numbers are <em>not real cards</em> and cannot be used for transactions.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by BIN or brand..."
              className="input-field pl-9"
            />
          </div>

          {/* Brand filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "visa", "mastercard", "amex", "discover"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setFilter(b)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${
                  filter === b
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {b === "all" ? `All (${BIN_PRESETS.length})` : `${BRAND_CONFIGS[b].label} (${brandCounts[b] ?? 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {search && (
          <p className="text-xs text-muted-foreground mb-3">
            Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
          </p>
        )}

        {/* Presets grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border text-center">
            <Hash className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">No presets found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((preset) => (
              <div
                key={`${preset.brand}-${preset.bin}`}
                className="group bg-card rounded-2xl border border-border p-4 card-hover-subtle flex flex-col"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <BrandBadge brand={preset.brand} size="md" />
                  {preset.tag && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TAG_COLORS[preset.tag] ?? "bg-secondary text-foreground border-border"}`}>
                      {preset.tag}
                    </span>
                  )}
                </div>

                {/* BIN display */}
                <p className="font-mono font-black text-2xl text-foreground tracking-widest mb-0.5">
                  {preset.bin}
                  <span className="text-muted-foreground/30 text-lg">xxxxxx</span>
                </p>
                <p className="font-semibold text-sm mb-1">{preset.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3">{preset.description}</p>

                {/* Action */}
                <button
                  onClick={() => usePreset(preset)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all group-hover:border-primary/40"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Use in Generator
                  <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-8 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          BIN patterns are for testing formats only — not real issuer-specific data
        </p>
      </div>
    </div>
  );
}
