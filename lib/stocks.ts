// The MVP universe: a few liquid large-caps where free data is reliable.
// Scoped deliberately (see PRD risk register) so reads are fast + trustworthy.
export type HeroStock = {
  symbol: string;   // yfinance symbol (NSE = .NS)
  name: string;     // display name
  blurb: string;    // one-line, plain-English "what this company is"
  tags: string[];   // themes, matched against onboarding tags
};

export const HERO_STOCKS: HeroStock[] = [
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", blurb: "India's largest private bank.", tags: ["Banking", "Big trusted names", "Steady, not risky"] },
  { symbol: "RELIANCE.NS", name: "Reliance Industries", blurb: "Oil-to-telecom-to-retail giant (Jio, Reliance Retail).", tags: ["Energy", "Shops & brands", "Big trusted names", "In the news"] },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", blurb: "India's biggest IT services company.", tags: ["Tech & IT", "Big trusted names", "Long-term"] },
  { symbol: "INFY.NS", name: "Infosys", blurb: "Major IT services and consulting firm.", tags: ["Tech & IT", "Long-term", "In the news"] },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", blurb: "One of India's largest private banks.", tags: ["Banking", "Big trusted names", "Steady, not risky"] },
];

export const bySymbol = (s: string) =>
  HERO_STOCKS.find((h) => h.symbol.toLowerCase() === s.toLowerCase());
