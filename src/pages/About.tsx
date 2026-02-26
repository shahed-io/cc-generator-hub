import { BookOpen, Shield, Code2, Heart, Mail, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <BookOpen className="w-7 h-7 text-primary" />
            About CC Generator
          </h1>
          <p className="text-muted-foreground">
            A free, open-source educational tool for generating Luhn-valid test card numbers.
          </p>
        </div>

        {/* Luhn Algorithm */}
        <section className="bg-card rounded-xl border border-border p-6 mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
            <Code2 className="w-5 h-5 text-primary" />
            The Luhn Algorithm
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            The <strong className="text-foreground">Luhn algorithm</strong> (also known as the "modulus 10" or "mod 10"
            algorithm) is a simple checksum formula used to validate identification numbers — most famously,
            credit card numbers. It was created by IBM scientist Hans Peter Luhn in 1954.
          </p>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            The algorithm works by processing each digit of the number, doubling every second digit from
            the right, subtracting 9 from any doubled values greater than 9, then summing all digits.
            A number passes the Luhn check if the total sum is divisible by 10.
          </p>

          {/* Step-by-step */}
          <div className="bg-secondary/40 rounded-lg p-4 border border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Step-by-step example</p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="font-mono text-primary font-bold">1.</span> Take the card number: <code className="font-mono text-foreground bg-secondary px-1 rounded">4539 1488 0343 6467</code></li>
              <li className="flex gap-2"><span className="font-mono text-primary font-bold">2.</span> From the right, double every second digit</li>
              <li className="flex gap-2"><span className="font-mono text-primary font-bold">3.</span> If doubling gives &gt; 9, subtract 9</li>
              <li className="flex gap-2"><span className="font-mono text-primary font-bold">4.</span> Sum all digits — if divisible by 10, it's valid ✅</li>
            </ol>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            The Luhn check is a <em>format validation</em> only — it does not verify that a card exists,
            has funds, or belongs to a real account.
          </p>
        </section>

        {/* Brand Prefix Rules */}
        <section className="bg-card rounded-xl border border-border p-6 mb-5">
          <h2 className="text-xl font-bold mb-3">Card Brand Prefix Rules</h2>
          <div className="space-y-3 text-sm">
            {[
              { brand: "Visa", rule: "Starts with 4 · Length: 13, 16, or 19 digits · CVV: 3 digits" },
              { brand: "Mastercard", rule: "Starts with 51–55 or 2221–2720 · Length: 16 digits · CVV: 3 digits" },
              { brand: "Amex", rule: "Starts with 34 or 37 · Length: 15 digits · CVV: 4 digits (CID)" },
              { brand: "Discover", rule: "Starts with 6011, 65, or 644–649 · Length: 16 or 19 digits · CVV: 3 digits" },
            ].map(({ brand, rule }) => (
              <div key={brand} className="flex gap-3 items-start py-2 border-b border-border/50 last:border-0">
                <span className="font-bold text-foreground w-24 shrink-0">{brand}</span>
                <span className="text-muted-foreground">{rule}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ethics */}
        <section className="bg-card rounded-xl border border-border p-6 mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            Ethical Use Policy
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="leading-relaxed">
              This tool exists to help developers test payment form validation, e-commerce integrations,
              and card number format handling <strong className="text-foreground">without using real card data</strong>.
            </p>
            <div className="bg-accent border border-border rounded-lg p-3 text-accent-foreground">
              <p className="font-semibold mb-1">✅ Acceptable uses:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Testing payment form validation logic</li>
                <li>Checking regex patterns for card number formats</li>
                <li>Education about the Luhn algorithm</li>
                <li>Automated testing pipelines that need card-format data</li>
              </ul>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive-foreground">
              <p className="font-semibold mb-1">❌ Never use for:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Real purchases or transactions of any kind</li>
                <li>Fraud, carding, or any illegal activity</li>
                <li>Bypassing payment systems</li>
                <li>Misrepresenting test data as real card data</li>
              </ul>
            </div>
            <p className="text-xs font-semibold text-destructive">
              ⚠️ Using fake card numbers for fraud is illegal and prosecutable under cybercrime laws worldwide.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-primary" />
            Contact
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Have questions, feedback, or want to report misuse? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:contact@example.com"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm font-semibold hover:bg-primary/20 transition-all"
            >
              <Mail className="w-4 h-4" />
              contact@example.com
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
            <Heart className="w-3 h-3 text-destructive" />
            Built for educational purposes. All generation is client-side — no data is sent to any server.
          </p>
        </section>
      </div>
    </div>
  );
}
