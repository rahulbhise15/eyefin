# EyeFin 👁️₹

**The market, finally in plain English.**

An AI investing *companion* for the ~80% of Indians who opened a demat account and froze. EyeFin turns "where do I even start?" into a daily habit of **understanding** — never a tip.

Pick a stock → get a calm, plain-English read:

- **What's happening** · **Why** · **What a beginner should notice**

Then ask one follow-up, save a watchlist, and let a memory that learns you make each read a little sharper. Explanations grow more detailed as you interact.

> EyeFin is educational only. It explains what's happening — it never tells you to buy or sell. Not investment advice.

## Stack

- **Next.js 16** (App Router, TypeScript) — the front door
- **Convex** — database + backend functions + the shared "one brain" (website *and* Hermes read/write it)
- **OpenAI GPT-5.6 Sol** — writes the plain-English reads and follow-ups (guardrailed, no-advice)
- **Hermes** (Nous Research) — Telegram gateway + the daily morning brief
- **Linkup** — live news · **Yahoo Finance** — prices (scoped to liquid large-caps)
- **DataFast** — product analytics

## Guardrails (the whole point)

Every AI answer passes a no-advice system prompt **and** an output scanner (`convex/guardrail.ts`). Anything that looks like "buy / sell / target / you should" is flagged and surfaced in the `/admin` evals dashboard.

## Where the knobs are

- `convex/prompt.ts` — read quality, tone, reading levels
- `convex/guardrail.ts` — safety rules + the advice scanner
- `convex/reads.ts` — the read + follow-up pipeline; reading-level thresholds

Built for the GrowthX Hermes Buildathon.
