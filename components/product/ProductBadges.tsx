'use client';

import { useI18n } from '@/components/providers/I18nProvider';
import { Badge } from '@/components/ui/Badge';
import { isOnSale } from '@/lib/filters';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

/** At most two badges, in priority order: Sale, New, Exclusive. */
export function ProductBadges({ product, className }: { product: Product; className?: string }) {
  const { t } = useI18n();
  const badges: { key: string; label: string; tone: 'accent' | 'default' | 'outline' }[] = [];
  if (isOnSale(product)) badges.push({ key: 'sale', label: t('product.badges.sale'), tone: 'accent' });
  if (product.tags.includes('new') || product.tags.includes('just-dropped')) {
    badges.push({ key: 'new', label: t('product.badges.new'), tone: 'default' });
  }
  if (product.tags.includes('exclusive')) badges.push({ key: 'exclusive', label: t('product.badges.exclusive'), tone: 'outline' });
  if (badges.length === 0) return null;

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      {badges.slice(0, 2).map((badge) => (
        <Badge key={badge.key} tone={badge.tone}>
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
