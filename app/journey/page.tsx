"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/lib/useUser";
import { bySymbol } from "@/lib/stocks";

const LEVEL_LABEL = ["", "Just getting started", "Finding your feet", "Reading the market"];
const LEVEL_NOTE = [
  "",
  "Everything is explained from the ground up.",
  "Explanations are growing a little more detailed as you go.",
  "You're getting the fuller picture now — cause and effect.",
];

const VERB: Record<string, string> = {
  view: "read",
  followup: "asked about",
  didnt_understand: "asked for a simpler take on",
  watch: "started watching",
  onboard: "told us who you are",
  signup: "saved your journey",
  telegram_connect: "connected Telegram",
};

export default function JourneyPage() {
  const userId = useUser();
  const j = useQuery(api.journey.getJourney, userId ? { userId } : "skip");

  return (
    <main className="relative mx-auto w-full max-w-xl px-5 py-10">
      <div className="glow" />
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← home
      </Link>
      <h1 className="mt-4 text-3xl font-medium">
        Your <span className="gradient-text">journey</span>
      </h1>

      {j === undefined ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : !j.started ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="text-muted">
            Your journey begins the second you read your first stock.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block font-display text-sm text-emerald"
          >
            Explore a stock →
          </Link>
        </div>
      ) : (
        <>
          {/* Reading level */}
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
            <div className="font-display text-xs uppercase tracking-[0.15em] text-accent2">
              Where you are
            </div>
            <div className="mt-1 text-xl font-medium">{LEVEL_LABEL[j.level]}</div>
            <p className="mt-1 text-sm text-muted">{LEVEL_NOTE[j.level]}</p>
            <div className="mt-3 flex gap-1.5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 flex-1 rounded-full ${
                    n <= j.level ? "bg-accent" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat n={j.stats.explored} label="stocks explored" />
            <Stat n={j.stats.questions} label="questions asked" />
            <Stat n={j.stats.watchlisted} label="on your watchlist" />
          </div>

          {/* Stocks touched */}
          {j.stocks.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 font-display text-xs uppercase tracking-[0.22em] text-muted">
                Stocks you&apos;ve met
              </h2>
              <div className="flex flex-wrap gap-2">
                {j.stocks.map((s) => (
                  <Link
                    key={s.symbol}
                    href={`/stock/${s.symbol}`}
                    className="rounded-full border border-border px-3.5 py-2 text-sm text-ink transition-colors hover:border-accent"
                  >
                    {bySymbol(s.symbol)?.name ?? s.symbol.replace(".NS", "")}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="mt-6">
            <h2 className="mb-3 font-display text-xs uppercase tracking-[0.22em] text-muted">
              Lately
            </h2>
            <div className="space-y-2">
              {j.recent.map((e, i) => {
                const name = e.symbol
                  ? bySymbol(e.symbol)?.name ?? e.symbol.replace(".NS", "")
                  : "";
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                  >
                    <span className="text-accent2">✦</span>
                    <span className="text-ink">
                      You {VERB[e.type] ?? e.type}
                      {name ? ` ${name}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-surface p-5 text-center">
            <p className="text-sm text-muted">
              Keep this — and let EyeFin learn you further.
            </p>
            <Link
              href="/join"
              className="mt-3 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
            >
              Save my journey →
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 text-center">
      <div className="text-2xl font-medium gradient-text">{n}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
