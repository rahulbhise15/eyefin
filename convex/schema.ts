import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// EyeFin data model. Per-user scoped, structured events, no PII.
export default defineSchema({
  users: defineTable({
    anonId: v.string(),
    email: v.optional(v.string()),
    telegramId: v.optional(v.string()),
  })
    .index("by_anon", ["anonId"])
    .index("by_telegram", ["telegramId"]),

  onboardingTags: defineTable({
    userId: v.id("users"),
    tags: v.array(v.string()),
  }).index("by_user", ["userId"]),

  watchlist: defineTable({
    userId: v.id("users"),
    symbol: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_symbol", ["userId", "symbol"]),

  // The interaction log — every meaningful thing a user does.
  events: defineTable({
    userId: v.id("users"),
    // view | didnt_understand | watch | telegram_connect | followup | brief_open | acted | pro_intent
    type: v.string(),
    symbol: v.optional(v.string()),
    meta: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"]),

  // Every LLM call, for evals / debugging / RCA.
  aiLogs: defineTable({
    userId: v.optional(v.id("users")),
    kind: v.string(), // read | followup
    symbol: v.string(),
    prompt: v.string(),
    response: v.string(),
    latencyMs: v.number(),
    tokens: v.optional(v.number()),
    sourceData: v.optional(v.string()),
    guardrailFlag: v.boolean(), // true if output tripped the advice-scanner
  })
    .index("by_symbol", ["symbol"])
    .index("by_flag", ["guardrailFlag"]),

  proIntent: defineTable({
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
});
