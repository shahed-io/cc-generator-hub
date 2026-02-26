// ─── Types ────────────────────────────────────────────────────────────────────

export type CardBrand = "visa" | "mastercard" | "amex" | "discover";

export interface CardBrandConfig {
  name: string;
  label: string;
  prefixes: string[];
  lengths: number[];
  cvvLength: number;
  color: string;
  textColor: string;
}

export interface GeneratedCard {
  id: string;
  brand: CardBrand;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  name: string;
  bin: string;
}

export interface GeneratorFormValues {
  brand: CardBrand;
  bin: string;
  length: number;
  quantity: number;
  expMonth: string;
  expYear: string;
  cvv: string;
  name: string;
  randomExp: boolean;
  randomCvv: boolean;
}

export interface HistoryBatch {
  id: string;
  timestamp: number;
  brand: CardBrand;
  quantity: number;
  bin: string;
  cards: GeneratedCard[];
}

// ─── Brand Configs ─────────────────────────────────────────────────────────────

export const BRAND_CONFIGS: Record<CardBrand, CardBrandConfig> = {
  visa: {
    name: "visa",
    label: "Visa",
    prefixes: ["4"],
    lengths: [13, 16, 19],
    cvvLength: 3,
    color: "bg-blue-600",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  mastercard: {
    name: "mastercard",
    label: "Mastercard",
    prefixes: ["51", "52", "53", "54", "55", "2221", "2720"],
    lengths: [16],
    cvvLength: 3,
    color: "bg-orange-500",
    textColor: "text-orange-500 dark:text-orange-400",
  },
  amex: {
    name: "amex",
    label: "Amex",
    prefixes: ["34", "37"],
    lengths: [15],
    cvvLength: 4,
    color: "bg-sky-600",
    textColor: "text-sky-600 dark:text-sky-400",
  },
  discover: {
    name: "discover",
    label: "Discover",
    prefixes: ["6011", "65", "644", "645", "646", "647", "648", "649"],
    lengths: [16, 19],
    cvvLength: 3,
    color: "bg-amber-500",
    textColor: "text-amber-500 dark:text-amber-400",
  },
};

// ─── Luhn Algorithm ────────────────────────────────────────────────────────────

export function luhnCheck(number: string): boolean {
  const digits = number.replace(/\D/g, "");
  if (!digits.length) return false;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i]);
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export function luhnComplete(partial: string): string {
  const digits = partial.replace(/\D/g, "");
  // Find check digit
  for (let d = 0; d <= 9; d++) {
    const candidate = digits + d.toString();
    if (luhnCheck(candidate)) return candidate;
  }
  return digits + "0"; // fallback
}

function randomDigit(): string {
  return Math.floor(Math.random() * 10).toString();
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Validation ────────────────────────────────────────────────────────────────

export function validateBin(bin: string, brand: CardBrand): { valid: boolean; error?: string } {
  if (!bin) return { valid: true };
  if (!/^\d+$/.test(bin)) return { valid: false, error: "BIN must contain only digits." };
  if (bin.length < 6 || bin.length > 8) return { valid: false, error: "BIN must be 6–8 digits." };

  const config = BRAND_CONFIGS[brand];
  const matches = config.prefixes.some((p) => {
    if (bin.length >= p.length) return bin.startsWith(p);
    return p.startsWith(bin);
  });

  if (!matches) {
    return {
      valid: false,
      error: `BIN "${bin}" does not match ${config.label} prefix patterns (${config.prefixes.slice(0, 3).join(", ")}...).`,
    };
  }
  return { valid: true };
}

export function getDefaultLength(brand: CardBrand): number {
  const cfg = BRAND_CONFIGS[brand];
  return cfg.lengths[0];
}

// ─── Generation ────────────────────────────────────────────────────────────────

export function generateCard(opts: {
  brand: CardBrand;
  bin: string;
  length: number;
  expMonth: string;
  expYear: string;
  cvv: string;
  name: string;
  randomExp: boolean;
  randomCvv: boolean;
}): GeneratedCard {
  const config = BRAND_CONFIGS[opts.brand];

  // Start with BIN or pick a random prefix
  let prefix = opts.bin || config.prefixes[Math.floor(Math.random() * config.prefixes.length)];

  // Fill remaining digits except last (check digit)
  let partial = prefix;
  while (partial.length < opts.length - 1) {
    partial += randomDigit();
  }

  const number = luhnComplete(partial);

  // Expiry
  const month = opts.randomExp
    ? String(randomInt(1, 12)).padStart(2, "0")
    : opts.expMonth.padStart(2, "0");

  const currentYear = new Date().getFullYear();
  const year = opts.randomExp
    ? String(randomInt(currentYear + 1, currentYear + 5)).slice(-2)
    : opts.expYear.slice(-2);

  // CVV
  const cvvLen = config.cvvLength;
  const cvv = opts.randomCvv
    ? Array.from({ length: cvvLen }, () => randomDigit()).join("")
    : opts.cvv.slice(0, cvvLen).padStart(cvvLen, "0");

  return {
    id: Math.random().toString(36).slice(2),
    brand: opts.brand,
    number,
    expMonth: month,
    expYear: year,
    cvv,
    name: opts.name || "TEST USER",
    bin: opts.bin,
  };
}

export function generateBatch(form: GeneratorFormValues): GeneratedCard[] {
  const cards: GeneratedCard[] = [];
  for (let i = 0; i < Math.min(form.quantity, 100); i++) {
    cards.push(
      generateCard({
        brand: form.brand,
        bin: form.bin,
        length: form.length,
        expMonth: form.expMonth,
        expYear: form.expYear,
        cvv: form.cvv,
        name: form.name,
        randomExp: form.randomExp,
        randomCvv: form.randomCvv,
      })
    );
  }
  return cards;
}

// ─── Format Helpers ────────────────────────────────────────────────────────────

export function formatCardNumber(number: string, brand: CardBrand, masked = false): string {
  let formatted = "";
  if (brand === "amex") {
    formatted = `${number.slice(0, 4)} ${number.slice(4, 10)} ${number.slice(10)}`;
  } else {
    formatted = number.replace(/(.{4})/g, "$1 ").trim();
  }
  if (masked) {
    const parts = formatted.split(" ");
    return parts.map((p, i) => (i === parts.length - 1 ? p : "****")).join(" ");
  }
  return formatted;
}

// ─── Export ────────────────────────────────────────────────────────────────────

export function exportCsv(cards: GeneratedCard[]): void {
  const header = "brand,number,expiry_month,expiry_year,cvv,name\n";
  const rows = cards
    .map((c) => `${c.brand},${c.number},${c.expMonth},${c.expYear},${c.cvv},"${c.name}"`)
    .join("\n");
  downloadFile(header + rows, "test-cards.csv", "text/csv");
}

export function exportTxt(cards: GeneratedCard[]): void {
  const lines = cards
    .map((c) => `${c.number} | ${c.expMonth}/${c.expYear} | ${c.cvv} | ${c.name} | ${BRAND_CONFIGS[c.brand].label}`)
    .join("\n");
  downloadFile(lines, "test-cards.txt", "text/plain");
}

function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── LocalStorage ─────────────────────────────────────────────────────────────

const HISTORY_KEY = "ccgen_history";
const PREFS_KEY = "ccgen_prefs";
const MAX_HISTORY = 50;

export function saveHistory(batch: HistoryBatch): void {
  const existing = loadHistory();
  const updated = [batch, ...existing].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function loadHistory(): HistoryBatch[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function deleteHistoryBatch(id: string): void {
  const existing = loadHistory();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(existing.filter((b) => b.id !== id)));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export interface UserPrefs {
  darkMode: boolean;
  defaultBrand: CardBrand;
}

export const DEFAULT_PREFS: UserPrefs = { darkMode: false, defaultBrand: "visa" };

export function loadPrefs(): UserPrefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Partial<UserPrefs>): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPrefs(), ...prefs }));
}
