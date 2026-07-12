// WhatsApp-wallpaper-style doodles: tiny finance + AI motifs, calm + low-key.
// Fixed behind all content, very low opacity.
export function DoodleBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-70">
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="eyefin-doodles"
            width="184"
            height="184"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="var(--accent)"
              strokeOpacity="0.11"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* rising chart */}
              <polyline points="14,44 28,32 40,39 56,18" />
              <path d="M56 18 l-7 1 M56 18 l-1 7" />
              {/* eye (the EyeFin motif) */}
              <path d="M104 28 q11 -9 22 0 q-11 9 -22 0Z" />
              <circle cx="115" cy="28" r="2.6" fill="var(--accent-2)" stroke="none" />
              {/* AI spark */}
              <path
                d="M160 34 l0 -11 M160 34 l0 11 M160 34 l-10 0 M160 34 l10 0"
                stroke="var(--accent-3)"
                strokeOpacity="0.14"
              />
              <path d="M154 22 l4 4 M166 22 l-4 4" stroke="var(--accent-3)" strokeOpacity="0.1" />
              {/* candlesticks */}
              <path d="M30 104 l0 30 M30 110 h9 v16 h-9 Z" />
              <path d="M48 100 l0 34 M48 106 h9 v18 h-9 Z" />
              {/* neural nodes (the "AI in the hood") */}
              <circle cx="128" cy="112" r="3.2" />
              <circle cx="152" cy="102" r="3.2" />
              <circle cx="144" cy="128" r="3.2" />
              <path
                d="M128 112 L152 102 M128 112 L144 128 M152 102 L144 128"
                strokeOpacity="0.07"
              />
              {/* rupee */}
              <path d="M16 148 h13 M16 155 h13 M20 148 c9 0 9 11 0 11 h-4 l9 9" />
              {/* growth arrow (getting better) */}
              <path
                d="M162 162 l0 -17 M162 145 l-5 5 M162 145 l5 5"
                stroke="var(--emerald)"
                strokeOpacity="0.16"
              />
              {/* small sparkle */}
              <path d="M92 150 l0 -7 M92 150 l0 7 M92 150 l-7 0 M92 150 l7 0" strokeOpacity="0.09" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#eyefin-doodles)" />
      </svg>
    </div>
  );
}
