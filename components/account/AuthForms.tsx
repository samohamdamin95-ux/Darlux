'use client';

import { useId, useState, type FormEvent } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { EMAIL_PATTERN } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { useAccount } from '@/store/account';

type Mode = 'signIn' | 'register';

/** Mock sign-in / registration. Replace `signIn` with your auth provider. */
export function AuthForms() {
  const { t } = useI18n();
  const id = useId();
  const signIn = useAccount((state) => state.signIn);
  const [mode, setMode] = useState<Mode>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'password', string>>>({});

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (mode === 'register' && !name.trim()) next.name = t('checkout.errors.required');
    if (!email.trim()) next.email = t('checkout.errors.required');
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = t('checkout.errors.email');
    if (password.length < 8) next.password = t('account.passwordError');
    setErrors(next);
    const firstInvalid = (['name', 'email', 'password'] as const).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(`${id}-${firstInvalid}`)?.focus();
      return;
    }
    const fallbackName = email.split('@')[0].replace(/[._-]+/g, ' ');
    signIn({ name: name.trim() || fallbackName, email: email.trim() });
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-md">
      <div role="group" aria-label={t('account.title')} className="grid grid-cols-2 rounded bg-canvas-muted p-1">
        {(['signIn', 'register'] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={mode === item}
            onClick={() => switchMode(item)}
            className={cn('h-10 rounded text-sm font-semibold transition-colors', mode === item ? 'bg-canvas shadow-sm' : 'text-ink-muted')}
          >
            {t(`account.${item}`)}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold">{mode === 'signIn' ? t('account.signInTitle') : t('account.registerTitle')}</h2>
        {mode === 'register' && <p className="mt-2 text-sm text-ink-muted">{t('account.registerText')}</p>}

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          {mode === 'register' && (
            <Field id={`${id}-name`} label={t('account.name')} autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          )}
          <Field id={`${id}-email`} label={t('account.email')} type="email" autoComplete="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <Field
            id={`${id}-password`}
            label={t('account.password')}
            type="password"
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            dir="ltr"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint={mode === 'register' ? t('account.passwordHint') : undefined}
          />
          {mode === 'signIn' && (
            <button type="button" className="text-xs link-underline">
              {t('account.forgot')}
            </button>
          )}
          <Button type="submit" size="lg" className="w-full">
            {t(`account.${mode}`)}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          {mode === 'signIn' ? t('account.noAccount') : t('account.haveAccount')}{' '}
          <button type="button" onClick={() => switchMode(mode === 'signIn' ? 'register' : 'signIn')} className="font-semibold text-ink link-underline">
            {mode === 'signIn' ? t('account.register') : t('account.signIn')}
          </button>
        </p>
        <p className="mt-8 rounded bg-canvas-soft p-3 text-center text-xs text-ink-muted">{t('account.demoNote')}</p>
      </div>
    </div>
  );
}
