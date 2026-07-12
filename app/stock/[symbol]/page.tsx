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
          <Link href="/join" className="text-sm font-medium text-emerald hover:underline">
            join →
          </Link>
        </div>
      </div>
      <StockRead symbol={symbol} name={name} />
    </main>
  );
}
