import { action, internalAction, internalQuery, ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { SYSTEM_PROMPT, scanForAdvice } from "./guardrail";

// ── small self-contained helpers (kept local so the cron has no coupling) ─
async function priceLine(symbol: string, name: string): Promise<string> {
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        symbol
      )}?range=5d&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const j = await r.json();
    const m = j?.chart?.result?.[0]?.meta;
    if (!m) return `${name}: price unavailable`;
    const price = m.regularMarketPrice;
    const prev = m.chartPreviousClose ?? m.previousClose;
    const pct = prev ? ((price - prev) / prev) * 100 : 0;
    return `${name}: ₹${price?.toFixed(2)} (${pct >= 0 ? "+" : ""}${pct.toFixed(2)}% vs yesterday)`;
  } catch {
    return `${name}: price unavailable`;
  }
}

async function openai(system: string, user: string, key: string): Promise<string> {
  const url =
    process.env.OPENAI_CHAT_URL ||
    "https://api.openai.com/v1/chat/completions";
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-5.6-sol",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`openai ${r.status}`);
  return j?.choices?.[0]?.message?.content ?? "";
}

async function sendTelegram(token: string, chatId: string, text: string) {
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!r.ok) throw new Error(`telegram ${r.status}: ${(await r.text()).slice(0, 160)}`);
}

// Names for the ~5 hero symbols (kept here so this module stays standalone).
const NAMES: Record<string, string> = {
  "HDFCBANK.NS": "HDFC Bank",
  "RELIANCE.NS": "Reliance",
  "TCS.NS": "TCS",
  "INFY.NS": "Infosys",
  "ICICIBANK.NS": "ICICI Bank",
};
const nm = (s: string) => NAMES[s] ?? s.replace(".NS", "");

// ── data the cron reads ──────────────────────────────────────────────────
export const usersWithTelegram = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("telegramId"), undefined))
      .collect();
    return users.map((u) => ({ userId: u._id, telegramId: u.telegramId! }));
  },
});

export const watchlistFor = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows.map((r) => r.symbol);
  },
});

// Build one user's brief text (returns null if they have nothing to watch).
async function buildBrief(
  ctx: ActionCtx,
  userId: Id<"users">,
  openaiKey: string
): Promise<{ text: string; flag: boolean } | null> {
  const symbols = await ctx.runQuery(internal.brief.watchlistFor, { userId });
  if (!symbols.length) return null;

  const lines: string[] = [];
  for (const s of symbols.slice(0, 6)) lines.push(await priceLine(s, nm(s)));

  const prompt = `Write a short, warm morning note (Telegram message, plain text, under 110 words) for a nervous beginner about the stocks they're watching. Cover:
1. In one line each, how each stock moved and, plainly, what's going on around it — never claim that news CAUSED the move; markets move for many reasons and no one knows the true cause.
2. One tiny concept they can learn today (one sentence).
3. End with a gentle reflective question (e.g. "notice anything you'd want to understand better?").
Rules: never tell them to buy, sell, or hold. No emojis overload — at most one. Ground everything in the data below; don't invent numbers.

TODAY'S DATA:
${lines.join("\n")}`;

  const text = (await openai(SYSTEM_PROMPT, prompt, openaiKey)).trim();
  return { text, flag: scanForAdvice(text) };
}

// ── the cron entrypoint ──────────────────────────────────────────────────
export const sendDailyBriefs = internalAction({
  args: {},
  handler: async (ctx) => {
    const openaiKey = process.env.OPENAI_API_KEY;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!openaiKey || !token) {
      console.log("brief: missing OPENAI_API_KEY or TELEGRAM_BOT_TOKEN — skipping");
      return { sent: 0 };
    }
    const recipients = await ctx.runQuery(internal.brief.usersWithTelegram, {});
    let sent = 0;
    for (const r of recipients) {
      try {
        const brief = await buildBrief(ctx, r.userId, openaiKey);
        if (!brief) continue;
        await sendTelegram(token, r.telegramId, `EyeFin — your morning read\n\n${brief.text}`);
        await ctx.runMutation(internal.reads.logAi, {
          userId: r.userId,
          kind: "brief",
          symbol: "*",
          prompt: "daily brief",
          response: brief.text,
          latencyMs: 0,
          guardrailFlag: brief.flag,
        });
        sent++;
      } catch (e) {
        console.log(`brief failed for ${r.userId}:`, (e as Error).message);
      }
    }
    console.log(`brief: sent ${sent}/${recipients.length}`);
    return { sent };
  },
});

// Manual trigger for the live demo — sends this user's brief right now.
export const sendBriefNow = action({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const openaiKey = process.env.OPENAI_API_KEY;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!openaiKey) throw new Error("OPENAI_API_KEY not set");
    const recipients = await ctx.runQuery(internal.brief.usersWithTelegram, {});
    const me = recipients.find((r) => r.userId === userId);
    if (!me) return { ok: false, reason: "no Telegram connected for this user" };
    const brief = await buildBrief(ctx, userId, openaiKey);
    if (!brief) return { ok: false, reason: "empty watchlist" };
    if (token) await sendTelegram(token, me.telegramId, `EyeFin — your morning read\n\n${brief.text}`);
    return { ok: true, preview: brief.text, sentToTelegram: !!token, guardrailFlag: brief.flag };
  },
});
