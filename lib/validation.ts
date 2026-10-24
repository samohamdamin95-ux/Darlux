/** Lightweight validators shared by checkout, account and newsletter forms. */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const digits = (value: string) => value.replace(/\D/g, '');

/** International mobile numbers: 8–15 digits, optional leading +. */
export function isValidPhone(value: string) {
  const count = digits(value).length;
  return /^\+?[\d\s()-]+$/.test(value.trim()) && count >= 8 && count <= 15;
}

export function isValidPostalCode(value: string) {
  return /^[A-Za-z0-9 -]{3,10}$/.test(value.trim());
}

/** Luhn checksum for card numbers (13–19 digits). */
export function isValidCardNumber(value: string) {
  const number = digits(value);
  if (number.length < 13 || number.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/** MM/YY in the future (the card is valid through the end of that month). */
export function isValidExpiry(value: string, now = new Date()) {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  return new Date(year, month, 1) > now;
}

export function isValidCvc(value: string) {
  return /^\d{3,4}$/.test(value.trim());
}

export function formatCardNumber(value: string) {
  return digits(value).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value: string) {
  const raw = digits(value).slice(0, 4);
  return raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
}
