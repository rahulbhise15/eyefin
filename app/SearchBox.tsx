"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

type Hit = { symbol: string; name: string };

// Rookie-friendly: search by the company name you know (Reliance, SBI, Zomato),
// not the ticker. Results drop down cleanly; tap one to open its read.
export function SearchBox() {
  const router = useRouter();
  const search = useAction(api.search.searchStocks);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Debounced search as they type.
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setHits([]);
      setLoading(false);
      setSearched(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await search({ q: query });
        setHits(r as Hit[]);
        setSearched(true);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, search]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(h: Hit) {
    router.push(`/stock/${encodeURIComponent(h.symbol)}?n=${encodeURIComponent(h.name)}`);
  }

  return (
    <div ref={box} className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
          ⌕
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length > 0 && setOpen(true)}
          placeholder="Search a company — e.g. Reliance, SBI, Zomato"
          className="w-full rounded-xl border border-border bg-surface py-3 pl-9 pr-9 text-sm outline-none transition-colors focus:border-accent"
        />
        {loading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-accent2">
            ✦
          </span>
        )}
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
          {hits.length > 0 ? (
            hits.map((h) => (
              <button
                key={h.symbol}
                onClick={() => go(h)}
                className="flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface2"
              >
                <span className="text-ink">{h.name}</span>
                <span className="whitespace-nowrap font-display text-xs text-muted">
                  {h.symbol.replace(".NS", "")} · NSE
                </span>
              </button>
            ))
          ) : loading ? (
            <div className="px-4 py-3 text-sm text-muted">Searching…</div>
          ) : searched ? (
            <div className="px-4 py-3 text-sm text-muted">
              No match — try the company&apos;s common name (e.g. &ldquo;Infosys&rdquo;).
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
