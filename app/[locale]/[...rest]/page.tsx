import { notFound } from 'next/navigation';

/** Catches unknown paths under a locale so the localized not-found page renders inside the layout. */
export default function CatchAll() {
  notFound();
}
