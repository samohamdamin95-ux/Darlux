'use client';

import { Banknote, CheckCircle2, CreditCard, Lock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Money, useFormatPrice } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { SmartImage } from '@/components/ui/SmartImage';
import { computeTotals, shippingPrice } from '@/lib/cart-totals';
import { DELIVERY_METHODS, POINTS_PER_DOLLAR, type DeliveryMethodId } from '@/lib/constants';
import { formatCardNumber, formatExpiry } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { useAccount, type Order } from '@/store/account';
import { useCart } from '@/store/cart';
import { useHydrated } from '@/store/ui';
import { STEPS, Stepper } from './Stepper';
import {
  COUNTRIES,
  validatePayment,
  validateShipping,
  type Errors,
  type PaymentForm,
  type ShippingForm,
} from './validation';

const EMPTY_SHIPPING: ShippingForm = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'SA',
};

const EMPTY_PAYMENT: PaymentForm = { method: 'card', cardNumber: '', cardName: '', expiry: '', cvc: '' };

/**
 * UI-only multi-step checkout: Shipping → Delivery → Payment → Review.
 * Each step validates before moving on; errors are announced, linked to their
 * fields and focus moves to the first invalid field. No payment is processed.
 */
export function CheckoutFlow() {
  const { t, l, href, locale } = useI18n();
  const separator = locale === 'ar' ? '، ' : ', ';
  const id = useId();
  const hydrated = useHydrated();
  const lines = useCart((state) => state.lines);
  const promoCode = useCart((state) => state.promoCode);
  const clearCart = useCart((state) => state.clear);
  const user = useAccount((state) => state.user);
  const addOrder = useAccount((state) => state.addOrder);
  const format = useFormatPrice();

  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_SHIPPING);
  const [delivery, setDelivery] = useState<DeliveryMethodId>('standard');
  const [payment, setPayment] = useState<PaymentForm>(EMPTY_PAYMENT);
  const [shippingErrors, setShippingErrors] = useState<Errors<ShippingForm>>({});
  const [paymentErrors, setPaymentErrors] = useState<Errors<PaymentForm>>({});
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const totals = computeTotals(lines, promoCode, delivery);

  // Prefill contact details for signed-in shoppers.
  useEffect(() => {
    if (!user) return;
    const [firstName, ...rest] = user.name.split(' ');
    setShipping((current) => ({
      ...current,
      email: current.email || user.email,
      firstName: current.firstName || firstName,
      lastName: current.lastName || rest.join(' '),
    }));
  }, [user]);

  // Move focus to the step heading so screen readers announce the new step.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, placed]);

  const focusFirstError = (keys: string[]) => {
    requestAnimationFrame(() => document.getElementById(`${id}-${keys[0]}`)?.focus());
  };

  const setShippingField = <K extends keyof ShippingForm>(key: K, value: ShippingForm[K]) => {
    setShipping((current) => ({ ...current, [key]: value }));
    if (shippingErrors[key]) setShippingErrors((current) => ({ ...current, [key]: undefined }));
  };

  const setPaymentField = <K extends keyof PaymentForm>(key: K, value: PaymentForm[K]) => {
    setPayment((current) => ({ ...current, [key]: value }));
    if (paymentErrors[key]) setPaymentErrors((current) => ({ ...current, [key]: undefined }));
  };

  const next = (event: FormEvent) => {
    event.preventDefault();
    if (STEPS[step] === 'shipping') {
      const errors = validateShipping(shipping);
      setShippingErrors(errors);
      const keys = Object.keys(errors);
      if (keys.length) return focusFirstError(keys);
    }
    if (STEPS[step] === 'payment') {
      const errors = validatePayment(payment);
      setPaymentErrors(errors);
      const keys = Object.keys(errors);
      if (keys.length) return focusFirstError(keys);
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const placeOrder = async () => {
    setPlacing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const order: Order = {
      id: `DL-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      placedAt: new Date().toISOString(),
      status: 'processing',
      lines,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping ?? 0,
      total: totals.total,
      delivery,
      payment: payment.method,
      email: shipping.email,
      pointsEarned: Math.floor(totals.subtotal * POINTS_PER_DOLLAR),
    };
    addOrder(order);
    clearCart();
    setPlaced(order);
    setPlacing(false);
  };

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_400px]" aria-busy="true">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden />
        <h2 ref={headingRef} tabIndex={-1} className="mt-6 text-3xl font-semibold outline-none">
          {t('checkout.confirmation.title')}
        </h2>
        <p className="mt-3 text-ink-soft">{t('checkout.confirmation.text', { id: placed.id, email: placed.email })}</p>
        <p className="mt-2 text-sm font-medium text-accent">{t('checkout.confirmation.points', { points: placed.pointsEarned })}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={href('/account?tab=orders')}>{t('checkout.confirmation.viewOrders')}</ButtonLink>
          <ButtonLink href={href('/')} variant="outline">
            {t('cart.continueShopping')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center rounded border border-dashed border-line-strong px-6 py-24 text-center">
        <ShoppingBag className="size-12 text-ink-subtle" aria-hidden />
        <h2 className="mt-5 text-xl font-semibold">{t('checkout.emptyTitle')}</h2>
        <p className="mt-2 text-sm text-ink-muted">{t('checkout.emptyText')}</p>
        <ButtonLink href={href('/c/new')} className="mt-8" size="lg">
          {t('cart.continueShopping')}
        </ButtonLink>
      </div>
    );
  }

  const errorCount = STEPS[step] === 'shipping' ? Object.values(shippingErrors).filter(Boolean).length : STEPS[step] === 'payment' ? Object.values(paymentErrors).filter(Boolean).length : 0;
  const fieldId = (key: string) => `${id}-${key}`;
  const err = (key?: string) => (key ? t(key as Parameters<typeof t>[0]) : undefined);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <div>
        <Stepper current={step} onSelect={setStep} />
        <p className="mt-6 text-xs text-ink-muted">{t('checkout.stepOf', { n: step + 1, total: STEPS.length })}</p>
        <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-semibold outline-none">
          {t(`checkout.steps.${STEPS[step]}`)}
        </h2>

        {errorCount > 0 && (
          <p role="alert" className="mt-4 rounded border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {t('checkout.errorSummary', { count: errorCount })}
          </p>
        )}

        <form onSubmit={next} noValidate className="mt-6">
          {STEPS[step] === 'shipping' && (
            <div className="space-y-8">
              <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <legend className="mb-4 text-sm font-semibold">{t('checkout.contact')}</legend>
                <Field id={fieldId('email')} label={t('checkout.email')} type="email" autoComplete="email" dir="ltr" required value={shipping.email} onChange={(e) => setShippingField('email', e.target.value)} error={err(shippingErrors.email)} />
                <Field id={fieldId('phone')} label={t('checkout.phone')} type="tel" autoComplete="tel" dir="ltr" required value={shipping.phone} onChange={(e) => setShippingField('phone', e.target.value)} error={err(shippingErrors.phone)} placeholder="+966 5x xxx xxxx" />
              </fieldset>
              <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <legend className="mb-4 text-sm font-semibold">{t('checkout.shippingAddress')}</legend>
                <Field id={fieldId('firstName')} label={t('checkout.firstName')} autoComplete="given-name" required value={shipping.firstName} onChange={(e) => setShippingField('firstName', e.target.value)} error={err(shippingErrors.firstName)} />
                <Field id={fieldId('lastName')} label={t('checkout.lastName')} autoComplete="family-name" required value={shipping.lastName} onChange={(e) => setShippingField('lastName', e.target.value)} error={err(shippingErrors.lastName)} />
                <div className="sm:col-span-2">
                  <label htmlFor={fieldId('country')} className="mb-1.5 block text-sm font-medium">
                    {t('checkout.country')}
                  </label>
                  <select id={fieldId('country')} autoComplete="country" value={shipping.country} onChange={(e) => setShippingField('country', e.target.value as ShippingForm['country'])} className="field">
                    {COUNTRIES.map((code) => (
                      <option key={code} value={code}>
                        {t(`checkout.countries.${code}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <Field id={fieldId('address')} className="sm:col-span-2" label={t('checkout.address')} autoComplete="address-line1" required value={shipping.address} onChange={(e) => setShippingField('address', e.target.value)} error={err(shippingErrors.address)} />
                <Field id={fieldId('apartment')} className="sm:col-span-2" label={t('checkout.apartment')} autoComplete="address-line2" value={shipping.apartment} onChange={(e) => setShippingField('apartment', e.target.value)} />
                <Field id={fieldId('city')} label={t('checkout.city')} autoComplete="address-level2" required value={shipping.city} onChange={(e) => setShippingField('city', e.target.value)} error={err(shippingErrors.city)} />
                <Field id={fieldId('region')} label={t('checkout.region')} autoComplete="address-level1" value={shipping.region} onChange={(e) => setShippingField('region', e.target.value)} />
                <Field id={fieldId('postalCode')} label={t('checkout.postalCode')} autoComplete="postal-code" inputMode="numeric" dir="ltr" required value={shipping.postalCode} onChange={(e) => setShippingField('postalCode', e.target.value)} error={err(shippingErrors.postalCode)} />
              </fieldset>
            </div>
          )}

          {STEPS[step] === 'delivery' && (
            <fieldset className="space-y-3">
              <legend className="sr-only">{t('checkout.deliveryMethod')}</legend>
              {DELIVERY_METHODS.map((method) => {
                const price = shippingPrice(method.id, totals.subtotal);
                return (
                  <OptionCard
                    key={method.id}
                    name={`${id}-delivery`}
                    checked={delivery === method.id}
                    onChange={() => setDelivery(method.id)}
                    title={t(`checkout.delivery.${method.id}`)}
                    description={method.days === '0' ? t('checkout.delivery.today') : t('checkout.delivery.days', { days: method.days })}
                    aside={price === 0 ? t('cart.free') : format(price)}
                  />
                );
              })}
            </fieldset>
          )}

          {STEPS[step] === 'payment' && (
            <div className="space-y-6">
              <fieldset className="space-y-3">
                <legend className="mb-4 text-sm font-semibold">{t('checkout.paymentMethod')}</legend>
                <OptionCard name={`${id}-payment`} checked={payment.method === 'card'} onChange={() => setPaymentField('method', 'card')} title={t('checkout.card')} icon={<CreditCard className="size-5" aria-hidden />} />
                <OptionCard name={`${id}-payment`} checked={payment.method === 'cod'} onChange={() => setPaymentField('method', 'cod')} title={t('checkout.cod')} description={t('checkout.codNote')} icon={<Banknote className="size-5" aria-hidden />} />
              </fieldset>
              {payment.method === 'card' && (
                <div className="grid grid-cols-1 gap-4 rounded border border-line p-5 sm:grid-cols-2">
                  <Field id={fieldId('cardNumber')} className="sm:col-span-2" label={t('checkout.cardNumber')} autoComplete="cc-number" inputMode="numeric" dir="ltr" required placeholder="4242 4242 4242 4242" value={payment.cardNumber} onChange={(e) => setPaymentField('cardNumber', formatCardNumber(e.target.value))} error={err(paymentErrors.cardNumber)} />
                  <Field id={fieldId('cardName')} className="sm:col-span-2" label={t('checkout.cardName')} autoComplete="cc-name" required value={payment.cardName} onChange={(e) => setPaymentField('cardName', e.target.value)} error={err(paymentErrors.cardName)} />
                  <Field id={fieldId('expiry')} label={t('checkout.expiry')} autoComplete="cc-exp" inputMode="numeric" dir="ltr" required placeholder="MM/YY" value={payment.expiry} onChange={(e) => setPaymentField('expiry', formatExpiry(e.target.value))} error={err(paymentErrors.expiry)} />
                  <Field id={fieldId('cvc')} label={t('checkout.cvc')} autoComplete="cc-csc" inputMode="numeric" dir="ltr" required maxLength={4} placeholder="123" value={payment.cvc} onChange={(e) => setPaymentField('cvc', e.target.value.replace(/\D/g, ''))} error={err(paymentErrors.cvc)} />
                </div>
              )}
            </div>
          )}

          {STEPS[step] === 'review' && (
            <div className="space-y-4">
              <ReviewBlock title={t('checkout.shipTo')} onEdit={() => setStep(0)}>
                <p>
                  {shipping.firstName} {shipping.lastName}
                </p>
                <p>
                  {shipping.address}
                  {shipping.apartment && `${separator}${shipping.apartment}`}
                </p>
                <p>
                  {shipping.city}
                  {shipping.region && `${separator}${shipping.region}`} {shipping.postalCode} · {t(`checkout.countries.${shipping.country}`)}
                </p>
                <p dir="ltr" className="text-start">
                  {shipping.email} · {shipping.phone}
                </p>
              </ReviewBlock>
              <ReviewBlock title={t('checkout.deliveryMethod')} onEdit={() => setStep(1)}>
                <p>
                  {t(`checkout.delivery.${delivery}`)} — {totals.shipping ? format(totals.shipping) : t('cart.free')}
                </p>
              </ReviewBlock>
              <ReviewBlock title={t('checkout.payWith')} onEdit={() => setStep(2)}>
                <p>
                  {payment.method === 'cod'
                    ? t('checkout.cod')
                    : t('checkout.cardEnding', { last4: payment.cardNumber.replace(/\D/g, '').slice(-4) })}
                </p>
              </ReviewBlock>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                {t('common.back')}
              </Button>
            ) : (
              <Link href={href('/cart')} className="text-center text-sm link-underline">
                {t('cart.viewBasket')}
              </Link>
            )}
            {STEPS[step] === 'review' ? (
              <Button size="lg" onClick={placeOrder} disabled={placing} aria-busy={placing}>
                <Lock className="size-4" aria-hidden />
                {placing ? t('checkout.placing') : `${t('checkout.placeOrder')} · ${format(totals.total)}`}
              </Button>
            ) : (
              <Button type="submit" size="lg">
                {t('checkout.continueTo', { step: t(`checkout.steps.${STEPS[step + 1]}`) })}
              </Button>
            )}
          </div>
        </form>
        <p className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
          <Lock className="size-3.5" aria-hidden /> {t('checkout.secure')}
        </p>
      </div>

      <OrderSummary totals={totals} className="lg:sticky lg:top-40">
        <ul className="max-h-72 space-y-4 overflow-y-auto border-t border-line pt-4">
          {lines.map((line) => (
            <li key={line.key} className="flex items-center gap-3 text-sm">
              <span className="relative size-14 shrink-0 overflow-hidden rounded bg-canvas-muted">
                <SmartImage src={line.image} alt="" fill sizes="56px" className="object-cover" />
                <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-canvas">
                  {line.quantity}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{l(line.name)}</span>
                {line.shade && <span className="block text-xs text-ink-muted">{l(line.shade.name)}</span>}
              </span>
              <Money amount={line.unitPrice * line.quantity} />
            </li>
          ))}
        </ul>
      </OrderSummary>
    </div>
  );
}

function OptionCard({
  name,
  checked,
  onChange,
  title,
  description,
  aside,
  icon,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
  aside?: string;
  icon?: ReactNode;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent',
        checked ? 'border-ink bg-canvas-soft' : 'border-line-strong hover:border-ink',
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="size-4 shrink-0 accent-ink focus:outline-none" />
      {icon}
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        {description && <span className="block text-xs text-ink-muted">{description}</span>}
      </span>
      {aside && <span className="text-sm font-semibold">{aside}</span>}
    </label>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <section className="rounded border border-line p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" onClick={onEdit} className="text-xs link-underline">
          {t('common.edit')}
        </button>
      </div>
      <div className="mt-2 space-y-0.5 text-sm text-ink-soft">{children}</div>
    </section>
  );
}
