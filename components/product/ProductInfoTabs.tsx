'use client';

import { useI18n } from '@/components/providers/I18nProvider';
import { Tabs } from '@/components/ui/Tabs';
import type { Product } from '@/lib/types';

export function ProductInfoTabs({ product }: { product: Product }) {
  const { t, l, locale } = useI18n();
  const separator = locale === 'ar' ? '، ' : ', ';

  const attributes = [
    product.skinTypes.length > 0 && {
      label: t('plp.skinType'),
      value: product.skinTypes.map((value) => t(`values.skinTypes.${value}`)).join(separator),
    },
    product.concerns.length > 0 && {
      label: t('plp.concern'),
      value: product.concerns.map((value) => t(`values.concerns.${value}`)).join(separator),
    },
    product.finish && { label: t('plp.finish'), value: t(`values.finishes.${product.finish}`) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <Tabs
      label={t('product.details')}
      items={[
        {
          id: 'details',
          label: t('product.details'),
          content: (
            <div className="max-w-3xl space-y-6">
              <p>{l(product.description)}</p>
              {attributes.length > 0 && (
                <dl className="grid gap-4 sm:grid-cols-3">
                  {attributes.map((item) => (
                    <div key={item.label} className="rounded bg-canvas-soft p-4">
                      <dt className="eyebrow">{item.label}</dt>
                      <dd className="mt-1 text-ink">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ),
        },
        { id: 'how-to-use', label: t('product.howToUse'), content: <p className="max-w-3xl">{l(product.howToUse)}</p> },
        {
          id: 'ingredients',
          label: t('product.ingredients'),
          content: (
            <p className="max-w-3xl" dir="auto">
              {l(product.ingredients)}
            </p>
          ),
        },
      ]}
    />
  );
}
