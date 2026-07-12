"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, useAnonId } from "@/lib/useUser";

const BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT || "EyeFinBot";

export default function JoinPage() {
  const userId = useUser();
  const anonId = useAnonId();
  const me = useQuery(api.users.getMe, userId ? { userId } : "skip");
  const saveEmail = useMutation(api.users.saveEmail);

  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const done = !!me?.hasEmail;

  async function submit() {
    if (!userId || saving) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("That doesn't look like an email — mind checking?");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveEmail({ userId, email });
    } catch {
      setError("Couldn't save that — try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  const tgLink = `https://t.me/${BOT}?start=${encodeURIComponent(anonId)}`;

  return (
    <main className="relative mx-auto w-full max-w-xl px-5 py-12">
      <div className="glow" />
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← back
      </Link>

      <h1 className="mt-5 text-3xl font-medium">
        Keep <span className="gradient-text">what you&apos;re learning.</span>
      </h1>
      <p className="mt-3 max-w-md text-muted">
        Your watchlist and everything EyeFin has learned about you stays put —
        and gets sharper each time you come back. No password. No spam.
      </p>

      {/* Email — the simple, reliable way in */}
      <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-2 font-display text-xs uppercase tracking-[0.15em] text-accent2">
          Save my spot
        </div>
        {done ? (
          <p className="text-ink">
            ✓ You&apos;re in as <span className="text-emerald">{me?.email}</span>.
            Your journey is saved.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder="you@email.com"
                className="flex-1 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={submit}
                disabled={saving || !email.trim()}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save my journey"}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-down">{error}</p>}
          </>
        )}
      </div>

      {/* Telegram — the daily habit via Hermes */}
      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-2 font-display text-xs uppercase tracking-[0.15em] text-accent3">
          Get a calm daily brief
        </div>
        <p className="mb-3 text-sm text-muted">
          {me?.hasTelegram
            ? "✓ Telegram connected — your morning brief is on."
            : "Connect Telegram and EyeFin sends one short, plain-English note each morning about the stocks you're watching. Never a tip."}
        </p>
        {!me?.hasTelegram && (
          <a
            href={tgLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-xl border border-accent3 px-5 py-2.5 text-sm font-medium text-accent3 transition-colors hover:bg-accent3/10"
          >
            Connect Telegram →
          </a>
        )}
      </div>

      <p className="mt-6 text-xs text-muted">
        EyeFin is educational only. We explain what&apos;s happening — we never
        tell you to buy or sell.
      </p>
    </main>
  );
}
