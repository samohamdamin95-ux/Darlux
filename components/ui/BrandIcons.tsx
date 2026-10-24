import type { SVGProps } from 'react';

/** Simple line glyphs for social networks (lucide no longer ships brand icons). */
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.4 2.7 2.3 4.6 5 5" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

export function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.5v5l4.5-2.5L10 9.5z" fill="currentColor" />
    </svg>
  );
}

/** Text-based payment badges (no third-party logos are reproduced). */
export function PaymentBadges({ label }: { label: string }) {
  const methods = ['VISA', 'Mastercard', 'mada', 'Apple Pay', 'COD'];
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {methods.map((method) => (
        <li
          key={method}
          className="rounded border border-white/20 px-2.5 py-1 text-2xs font-semibold tracking-wide text-white/80"
        >
          {method}
        </li>
      ))}
    </ul>
  );
}
