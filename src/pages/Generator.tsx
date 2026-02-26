import { useState, useEffect } from "react";
import {
  CardBrand,
  BRAND_CONFIGS,
  GeneratedCard,
  GeneratorFormValues,
  generateBatch,
  validateBin,
  getDefaultLength,
  formatCardNumber,
  exportCsv,
  exportTxt,
  saveHistory,
  luhnCheck,
} from "@/lib/cardUtils";
import { BrandBadge } from "@/components/BrandBadge";
import { CopyButton } from "@/components/CopyButton";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { toast } from "@/hooks/use-toast";
import {
  Zap,
  Trash2,
  Eye,
  EyeOff,
  Download,
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  BookmarkPlus,
  Settings,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR + i));
const QUANTITIES = [1, 5, 10, 20, 50, 100];

const DEFAULT_FORM: GeneratorFormValues = {
  brand: "visa",
  bin: "",
  length: 16,
  quantity: 10,
  expMonth: "01",
  expYear: String(CURRENT_YEAR + 2),
  cvv: "123",
  name: "TEST USER",
  randomExp: true,
  randomCvv: true,
};

// BIN presets stored in sessionStorage for cross-page navigation
function getPresetBin(): GeneratorFormValues | null {
  try {
    const v = sessionStorage.getItem("ccgen_preset");
    if (v) { sessionStorage.removeItem("ccgen_preset"); return JSON.parse(v); }
  } catch {}
  return null;
}

export default function GeneratorPage() {
  const [form, setForm] = useState<GeneratorFormValues>({ ...DEFAULT_FORM });
  const [binError, setBinError] = useState("");
  const [results, setResults] = useState<GeneratedCard[]>([]);
  const [maskedRows, setMaskedRows] = useState<Record<string, boolean>>({});
  const [hiddenCvv, setHiddenCvv] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalMask, setGlobalMask] = useState(true);

  useEffect(() => {
    const preset = getPresetBin();
    if (preset) setForm(preset);
  }, []);

  const set = <K extends keyof GeneratorFormValues>(key: K, value: GeneratorFormValues[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-set length when brand changes
      if (key === "brand") {
        next.length = getDefaultLength(value as CardBrand);
        // Re-validate BIN on brand change
        if (next.bin) {
          const v = validateBin(next.bin, value as CardBrand);
          setBinError(v.error || "");
        }
      }
      return next;
    });
  };

  const handleBinChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 8);
    set("bin", clean);
    if (clean) {
      const v = validateBin(clean, form.brand);
      setBinError(v.error || "");
    } else {
      setBinError("");
    }
  };

  const handleGenerate = () => {
    if (form.bin) {
      const v = validateBin(form.bin, form.brand);
      if (!v.valid) { setBinError(v.error || "Invalid BIN"); return; }
    }
    setIsGenerating(true);
    setTimeout(() => {
      const cards = generateBatch(form);
      setResults(cards);
      // All masked + cvv hidden by default
      const m: Record<string, boolean> = {};
      const c: Record<string, boolean> = {};
      cards.forEach((card) => { m[card.id] = true; c[card.id] = true; });
      setMaskedRows(m);
      setHiddenCvv(c);
      setGlobalMask(true);
      saveHistory({ id: Date.now().toString(), timestamp: Date.now(), brand: form.brand, quantity: cards.length, bin: form.bin, cards });
      toast({ title: `Generated ${cards.length} test card${cards.length > 1 ? "s" : ""}`, duration: 2000 });
      setIsGenerating(false);
    }, 200);
  };

  const toggleMask = (id: string) => setMaskedRows((p) => ({ ...p, [id]: !p[id] }));
  const toggleCvv = (id: string) => setHiddenCvv((p) => ({ ...p, [id]: !p[id] }));

  const toggleGlobalMask = () => {
    const newVal = !globalMask;
    setGlobalMask(newVal);
    const m: Record<string, boolean> = {};
    results.forEach((c) => { m[c.id] = newVal; });
    setMaskedRows(m);
  };

  const deleteRow = (id: string) => setResults((p) => p.filter((c) => c.id !== id));

  const cardFullString = (c: GeneratedCard) =>
    `${c.number} | ${c.expMonth}/${c.expYear} | ${c.cvv} | ${c.name} | ${BRAND_CONFIGS[c.brand].label}`;

  const allText = results.map(cardFullString).join("\n");

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(allText);
    toast({ title: "All cards copied!", duration: 2000 });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Card Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure options and generate Luhn-valid test card numbers.</p>
        </div>
        <DisclaimerBanner />

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ─── Form Panel ─── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">

              {/* Brand */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Card Brand</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(BRAND_CONFIGS) as CardBrand[]).map((b) => (
                    <button
                      key={b}
                      onClick={() => set("brand", b)}
                      className={`py-2.5 px-3 rounded-lg text-sm font-semibold border transition-all ${
                        form.brand === b
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary border-border text-foreground hover:border-primary/40"
                      }`}
                    >
                      {BRAND_CONFIGS[b].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BIN */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  BIN / IIN <span className="normal-case font-normal">(optional, 6–8 digits)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.bin}
                  onChange={(e) => handleBinChange(e.target.value)}
                  placeholder={`e.g. ${BRAND_CONFIGS[form.brand].prefixes[0]}xxxx`}
                  className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                    binError ? "border-destructive focus:ring-destructive/30" : "border-border focus:ring-primary/30 focus:border-primary/50"
                  }`}
                />
                {binError ? (
                  <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {binError}
                  </p>
                ) : form.bin ? (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{color: "hsl(var(--success))"}}>
                    <CheckCircle2 className="w-3 h-3" /> BIN looks good
                  </p>
                ) : null}
              </div>

              {/* Length */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Card Length <span className="normal-case font-normal">(12–19)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={12}
                    max={19}
                    value={form.length}
                    onChange={(e) => set("length", parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="font-mono font-bold text-primary w-6 text-center">{form.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Default for {BRAND_CONFIGS[form.brand].label}: {getDefaultLength(form.brand)} digits
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Quantity</label>
                <div className="flex flex-wrap gap-2">
                  {QUANTITIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => set("quantity", q)}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold border transition-all ${
                        form.quantity === q
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expiry */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiry</label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.randomExp}
                      onChange={(e) => set("randomExp", e.target.checked)}
                      className="rounded accent-primary"
                    />
                    Random valid future
                  </label>
                </div>
                {!form.randomExp && (
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={form.expMonth}
                      onChange={(e) => set("expMonth", e.target.value)}
                      className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                      value={form.expYear}
                      onChange={(e) => set("expYear", e.target.value)}
                      className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* CVV */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    CVV <span className="normal-case font-normal">({BRAND_CONFIGS[form.brand].cvvLength} digits)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.randomCvv}
                      onChange={(e) => set("randomCvv", e.target.checked)}
                      className="rounded accent-primary"
                    />
                    Random
                  </label>
                </div>
                {!form.randomCvv && (
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={BRAND_CONFIGS[form.brand].cvvLength}
                    value={form.cvv}
                    onChange={(e) => set("cvv", e.target.value.replace(/\D/g, "").slice(0, BRAND_CONFIGS[form.brand].cvvLength))}
                    placeholder={"•".repeat(BRAND_CONFIGS[form.brand].cvvLength)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                )}
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Cardholder Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value.slice(0, 50))}
                  placeholder="TEST USER"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGenerate}
                disabled={!!binError || isGenerating}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Generate {form.quantity}
              </button>
              <button
                onClick={() => { setForm({ ...DEFAULT_FORM }); setResults([]); setBinError(""); }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm border border-border hover:bg-secondary/80 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          {/* ─── Results Panel ─── */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden flex-1">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border bg-secondary/20">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Results</span>
                  {results.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-mono font-bold">
                      {results.length}
                    </span>
                  )}
                </div>
                {results.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={toggleGlobalMask}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                    >
                      {globalMask ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {globalMask ? "Show All" : "Mask All"}
                    </button>
                    <CopyButton text={allText} variant="outline" label="Copy All" successMsg="All cards copied!" />
                    <button
                      onClick={() => { exportCsv(results); toast({ title: "CSV downloaded", duration: 2000 }); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                    >
                      <Download className="w-3 h-3" /> CSV
                    </button>
                    <button
                      onClick={() => { exportTxt(results); toast({ title: "TXT downloaded", duration: 2000 }); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="w-3 h-3" /> TXT
                    </button>
                    <button
                      onClick={() => setResults([])}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      title="Clear results"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Disclaimer inside results */}
              {results.length > 0 && (
                <div className="px-4 pt-3">
                  <DisclaimerBanner compact />
                </div>
              )}

              {/* Table */}
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 border border-border">
                    <Zap className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="font-medium text-muted-foreground">No cards generated yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Fill in the form and click Generate</p>
                </div>
              ) : (
                <div className="overflow-auto scrollbar-thin flex-1">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-card/95 border-b border-border">
                      <tr>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">#</th>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">Number</th>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">Exp</th>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">CVV</th>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">Brand</th>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">Luhn</th>
                        <th className="px-3 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((card, idx) => {
                        const masked = maskedRows[card.id] ?? true;
                        const cvvHidden = hiddenCvv[card.id] ?? true;
                        const formatted = formatCardNumber(card.number, card.brand, masked);
                        const isValid = luhnCheck(card.number);
                        return (
                          <tr key={card.id} className="border-b border-border/40 hover:bg-secondary/30 group transition-colors">
                            <td className="px-3 py-2.5 text-muted-foreground/50 font-mono">{idx + 1}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-foreground tracking-wider">{formatted}</span>
                                <button onClick={() => toggleMask(card.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                                  {masked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-foreground/80">{card.expMonth}/{card.expYear}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-foreground/80">{cvvHidden ? "•".repeat(card.cvv.length) : card.cvv}</span>
                                <button onClick={() => toggleCvv(card.id)} className="text-muted-foreground hover:text-foreground">
                                  {cvvHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <BrandBadge brand={card.brand} />
                            </td>
                            <td className="px-3 py-2.5">
                              {isValid ? (
                                <span className="badge-success"><CheckCircle2 className="w-3 h-3" />✓</span>
                              ) : (
                                <span className="badge-warning">✗</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={card.number} successMsg="Number copied!" />
                                <CopyButton text={cardFullString(card)} successMsg="Full card copied!" />
                                <button onClick={() => deleteRow(card.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
