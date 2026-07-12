import { query } from "./_generated/server";

// The evals / insights dashboard. Read-only aggregate over the whole app.
// Small data volumes (hackathon scale), so full-collection scans are fine.
export const insights = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const events = await ctx.db.query("events").collect();
    const logs = await ctx.db.query("aiLogs").collect();

    // Distinct users who reached each stage of the funnel.
    const usersWith = (type: string) =>
      new Set(events.filter((e) => e.type === type).map((e) => e.userId)).size;

    const funnel = [
      { stage: "Visited", n: users.length },
      { stage: "Read a stock", n: usersWith("view") },
      { stage: "Asked a question", n: usersWith("followup") },
      { stage: "Added to watchlist", n: usersWith("watch") },
      { stage: "Signed up", n: usersWith("signup") },
      { stage: "Connected Telegram", n: usersWith("telegram_connect") },
    ];

    // Confusion map: where people asked for simpler / asked follow-ups.
    const confusion = new Map<string, { simpler: number; questions: number }>();
    for (const e of events) {
      if (!e.symbol) continue;
      if (e.type !== "didnt_understand" && e.type !== "followup") continue;
      const c = confusion.get(e.symbol) ?? { simpler: 0, questions: 0 };
      if (e.type === "didnt_understand") c.simpler++;
      else c.questions++;
      confusion.set(e.symbol, c);
    }
    const confusionMap = [...confusion.entries()]
      .map(([symbol, c]) => ({ symbol, ...c, total: c.simpler + c.questions }))
      .sort((a, b) => b.total - a.total);

    // AI health.
    const flagged = logs.filter((l) => l.guardrailFlag).length;
    const avgLatency = logs.length
      ? Math.round(logs.reduce((s, l) => s + l.latencyMs, 0) / logs.length)
      : 0;

    // Recent AI calls (most recent first), trimmed for the table.
    const recent = [...logs]
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 25)
      .map((l) => ({
        kind: l.kind,
        symbol: l.symbol,
        guardrailFlag: l.guardrailFlag,
        latencyMs: l.latencyMs,
        tokens: l.tokens ?? null,
        response: l.response.slice(0, 220),
        ts: l._creationTime,
      }));

    return {
      totals: {
        users: users.length,
        reads: logs.filter((l) => l.kind === "read").length,
        followups: logs.filter((l) => l.kind === "followup").length,
        flagged,
        avgLatency,
      },
      funnel,
      confusionMap,
      recent,
    };
  },
});
