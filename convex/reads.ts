import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { SYSTEM_PROMPT, scanForAdvice } from "./guardrail";
import { buildReadPrompt } from "./prompt";

// ── external data ──────────────────────────────────────────────────────
async function fetchPrice(symbol: string) {
  const r = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?range=5d&interval=1d`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );
  if (!r.ok) throw new Error(`price ${r.status}`);
  const j = await r.json();
  const meta = j?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error("no price meta");
  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose ?? meta.previousClose;
  const changePct = prev ? ((price - prev) / prev) * 100 : 0;
  return { price, prev, changePct, currency: meta.currency ?? "INR" };
}

async function fetchNews(query: string, apiKey: string): Promise<string> {
  const r = await fetch("https://api.linkup.so/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ q: query, depth: "standard", outputType: "sourcedAnswer" }),
  });
  if (!r.ok) throw new Error(`linkup ${r.status}`);
  const j = await r.json();
  return (j?.answer ?? "").toString().slice(0, 1800);
}

async function callOpenAI(
  system: string,
  user: string,
  apiKey: string,
  json = true
) {
  const payload: Record<string, unknown> = {
    model: "gpt-5.6-sol",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  if (json) payload.response_format = { type: "json_object" };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`openai ${r.status}: ${JSON.stringify(j).slice(0, 200)}`);
  return {
    content: j?.choices?.[0]?.message?.content ?? "",
    tokens: j?.usage?.total_tokens as number | undefined,
  };
}

// ── the read ───────────────────────────────────────────────────────────
export const generateRead = action({
  args: {
    symbol: v.string(),
    name: v.string(),
    userId: v.optional(v.id("users")),
    simpler: v.optional(v.boolean()),
  },
  handler: async (ctx, { symbol, name, userId, simpler }) => {
    const start = Date.now();
    const openaiKey = process.env.OPENAI_API_KEY;
    const linkupKey = process.env.LINKUP_API_KEY;
    if (!openaiKey)
      throw new Error("OPENAI_API_KEY not set — run: npx convex env set OPENAI_API_KEY sk-...");

    // Reading level grows with how much the user has interacted.
    let level = 1;
    if (userId) {
      const count = await ctx.runQuery(internal.reads.countEvents, { userId });
      level = count < 3 ? 1 : count < 12 ? 2 : 3;
    }

    const price = await fetchPrice(symbol).catch(() => null);
    const news = linkupKey
      ? await fetchNews(
          `${name} (${symbol}) share price — what happened recently and why it moved, India NSE, last few days`,
          linkupKey
        ).catch(() => "")
      : "";

    const dataBlock = `Stock: ${name} (${symbol})
Latest price: ${
      price
        ? `₹${price.price?.toFixed(2)} (${price.changePct >= 0 ? "+" : ""}${price.changePct?.toFixed(2)}% vs previous close of ₹${price.prev?.toFixed(2)})`
        : "unavailable"
    }
Recent news / context:
${news || "No fresh news available today."}`;

    const userPrompt = buildReadPrompt({ name, symbol, dataBlock, level, simpler });

    const { content, tokens } = await callOpenAI(SYSTEM_PROMPT, userPrompt, openaiKey);
    let cards = { happening: "", why: "", watch: "" };
    try {
      cards = { ...cards, ...JSON.parse(content) };
    } catch {
      cards.happening = content.slice(0, 600);
    }

    const flag = scanForAdvice(`${cards.happening} ${cards.why} ${cards.watch}`);
    await ctx.runMutation(internal.reads.logAi, {
      userId,
      kind: "read",
      symbol,
      prompt: userPrompt,
      response: JSON.stringify(cards),
      latencyMs: Date.now() - start,
      tokens,
      sourceData: dataBlock,
      guardrailFlag: flag,
    });

    return { name, symbol, price, cards, guardrailFlag: flag, level };
  },
});

// ── one follow-up question per read (guardrailed, domain-locked) ────────
export const askFollowup = action({
  args: {
    symbol: v.string(),
    name: v.string(),
    question: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { symbol, name, question, userId }) => {
    const start = Date.now();
    const openaiKey = process.env.OPENAI_API_KEY;
    const linkupKey = process.env.LINKUP_API_KEY;
    if (!openaiKey) throw new Error("OPENAI_API_KEY not set");

    const price = await fetchPrice(symbol).catch(() => null);
    const news = linkupKey
      ? await fetchNews(`${name} (${symbol}) stock India recent news`, linkupKey).catch(() => "")
      : "";
    const context = `Stock: ${name} (${symbol}). Price: ${
      price ? `₹${price.price?.toFixed(2)} (${price.changePct?.toFixed(2)}%)` : "n/a"
    }. Recent news: ${news || "none available"}`;

    const userPrompt = `A nervous beginner is looking at ${name} and asks: "${question}"

Answer in 2–4 plain, warm sentences a beginner can follow. Use the context below only where relevant.
- If they ask whether to buy / sell / hold, DO NOT advise — instead explain what to UNDERSTAND so they can decide for themselves.
- If the question is off-topic (not about this stock, the market, or basic investing), gently say you can only help them understand stocks.
- Never invent numbers or events.

CONTEXT: ${context}`;

    const { content, tokens } = await callOpenAI(SYSTEM_PROMPT, userPrompt, openaiKey, false);
    const answer = (content || "").trim();
    const flag = scanForAdvice(answer);

    await ctx.runMutation(internal.reads.logAi, {
      userId,
      kind: "followup",
      symbol,
      prompt: `Q: ${question}\n\n${userPrompt}`,
      response: answer,
      latencyMs: Date.now() - start,
      tokens,
      sourceData: context,
      guardrailFlag: flag,
    });
    if (userId)
      await ctx.runMutation(internal.reads.logFollowupEvent, { userId, symbol, question });

    return { answer, guardrailFlag: flag };
  },
});

export const logFollowupEvent = internalMutation({
  args: { userId: v.id("users"), symbol: v.string(), question: v.string() },
  handler: async (ctx, { userId, symbol, question }) => {
    await ctx.db.insert("events", {
      userId,
      type: "followup",
      symbol,
      meta: { question },
    });
  },
});

export const countEvents = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows.length;
  },
});

export const logAi = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    kind: v.string(),
    symbol: v.string(),
    prompt: v.string(),
    response: v.string(),
    latencyMs: v.number(),
    tokens: v.optional(v.number()),
    sourceData: v.optional(v.string()),
    guardrailFlag: v.boolean(),
  },
  handler: async (ctx, a) => {
    await ctx.db.insert("aiLogs", a);
  },
});
