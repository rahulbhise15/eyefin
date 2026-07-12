import { HERO_STOCKS, DEFAULT_EXPLORE, type HeroStock } from "./stocks";

// The ~10 word-tags shown at onboarding. Plain, human, not finance jargon.
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

// Meta-tags don't map to a sector, so expand them to concrete themes.
const EXPAND: Record<string, string[]> = {
  "Total beginner": ["Big trusted names", "Steady, not risky"],
  "Just exploring": ["Big trusted names", "In the news"],
};

function expand(tags: string[]): string[] {
  const out = new Set<string>();
  for (const t of tags) {
    out.add(t);
    (EXPAND[t] ?? []).forEach((e) => out.add(e));
  }
  return [...out];
}

const defaults = (): HeroStock[] =>
  DEFAULT_EXPLORE
    .map((s) => HERO_STOCKS.find((h) => h.symbol === s))
    .filter((h): h is HeroStock => !!h);

// Filter + rank to the user's tags: stocks matching the chosen themes are
// surfaced (most-overlap first), non-matching ones dropped — unless that would
// leave too few to explore, in which case we top up with the beginner set.
export function rankByTags(tags: string[]): HeroStock[] {
  if (!tags.length) return defaults();
  const set = new Set(expand(tags));
  const scored = HERO_STOCKS.map((s) => ({
    s,
    score: s.tags.filter((t) => set.has(t)).length,
  }));
  const matching = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  if (matching.length >= 3) return matching.map((x) => x.s);
  const rest = defaults().filter(
    (d) => !matching.some((m) => m.s.symbol === d.symbol)
  );
  return [...matching.map((x) => x.s), ...rest].slice(0, 6);
}

// The first chosen tag a stock matches (prefer a directly-picked tag over an
// expanded one) — used for the "because you said …" reason line.
export function matchReason(stock: HeroStock, tags: string[]): string | null {
  const direct = stock.tags.find((t) => tags.includes(t));
  if (direct) return direct;
  const set = expand(tags);
  return stock.tags.find((t) => set.includes(t)) ?? null;
}
