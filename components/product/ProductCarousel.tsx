import { Carousel } from '@/components/ui/Carousel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  brandNames: Record<string, string>;
  action?: { label: string; href: string };
  eyebrow?: string;
  id: string;
}

export function ProductCarousel({ title, products, brandNames, action, eyebrow, id }: ProductCarouselProps) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={id} className="container py-10 md:py-14">
      <SectionHeader id={id} title={title} eyebrow={eyebrow} action={action} />
      <Carousel label={title}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            brandName={brandNames[product.brand] ?? product.brand}
            sizes="(min-width: 1280px) 19vw, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw"
          />
        ))}
      </Carousel>
    </section>
  );
}
