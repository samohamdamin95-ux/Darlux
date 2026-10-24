'use client';

import { Heart, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/components/providers/I18nProvider';
import { useAccount } from '@/store/account';
import { selectItemCount, useCart } from '@/store/cart';
import { useHydrated, useUi } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden
      className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-accent-contrast animate-fade-in"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

const iconButton = 'relative flex items-center gap-2 rounded-full p-2 text-sm transition-colors hover:bg-canvas-muted';

export function HeaderActions() {
  const { t, href } = useI18n();
  const hydrated = useHydrated();
  const itemCount = useCart(selectItemCount);
  const wishlistCount = useWishlist((state) => state.ids.length);
  const user = useAccount((state) => state.user);
  const openMiniCart = useUi((state) => state.openMiniCart);
  const basketCount = hydrated ? itemCount : 0;

  return (
    <div className="flex items-center gap-0.5 md:gap-1">
      <Link href={href('/account')} className={iconButton}>
        <User className="size-[22px]" aria-hidden />
        <span className="hidden max-w-28 truncate font-medium xl:inline">
          {hydrated && user ? user.name.split(' ')[0] : t('header.signIn')}
        </span>
        <span className="sr-only xl:hidden">{t('header.account')}</span>
      </Link>
      <Link href={href('/wishlist')} className={`${iconButton} hidden sm:flex`}>
        <Heart className="size-[22px]" aria-hidden />
        <span className="sr-only">{t('header.wishlist')}</span>
        <CountBadge count={hydrated ? wishlistCount : 0} />
      </Link>
      <button
        type="button"
        onClick={openMiniCart}
        aria-label={t('header.basketCount', { count: basketCount })}
        aria-haspopup="dialog"
        className={iconButton}
      >
        <ShoppingBag className="size-[22px]" aria-hidden />
        <CountBadge count={basketCount} />
      </button>
    </div>
  );
}
