"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/lib/useUser";
import { bySymbol } from "@/lib/stocks";

export default function WatchlistPage() {
  const userId = useUser();
  const items = useQuery(
    api.users.listWatchlist,
    userId ? { userId } : "skip"
  );

  return (
    <main className="relative mx-auto w-full max-w-xl px-5 py-10">
      <div className="glow" />
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← home
      </Link>
      <h1 className="mt-4 text-3xl font-medium">Your watchlist</h1>
      <p className="mt-2 text-muted">
        The stocks you&apos;re getting to know. Tap any to re-read.
      </p>

      <div className="mt-6 grid gap-3">
        {items === undefined ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="text-muted">
              Nothing here yet — your watchlist begins the moment you add your
              first stock.
            </p>
            <Link
              href="/"
              className="mt-3 inline-block font-display text-sm text-emerald"
            >
              Explore stocks →
            </Link>
          </div>
        ) : (
          items.map((it) => {
            const s = bySymbol(it.symbol);
            return (
              <Link
                key={it._id}
                href={`/stock/${it.symbol}`}
                className="group block rounded-2xl border border-border bg-surface p-4 transition-all hover:border-accent hover:bg-surface2"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">
                      {s?.name ?? it.symbol.replace(".NS", "")}
                    </div>
                    <div className="text-sm text-muted">{s?.blurb ?? ""}</div>
                  </div>
                  <span className="whitespace-nowrap font-display text-sm text-emerald opacity-70 transition-opacity group-hover:opacity-100">
                    Re-read →
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}
