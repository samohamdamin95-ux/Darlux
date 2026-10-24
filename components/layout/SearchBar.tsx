'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { SmartImage } from '@/components/ui/SmartImage';
import { matchesQuery } from '@/lib/search';
import type { SearchIndexEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

const LIMITS: Record<SearchIndexEntry['type'], number> = { category: 3, brand: 3, product: 6 };
const GROUP_ORDER: SearchIndexEntry['type'][] = ['category', 'brand', 'product'];

/**
 * Header search with autocomplete, implemented as an ARIA 1.2 combobox.
 * It is a regular GET form underneath, so it still works before hydration.
 */
export function SearchBar({ index, className }: { index: SearchIndexEntry[]; className?: string }) {
  const { t, l, href } = useI18n();
  const router = useRouter();
  const id = useId();
  const listboxId = `${id}-listbox`;
  const wrapperRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const groups = useMemo(() => {
    if (query.trim().length < 2) return [];
    return GROUP_ORDER.map((type) => ({
      type,
      items: index
        .filter((entry) => entry.type === type)
        .filter((entry) => matchesQuery(`${entry.label.ar} ${entry.label.en} ${entry.sublabel ?? ''}`, query))
        .slice(0, LIMITS[type]),
    })).filter((group) => group.items.length > 0);
  }, [index, query]);

  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const expanded = open && query.trim().length >= 2;

  useEffect(() => setActive(-1), [query]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    inputRef.current?.blur();
    router.push(href(path));
  };

  const submit = () => {
    const term = query.trim();
    if (term) go(`/search?q=${encodeURIComponent(term)}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (flat.length ? (current + 1) % flat.length : -1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => (flat.length ? (current - 1 + flat.length) % flat.length : -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (expanded && active >= 0 && flat[active]) go(flat[active].href);
      else submit();
    } else if (event.key === 'Escape') {
      if (expanded) setOpen(false);
      else setQuery('');
    }
  };

  const optionId = (index: number) => `${id}-option-${index}`;
  let running = -1;

  return (
    <form
      ref={wrapperRef}
      role="search"
      action={href('/search')}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className={cn('relative', className)}
    >
      <label htmlFor={`${id}-input`} className="sr-only">
        {t('header.searchLabel')}
      </label>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        <input
          ref={inputRef}
          id={`${id}-input`}
          name="q"
          type="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t('header.searchPlaceholder')}
          className="h-11 w-full rounded-full border border-line-strong bg-canvas-soft pe-10 ps-11 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-ink focus:bg-canvas focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label={t('common.clear')}
            className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-muted hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <div
        className={cn(
          'absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-line bg-canvas shadow-pop',
          !expanded && 'hidden',
        )}
      >
        <div id={listboxId} role="listbox" aria-label={t('header.searchLabel')} className="max-h-[70vh] overflow-y-auto py-2">
          {groups.map((group) => (
            <div key={group.type} role="group" aria-labelledby={`${id}-group-${group.type}`}>
              <p id={`${id}-group-${group.type}`} className="eyebrow px-4 pb-1 pt-3">
                {t(`header.suggestions.${group.type}`)}
              </p>
              {group.items.map((entry) => {
                running += 1;
                const position = running;
                return (
                  <div
                    key={entry.href}
                    id={optionId(position)}
                    role="option"
                    aria-selected={position === active}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => go(entry.href)}
                    onMouseEnter={() => setActive(position)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-4 py-2 text-sm',
                      position === active && 'bg-canvas-muted',
                    )}
                  >
                    {entry.image && (
                      <span className="relative size-10 shrink-0 overflow-hidden rounded bg-canvas-muted">
                        <SmartImage src={entry.image} alt="" fill sizes="40px" className="object-cover" />
                      </span>
                    )}
                    <span className="min-w-0">
                      {entry.sublabel && (
                        <span className="block text-2xs font-semibold uppercase tracking-wider text-ink-muted">
                          {entry.sublabel}
                        </span>
                      )}
                      <span className="block truncate">{l(entry.label)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
          {groups.length === 0 && (
            <p className="px-4 py-3 text-sm text-ink-muted">{t('header.noSuggestions', { q: query.trim() })}</p>
          )}
        </div>
        <button
          type="submit"
          onPointerDown={(event) => event.preventDefault()}
          className="block w-full border-t border-line px-4 py-3 text-start text-sm font-semibold hover:bg-canvas-soft"
        >
          {t('header.viewAllResults', { q: query.trim() })}
        </button>
      </div>
    </form>
  );
}
