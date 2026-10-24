import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'accent' | 'outline';

const tones: Record<Tone, string> = {
  default: 'bg-ink text-canvas',
  accent: 'bg-accent text-accent-contrast',
  outline: 'border border-ink bg-canvas text-ink',
};

export function Badge({ tone = 'default', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
