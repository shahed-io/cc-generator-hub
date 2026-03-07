import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CardBrand, BRAND_CONFIGS, GeneratedCard, GeneratorFormValues,
  generateBatch, validateBin, getDefaultLength, formatCardNumber,
  exportCsv, exportTxt, saveHistory, luhnCheck, generateCard,
} from "@/lib/cardUtils";
import { BrandBadge } from "@/components/BrandBadge";
import { CopyButton } from "@/components/CopyButton";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { toast } from "@/hooks/use-toast";
import {
  Zap, Trash2, Eye, EyeOff, Download, FileText, RefreshCw,
  CheckCircle2, AlertCircle, X, Settings2, CreditCard,
  Copy, AlertTriangle, Wifi, Shield,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR + i));
const QUANTITIES = [1, 5, 10, 20, 50, 100];

const DEFAULT_FORM: GeneratorFormValues = {
  brand: "visa", bin: "", length: 16, quantity: 10,
  expMonth: "01", expYear: String(CURRENT_YEAR + 2),
  cvv: "123", name: "TEST USER", randomExp: true, randomCvv: true,
};

function getPresetBin(): GeneratorFormValues | null {
  try {
    const v = sessionStorage.getItem("ccgen_preset");
    if (v) { sessionStorage.removeItem("ccgen_preset"); return JSON.parse(v); }
  } catch {}
  return null;
}

// ─── Scramble text animation hook ──────────────────────────────────────────
function useScramble(target: string, active: boolean) {
  const [display, setDisplay] = useState(target);
  const chars = "0123456789";
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) { setDisplay(target); return; }
    let iteration = 0;
    const total = 12;
    if (frameRef.current) clearInterval(frameRef.current);
    frameRef.current = setInterval(() => {
      setDisplay(
        target
          .split("")
          .map((char, idx) => {
            if (char === " " || char === "/" || char === "•") return char;
            if (idx < iteration) return target[idx];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      if (iteration >= target.length) {
        clearInterval(frameRef.current!);
        setDisplay(target);
      }
      iteration += 1.5;
    }, 40);
    return () => { if (frameRef.current) clearInterval(frameRef.current); };
  }, [target, active]);

  return display;
}

// ─── Brand gradient map ─────────────────────────────────────────────────────
const BRAND_GRADIENTS: Record<CardBrand, { from: string; to: string; bg: string }> = {
  visa:       { from: "#2563eb", to: "#7c3aed", bg: "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)" },
  mastercard: { from: "#f97316", to: "#eab308", bg: "linear-gradient(135deg,#ea580c 0%,#f59e0b 100%)" },
  amex:       { from: "#0ea5e9", to: "#1d4ed8", bg: "linear-gradient(135deg,#0284c7 0%,#1e40af 100%)" },
  discover:   { from: "#f59e0b", to: "#ef4444", bg: "linear-gradient(135deg,#d97706 0%,#dc2626 100%)" },
};

// ─── Live Virtual Card ──────────────────────────────────────────────────────
interface LiveCardProps {
  brand: CardBrand;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  name: string;
  masked: boolean;
  scrambling: boolean;
}

function LiveVirtualCard({ brand, number, expMonth, expYear, cvv, name, masked, scrambling }: LiveCardProps) {
  const grad = BRAND_GRADIENTS[brand];

  const displayNumber = masked
    ? number.replace(/(.{4})/g, "$1 ").trim().split(" ").map((g, i) => i === Math.floor(number.length / 4) - 1 ? g : "••••").join(" ")
    : number.replace(/(.{4})/g, "$1 ").trim();

  const scrambledNumber = useScramble(displayNumber, scrambling);

  return (
    <motion.div
      layout
      className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden select-none cursor-default shadow-2xl"
      style={{ background: grad.bg }}
      whileHover={{ scale: 1.02, rotateY: 3 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Glow orbs */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle,white,transparent)" }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle,white,transparent)" }} />

      {/* Shimmer overlay when scrambling */}
      <AnimatePresence>
        {scrambling && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 0.8s infinite",
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col justify-between p-5 text-white">
        {/* Top */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">CC Generator</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Wifi className="w-3 h-3 opacity-70" />
              <p className="text-[10px] font-semibold opacity-80">TEST CARD ONLY</p>
            </div>
          </div>
          <motion.div
            key={brand}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-end"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-80">
              {BRAND_CONFIGS[brand].label}
            </p>
          </motion.div>
        </div>

        {/* Chip */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-8 rounded-md flex items-center justify-center shadow-inner"
            style={{ background: "linear-gradient(135deg,#d4a843,#f0c060)" }}>
            <div className="w-6 h-5 rounded-sm grid grid-cols-2 gap-px p-0.5"
              style={{ background: "rgba(180,130,30,0.4)", border: "1px solid rgba(200,160,50,0.5)" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-[1px]" style={{ background: "rgba(200,160,50,0.5)" }} />
              ))}
            </div>
          </div>
          <Shield className="w-4 h-4 opacity-40" />
        </div>

        {/* Card Number */}
        <div>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Card Number</p>
          <motion.p
            key={scrambledNumber}
            className="font-mono text-base md:text-lg font-black tracking-[0.18em] leading-none"
          >
            {scrambledNumber || "•••• •••• •••• ••••"}
          </motion.p>
        </div>

        {/* Bottom */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-widest opacity-50 mb-0.5">Card Holder</p>
            <motion.p
              key={name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-black uppercase tracking-wider"
            >
              {name || "TEST USER"}
            </motion.p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest opacity-50 mb-0.5">Expires</p>
            <motion.p
              key={`${expMonth}/${expYear}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-black font-mono"
            >
              {expMonth}/{expYear.slice(-2)}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Live Card Number Preview (updates as you type BIN) ─────────────────────
function LiveNumberPreview({ brand, bin, length }: { brand: CardBrand; bin: string; length: number }) {
  const [liveNumber, setLiveNumber] = useState("");
  const [ticking, setTicking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTicking(true);
    let ticks = 0;
    intervalRef.current = setInterval(() => {
      try {
        const c = generateCard({
          brand, bin, length,
          expMonth: "01", expYear: String(CURRENT_YEAR + 2),
          cvv: "123", name: "PREVIEW",
          randomExp: false, randomCvv: false,
        });
        setLiveNumber(c.number);
      } catch {}
      ticks++;
      if (ticks >= 6) {
        clearInterval(intervalRef.current!);
        setTicking(false);
      }
    }, 80);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [brand, bin, length]);

  const display = formatCardNumber(liveNumber, brand, false);
  const scrambled = useScramble(display, ticking);

  return (
    <div className="font-mono text-xs text-muted-foreground tracking-wider bg-secondary/50 px-3 py-2 rounded-lg border border-border overflow-hidden">
      <span className="text-[10px] text-muted-foreground/60 mr-2">Preview:</span>
      <span className={ticking ? "text-primary" : "text-foreground"}>{scrambled || "—"}</span>
    </div>
  );
}

// ─── Main Generator Page ────────────────────────────────────────────────────
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
  const [cardScrambling, setCardScrambling] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    const preset = getPresetBin();
    if (preset) setForm(preset);
  }, []);

  // Live card updates from form
  const liveCardData = {
    brand: form.brand,
    number: previewCard?.number ?? "4000000000000000",
    expMonth: form.randomExp ? (previewCard?.expMonth ?? "01") : form.expMonth,
    expYear: form.randomExp ? (previewCard?.expYear ?? String(CURRENT_YEAR + 2).slice(-2)) : form.expYear.slice(-2),
    cvv: form.randomCvv ? (previewCard?.cvv ?? "•••") : form.cvv,
    name: form.name || "TEST USER",
  };

  const set = useCallback(<K extends keyof GeneratorFormValues>(key: K, value: GeneratorFormValues[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "brand") {
        next.length = getDefaultLength(value as CardBrand);
        if (next.bin) {
          const v = validateBin(next.bin, value as CardBrand);
          setBinError(v.error || "");
        }
        setCardScrambling(true);
        setTimeout(() => setCardScrambling(false), 700);
      }
      return next;
    });
  }, []);

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
    setGenerationProgress(0);
    setCardScrambling(true);

    // Animate progress
    let prog = 0;
    const progInterval = setInterval(() => {
      prog += Math.random() * 25;
      setGenerationProgress(Math.min(prog, 90));
      if (prog >= 90) clearInterval(progInterval);
    }, 60);

    setTimeout(() => {
      clearInterval(progInterval);
      setGenerationProgress(100);
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
      toast({ title: `⚡ ${cards.length} test card${cards.length > 1 ? "s" : ""} generated`, duration: 2000 });
      setIsGenerating(false);
      setCardScrambling(false);
      setTimeout(() => setGenerationProgress(0), 500);
    }, 400);
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
        <div className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-primary" />
            Card Generator
            <span className="pulse-dot ml-1">
              <span className="text-xs font-normal text-muted-foreground normal-case tracking-normal">live</span>
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Form changes reflect on the card preview instantly.</p>
        </div>
        <DisclaimerBanner compact />

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">

          {/* ─── Left: Form + Live Card ─── */}
          <div className="space-y-4">
            {/* Live Virtual Card — always visible at top */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Live Preview
                </p>
                <button
                  onClick={() => setPreviewMasked(p => !p)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  {previewMasked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {previewMasked ? "Reveal" : "Mask"}
                </button>
              </div>
              <LiveVirtualCard
                brand={liveCardData.brand}
                number={liveCardData.number}
                expMonth={liveCardData.expMonth}
                expYear={liveCardData.expYear}
                cvv={liveCardData.cvv}
                name={liveCardData.name}
                masked={previewMasked}
                scrambling={cardScrambling}
              />
              {/* Live number preview below card */}
              <LiveNumberPreview brand={form.brand} bin={form.bin} length={form.length} />
            </div>

            {/* Form */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">

              {/* Brand */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Card Brand</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(BRAND_CONFIGS) as CardBrand[]).map((b) => {
                    const dotColors: Record<CardBrand, string> = {
                      visa: "bg-primary", mastercard: "bg-orange-500",
                      amex: "bg-sky-500", discover: "bg-amber-500",
                    };
                    return (
                      <motion.button
                        key={b}
                        onClick={() => set("brand", b)}
                        whileTap={{ scale: 0.96 }}
                        className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                          form.brand === b
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                            : "bg-secondary border-border text-foreground hover:border-primary/40 hover:bg-accent/50"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${form.brand === b ? "bg-white" : dotColors[b]}`} />
                          {BRAND_CONFIGS[b].label}
                        </span>
                      </motion.button>
                    );
                  })}
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
                  className={`input-field font-mono ${binError ? "border-destructive focus:ring-destructive/30" : ""}`}
                />
                <AnimatePresence mode="wait">
                  {binError ? (
                    <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {binError}
                    </motion.p>
                  ) : form.bin && form.bin.length >= 6 ? (
                    <motion.p key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "hsl(var(--success))" }}>
                      <CheckCircle2 className="w-3 h-3" /> BIN matches {BRAND_CONFIGS[form.brand].label}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Card Length */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card Length</label>
                  <motion.span
                    key={form.length}
                    initial={{ scale: 1.3, color: "hsl(var(--primary))" }}
                    animate={{ scale: 1 }}
                    className="font-mono font-bold text-primary text-sm bg-primary/10 px-2 py-0.5 rounded-md"
                  >
                    {form.length}
                  </motion.span>
                </div>
                <input type="range" min={12} max={19} value={form.length}
                  onChange={(e) => set("length", parseInt(e.target.value))}
                  className="w-full accent-primary" />
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
                    <motion.button key={q} whileTap={{ scale: 0.9 }}
                      onClick={() => set("quantity", q)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        form.quantity === q
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >{q}</motion.button>
                  ))}
                </div>
              </div>

              {/* Expiry */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiry</label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                    <input type="checkbox" checked={form.randomExp}
                      onChange={(e) => set("randomExp", e.target.checked)}
                      className="rounded accent-primary" />
                    Random
                  </label>
                </div>
                <AnimatePresence>
                  {!form.randomExp && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-2 pb-1">
                        <select value={form.expMonth} onChange={(e) => set("expMonth", e.target.value)}
                          className="input-field bg-background">
                          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select value={form.expYear} onChange={(e) => set("expYear", e.target.value)}
                          className="input-field bg-background">
                          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CVV */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    CVV <span className="normal-case font-normal">({BRAND_CONFIGS[form.brand].cvvLength}-digit{form.brand === "amex" ? " CID" : ""})</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                    <input type="checkbox" checked={form.randomCvv}
                      onChange={(e) => set("randomCvv", e.target.checked)}
                      className="rounded accent-primary" />
                    Random
                  </label>
                </div>
                <AnimatePresence>
                  {!form.randomCvv && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <input type="text" inputMode="numeric"
                        maxLength={BRAND_CONFIGS[form.brand].cvvLength}
                        value={form.cvv}
                        onChange={(e) => set("cvv", e.target.value.replace(/\D/g, "").slice(0, BRAND_CONFIGS[form.brand].cvvLength))}
                        placeholder={"•".repeat(BRAND_CONFIGS[form.brand].cvvLength)}
                        className="input-field font-mono mb-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Cardholder Name</label>
                <input type="text" value={form.name}
                  onChange={(e) => set("name", e.target.value.slice(0, 50))}
                  placeholder="TEST USER" className="input-field uppercase" />
              </div>
            </div>

            {/* Generate & Reset */}
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                onClick={handleGenerate}
                disabled={!!binError || isGenerating}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {/* Progress bar */}
                {isGenerating && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: generationProgress / 100 }}
                    transition={{ ease: "linear" }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {isGenerating
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Zap className="w-4 h-4" />}
                  {isGenerating ? "Generating…" : `Generate ${form.quantity}`}
                </span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setForm({ ...DEFAULT_FORM }); setResults([]); setBinError(""); setPreviewCard(null); setCardScrambling(true); setTimeout(() => setCardScrambling(false), 600); }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm border border-border hover:bg-secondary/80 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Reset
              </motion.button>
            </div>
          </div>

          {/* ─── Right: Results Panel ─── */}
          <div className="flex flex-col min-h-[600px]">
            <div className="bg-card rounded-2xl border border-border flex flex-col overflow-hidden flex-1">
              {/* Results header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border bg-secondary/20">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Results</span>
                  <AnimatePresence mode="wait">
                    {results.length > 0 && (
                      <motion.span
                        key={results.length}
                        initial={{ scale: 1.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-mono font-bold border border-primary/20"
                      >
                        {results.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {results.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button onClick={toggleGlobalMask}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground">
                      {globalMask ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {globalMask ? "Show All" : "Mask All"}
                    </button>
                    <button onClick={handleCopyAll}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground">
                      <Copy className="w-3 h-3" /> Copy All
                    </button>
                    <button onClick={() => { exportCsv(results); toast({ title: "CSV downloaded ✓", duration: 2000 }); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground">
                      <Download className="w-3 h-3" /> CSV
                    </button>
                    <button onClick={() => { exportTxt(results); toast({ title: "TXT downloaded ✓", duration: 2000 }); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground">
                      <FileText className="w-3 h-3" /> TXT
                    </button>
                    <button onClick={() => setResults([])}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" title="Clear">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Warning banner */}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    className="px-4 pt-3 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs border"
                      style={{ background: "hsl(var(--warning)/0.07)", borderColor: "hsl(var(--warning)/0.25)", color: "hsl(var(--warning))" }}>
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      This is <strong className="mx-1">NOT</strong> real payment card data. Do NOT use for real transactions.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {results.length === 0 && !isGenerating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center flex-1 py-24 text-center px-8">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center mb-5"
                  >
                    <CreditCard className="w-9 h-9 text-muted-foreground/30" />
                  </motion.div>
                  <p className="font-semibold text-muted-foreground text-base">No cards generated yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-xs">
                    Configure options on the left and click <strong>Generate</strong>
                  </p>
                </motion.div>
              )}

              {/* Generating skeleton */}
              {isGenerating && (
                <div className="flex-1 p-4 space-y-2">
                  {Array.from({ length: form.quantity > 8 ? 8 : form.quantity }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="h-9 rounded-lg shimmer"
                    />
                  ))}
                </div>
              )}

              {/* Results table */}
              {results.length > 0 && !isGenerating && (
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
                        <th className="px-3 py-2.5 w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {results.map((card, idx) => {
                          const masked = maskedRows[card.id] ?? true;
                          const cvvHidden = hiddenCvv[card.id] ?? true;
                          const formatted = formatCardNumber(card.number, card.brand, masked);
                          const isValid = luhnCheck(card.number);
                          const isSelected = previewCard?.id === card.id;
                          return (
                            <motion.tr
                              key={card.id}
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 20, height: 0 }}
                              transition={{ delay: idx * 0.03, duration: 0.2 }}
                              onClick={() => { setPreviewCard(card); setCardScrambling(true); setTimeout(() => setCardScrambling(false), 600); }}
                              className={`border-b border-border/40 hover:bg-secondary/30 group transition-colors cursor-pointer ${
                                isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
                              }`}
                            >
                              <td className="px-3 py-2.5 text-muted-foreground/40 font-mono">{idx + 1}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-foreground tracking-wider whitespace-nowrap">{formatted}</span>
                                  <button onClick={(e) => { e.stopPropagation(); toggleMask(card.id); }}
                                    className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                                    {masked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 font-mono text-foreground/80 whitespace-nowrap">{card.expMonth}/{card.expYear}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-foreground/80">{cvvHidden ? "•".repeat(card.cvv.length) : card.cvv}</span>
                                  <button onClick={(e) => { e.stopPropagation(); toggleCvv(card.id); }}
                                    className="text-muted-foreground hover:text-primary transition-colors">
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
                                  <button onClick={(e) => { e.stopPropagation(); deleteRow(card.id); }}
                                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
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
