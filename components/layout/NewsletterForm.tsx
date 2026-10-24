'use client';

import { useId, useState, type FormEvent } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { EMAIL_PATTERN } from '@/lib/validation';

/** UI-only newsletter signup. Wire `onSubmit` to your ESP (Klaviyo, Mailchimp…) later. */
export function NewsletterForm() {
  const { t } = useI18n();
  const id = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'done'>('idle');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setStatus(EMAIL_PATTERN.test(email.trim()) ? 'done' : 'error');
  };

  if (status === 'done') {
    return (
      <p role="status" className="text-sm text-white">
        {t('footer.subscribed')}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-md">
      <label htmlFor={id} className="sr-only">
        {t('footer.emailLabel')}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder={t('footer.emailPlaceholder')}
          aria-invalid={status === 'error'}
          aria-describedby={status === 'error' ? `${id}-error` : undefined}
          dir="ltr"
          className="h-12 min-w-0 flex-1 rounded border border-white/25 bg-transparent px-4 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none rtl:text-right"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded bg-canvas px-6 text-sm font-semibold text-ink transition-colors hover:bg-canvas-muted"
        >
          {t('footer.subscribe')}
        </button>
      </div>
      {status === 'error' && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-[#F4A3A3]">
          {t('footer.invalidEmail')}
        </p>
      )}
    </form>
  );
}
