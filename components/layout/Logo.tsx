import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Typographic wordmark — always Latin, so it reads the same in both languages. */
export function Logo({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <Link href={href} aria-label={label} className={cn('inline-flex items-baseline', className)} dir="ltr">
      <span className="text-xl font-semibold tracking-[0.32em] md:text-2xl">DARLUX</span>
      <span aria-hidden className="ms-0.5 size-1.5 rounded-full bg-accent" />
    </Link>
  );
}
