import { useState } from "react";
import { BookOpen, Shield, Code2, Mail, CheckCircle2, XCircle, ChevronDown, ChevronUp, Cpu, Lock, Globe } from "lucide-react";
import { luhnCheck } from "@/lib/cardUtils";

function LuhnDemo() {
  const [input, setInput] = useState("4532015112830366");
  const isValid = input.replace(/\D/g, "").length >= 8 && luhnCheck(input);
  const digits = input.replace(/\D/g, "");

  // Step-by-step Luhn
  const steps = digits.length >= 2 ? (() => {
    const arr = digits.split("").map(Number);
    return arr.map((d, i) => {
      const fromRight = arr.length - 1 - i;
      const shouldDouble = fromRight % 2 === 1;
      let val = d;
      if (shouldDouble) {
        val *= 2;
        if (val > 9) val -= 9;
      }
      return { original: d, doubled: shouldDouble, value: val };
    });
  })() : [];

  const sum = steps.reduce((a, s) => a + s.value, 0);

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Enter any card number to check Luhn validity:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\s/g, ""))}
            placeholder="4532015112830366"
            maxLength={19}
            className="input-field font-mono flex-1"
          />
          <div className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border shrink-0 ${
            digits.length >= 8
              ? isValid
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive border-destructive/30"
              : "bg-secondary border-border text-muted-foreground"
          }`}>
            {digits.length < 8
              ? "—"
              : isValid
                ? <><CheckCircle2 className="w-4 h-4" /> Valid</>
                : <><XCircle className="w-4 h-4" /> Invalid</>}
          </div>
        </div>
      </div>

      {/* Step-by-step visualization */}
      {steps.length >= 8 && (
        <div className="bg-secondary/40 rounded-xl p-4 border border-border overflow-x-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Step-by-step breakdown:</p>
          <div className="flex gap-1 mb-2 min-w-max">
            {steps.map((s, i) => (
              <div key={i} className={`flex flex-col items-center gap-0.5 min-w-[2rem] px-1 py-1.5 rounded-lg text-xs font-mono ${
                s.doubled ? "bg-primary/15 border border-primary/30" : "bg-secondary/60 border border-border"
              }`}>
                <span className="text-muted-foreground font-bold">{s.original}</span>
                {s.doubled && <span className="text-[9px] text-primary">×2</span>}
                <span className={`font-bold ${s.doubled ? "text-primary" : "text-foreground"}`}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Sum = <strong className="text-foreground">{sum}</strong></span>
            <span className="text-xs text-muted-foreground">÷10 = <strong className="text-foreground">{sum / 10}</strong></span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              sum % 10 === 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            }`}>
              {sum % 10 === 0 ? "✓ Divisible by 10 — VALID" : `✗ Remainder ${sum % 10} — INVALID`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const BRAND_RULES = [
  { brand: "Visa", prefix: "Starts with 4", length: "13, 16, or 19 digits", cvv: "3-digit CVV", color: "bg-primary/10 text-primary" },
  { brand: "Mastercard", prefix: "51–55 or 2221–2720", length: "16 digits", cvv: "3-digit CVV", color: "bg-orange-500/10 text-orange-500" },
  { brand: "Amex", prefix: "34 or 37", length: "15 digits", cvv: "4-digit CID", color: "bg-sky-500/10 text-sky-500" },
  { brand: "Discover", prefix: "6011, 65, or 644–649", length: "16 or 19 digits", cvv: "3-digit CVV", color: "bg-amber-500/10 text-amber-500" },
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Can I use these numbers for real purchases?",
      a: "Absolutely NOT. Generated numbers are mathematically valid by the Luhn formula but are not linked to any real bank account, credit line, or card holder. They will be declined by any real payment processor.",
    },
    {
      q: "Is this tool safe to use?",
      a: "Yes — the tool runs 100% in your browser. No card data is sent to any server. Your generated numbers and history stay local in your browser's localStorage only.",
    },
    {
      q: "What is the Luhn algorithm?",
      a: "It's a checksum formula (mod 10) used to validate identification numbers, most commonly credit card numbers. Created by IBM scientist Hans Peter Luhn in 1954, it catches accidental digit errors but is not a cryptographic security measure.",
    },
    {
      q: "What's a BIN / IIN?",
      a: "A Bank Identification Number (BIN) or Issuer Identification Number (IIN) is the first 6–8 digits of a card number. It identifies the issuing institution, card brand, and card type. We use it to generate correctly-prefixed test numbers.",
    },
    {
      q: "Why do developers need this tool?",
      a: "When testing payment forms, e-commerce checkouts, or card validation logic, you need card-format data that won't accidentally charge real accounts. These test numbers let you validate your code safely.",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <span className="badge-primary text-xs uppercase tracking-wider mb-3 inline-flex">About</span>
          <h1 className="text-3xl font-bold mb-2">About CC Generator</h1>
          <p className="text-muted-foreground leading-relaxed">
            A free, educational tool for generating Luhn-valid test card numbers.
            Built for developers, QA engineers, and students — 100% client-side, zero data collection.
          </p>
        </div>

        {/* Interactive Luhn demo */}
        <section className="bg-card rounded-2xl border border-border p-6 mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-primary" />
            Interactive Luhn Validator
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Try any card number to see the Luhn check step-by-step.
          </p>
          <LuhnDemo />
        </section>

        {/* Luhn explanation */}
        <section className="bg-card rounded-2xl border border-border p-6 mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
            <Code2 className="w-5 h-5 text-primary" />
            How the Luhn Algorithm Works
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              The <strong className="text-foreground">Luhn algorithm</strong> (also "mod 10") is a simple checksum formula
              created by IBM scientist Hans Peter Luhn in 1954. It's used to validate credit card numbers, IMEI numbers,
              and other identification strings.
            </p>
            <ol className="space-y-2 list-none pl-0">
              {[
                "From the rightmost digit (excluding the check digit), double every second digit.",
                "If doubling a digit results in a number > 9, subtract 9 from the result.",
                "Sum all the digits (undoubled and doubled).",
                "If the total modulo 10 equals 0, the number is valid.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="font-mono font-black text-primary bg-primary/10 rounded-lg w-7 h-7 flex items-center justify-center shrink-0 text-sm">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs border-l-2 border-primary/40 pl-3 italic">
              The Luhn check is a <em>format validation</em> only — it does not verify that a card exists,
              has funds, belongs to a real account, or is not expired.
            </p>
          </div>
        </section>

        {/* Brand prefix rules */}
        <section className="bg-card rounded-2xl border border-border p-6 mb-5">
          <h2 className="text-xl font-bold mb-4">Card Brand Prefix Rules</h2>
          <div className="space-y-2">
            {BRAND_RULES.map(({ brand, prefix, length, cvv, color }) => (
              <div key={brand} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg w-fit ${color}`}>{brand}</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span><strong className="text-foreground">Prefix:</strong> {prefix}</span>
                  <span><strong className="text-foreground">Length:</strong> {length}</span>
                  <span><strong className="text-foreground">CVV:</strong> {cvv}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ethics */}
        <section className="bg-card rounded-2xl border border-border p-6 mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            Ethical Use Policy
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 rounded-xl border"
              style={{ background: "hsl(var(--success) / 0.07)", borderColor: "hsl(var(--success) / 0.3)" }}>
              <p className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ color: "hsl(var(--success))" }}>
                <CheckCircle2 className="w-4 h-4" /> Acceptable uses
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {[
                  "Testing payment form validation logic",
                  "Checking regex for card number formats",
                  "Education about the Luhn algorithm",
                  "Automated test pipelines needing card-format data",
                  "Prototyping checkout UIs without real data",
                ].map((u) => <li key={u} className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">•</span>{u}</li>)}
              </ul>
            </div>
            <div className="p-3.5 rounded-xl border"
              style={{ background: "hsl(var(--destructive) / 0.07)", borderColor: "hsl(var(--destructive) / 0.3)" }}>
              <p className="font-bold text-sm mb-2 flex items-center gap-1.5 text-destructive">
                <XCircle className="w-4 h-4" /> Never use for
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {[
                  "Real purchases or transactions of any kind",
                  "Fraud, carding, or any illegal activity",
                  "Bypassing payment systems",
                  "Misrepresenting test data as real card data",
                  "Any commercial or criminal purpose",
                ].map((u) => <li key={u} className="flex items-start gap-1.5"><span className="text-destructive mt-0.5">•</span>{u}</li>)}
              </ul>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl border"
            style={{ background: "hsl(var(--warning) / 0.08)", borderColor: "hsl(var(--warning) / 0.3)" }}>
            <Lock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(var(--warning))" }} />
            <p className="text-xs font-semibold" style={{ color: "hsl(var(--warning))" }}>
              Using fake card numbers for fraud is illegal and prosecutable under cybercrime laws worldwide.
              Always use this tool responsibly.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-card rounded-2xl border border-border p-6 mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="font-semibold text-sm pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground border-t border-border leading-relaxed animate-slide-up">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="bg-card rounded-2xl border border-border p-6 mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-primary" />
            Privacy & Technical Notes
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: "🔒", title: "100% Client-side", desc: "All logic runs in your browser. Zero data is sent to any server." },
              { icon: "💾", title: "Local Storage Only", desc: "History and preferences saved to your browser's localStorage only." },
              { icon: "🚫", title: "No Tracking", desc: "No analytics, no cookies, no accounts required." },
            ].map((item) => (
              <div key={item.title} className="p-3.5 rounded-xl bg-secondary/40 border border-border">
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="font-bold text-sm mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-primary" />
            Contact
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Have questions, feedback, or want to report misuse?
          </p>
          <a
            href="mailto:contact@example.com"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-semibold hover:bg-primary/20 transition-all"
          >
            <Mail className="w-4 h-4" />
            contact@example.com
          </a>
          <p className="text-xs text-muted-foreground mt-4">
            Built for educational purposes. All generation is client-side — no data is sent to any server.
          </p>
        </section>
      </div>
    </div>
  );
}
