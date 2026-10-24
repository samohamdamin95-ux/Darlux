import { interpolate } from '@/lib/utils';
import type ar from './dictionaries/ar.json';

export type Dictionary = typeof ar;

/** Dot-separated paths to every string leaf of the dictionary, e.g. "cart.title". */
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<Dictionary>;

export type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export function createTranslator(dictionary: Dictionary): Translate {
  return (key, vars) => {
    const value = key
      .split('.')
      .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], dictionary);
    return typeof value === 'string' ? interpolate(value, vars) : key;
  };
}
