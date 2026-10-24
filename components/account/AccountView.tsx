'use client';

import { Crown, LogOut, Package } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useI18n } from '@/components/providers/I18nProvider';
import { Money } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { SmartImage } from '@/components/ui/SmartImage';
import { LOYALTY_TIERS } from '@/lib/constants';
import { formatDate, formatNumber } from '@/lib/format';
import { getTierStatus } from '@/lib/loyalty';
import { cn } from '@/lib/utils';
import { selectPoints, useAccount, WELCOME_POINTS, type Order } from '@/store/account';
import { useHydrated } from '@/store/ui';
import { AuthForms } from './AuthForms';
import { WishlistGrid } from './WishlistGrid';

const TABS = ['overview', 'orders', 'wishlist', 'loyalty'] as const;
type Tab = (typeof TABS)[number];

export function AccountView({ brandNames }: { brandNames: Record<string, string> }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const user = useAccount((state) => state.user);
  const orders = useAccount((state) => state.orders);
  const points = useAccount(selectPoints);
  const signOut = useAccount((state) => state.signOut);

  const requested = searchParams.get('tab') as Tab | null;
  const tab: Tab = requested && TABS.includes(requested) ? requested : 'overview';

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) return <AuthForms />;

  const tier = getTierStatus(points);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside>
        <p className="text-2xl font-semibold">{t('account.hello', { name: user.name.split(' ')[0] })}</p>
        <p className="mt-1 text-sm text-ink-muted" dir="ltr">
          {user.email}
        </p>
        <nav aria-label={t('account.title')} className="mt-8">
          <ul className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col">
            {TABS.map((item) => (
              <li key={item}>
                <Link
                  href={`${pathname}?tab=${item}`}
                  scroll={false}
                  aria-current={tab === item ? 'page' : undefined}
                  className={cn(
                    'block whitespace-nowrap rounded px-4 py-2.5 text-sm transition-colors',
                    tab === item ? 'bg-ink font-semibold text-canvas' : 'hover:bg-canvas-muted',
                  )}
                >
                  {t(`account.tabs.${item}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" onClick={signOut} className="mt-6 flex items-center gap-2 px-4 text-sm text-ink-muted hover:text-ink">
          <LogOut className="size-4" aria-hidden /> {t('account.signOut')}
        </button>
      </aside>

      <section aria-label={t(`account.tabs.${tab}`)}>
        {tab === 'overview' && (
          <div className="space-y-10">
            <LoyaltyCard points={points} />
            <div>
              <h2 className="mb-4 text-lg font-semibold">{t('account.recentOrders')}</h2>
              <OrderList orders={orders.slice(0, 2)} />
              {orders.length > 2 && (
                <Link href={`${pathname}?tab=orders`} className="mt-4 inline-block text-sm link-underline">
                  {t('common.viewAll')}
                </Link>
              )}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold">{t('account.tabs.orders')}</h2>
            <OrderList orders={orders} />
          </div>
        )}

        {tab === 'wishlist' && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold">{t('account.tabs.wishlist')}</h2>
            <WishlistGrid brandNames={brandNames} />
          </div>
        )}

        {tab === 'loyalty' && (
          <div className="space-y-10">
            <LoyaltyCard points={points} />
            <div>
              <h2 className="mb-4 text-lg font-semibold">{t('account.benefits')}</h2>
              <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {LOYALTY_TIERS.map((item) => {
                  const reached = points >= item.min;
                  return (
                    <li
                      key={item.id}
                      className={cn('rounded border p-5', item.id === tier.current ? 'border-ink' : 'border-line', !reached && 'opacity-60')}
                    >
                      <p className="text-lg font-semibold" dir="ltr">
                        {t(`tiers.${item.id}.name`)}
                      </p>
                      <p className="text-xs text-ink-muted">{t('home.loyalty.tierFrom', { points: item.min })}</p>
                      <p className="mt-3 text-sm text-ink-soft">{t(`tiers.${item.id}.perk`)}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div>
              <h2 className="mb-4 text-lg font-semibold">{t('account.pointsHistory')}</h2>
              <ul className="divide-y divide-line rounded border border-line">
                {orders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span>
                      {t('account.earnedOn', { id: order.id })}
                      <span className="block text-xs text-ink-muted">{formatDate(order.placedAt, locale)}</span>
                    </span>
                    <span className="font-semibold text-accent">+{formatNumber(order.pointsEarned, locale)}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between px-5 py-3 text-sm">
                  <span>
                    {t('account.welcomeBonus')}
                    <span className="block text-xs text-ink-muted">{formatDate(user.joinedAt, locale)}</span>
                  </span>
                  <span className="font-semibold text-accent">+{WELCOME_POINTS}</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function LoyaltyCard({ points }: { points: number }) {
  const { t, locale } = useI18n();
  const tier = getTierStatus(points);
  return (
    <div className="overflow-hidden rounded bg-ink p-6 text-white md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-luxe text-white/60">
            <Crown className="size-4" aria-hidden /> {t('account.currentTier')}
          </p>
          <p className="mt-2 text-3xl font-semibold" dir="ltr">
            {t(`tiers.${tier.current}.name`)}
          </p>
        </div>
        <p className="text-end">
          <span className="block text-4xl font-semibold tabular-nums">{formatNumber(points, locale)}</span>
          <span className="text-xs text-white/60">{t('account.pointsLabel')}</span>
        </p>
      </div>
      <div className="mt-8">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(tier.progress * 100)}
          aria-label={t('account.currentTier')}
          className="h-1.5 overflow-hidden rounded-full bg-white/15"
        >
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${tier.progress * 100}%` }} />
        </div>
        <p className="mt-3 text-sm text-white/75">
          {tier.next ? t('account.nextTier', { points: tier.remaining, tier: t(`tiers.${tier.next}.name`) }) : t('account.topTier')}
        </p>
      </div>
    </div>
  );
}

function OrderList({ orders }: { orders: Order[] }) {
  const { t, l, locale } = useI18n();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center rounded border border-dashed border-line-strong px-6 py-14 text-center">
        <Package className="size-9 text-ink-subtle" aria-hidden />
        <p className="mt-3 text-sm text-ink-muted">{t('account.noOrders')}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id} className="rounded border border-line p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{t('account.order', { id: order.id })}</p>
              <p className="text-xs text-ink-muted">
                {t('account.placedOn', { date: formatDate(order.placedAt, locale) })} ·{' '}
                {t('account.itemsCount', { count: order.lines.reduce((sum, line) => sum + line.quantity, 0) })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {t(`account.status.${order.status}`)}
              </span>
              <Money amount={order.total} className="font-semibold" />
            </div>
          </div>
          <ul className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            {order.lines.map((line) => (
              <li key={line.key} className="relative size-14 shrink-0 overflow-hidden rounded bg-canvas-muted" title={l(line.name)}>
                <SmartImage src={line.image} alt={l(line.name)} fill sizes="56px" className="object-cover" />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
