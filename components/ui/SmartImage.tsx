'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * next/image with a graceful, on-brand fallback: if a remote image fails to
 * load (offline, removed photo, blocked CDN) we show a soft gradient with the
 * Darlux monogram instead of a broken-image icon.
 */
export function SmartImage({ className, alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-canvas-muted via-canvas-soft to-accent-soft',
          className,
        )}
      >
        <span aria-hidden className="text-2xl font-light tracking-luxe text-ink/25">
          D
        </span>
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      className={cn('transition-opacity duration-500 ease-luxe', loaded ? 'opacity-100' : 'opacity-0', className)}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
