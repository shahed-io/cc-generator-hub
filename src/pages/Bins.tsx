import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardBrand, BRAND_CONFIGS, GeneratorFormValues, getDefaultLength } from "@/lib/cardUtils";
import { BrandBadge } from "@/components/BrandBadge";
import { Hash, ExternalLink, Info } from "lucide-react";

interface BinPreset {
  brand: CardBrand;
  bin: string;
  label: string;
  description: string;
}

const BIN_PRESETS: BinPreset[] = [
  { brand: "visa", bin: "400000", label: "Visa Test BIN: 400000", description: "Generic Visa test prefix (16 digits)" },
  { brand: "visa", bin: "411111", label: "Visa Test BIN: 411111", description: "Common Visa test prefix used in dev docs" },
  { brand: "visa", bin: "424242", label: "Visa Test BIN: 424242", description: "Widely used Visa test BIN in sandboxes" },
  { brand: "mastercard", bin: "510000", label: "Mastercard Test BIN: 510000", description: "Generic MC range 51xxxx (16 digits)" },
  { brand: "mastercard", bin: "520000", label: "Mastercard Test BIN: 520000", description: "Generic MC range 52xxxx (16 digits)" },
  { brand: "mastercard", bin: "530000", label: "Mastercard Test BIN: 530000", description: "Generic MC range 53xxxx (16 digits)" },
  { brand: "mastercard", bin: "222100", label: "Mastercard Test BIN: 222100", description: "New MC 2-series range 2221xxxx (16 digits)" },
  { brand: "amex", bin: "340000", label: "Amex Test BIN: 340000", description: "Generic Amex 34xxxx (15 digits)" },
  { brand: "amex", bin: "370000", label: "Amex Test BIN: 370000", description: "Generic Amex 37xxxx (15 digits)" },
  { brand: "discover", bin: "601100", label: "Discover Test BIN: 601100", description: "Generic Discover 6011xx (16 digits)" },
  { brand: "discover", bin: "650000", label: "Discover Test BIN: 650000", description: "Generic Discover 65xxxx (16 digits)" },
];

export default function BinsPage() {
  const [filter, setFilter] = useState<CardBrand | "all">("all");
  const navigate = useNavigate();

  const filtered = filter === "all" ? BIN_PRESETS : BIN_PRESETS.filter((p) => p.brand === filter);

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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Hash className="w-6 h-6 text-primary" />
            BIN Presets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Curated test BINs for each card brand. Click a preset to fill the Generator form.
          </p>
        </div>

        {/* Notice */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground/80 mb-6">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <strong>Note:</strong> These BIN patterns are provided for testing card number formats only.
            They do not represent real issuing banks or financial institutions.
            Generated numbers are <em>not real cards</em> and cannot be used for transactions.
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(["all", "visa", "mastercard", "amex", "discover"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setFilter(b)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all capitalize ${
                filter === b
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {b === "all" ? "All" : BRAND_CONFIGS[b].label}
            </button>
          ))}
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((preset) => (
            <div
              key={`${preset.brand}-${preset.bin}`}
              className="bg-card rounded-xl border border-border p-4 card-hover"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <BrandBadge brand={preset.brand} size="md" />
                  <p className="font-mono font-bold text-lg mt-2 text-foreground">{preset.bin}xxxxxx</p>
                  <p className="text-xs font-semibold text-foreground/80 mt-0.5">{preset.label}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>
              <button
                onClick={() => usePreset(preset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                Use in Generator
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
