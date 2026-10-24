'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/components/providers/I18nProvider';
import { cn } from '@/lib/utils';

type Side = 'center' | 'start' | 'end' | 'bottom';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visually hide the title bar (the title is still announced). */
  hideHeader?: boolean;
  side?: Side;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const panelBase: Record<Side, string> = {
  center: 'left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 max-h-[90vh] rounded-lg',
  end: 'inset-y-0 end-0 w-full max-w-md',
  start: 'inset-y-0 start-0 w-full max-w-sm',
  bottom: 'inset-x-0 bottom-0 max-h-[88vh] rounded-t-xl',
};

const panelHidden: Record<Side, string> = {
  center: 'opacity-0 -translate-y-[46%] scale-[0.98]',
  end: 'ltr:translate-x-full rtl:-translate-x-full',
  start: 'ltr:-translate-x-full rtl:translate-x-full',
  bottom: 'translate-y-full',
};

const panelShown: Record<Side, string> = {
  center: 'opacity-100 -translate-y-1/2 scale-100',
  end: 'translate-x-0',
  start: 'translate-x-0',
  bottom: 'translate-y-0',
};

/**
 * Accessible modal used for drawers, bottom sheets and Quick Look:
 * focus is moved in and trapped, Escape and the backdrop close it, page scroll
 * is locked and focus returns to the trigger on close.
 */
export function Dialog({ open, onClose, title, hideHeader, side = 'center', className, children, footer }: DialogProps) {
  const { t } = useI18n();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  // Mount → animate in; animate out → unmount.
  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) return;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus({ preventScroll: true });

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      returnFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [mounted, open]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]" onKeyDown={onKeyDown}>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ease-luxe',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'absolute flex flex-col overflow-hidden bg-canvas shadow-pop outline-none transition-all duration-300 ease-luxe',
          panelBase[side],
          shown ? panelShown[side] : panelHidden[side],
          className,
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-between gap-4 border-b border-line px-5 py-4',
            hideHeader && 'absolute end-0 top-0 z-10 border-0 bg-transparent p-3',
          )}
        >
          <h2 id={titleId} className={cn('text-base font-semibold', hideHeader && 'sr-only')}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="-m-2 rounded-full p-2 text-ink transition-colors hover:bg-canvas-muted"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-line bg-canvas px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
