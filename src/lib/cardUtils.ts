// Luhn Algorithm - generates valid check digit
export function luhnChecksum(number: string): number {
  let sum = 0;
  let isEven = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10;
}

export function generateLuhnDigit(partial: string): number {
  const checksum = luhnChecksum(partial + "0");
  return checksum === 0 ? 0 : 10 - checksum;
}

export function validateLuhn(number: string): boolean {
  return luhnChecksum(number) === 0;
}

export type CardNetwork = "visa" | "mastercard" | "amex" | "discover" | "unionpay" | "jcb" | "random";

export function detectNetwork(bin: string): CardNetwork {
  if (!bin) return "random";
  const b = bin.replace(/\D/g, "");
  if (b.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(b) || /^2[2-7]/.test(b)) return "mastercard";
  if (/^3[47]/.test(b)) return "amex";
  if (/^6(?:011|5)/.test(b)) return "discover";
  if (/^62/.test(b)) return "unionpay";
  if (/^35/.test(b)) return "jcb";
  return "random";
}

export function getNetworkLabel(network: CardNetwork): string {
  const labels: Record<CardNetwork, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    unionpay: "UnionPay",
    jcb: "JCB",
    random: "Random",
  };
  return labels[network];
}

function randomDigit(): string {
  return Math.floor(Math.random() * 10).toString();
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface GeneratedCard {
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  network: CardNetwork;
  formatted: string;
}

export interface GeneratorOptions {
  bin: string;
  quantity: number;
  expMonth: string;
  expYear: string;
  cvv: string;
  format: "pipe" | "comma" | "plain";
}

export function generateCards(options: GeneratorOptions): GeneratedCard[] {
  const { bin, quantity, expMonth, expYear, cvv, format } = options;
  const cleanBin = bin.replace(/\D/g, "").slice(0, 16);
  const results: GeneratedCard[] = [];

  for (let i = 0; i < Math.min(quantity, 999); i++) {
    // Determine card length
    let cardLength = 16;
    if (cleanBin.startsWith("34") || cleanBin.startsWith("37")) cardLength = 15;

    // Build the card number
    let partial = cleanBin;
    while (partial.length < cardLength - 1) {
      partial += randomDigit();
    }
    const lastDigit = generateLuhnDigit(partial);
    const cardNumber = partial + lastDigit;

    // Determine network
    const network = detectNetwork(cardNumber);

    // Expiry
    const month = expMonth === "XX" || expMonth === "" 
      ? String(randomBetween(1, 12)).padStart(2, "0") 
      : expMonth.padStart(2, "0");
    const year = expYear === "XXXX" || expYear === "" || expYear === "XX"
      ? String(randomBetween(26, 30))
      : expYear.length === 2 ? expYear : expYear.slice(-2);

    // CVV
    const cvvLength = network === "amex" ? 4 : 3;
    const generatedCvv = cvv === "XXX" || cvv === "XXXX" || cvv === ""
      ? Array.from({ length: cvvLength }, () => randomDigit()).join("")
      : cvv;

    // Format card number
    let formattedNumber = "";
    if (network === "amex") {
      formattedNumber = `${cardNumber.slice(0, 4)} ${cardNumber.slice(4, 10)} ${cardNumber.slice(10)}`;
    } else {
      formattedNumber = cardNumber.replace(/(.{4})/g, "$1 ").trim();
    }

    // Full formatted string
    let fullFormatted = "";
    if (format === "pipe") {
      fullFormatted = `${cardNumber}|${month}|${year}|${generatedCvv}`;
    } else if (format === "comma") {
      fullFormatted = `${cardNumber},${month},${year},${generatedCvv}`;
    } else {
      fullFormatted = `${cardNumber} ${month}/${year} ${generatedCvv}`;
    }

    results.push({
      number: cardNumber,
      expMonth: month,
      expYear: year,
      cvv: generatedCvv,
      network,
      formatted: fullFormatted,
    });
  }

  return results;
}

export function formatCardDisplay(number: string, network: CardNetwork): string {
  if (network === "amex") {
    return `${number.slice(0, 4)} ${number.slice(4, 10)} ${number.slice(10)}`;
  }
  return number.replace(/(.{4})/g, "$1 ").trim();
}
