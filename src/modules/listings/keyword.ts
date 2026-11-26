/**
 * Keyword search helpers. Kept free of Prisma so they can be unit tested.
 *
 * Search is per word: every word must match somewhere (title, description,
 * make or model, in English or Arabic). Each word also gets spelling variants
 * so common ways of typing a model still match the stored text:
 *   "G63"  -> "g63", "g 63", "g-63"
 *   "x-5"  -> "x-5", "x5", "x 5"
 */

const MAX_TERMS = 6;

/** Normalise Arabic letter forms that users type interchangeably. */
export function normalizeArabic(s: string): string {
  return s
    .replace(/[ً-ْـ]/g, "") // harakat + tatweel
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

/** Split a raw keyword into search words (lowercased, deduplicated, capped). */
export function keywordTerms(raw: string): string[] {
  const words = raw
    .toLowerCase()
    .split(/[\s,،/]+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter((w) => w.length > 0);
  return [...new Set(words)].slice(0, MAX_TERMS);
}

/** Spelling variants of one word that should all count as a match. */
export function termVariants(term: string): string[] {
  const out = new Set<string>([term]);

  // Letter/digit boundaries: "g63" <-> "g 63" / "g-63".
  const split = term
    .replace(/(\p{L})(\p{N})/gu, "$1 $2")
    .replace(/(\p{N})(\p{L})/gu, "$1 $2");
  if (split !== term) {
    out.add(split);
    out.add(split.replace(/ /g, "-"));
  }

  // Hyphenated or dotted forms: "x-5" -> "x5" and "x 5".
  if (/[-.]/.test(term)) {
    out.add(term.replace(/[-.]/g, ""));
    out.add(term.replace(/[-.]/g, " "));
  }

  // Arabic spelling forms: "تويوتا" typed with different alef/ya/ta forms.
  const ar = normalizeArabic(term);
  if (ar !== term) out.add(ar);

  return [...out].filter((v) => v.length > 0);
}
