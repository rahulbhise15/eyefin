"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { bySymbol } from "@/lib/stocks";

function name(sym: string) {
  return bySymbol(sym)?.name ?? sym.replace(".NS", "");
}

export default function AdminPage() {
  const d = useQuery(api.admin.insights, {});

  return (
    <main className="relative mx-auto w-full max-w-3xl px-5 py-10">
      <div className="glow" />
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← home
      </Link>
      <h1 className="mt-4 text-3xl font-medium">
        EyeFin <span className="gradient-text">insights</span>
      </h1>
      <p className="mt-2 text-sm text-muted">
        The funnel, where beginners get confused, and every AI answer with its
        safety flag.
      </p>

      {d === undefined ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <>
          {/* Totals */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat n={d.totals.users} label="users" />
            <Stat n={d.totals.reads} label="reads" />
            <Stat n={d.totals.followups} label="questions" />
            <Stat n={d.totals.flagged} label="flagged" warn={d.totals.flagged > 0} />
            <Stat n={`${d.totals.avgLatency}ms`} label="avg latency" />
          </div>

          {/* Funnel */}
          <Section title="Signup funnel">
            <div className="space-y-2">
              {d.funnel.map((f) => {
                const top = d.funnel[0].n || 1;
                const pct = Math.round((f.n / top) * 100);
                return (
                  <div key={f.stage} className="flex items-center gap-3">
                    <div className="w-40 shrink-0 text-sm text-muted">{f.stage}</div>
                    <div className="h-6 flex-1 overflow-hidden rounded-md bg-border/40">
                      <div
                        className="flex h-full items-center rounded-md bg-accent/70 px-2 text-xs font-medium text-white"
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      >
                        {f.n}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Confusion map */}
          <Section title="Confusion map — where beginners needed help">
            {d.confusionMap.length === 0 ? (
              <p className="text-sm text-muted">No confusion signals yet.</p>
            ) : (
              <div className="space-y-2">
                {d.confusionMap.map((c) => (
                  <div
                    key={c.symbol}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium">{name(c.symbol)}</span>
                    <span className="text-muted">
                      {c.simpler} simpler · {c.questions} questions
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* AI logs */}
          <Section title="Recent AI answers">
            <div className="space-y-2">
              {d.recent.map((l, i) => (
                <div
                  key={i}
                  className={`rounded-xl border bg-surface p-3 text-sm ${
                    l.guardrailFlag ? "border-down" : "border-border"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted">
                    <span className="rounded bg-border/50 px-1.5 py-0.5 font-display uppercase tracking-wide">
                      {l.kind}
                    </span>
                    <span>{name(l.symbol)}</span>
                    <span>· {l.latencyMs}ms</span>
                    {l.tokens != null && <span>· {l.tokens} tok</span>}
                    {l.guardrailFlag && (
                      <span className="ml-auto font-medium text-down">⚑ flagged</span>
                    )}
                  </div>
                  <p className="leading-relaxed text-ink/90">{l.response}…</p>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </main>
  );
}

function Stat({
  n,
  label,
  warn = false,
}: {
  n: number | string;
  label: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 text-center">
      <div className={`text-2xl font-medium ${warn ? "text-down" : "gradient-text"}`}>
        {n}
      </div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-display text-xs uppercase tracking-[0.22em] text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}
