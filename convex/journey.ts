import { query } from "./_generated/server";
import { v } from "convex/values";

// A gentle, interaction-seeded picture of the user's learning so far.
// Everything here is derived from the events log — no separate tracking.
export const getJourney = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const reads = events.filter((e) => e.type === "view").length;
    const questions = events.filter((e) => e.type === "followup").length;
    const confusions = events.filter((e) => e.type === "didnt_understand").length;

    const watchlist = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Distinct stocks touched, most-recent first.
    const seen = new Map<string, number>();
    for (const e of events) {
      if (e.symbol) seen.set(e.symbol, Math.max(seen.get(e.symbol) ?? 0, e._creationTime));
    }
    const stocks = [...seen.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([symbol, ts]) => ({ symbol, ts }));

    // Reading level grows with total interaction (matches the read pipeline).
    const total = events.length;
    const level = total < 3 ? 1 : total < 12 ? 2 : 3;

    const recent = [...events]
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 12)
      .map((e) => ({ type: e.type, symbol: e.symbol ?? null, ts: e._creationTime }));

    return {
      stats: { reads, questions, confusions, watchlisted: watchlist.length, explored: stocks.length },
      level,
      stocks,
      recent,
      started: total > 0,
    };
  },
});
