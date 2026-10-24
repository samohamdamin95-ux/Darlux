/**
 * Text normalization shared by the server search and the client autocomplete,
 * so Arabic queries match regardless of diacritics or letter variants
 * (أ/إ/آ → ا, ة → ه, ى → ي) and Latin queries ignore accents (Lunaré → lunare).
 */
export function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every query word must appear somewhere in the haystack. */
export function matchesQuery(haystack: string, query: string) {
  const normalized = normalizeText(haystack);
  return normalizeText(query)
    .split(' ')
    .filter(Boolean)
    .every((word) => normalized.includes(word));
}
