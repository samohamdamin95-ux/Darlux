import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionHeader({
  title,
  eyebrow,
  action,
  id,
  className,
}: {
  title: string;
  eyebrow?: string;
  action?: { label: string; href: string };
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn('mb-6 flex items-end justify-between gap-4 md:mb-8', className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 id={id} className="heading-section">
          {title}
        </h2>
      </div>
      {action && (
        <Link href={action.href} className="shrink-0 text-sm font-medium link-underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}
