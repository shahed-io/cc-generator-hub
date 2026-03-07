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
  Zap, Trash2, Eye, EyeOff, Download, FileText, RefreshCw,
  CheckCircle2, AlertCircle, X, Settings2, CreditCard,
  ChevronDown, Copy, AlertTriangle
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

function getPresetBin(): GeneratorFormValues | null {
  try {
    const v = sessionStorage.getItem("ccgen_preset");
    if (v) { sessionStorage.removeItem("ccgen_preset"); return JSON.parse(v); }
  } catch {}
  return null;
}

// Virtual card preview component
function VirtualCard({ card, masked }: { card: GeneratedCard | null; masked: boolean }) {
  const brandGradients: Record<CardBrand, string> = {
    visa: "from-primary to-primary-glow",
    mastercard: "from-orange-500 to-amber-500",
    amex: "from-sky-500 to-blue-700",
    discover: "from-amber-500 to-orange-500",
  };

  const brand = card?.brand ?? "visa";
  const gradient = brandGradients[brand];

  return (
    <div className={`virtual-card aspect-[1.586/1] w-full max-w-sm mx-auto p-5 md:p-6 bg-gradient-to-br ${gradient} text-white select-none`}>
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">CC Generator</p>
            <p className="text-xs font-bold mt-0.5 opacity-90">Test Card Only</p>
          </div>
          <div className="flex flex-col items-end">
            <CreditCard className="w-7 h-7 opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">
              {card ? BRAND_CONFIGS[card.brand].label : "—"}
            </span>
          </div>
        </div>

        {/* Chip */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-7 rounded-md bg-amber-300/80 flex items-center justify-center shadow-inner">
            <div className="w-5 h-5 rounded-sm border border-amber-400/50 bg-amber-200/60 grid grid-cols-2 gap-px p-0.5">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-amber-400/60 rounded-[1px]" />)}
            </div>
          </div>
        </div>

        {/* Number */}
        <div>
          <p className="font-mono text-lg md:text-xl font-bold tracking-widest leading-relaxed">
            {card
              ? formatCardNumber(card.number, card.brand, masked)
              : "•••• •••• •••• ••••"}
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-60 mb-0.5">Card Holder</p>
            <p className="text-sm font-bold uppercase tracking-wide">
              {card?.name ?? "TEST USER"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-60 mb-0.5">Expires</p>
            <p className="text-sm font-bold font-mono">
              {card ? `${card.expMonth}/${card.expYear}` : "MM/YY"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneratorPage() {
  const [form, setForm] = useState<GeneratorFormValues>({ ...DEFAULT_FORM });
  const [binError, setBinError] = useState("");
  const [results, setResults] = useState<GeneratedCard[]>([]);
  const [maskedRows, setMaskedRows] = useState<Record<string, boolean>>({});
  const [hiddenCvv, setHiddenCvv] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalMask, setGlobalMask] = useState(true);
  const [previewCard, setPreviewCard] = useState<GeneratedCard | null>(null);
  const [previewMasked, setPreviewMasked] = useState(true);
  const [outputFormat, setOutputFormat] = useState<"table" | "list">("table");

  useEffect(() => {
    const preset = getPresetBin();
    if (preset) setForm(preset);
  }, []);

  const set = <K extends keyof GeneratorFormValues>(key: K, value: GeneratorFormValues[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "brand") {
        next.length = getDefaultLength(value as CardBrand);
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
      const m: Record<string, boolean> = {};
      const c: Record<string, boolean> = {};
      cards.forEach((card) => { m[card.id] = true; c[card.id] = true; });
      setMaskedRows(m);
      setHiddenCvv(c);
      setGlobalMask(true);
      setPreviewCard(cards[0] ?? null);
      setPreviewMasked(true);
      saveHistory({ id: Date.now().toString(), timestamp: Date.now(), brand: form.brand, quantity: cards.length, bin: form.bin, cards });
      toast({ title: `✓ Generated ${cards.length} test card${cards.length > 1 ? "s" : ""}`, duration: 2000 });
      setIsGenerating(false);
    }, 250);
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

  const deleteRow = (id: string) => {
    setResults((p) => {
      const next = p.filter((c) => c.id !== id);
      if (previewCard?.id === id) setPreviewCard(next[0] ?? null);
      return next;
    });
  };

  const cardFullString = (c: GeneratedCard) =>
    `${c.number} | ${c.expMonth}/${c.expYear} | ${c.cvv} | ${c.name} | ${BRAND_CONFIGS[c.brand].label}`;

  const allText = results.map(cardFullString).join("\n");

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(allText);
    toast({ title: "All cards copied!", duration: 2000 });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-primary" />
              Card Generator
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configure and generate Luhn-valid test card numbers.</p>
          </div>
        </div>
        <DisclaimerBanner compact />

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
          {/* ─── Left: Form Panel ─── */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5 space-y-5">

              {/* Brand Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Card Brand</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(BRAND_CONFIGS) as CardBrand[]).map((b) => (
                    <button
                      key={b}
                      onClick={() => set("brand", b)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                        form.brand === b
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                          : "bg-secondary border-border text-foreground hover:border-primary/40 hover:bg-accent/50"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          b === "visa" ? "bg-primary" : b === "mastercard" ? "bg-orange-500" : b === "amex" ? "bg-sky-500" : "bg-amber-500"
                        } ${form.brand === b ? "bg-white" : ""}`} />
                        {BRAND_CONFIGS[b].label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* BIN */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  BIN / IIN <span className="normal-case font-normal text-muted-foreground">(optional, 6–8 digits)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.bin}
                  onChange={(e) => handleBinChange(e.target.value)}
                  placeholder={`e.g. ${BRAND_CONFIGS[form.brand].prefixes[0]}xxxx`}
                  className={`input-field font-mono ${
                    binError ? "border-destructive focus:ring-destructive/30" : ""
                  }`}
                />
                {binError ? (
                  <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {binError}
                  </p>
                ) : form.bin && form.bin.length >= 6 ? (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "hsl(var(--success))" }}>
                    <CheckCircle2 className="w-3 h-3" /> BIN matches {BRAND_CONFIGS[form.brand].label}
                  </p>
                ) : null}
              </div>

              {/* Card Length */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card Length</label>
                  <span className="font-mono font-bold text-primary text-sm bg-primary/10 px-2 py-0.5 rounded-md">{form.length}</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={19}
                  value={form.length}
                  onChange={(e) => set("length", parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span>12</span>
                  <span className="text-primary/70">Default: {getDefaultLength(form.brand)}</span>
                  <span>19</span>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Quantity</label>
                <div className="flex flex-wrap gap-1.5">
                  {QUANTITIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => set("quantity", q)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        form.quantity === q
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
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
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiry Date</label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.randomExp}
                      onChange={(e) => set("randomExp", e.target.checked)}
                      className="rounded accent-primary"
                    />
                    Random
                  </label>
                </div>
                {!form.randomExp && (
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={form.expMonth}
                      onChange={(e) => set("expMonth", e.target.value)}
                      className="input-field bg-background"
                    >
                      {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                      value={form.expYear}
                      onChange={(e) => set("expYear", e.target.value)}
                      className="input-field bg-background"
                    >
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}
                {form.randomExp && (
                  <p className="text-xs text-muted-foreground bg-secondary/60 rounded-lg px-2.5 py-1.5 border border-border">
                    Will generate random future expiry (1–5 years ahead)
                  </p>
                )}
              </div>

              {/* CVV */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    CVV <span className="normal-case font-normal">({BRAND_CONFIGS[form.brand].cvvLength}-digit{form.brand === "amex" ? " CID" : ""})</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
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
                    className="input-field font-mono"
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
                  className="input-field uppercase"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleGenerate}
                disabled={!!binError || isGenerating}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isGenerating
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Zap className="w-4 h-4" />}
                Generate {form.quantity}
              </button>
              <button
                onClick={() => { setForm({ ...DEFAULT_FORM }); setResults([]); setBinError(""); setPreviewCard(null); }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm border border-border hover:bg-secondary/80 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Virtual Card Preview */}
            {previewCard && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card Preview</p>
                  <button
                    onClick={() => setPreviewMasked(p => !p)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    {previewMasked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {previewMasked ? "Reveal" : "Mask"}
                  </button>
                </div>
                <VirtualCard card={previewCard} masked={previewMasked} />
                <p className="text-[10px] text-center text-muted-foreground">
                  Click a row to preview · NOT a real card
                </p>
              </div>
            )}
          </div>

          {/* ─── Right: Results Panel ─── */}
          <div className="flex flex-col min-h-[500px]">
            <div className="bg-card rounded-2xl border border-border flex flex-col overflow-hidden flex-1">
              {/* Results header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border bg-secondary/20">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Results</span>
                  {results.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-mono font-bold border border-primary/20">
                      {results.length}
                    </span>
                  )}
                </div>
                {results.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={toggleGlobalMask}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                    >
                      {globalMask ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {globalMask ? "Show All" : "Mask All"}
                    </button>
                    <button
                      onClick={handleCopyAll}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-3 h-3" /> Copy All
                    </button>
                    <button
                      onClick={() => { exportCsv(results); toast({ title: "CSV downloaded ✓", duration: 2000 }); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                    >
                      <Download className="w-3 h-3" /> CSV
                    </button>
                    <button
                      onClick={() => { exportTxt(results); toast({ title: "TXT downloaded ✓", duration: 2000 }); }}
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

              {/* Disclaimer */}
              {results.length > 0 && (
                <div className="px-4 pt-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs border"
                    style={{
                      background: "hsl(var(--warning) / 0.07)",
                      borderColor: "hsl(var(--warning) / 0.25)",
                      color: "hsl(var(--warning))",
                    }}>
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>This is <strong>NOT</strong> real payment card data. Do NOT use for real transactions.</span>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-24 text-center px-8">
                  <div className="w-20 h-20 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center mb-5">
                    <CreditCard className="w-9 h-9 text-muted-foreground/30" />
                  </div>
                  <p className="font-semibold text-muted-foreground text-base">No cards generated yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-xs">
                    Configure options on the left and click <strong>Generate</strong> to create test card numbers
                  </p>
                </div>
              ) : (
                /* Results table */
                <div className="overflow-auto scrollbar-thin flex-1">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-card/95 border-b border-border backdrop-blur-sm">
                      <tr>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold w-8">#</th>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">Card Number</th>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">Expiry</th>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">CVV</th>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">Brand</th>
                        <th className="text-left px-3 py-2.5 text-muted-foreground font-semibold">Luhn</th>
                        <th className="px-3 py-2.5 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((card, idx) => {
                        const masked = maskedRows[card.id] ?? true;
                        const cvvHidden = hiddenCvv[card.id] ?? true;
                        const formatted = formatCardNumber(card.number, card.brand, masked);
                        const isValid = luhnCheck(card.number);
                        const isPreview = previewCard?.id === card.id;
                        return (
                          <tr
                            key={card.id}
                            onClick={() => setPreviewCard(card)}
                            className={`border-b border-border/40 hover:bg-secondary/30 group transition-colors cursor-pointer ${isPreview ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                          >
                            <td className="px-3 py-2.5 text-muted-foreground/40 font-mono">{idx + 1}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-foreground tracking-wider whitespace-nowrap">{formatted}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleMask(card.id); }}
                                  className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                                >
                                  {masked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-foreground/80 whitespace-nowrap">{card.expMonth}/{card.expYear}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-foreground/80">{cvvHidden ? "•".repeat(card.cvv.length) : card.cvv}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleCvv(card.id); }}
                                  className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                  {cvvHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2.5"><BrandBadge brand={card.brand} /></td>
                            <td className="px-3 py-2.5">
                              {isValid
                                ? <span className="badge-success"><CheckCircle2 className="w-3 h-3" />Valid</span>
                                : <span className="badge-warning">✗ Fail</span>}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={card.number} successMsg="Number copied!" />
                                <CopyButton text={cardFullString(card)} successMsg="Full card copied!" />
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteRow(card.id); }}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                >
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
