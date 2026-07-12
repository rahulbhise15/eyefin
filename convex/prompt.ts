// ═══════════════════════════════════════════════════════════════════════
//  EDIT THIS FILE to tune HOW EyeFin explains stocks.
//  (The hard safety rules — no advice — and the tone live in guardrail.ts
//   and should stay put. This file controls quality, length, and the
//   reading level that grows with the user.)
//  Change it, save — `npx convex dev` auto-deploys it. No other step.
// ═══════════════════════════════════════════════════════════════════════

// The explanation gets more advanced as the user interacts more with EyeFin.
// `level` is derived from how many things the user has done (see reads.ts).
export function levelGuide(level: number): string {
  if (level <= 1) {
    return `The reader is a COMPLETE beginner, likely on their first visit. Explain like to a smart friend who has NEVER invested. Use only everyday words. If you must use any finance word (revenue, profit, results, sector), define it in the same breath in plain language. Walk the cause-and-effect one small step at a time. Be warm and reassuring — assume zero prior knowledge.`;
  }
  if (level <= 3) {
    return `The reader has looked at a handful of stocks. Keep it simple and concrete, but you may introduce ONE real concept properly this time (e.g. what a P/E ratio is, or how quarterly results work) with a one-line plain definition, and tie the cause-and-effect to it.`;
  }
  return `The reader is a returning learner who is growing. You may use standard market vocabulary (with a quick gloss the first time it appears) and connect this specific move to broader dynamics — the sector, the macro picture (interest rates, oil), or the results cycle. Still clear and jargon-light; never a research report.`;
}

export function buildReadPrompt(opts: {
  name: string;
  symbol: string;
  dataBlock: string;
  level: number;
  simpler?: boolean;
}): string {
  const { name, dataBlock, level, simpler } = opts;
  const levelNote = simpler
    ? levelGuide(1) +
      " IMPORTANT: the reader just tapped 'I didn't get that' — go EVEN simpler and more concrete than usual, with a tiny everyday analogy."
    : levelGuide(level);

  return `You are explaining ${name} to a nervous Indian beginner who finds the stock market intimidating.

READER LEVEL: ${levelNote}

Return JSON with exactly these keys. Each value is a SHORT PARAGRAPH of about 3–4 sentences (roughly 55–100 words) — long enough to actually teach the cause-and-effect, not a vague one-liner:
{
 "happening": "In plain words, what has actually been going on with this stock recently. Describe the concrete situation (use the real price move), not abstract phrases.",
 "why": "Spell out the cause-and-effect step by step and concretely: what happened in the real world → WHY that specifically affects THIS company's money or business → SO how the stock reacted. Name the actual mechanism (e.g. 'higher oil prices raise fuel costs, so airlines earn less profit, so their share price fell'). If the data doesn't show a clear reason, say so honestly and then explain, plainly, what usually moves a company like this.",
 "watch": "What a beginner should NOTICE going forward, and how to think about it — including one specific thing that could go wrong. Teach them WHAT to look for. Never tell them to buy, sell, or hold."
}

Style: concrete over abstract, real mechanisms not buzzwords, warm and calm, zero hype. Use ONLY the data below — never invent numbers or events.

DATA:
${dataBlock}`;
}
