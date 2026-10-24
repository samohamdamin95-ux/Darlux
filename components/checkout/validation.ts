import type { TranslationKey } from '@/i18n/translator';
import {
  EMAIL_PATTERN,
  isValidCardNumber,
  isValidCvc,
  isValidExpiry,
  isValidPhone,
  isValidPostalCode,
} from '@/lib/validation';

export const COUNTRIES = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'EG', 'JO'] as const;
export type Country = (typeof COUNTRIES)[number];

export interface ShippingForm {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  region: string;
  postalCode: string;
  country: Country;
}

export interface PaymentForm {
  method: 'card' | 'cod';
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvc: string;
}

export type Errors<T> = Partial<Record<keyof T, TranslationKey>>;

export function validateShipping(form: ShippingForm): Errors<ShippingForm> {
  const errors: Errors<ShippingForm> = {};
  const required: (keyof ShippingForm)[] = ['email', 'phone', 'firstName', 'lastName', 'address', 'city', 'postalCode'];
  required.forEach((key) => {
    if (!String(form[key]).trim()) errors[key] = 'checkout.errors.required';
  });
  if (!errors.email && !EMAIL_PATTERN.test(form.email.trim())) errors.email = 'checkout.errors.email';
  if (!errors.phone && !isValidPhone(form.phone)) errors.phone = 'checkout.errors.phone';
  if (!errors.postalCode && !isValidPostalCode(form.postalCode)) errors.postalCode = 'checkout.errors.postal';
  return errors;
}

export function validatePayment(form: PaymentForm): Errors<PaymentForm> {
  if (form.method === 'cod') return {};
  const errors: Errors<PaymentForm> = {};
  if (!form.cardNumber.trim()) errors.cardNumber = 'checkout.errors.required';
  else if (!isValidCardNumber(form.cardNumber)) errors.cardNumber = 'checkout.errors.card';
  if (!form.cardName.trim()) errors.cardName = 'checkout.errors.required';
  if (!form.expiry.trim()) errors.expiry = 'checkout.errors.required';
  else if (!isValidExpiry(form.expiry)) errors.expiry = 'checkout.errors.expiry';
  if (!form.cvc.trim()) errors.cvc = 'checkout.errors.required';
  else if (!isValidCvc(form.cvc)) errors.cvc = 'checkout.errors.cvc';
  return errors;
}
