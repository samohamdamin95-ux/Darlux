import Link from 'next/link';
import { InstagramIcon, PaymentBadges, TikTokIcon, XIcon, YouTubeIcon } from '@/components/ui/BrandIcons';
import { getI18n } from '@/i18n/server';
import type { Locale } from '@/i18n/config';
import type { Category } from '@/lib/types';
import { CurrencySelector } from './CurrencySelector';
import { LocaleSwitcher } from './LocaleSwitcher';
import { Logo } from './Logo';
import { NewsletterForm } from './NewsletterForm';

const SOCIAL = [
  { name: 'Instagram', Icon: InstagramIcon },
  { name: 'TikTok', Icon: TikTokIcon },
  { name: 'X', Icon: XIcon },
  { name: 'YouTube', Icon: YouTubeIcon },
];

export function Footer({ locale, categories }: { locale: Locale; categories: Category[] }) {
  const { t, l, href } = getI18n(locale);

  const columns = [
    {
      title: t('footer.shop'),
      links: [
        ...categories.map((category) => ({ label: l(category.name), href: `/c/${category.slug}` })),
        { label: t('header.brands'), href: '/brands' },
        { label: t('header.sale'), href: '/c/sale' },
      ],
    },
    {
      title: t('footer.help'),
      links: [
        { label: t('footer.links.contact'), href: '/info/contact' },
        { label: t('footer.links.shipping'), href: '/info/shipping' },
        { label: t('footer.links.returns'), href: '/info/returns' },
        { label: t('footer.links.track'), href: '/account?tab=orders' },
        { label: t('footer.links.faq'), href: '/info/faq' },
      ],
    },
    {
      title: t('footer.about'),
      links: [
        { label: t('footer.links.story'), href: '/info/story' },
        { label: t('footer.links.circle'), href: '/account?tab=loyalty' },
        { label: t('footer.links.careers'), href: '/info/careers' },
        { label: t('footer.links.sustainability'), href: '/info/sustainability' },
      ],
    },
  ];

  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="container grid grid-cols-1 gap-10 border-b border-white/10 py-14 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('footer.newsletterTitle')}</h2>
          <p className="mt-2 max-w-md text-sm text-white/70">{t('footer.newsletterText')}</p>
        </div>
        <div className="lg:justify-self-end">
          <NewsletterForm />
        </div>
      </div>

      <div className="container grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo href={href('/')} label="Darlux" className="text-white" />
          <p className="mt-4 max-w-xs text-sm text-white/60">{t('meta.tagline')}</p>
          <p className="eyebrow mt-8 text-white/50">{t('footer.follow')}</p>
          <ul className="mt-3 flex gap-2">
            {SOCIAL.map(({ name, Icon }) => (
              <li key={name}>
                <a
                  href="#"
                  aria-label={name}
                  className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white hover:text-white"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="eyebrow text-white/50">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={href(link.href)} className="text-sm text-white/80 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            <LocaleSwitcher tone="dark" />
            <CurrencySelector tone="dark" />
          </div>
          <PaymentBadges label={t('footer.payments')} />
        </div>
        <div className="container flex flex-col gap-2 pb-8 text-xs text-white/50 md:flex-row md:justify-between">
          <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
          <p>{t('footer.demo')}</p>
          <p className="flex gap-4">
            <Link href={href('/info/privacy')} className="hover:text-white">
              {t('footer.links.privacy')}
            </Link>
            <Link href={href('/info/terms')} className="hover:text-white">
              {t('footer.links.terms')}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
