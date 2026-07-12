import Link from "next/link";
import { bySymbol } from "@/lib/stocks";
import { StockRead } from "./StockRead";

export default async function StockPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: raw } = await params;
  const symbol = decodeURIComponent(raw);
  const stock = bySymbol(symbol);
  const name = stock?.name ?? symbol.replace(".NS", "");

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← back
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/journey" className="text-sm text-muted hover:text-ink">
            journey
          </Link>
          <Link href="/watchlist" className="text-sm text-muted hover:text-ink">
            watchlist
          </Link>
          <Link
            href="/join"
            className="rounded-full bg-emerald px-3.5 py-1.5 text-sm font-semibold text-black"
          >
            Join free
          </Link>
        </div>
      </div>

      {/* Value reminder — why saving matters, right where they're learning */}
      <Link
        href="/join"
        className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald/40 bg-gradient-to-r from-emerald/10 to-accent2/5 px-4 py-2.5 text-sm transition-colors hover:border-emerald"
      >
        <span className="text-ink">
          <span className="text-accent2">✦</span> Understand it here — keep your
          watchlist, a daily brief &amp; a memory that learns you.
        </span>
        <span className="whitespace-nowrap font-semibold text-emerald">Join →</span>
      </Link>

      <StockRead symbol={symbol} name={name} />
    </main>
  );
}
