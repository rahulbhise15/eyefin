import { HERO_STOCKS, type HeroStock } from "./stocks";

// The ~10 word-tags shown at onboarding. Plain, human, not finance jargon.
// These match the `tags` on each stock so Explore can visibly reflect them.
export const ONBOARDING_TAGS = [
  "Total beginner",
  "Big trusted names",
  "Tech & IT",
  "Banking",
  "Shops & brands",
  "Energy",
  "Steady, not risky",
  "Long-term",
  "In the news",
  "Just exploring",
];

// Rank the stock list by overlap with the user's chosen tags.
// Stocks that share more of the user's interests float to the top.
export function rankByTags(tags: string[]): HeroStock[] {
  if (!tags.length) return HERO_STOCKS;
  const set = new Set(tags);
  return [...HERO_STOCKS]
    .map((s) => ({ s, score: s.tags.filter((t) => set.has(t)).length }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s);
}

// The first chosen tag that a given stock actually matches — used for the
// "because you said …" reason line. Returns null when there's no overlap.
export function matchReason(stock: HeroStock, tags: string[]): string | null {
  return stock.tags.find((t) => tags.includes(t)) ?? null;
}
