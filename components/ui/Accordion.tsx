import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Native <details>/<summary> accordion: keyboard accessible and announced
 * correctly by screen readers without any client-side JavaScript.
 */
export function AccordionItem({
  title,
  children,
  defaultOpen,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={cn('group border-b border-line', className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 transition-transform duration-300 ease-luxe group-open:rotate-180"
        />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-ink-soft">{children}</div>
    </details>
  );
}
