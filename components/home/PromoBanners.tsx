import Link from 'next/link';
import { SmartImage } from '@/components/ui/SmartImage';
import type { PromoBanner } from '@/lib/types';

export function PromoBanners({
  banners,
  getText,
  getHref,
}: {
  banners: PromoBanner[];
  getText: (banner: PromoBanner) => { eyebrow: string; title: string; cta: string };
  getHref: (path: string) => string;
}) {
  return (
    <section className="container grid gap-4 py-10 md:grid-cols-2 md:gap-6 md:py-14">
      {banners.map((banner) => {
        const text = getText(banner);
        return (
          <Link
            key={banner.id}
            href={getHref(banner.href)}
            className="group relative flex aspect-[4/3] items-end overflow-hidden rounded bg-ink md:aspect-[5/4] lg:aspect-[16/11]"
          >
            <SmartImage
              src={banner.image}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="relative p-6 text-white md:p-10">
              <span className="block text-xs font-semibold uppercase tracking-luxe text-white/80">{text.eyebrow}</span>
              <span className="mt-2 block max-w-sm text-2xl font-semibold leading-tight md:text-3xl">{text.title}</span>
              <span className="mt-5 inline-block border-b border-white pb-0.5 text-sm font-semibold transition-colors group-hover:border-transparent">
                {text.cta}
              </span>
            </span>
          </Link>
        );
      })}
    </section>
  );
}
