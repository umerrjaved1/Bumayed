/**
 * ISO codes of the six Gulf Cooperation Council countries. Kept free of
 * server-only imports so the proxy (which runs before the app) can use it.
 */
export const GCC_ISO_CODES = ["AE", "SA", "QA", "KW", "BH", "OM"] as const;

export function isGccCountry(code: string | null | undefined): boolean {
  return GCC_ISO_CODES.includes(
    (code ?? "").toUpperCase() as (typeof GCC_ISO_CODES)[number],
  );
}
