import { action } from "./_generated/server";
import { v } from "convex/values";

// Search any Indian stock by name or ticker. Yahoo's search often returns the
// BSE (.BO) listing rather than NSE (.NS), so we normalize every Indian match
// to its NSE form — more liquid and our default for reads.
// Well-known renames/brands Yahoo's name-search misses. Rookies search the
// brand they know, so map it to the live NSE symbol.
const ALIASES: Record<string, { symbol: string; name: string }> = {
  zomato: { symbol: "ETERNAL.NS", name: "Eternal (formerly Zomato)" },
};

export const searchStocks = action({
  args: { q: v.string() },
  handler: async (_ctx, { q }) => {
    const query = q.trim();
    if (query.length < 2) return [];
    let quotes: Array<{
      symbol?: string;
      quoteType?: string;
      longname?: string;
      shortname?: string;
    }> = [];
    try {
      const r = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
          query
        )}&quotesCount=12&newsCount=0`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      if (!r.ok) return [];
      const j = await r.json();
      quotes = j?.quotes ?? [];
    } catch {
      return [];
    }

    const seen = new Set<string>();
    const out: { symbol: string; name: string }[] = [];
    for (const qt of quotes) {
      const sym = qt?.symbol ?? "";
      const m = sym.match(/^(.+)\.(NS|BO)$/);
      if (!m) continue; // Indian listings only
      if (qt?.quoteType && qt.quoteType !== "EQUITY") continue;
      const root = m[1];
      if (seen.has(root)) continue;
      seen.add(root);
      out.push({ symbol: `${root}.NS`, name: qt.longname || qt.shortname || root });
      if (out.length >= 8) break;
    }
    const alias = ALIASES[query.toLowerCase()];
    if (alias && !out.some((o) => o.symbol === alias.symbol)) out.unshift(alias);
    return out.slice(0, 8);
  },
});
