import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';

export function PlpHeader({
  crumbs,
  breadcrumbLabel,
  title,
  description,
}: {
  crumbs: Crumb[];
  breadcrumbLabel: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8 md:mb-10">
      <Breadcrumbs items={crumbs} label={breadcrumbLabel} />
      <h1 className="heading-display mt-4">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-sm text-ink-muted md:text-base">{description}</p>}
    </header>
  );
}
