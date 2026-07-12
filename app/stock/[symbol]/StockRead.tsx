"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/lib/useUser";
import { Id } from "@/convex/_generated/dataModel";

type Read = {
  name: string;
  symbol: string;
  price: { price: number; changePct: number; prev: number; currency: string } | null;
  cards: { happening: string; context: string; watch: string };
  guardrailFlag: boolean;
};

export function StockRead({ symbol, name }: { symbol: string; name: string }) {
  const userId = useUser();
  const generate = useAction(api.reads.generateRead);
  const addWatch = useMutation(api.users.addToWatchlist);
  const logEvent = useMutation(api.users.logEvent);

  const [read, setRead] = useState<Read | null>(null);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(false);
  const loaded = useRef(false);

  async function load(simpler = false) {
    setLoading(true);
    try {
      const r = await generate({
        symbol,
        name,
        userId: userId ?? undefined,
        simpler,
      });
      setRead(r as Read);
    } finally {
      setLoading(false);
    }
  }

  // Load the read once on mount.
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log the view once the user id resolves.
  useEffect(() => {
    if (userId) logEvent({ userId, type: "view", symbol });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const price = read?.price;

  return (
    <div className="relative mt-4">
      <div className="glow" />
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-3xl font-medium">{name}</h1>
        {price && (
          <span
            className={`text-sm font-medium ${
              price.changePct >= 0 ? "text-up" : "text-down"
            }`}
          >
            ₹{price.price?.toFixed(2)} · {price.changePct >= 0 ? "+" : ""}
            {price.changePct?.toFixed(2)}%
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-border shimmer"
            />
          ))}
          <p className="text-sm text-muted">
            <span className="text-accent2">✦</span> EyeFin is reading the market
            for you…
          </p>
        </div>
      ) : read ? (
        <>
          <div className="mt-6 space-y-3 rise">
            <Card label="What's happening" text={read.cards.happening} tone="blue" />
            <Card label="The context" text={read.cards.context} tone="emerald" />
            <Card label="What a beginner should notice" text={read.cards.watch} tone="amber" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (userId) logEvent({ userId, type: "didnt_understand", symbol });
                load(true);
              }}
              className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-accent"
            >
              I didn&apos;t get that — explain it more simply
            </button>
            <button
              onClick={async () => {
                if (userId) {
                  await addWatch({ userId, symbol });
                  setWatched(true);
                }
              }}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              {watched ? "✓ Watching" : "Add to watchlist"}
            </button>
            <Link
              href="/join"
              className="rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              Save my journey →
            </Link>
          </div>

          <FollowUp symbol={symbol} name={name} userId={userId} />

          <p className="mt-6 text-xs text-muted">
            Educational only — not a recommendation to buy or sell.
          </p>
        </>
      ) : (
        <p className="mt-6 text-muted">Couldn&apos;t load this one right now. Try another.</p>
      )}
    </div>
  );
}

const CHIPS = [
  "What's going on with it?",
  "Is this a big or risky company?",
  "What should a beginner watch here?",
];

function FollowUp({
  symbol,
  name,
  userId,
}: {
  symbol: string;
  name: string;
  userId: Id<"users"> | null;
}) {
  const ask = useAction(api.reads.askFollowup);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);

  async function submit(question: string) {
    const text = question.trim();
    if (!text || loading || asked) return;
    setLoading(true);
    try {
      const r = await ask({ symbol, name, question: text, userId: userId ?? undefined });
      setAnswer(r.answer);
      setAsked(true);
    } catch {
      setAnswer("Couldn't answer that one right now — try again in a moment.");
      setAsked(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
      <div className="mb-2 font-display text-xs uppercase tracking-[0.15em] text-accent2">
        Ask one thing
      </div>

      {!asked && (
        <>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setQ(c);
                  submit(c);
                }}
                disabled={loading}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-ink disabled:opacity-40"
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit(q);
              }}
              placeholder="…or ask your own"
              disabled={loading}
              className="flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={() => submit(q)}
              disabled={loading || !q.trim()}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Ask
            </button>
          </div>
        </>
      )}

      {loading && (
        <p className="mt-2 text-sm text-muted">
          <span className="text-accent2">✦</span> thinking…
        </p>
      )}

      {answer && !loading && (
        <div className="mt-1">
          <p className="leading-relaxed text-ink">{answer}</p>
          <p className="mt-3 text-sm text-muted">
            That&apos;s your one free question here.{" "}
            <Link href="/join" className="text-emerald hover:underline">
              Sign up to keep asking →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

const TONES: Record<string, string> = {
  blue: "text-accent",
  emerald: "text-emerald",
  amber: "text-amber",
};

function Card({
  label,
  text,
  tone = "blue",
}: {
  label: string;
  text: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-muted">
      <div
        className={`mb-1.5 font-display text-xs uppercase tracking-[0.15em] ${TONES[tone]}`}
      >
        {label}
      </div>
      <p className="leading-relaxed text-ink">{text}</p>
    </div>
  );
}
