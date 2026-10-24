'use client';

import { Tag, X } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { useCart } from '@/store/cart';

export function PromoCodeField() {
  const { t } = useI18n();
  const id = useId();
  const promoCode = useCart((state) => state.promoCode);
  const applyPromo = useCart((state) => state.applyPromo);
  const removePromo = useCart((state) => state.removePromo);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    const ok = applyPromo(code);
    setError(!ok);
    if (ok) setCode('');
  };

  if (promoCode) {
    return (
      <div className="flex items-center justify-between rounded bg-accent-soft px-3 py-2.5 text-sm" role="status">
        <span className="flex items-center gap-2 font-medium text-accent">
          <Tag className="size-4" aria-hidden />
          {t('cart.promoApplied', { code: promoCode })}
        </span>
        <button type="button" onClick={removePromo} aria-label={t('cart.promoRemove')} className="rounded p-1 hover:bg-white/60">
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {t('cart.promoLabel')}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setError(false);
          }}
          placeholder={t('cart.promoPlaceholder')}
          aria-invalid={error}
          aria-describedby={`${id}-hint`}
          autoComplete="off"
          className="field min-w-0 flex-1 py-2.5 uppercase"
        />
        <button type="submit" className="shrink-0 rounded border border-ink px-4 text-sm font-semibold transition-colors hover:bg-ink hover:text-canvas">
          {t('cart.promoApply')}
        </button>
      </div>
      <p id={`${id}-hint`} className={error ? 'mt-1.5 text-xs text-danger' : 'mt-1.5 text-xs text-ink-muted'} role={error ? 'alert' : undefined}>
        {error ? t('cart.promoInvalid') : t('cart.promoHint')}
      </p>
    </form>
  );
}
