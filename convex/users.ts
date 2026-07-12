import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateUser = mutation({
  args: { anonId: v.string() },
  handler: async (ctx, { anonId }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_anon", (q) => q.eq("anonId", anonId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("users", { anonId });
  },
});

export const saveTags = mutation({
  args: { userId: v.id("users"), tags: v.array(v.string()) },
  handler: async (ctx, { userId, tags }) => {
    const existing = await ctx.db
      .query("onboardingTags")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) await ctx.db.patch(existing._id, { tags });
    else await ctx.db.insert("onboardingTags", { userId, tags });
    await ctx.db.insert("events", { userId, type: "onboard", meta: { tags } });
  },
});

export const getTags = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const t = await ctx.db
      .query("onboardingTags")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return t?.tags ?? [];
  },
});

export const addToWatchlist = mutation({
  args: { userId: v.id("users"), symbol: v.string() },
  handler: async (ctx, { userId, symbol }) => {
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_symbol", (q) => q.eq("userId", userId).eq("symbol", symbol))
      .unique();
    if (!existing) await ctx.db.insert("watchlist", { userId, symbol });
    await ctx.db.insert("events", { userId, type: "watch", symbol });
  },
});

export const listWatchlist = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const logEvent = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    symbol: v.optional(v.string()),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, a) => {
    await ctx.db.insert("events", a);
  },
});

// ── signup: email tied to the existing anonymous user (nothing is lost) ──
export const saveEmail = mutation({
  args: { userId: v.id("users"), email: v.string() },
  handler: async (ctx, { userId, email }) => {
    const clean = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) throw new Error("bad email");
    const already = (await ctx.db.get(userId))?.email;
    await ctx.db.patch(userId, { email: clean });
    if (!already) await ctx.db.insert("events", { userId, type: "signup", meta: { via: "email" } });
    return { ok: true };
  },
});

// The current user's signup state — drives the join UI.
export const getMe = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const u = await ctx.db.get(userId);
    if (!u) return null;
    return { hasEmail: !!u.email, hasTelegram: !!u.telegramId, email: u.email ?? null };
  },
});

// Called by Hermes when someone opens the bot via the connect deep-link.
// The `startParam` is the anonId we put in the t.me/...?start= link, so the
// Telegram account stitches onto the same user — watchlist + tags carry over.
export const linkTelegram = mutation({
  args: { anonId: v.string(), telegramId: v.string() },
  handler: async (ctx, { anonId, telegramId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_anon", (q) => q.eq("anonId", anonId))
      .unique();
    if (!user) return { ok: false, reason: "unknown user" };
    await ctx.db.patch(user._id, { telegramId });
    await ctx.db.insert("events", {
      userId: user._id,
      type: "telegram_connect",
      meta: { telegramId },
    });
    return { ok: true, userId: user._id };
  },
});

export const recordProIntent = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.insert("proIntent", { userId });
    await ctx.db.insert("events", { userId, type: "pro_intent" });
  },
});
