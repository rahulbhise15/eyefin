"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/lib/useUser";
import { ONBOARDING_TAGS, rankByTags, matchReason } from "@/lib/tags";
import { SearchBox } from "./SearchBox";

export function ExploreSection() {
  const userId = useUser();
  const saved = useQuery(api.users.getTags, userId ? { userId } : "skip");
  const saveTags = useMutation(api.users.saveTags);

  const [tags, setTags] = useState<string[]>([]);
  const [picking, setPicking] = useState(false);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [decided, setDecided] = useState(false);

  // Decide once, when saved tags first load: a returning user with tags skips
  // the picker; a fresh visitor sees it.
  useEffect(() => {
    if (saved === undefined || decided) return;
    setDecided(true);
    if (saved.length) setTags(saved);
    else setPicking(true);
  }, [saved, decided]);

  function toggle(t: string) {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  async function finish() {
    const picked = [...chosen];
    setTags(picked);
    setPicking(false);
    if (userId && picked.length) await saveTags({ userId, tags: picked });
  }

  if (picking) {
    return (
      <section className="rise">
        <h2 className="mb-2 font-display text-xs uppercase tracking-[0.22em] text-muted">
          Quick — who are you?
        </h2>
        <p className="mb-4 text-sm text-muted">
          Tap whatever fits (or skip). We&apos;ll line up the stocks that suit
          you — no wrong answers.
        </p>
        <div className="flex flex-wrap gap-2">
          {ONBOARDING_TAGS.map((t) => {
            const on = chosen.has(t);
            return (
              <button
                key={t}
                onClick={() => toggle(t)}
                className={`rounded-full border px-3.5 py-2 text-sm transition-all ${
                  on
                    ? "border-accent bg-accent/15 text-ink"
                    : "border-border text-muted hover:border-muted hover:text-ink"
                }`}
              >
                {on ? "✓ " : ""}
                {t}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={finish}
            disabled={chosen.size === 0}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            Show me stocks →
          </button>
          <button
            onClick={() => {
              setTags([]);
              setPicking(false);
            }}
            className="text-sm text-muted hover:text-ink"
          >
            skip
          </button>
        </div>
      </section>
    );
  }

  const ranked = rankByTags(tags);

  return (
    <section className="rise">
      <div className="mb-5">
        <div className="mb-2 font-display text-xs uppercase tracking-[0.22em] text-muted">
          Search any Indian stock
        </div>
        <SearchBox />
      </div>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xs uppercase tracking-[0.22em] text-muted">
          {tags.length ? "Lined up for you" : "Start with one you know"}
        </h2>
        {tags.length > 0 && (
          <button
            onClick={() => {
              setChosen(new Set(tags));
              setPicking(true);
            }}
            className="text-xs text-muted hover:text-ink"
          >
            edit
          </button>
        )}
      </div>
      <div className="grid gap-3">
        {ranked.map((s) => {
          const reason = tags.length ? matchReason(s, tags) : null;
          return (
            <Link
              key={s.symbol}
              href={`/stock/${s.symbol}`}
              className="group block rounded-2xl border border-border bg-surface p-4 transition-all hover:border-accent hover:bg-surface2"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-muted">{s.blurb}</div>
                  {reason && (
                    <div className="mt-1.5 text-xs text-accent2">
                      because you said “{reason}”
                    </div>
                  )}
                </div>
                <span className="whitespace-nowrap font-display text-sm text-emerald opacity-70 transition-opacity group-hover:opacity-100">
                  Understand →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
