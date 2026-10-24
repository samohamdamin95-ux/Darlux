import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  /** Accessible label, e.g. "Rated 4.6 out of 5". Empty = decorative. */
  label: string;
  count?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z';

/** Five stars with fractional fill. Pure markup, no client JS. */
export function Rating({ value, label, count, size = 'sm', className }: RatingProps) {
  const px = size === 'sm' ? 12 : 16;
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        role={label ? 'img' : undefined}
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
        className="relative inline-flex"
      >
        <span className="flex gap-0.5 text-line-strong" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} width={px} height={px} viewBox="0 0 24 24" fill="currentColor">
              <path d={STAR} />
            </svg>
          ))}
        </span>
        <span
          className="absolute inset-y-0 start-0 flex gap-0.5 overflow-hidden text-star"
          style={{ width: `${(Math.min(5, Math.max(0, value)) / 5) * 100}%` }}
          aria-hidden
        >
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} width={px} height={px} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d={STAR} />
            </svg>
          ))}
        </span>
      </span>
      {count && <span className="text-xs text-ink-muted">{count}</span>}
    </div>
  );
}
