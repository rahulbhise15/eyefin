// The MVP universe: liquid large-caps across sectors where free data is
// reliable. Wider than the first 5 so onboarding tags actually filter to a
// real, sector-specific lineup (see lib/tags.ts).
export type HeroStock = {
  symbol: string;   // yfinance symbol (NSE = .NS)
  name: string;     // display name
  blurb: string;    // one-line, plain-English "what this company is"
  tags: string[];   // themes, matched against onboarding tags
};

export const HERO_STOCKS: HeroStock[] = [
  // Banking
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", blurb: "India's largest private bank.", tags: ["Banking", "Big trusted names", "Steady, not risky"] },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", blurb: "One of India's largest private banks.", tags: ["Banking", "Big trusted names", "Steady, not risky"] },
  { symbol: "SBIN.NS", name: "State Bank of India", blurb: "India's biggest public-sector bank.", tags: ["Banking", "Big trusted names", "In the news"] },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", blurb: "A large, well-run private bank.", tags: ["Banking", "Steady, not risky"] },
  { symbol: "AXISBANK.NS", name: "Axis Bank", blurb: "A major private-sector bank.", tags: ["Banking"] },

  // Tech & IT
  { symbol: "TCS.NS", name: "Tata Consultancy Services", blurb: "India's biggest IT services company.", tags: ["Tech & IT", "Big trusted names", "Long-term"] },
  { symbol: "INFY.NS", name: "Infosys", blurb: "Major IT services and consulting firm.", tags: ["Tech & IT", "Long-term", "In the news"] },
  { symbol: "WIPRO.NS", name: "Wipro", blurb: "Large global IT services company.", tags: ["Tech & IT", "Long-term"] },
  { symbol: "HCLTECH.NS", name: "HCL Technologies", blurb: "One of India's top IT services firms.", tags: ["Tech & IT", "Long-term"] },
  { symbol: "TECHM.NS", name: "Tech Mahindra", blurb: "IT services with a telecom focus.", tags: ["Tech & IT"] },

  // Shops & brands (consumer)
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", blurb: "Everyday brands — soaps, tea, shampoo.", tags: ["Shops & brands", "Big trusted names", "Steady, not risky"] },
  { symbol: "ITC.NS", name: "ITC", blurb: "Cigarettes, foods (Aashirvaad, Sunfeast), hotels.", tags: ["Shops & brands", "Big trusted names", "In the news"] },
  { symbol: "NESTLEIND.NS", name: "Nestlé India", blurb: "Maggi, KitKat, Nescafé maker.", tags: ["Shops & brands", "Steady, not risky", "Long-term"] },
  { symbol: "DMART.NS", name: "Avenue Supermarts (DMart)", blurb: "The DMart discount-retail chain.", tags: ["Shops & brands", "In the news"] },

  // Energy & power
  { symbol: "RELIANCE.NS", name: "Reliance Industries", blurb: "Oil-to-telecom-to-retail giant (Jio, Reliance Retail).", tags: ["Energy", "Shops & brands", "Big trusted names", "In the news"] },
  { symbol: "NTPC.NS", name: "NTPC", blurb: "India's largest power generator.", tags: ["Energy", "Steady, not risky"] },
  { symbol: "POWERGRID.NS", name: "Power Grid", blurb: "Runs India's electricity transmission network.", tags: ["Energy", "Steady, not risky"] },

  // Autos & names people know
  { symbol: "MARUTI.NS", name: "Maruti Suzuki", blurb: "India's biggest carmaker.", tags: ["Big trusted names", "Shops & brands"] },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", blurb: "Cars and trucks (owns Jaguar Land Rover).", tags: ["In the news", "Big trusted names"] },
];

// A curated beginner default when no tags are chosen — the classic names.
export const DEFAULT_EXPLORE = [
  "HDFCBANK.NS", "RELIANCE.NS", "TCS.NS", "INFY.NS", "ITC.NS", "ICICIBANK.NS",
];

export const bySymbol = (s: string) =>
  HERO_STOCKS.find((h) => h.symbol.toLowerCase() === s.toLowerCase());
