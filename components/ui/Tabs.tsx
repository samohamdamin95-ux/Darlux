'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

/** WAI-ARIA tabs with roving focus; arrow keys follow the reading direction. */
export function Tabs({ items, label, className }: { items: TabItem[]; label: string; className?: string }) {
  const { dir } = useI18n();
  const baseId = useId();
  const [active, setActive] = useState(items[0]?.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (index: number) => {
    const next = (index + items.length) % items.length;
    setActive(items[next].id);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forward) focusTab(index + 1);
    else if (event.key === backward) focusTab(index - 1);
    else if (event.key === 'Home') focusTab(0);
    else if (event.key === 'End') focusTab(items.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex gap-6 overflow-x-auto border-b border-line no-scrollbar">
        {items.map((item, index) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                '-mb-px shrink-0 border-b-2 py-3 text-sm font-semibold transition-colors',
                selected ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className="py-6 text-sm leading-relaxed text-ink-soft"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
