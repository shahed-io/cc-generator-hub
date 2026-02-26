import { useState } from "react";
import {
  generateCards,
  GeneratedCard,
  GeneratorOptions,
  detectNetwork,
  getNetworkLabel,
  CardNetwork,
} from "@/lib/cardUtils";
import { NetworkBadge } from "@/components/NetworkBadge";
import { CopyButton } from "@/components/CopyButton";
import heroBg from "@/assets/hero-bg.jpg";
import {
  CreditCard,
  Zap,
  List,
  Settings2,
  ChevronDown,
  RefreshCw,
  Download,
  Trash2,
} from "lucide-react";

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const YEARS = Array.from({ length: 10 }, (_, i) => String(2025 + i));
const QUANTITIES = [1, 5, 10, 20, 50, 100, 200, 500, 999];

export default function Index() {
  const [bin, setBin] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [expMonth, setExpMonth] = useState("XX");
  const [expYear, setExpYear] = useState("XX");
  const [cvv, setCvv] = useState("XXX");
  const [format, setFormat] = useState<"pipe" | "comma" | "plain">("pipe");
  const [results, setResults] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");

  const detectedNetwork = detectNetwork(bin);

  const handleGenerate = () => {
    if (!bin.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const cards = generateCards({
        bin: bin.trim(),
        quantity,
        expMonth: expMonth === "XX" ? "" : expMonth,
        expYear: expYear === "XX" ? "" : expYear,
        cvv: cvv === "XXX" || cvv === "XXXX" ? "" : cvv,
        format,
      } as GeneratorOptions);
      setResults(cards);
      setIsGenerating(false);
    }, 300);
  };

  const allText = results.map((c) => c.formatted).join("\n");

  const handleDownload = () => {
    const blob = new Blob([allText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-cards.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatBin = (val: string) => {
    return val.replace(/\D/g, "").slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div
        className="relative overflow-hidden border-b border-border"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-background/75 backdrop-blur-sm" />
        <div className="relative container mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold mb-4">
            <Zap className="w-3 h-3" />
            Luhn Algorithm Verified
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 glow-text">
            <span className="primary-gradient bg-clip-text text-transparent">
              CC Generator
            </span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Generate valid test credit card numbers using the Luhn algorithm. For educational & testing purposes only.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel - Generator */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex rounded-lg bg-secondary border border-border p-1 gap-1">
              {(["basic", "advanced"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "basic" ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Basic
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <Settings2 className="w-3.5 h-3.5" /> Advanced
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* BIN Input */}
            <div className="card-gradient rounded-xl border border-border p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  BIN / IIN
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={bin}
                    onChange={(e) => setBin(formatBin(e.target.value))}
                    placeholder="Enter BIN (e.g. 414720)"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground font-mono text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                  {bin && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <NetworkBadge network={detectedNetwork} />
                    </div>
                  )}
                </div>
                {bin && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Network: <span className="text-primary font-medium">{getNetworkLabel(detectedNetwork)}</span>
                    {" · "}BIN Length: <span className="text-primary font-medium">{bin.length}</span>
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Quantity
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUANTITIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuantity(q)}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all border ${
                        quantity === q
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Month
                  </label>
                  <select
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  >
                    <option value="XX">Random</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Year
                  </label>
                  <select
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  >
                    <option value="XX">Random</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y.slice(-2)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setCvv(val || "XXX");
                    }}
                    placeholder="Rnd"
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Advanced options */}
              {activeTab === "advanced" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Output Format
                  </label>
                  <div className="flex gap-2">
                    {(["pipe", "comma", "plain"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono border transition-all ${
                          format === f
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-secondary border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {f === "pipe" ? "4444|MM|YY|CVV" : f === "comma" ? "4444,MM,YY" : "4444 MM/YY"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!bin.trim() || isGenerating}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 primary-gradient text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate {quantity} Card{quantity > 1 ? "s" : ""}
                </>
              )}
            </button>

            {/* Info Card */}
            <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground/70 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-primary" /> Supported Networks
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(["visa", "mastercard", "amex", "discover", "unionpay", "jcb"] as CardNetwork[]).map((n) => (
                  <NetworkBadge key={n} network={n} size="md" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-3">
            <div className="card-gradient rounded-xl border border-border overflow-hidden h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/20">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <List className="w-4 h-4 text-primary" />
                  <span>Generated Cards</span>
                  {results.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-mono">
                      {results.length}
                    </span>
                  )}
                </div>
                {results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <CopyButton text={allText} variant="full" label="Copy All" />
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <button
                      onClick={() => setResults([])}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      title="Clear"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Results */}
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-medium">No cards generated yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Enter a BIN and click Generate</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[620px] scrollbar-thin">
                  <table className="w-full text-xs font-mono">
                    <thead className="sticky top-0 bg-card/80 backdrop-blur-sm border-b border-border">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">#</th>
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">Card Number</th>
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">Exp</th>
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">CVV</th>
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">Net</th>
                        <th className="px-2 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((card, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors group"
                        >
                          <td className="px-4 py-2.5 text-muted-foreground/50">{idx + 1}</td>
                          <td className="px-4 py-2.5 text-foreground tracking-wider">{card.number}</td>
                          <td className="px-4 py-2.5 text-foreground/80">
                            {card.expMonth}/{card.expYear}
                          </td>
                          <td className="px-4 py-2.5 text-foreground/80">{card.cvv}</td>
                          <td className="px-4 py-2.5">
                            <NetworkBadge network={card.network} />
                          </td>
                          <td className="px-2 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={card.formatted} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-center text-xs text-muted-foreground">
          <strong className="text-destructive/80">⚠️ Disclaimer:</strong> This tool is for educational and software testing purposes only.
          Generated numbers are mathematically valid but not real credit cards. Using fake card numbers for fraud is illegal.
        </div>
      </div>
    </div>
  );
}
