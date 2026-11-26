import { prisma } from "@/lib/prisma";

const DEFAULT_BANNED = ["weapon", "stolen", "fake papers"];

/** Words from the draft prohibited-listings page, plus a small default until the client approves policy. */
export async function findProhibitedTerms(text: string): Promise<string[]> {
  const page = await prisma.contentPage.findUnique({
    where: { slug: "prohibited-listings" },
  });
  const source = `${page?.bodyEn ?? ""}\n${page?.bodyAr ?? ""}`;
  const fromPage = source
    .split(/[\n,]+/)
    .map((w) => w.replace(/<[^>]+>/g, "").trim().toLowerCase())
    .filter((w) => w.length >= 3);
  const terms = fromPage.length > 0 ? fromPage : DEFAULT_BANNED;
  const hay = text.toLowerCase();
  return terms.filter((term) => hay.includes(term));
}
