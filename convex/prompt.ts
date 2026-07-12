// ═══════════════════════════════════════════════════════════════════════
//  EDIT THIS FILE to tune HOW EyeFin explains stocks.
//  (The hard safety rules — no advice — and the tone live in guardrail.ts
//   and should stay put. This file controls quality, length, and the
//   reading level that grows with the user.)
//  Change it, save — `npx convex dev` auto-deploys it. No other step.
//
//  PRINCIPLE: we never claim to KNOW why a stock moved — no one can. We
//  describe what's happening and the context/story around it, honestly.
// ═══════════════════════════════════════════════════════════════════════

// The explanation gets more advanced as the user interacts more with EyeFin.
// `level` is derived from how many things the user has done (see reads.ts).
export function levelGuide(level: number): string {
  if (level <= 1) {
    return `The reader is a COMPLETE beginner, likely on their first visit. Explain like to a smart friend who has NEVER invested. Use only everyday words. If you must use any finance word (revenue, profit, results, sector), define it in the same breath in plain language. Walk through what's going on one small step at a time. Be warm and reassuring — assume zero prior knowledge.`;
  }
  if (level <= 3) {
    return `The reader has looked at a handful of stocks. Keep it simple and concrete, but you may introduce ONE real concept properly this time (e.g. what a P/E ratio is, or how quarterly results work) with a one-line plain definition, and tie the context to it.`;
  }
  return `The reader is a returning learner who is growing. You may use standard market vocabulary (with a quick gloss the first time it appears) and connect what's happening to broader dynamics — the sector, the macro picture (interest rates, oil), or the results cycle. Still clear and jargon-light; never a research report.`;
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

Return JSON with exactly these keys. Each value is a SHORT PARAGRAPH of about 3–4 sentences (roughly 55–100 words) — long enough to actually teach, not a vague one-liner:
{
 "happening": "In plain words, what has actually been going on with this stock recently. Describe the concrete situation (use the real price move), not abstract phrases.",
 "context": "The backdrop around this stock right now — the news, events, and what's being discussed lately. CRITICAL HONESTY RULE: markets move for many reasons at once and NO ONE can know the true cause of any single move, so present this as the surrounding story, NEVER as 'this is why it moved' or 'this caused it.' Use framing like 'around the same time…', 'what's being talked about is…', 'the backdrop is…'. If there's no clear news, say so plainly and explain what usually shapes a company like this over time. Do not invent a reason to sound confident.",
 "watch": "What a beginner should NOTICE going forward, and how to think about it — including one specific thing that could go wrong. Teach them WHAT to look for. Never tell them to buy, sell, or hold."
}

Style: concrete over abstract, real and honest, warm and calm, zero hype. Never pretend to know causation. Use ONLY the data below — never invent numbers or events.

DATA:
${dataBlock}`;
}
