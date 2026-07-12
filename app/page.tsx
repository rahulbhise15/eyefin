import Link from "next/link";
import { ExploreSection } from "./ExploreSection";

function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="40" height="28" viewBox="0 0 40 28" fill="none" aria-hidden>
        <defs>
          <linearGradient id="eye" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5B90FF" />
            <stop offset="0.5" stopColor="#22D3EE" />
            <stop offset="1" stopColor="#2FE6A8" />
          </linearGradient>
        </defs>
        {/* banknote */}
        <rect x="1.3" y="1.3" width="37.4" height="25.4" rx="4.5" stroke="url(#eye)" strokeWidth="1.7" />
        {/* portrait frame */}
        <ellipse cx="20" cy="14" rx="7.6" ry="8.6" stroke="url(#eye)" strokeWidth="1.2" strokeOpacity="0.45" />
        {/* the eye where the face usually is */}
        <path d="M13.6 14 q6.4 -5.2 12.8 0 q-6.4 5.2 -12.8 0Z" stroke="url(#eye)" strokeWidth="1.5" fill="none" />
        <circle cx="20" cy="14" r="2.5" fill="url(#eye)" />
        {/* corner denominations */}
        <circle cx="6.5" cy="7" r="1.4" stroke="url(#eye)" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="33.5" cy="21" r="1.4" stroke="url(#eye)" strokeWidth="1" strokeOpacity="0.4" />
      </svg>
      <span className="font-display text-lg tracking-tight gradient-text">EyeFin</span>
    </span>
  );
}

export default function Home() {
  return (
    <main className="relative mx-auto w-full max-w-xl px-5 py-12">
      <div className="glow" />

      <header className="mb-12 rise">
        <Logo />
        <h1 className="mt-7 text-[2.7rem] font-medium leading-[1.05]">
          The market,
          <br />
          <span className="gradient-text">finally in plain English.</span>
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted">
          Always meant to start investing but never actually did? You&apos;re not
          alone. Pick a stock — we&apos;ll show you what&apos;s happening and why,
          calmly, one at a time.{" "}
          <span className="text-ink">No tips, ever.</span>
        </p>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <span className="text-accent2">✦</span> Backed by a memory that learns
          you — it gets sharper every time you come back.
        </p>
      </header>

      <ExploreSection />

      <section className="mt-10 rounded-2xl border border-border bg-surface p-5 rise">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">Save your journey</div>
            <p className="text-sm text-muted">
              Keep your watchlist and a memory that learns you — free, no
              password.
            </p>
          </div>
          <Link
            href="/join"
            className="whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
          >
            Sign up →
          </Link>
        </div>
      </section>

      <footer className="mt-14 border-t border-border pt-5 text-xs text-muted">
        EyeFin is educational only. We explain what&apos;s happening — we never
        tell you to buy or sell. Not investment advice.
      </footer>
    </main>
  );
}
