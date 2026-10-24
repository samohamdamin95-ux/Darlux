import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

/** Labelled input wired for validation: aria-invalid + aria-describedby on errors and hints. */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, error, hint, className, required, ...props },
  ref,
) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="text-accent">
            {' '}
            *
          </span>
        )}
      </label>
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="field"
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={cn('mt-1.5 text-xs text-danger')}>
          {error}
        </p>
      )}
    </div>
  );
});
