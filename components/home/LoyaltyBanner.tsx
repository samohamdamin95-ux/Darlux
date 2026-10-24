import { Crown } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { LOYALTY_TIERS } from '@/lib/constants';
import type { Translate } from '@/i18n/translator';
import { cn } from '@/lib/utils';

export function LoyaltyBanner({ t, href }: { t: Translate; href: string }) {
  return (
    <section aria-labelledby="loyalty" className="container py-10 md:py-14">
      <div className="grid overflow-hidden rounded bg-ink text-white lg:grid-cols-5">
        <div className="p-8 md:p-12 lg:col-span-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-luxe text-white/70">
            <Crown className="size-4" aria-hidden /> {t('home.loyalty.eyebrow')}
          </p>
          <h2 id="loyalty" className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            {t('home.loyalty.title')}
          </h2>
          <p className="mt-4 text-white/75">{t('home.loyalty.text')}</p>
          <ButtonLink href={href} variant="inverse" size="lg" className="mt-8">
            {t('home.loyalty.join')}
          </ButtonLink>
        </div>
        <ol className="grid gap-px bg-white/10 sm:grid-cols-3 lg:col-span-3">
          {LOYALTY_TIERS.map((tier, index) => (
            <li
              key={tier.id}
              className={cn(
                'flex flex-col justify-end bg-ink p-8',
                index === 1 && 'bg-[#141414]',
                index === 2 && 'bg-accent',
              )}
            >
              <span className="text-xs text-white/60">{t('home.loyalty.tierFrom', { points: tier.min })}</span>
              <span className="mt-2 text-2xl font-semibold" dir="ltr">
                {t(`tiers.${tier.id}.name`)}
              </span>
              <span className="mt-3 text-sm text-white/75">{t(`tiers.${tier.id}.perk`)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
