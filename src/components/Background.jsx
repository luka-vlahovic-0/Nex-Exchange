import { useMemo } from "react";

// Deterministic pseudo-random so the starfield is stable across renders
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Flowing "energy streams" — light pulses travelling along bezier paths.
// Loops seamlessly: dashoffset animates by exactly one dash period.
const STREAMS = [
  { d: "M -60 120 C 320 40, 560 220, 840 140 S 1260 30, 1520 150", duration: "11s", delay: "0s", gradient: "url(#stream-a)" },
  { d: "M -60 320 C 280 240, 520 420, 780 340 S 1220 220, 1520 330", duration: "14s", delay: "-4s", gradient: "url(#stream-b)" },
  { d: "M -60 520 C 340 440, 560 620, 830 540 S 1240 420, 1520 530", duration: "12s", delay: "-8s", gradient: "url(#stream-a)" },
  { d: "M -60 700 C 300 620, 540 800, 810 720 S 1260 600, 1520 710", duration: "16s", delay: "-2s", gradient: "url(#stream-b)" },
  { d: "M -60 860 C 360 790, 580 940, 860 870 S 1280 780, 1520 860", duration: "13s", delay: "-6s", gradient: "url(#stream-c)" },
];

export default function Background() {
  const stars = useMemo(() => {
    const rand = mulberry32(1337);
    return Array.from({ length: 56 }, (_, i) => ({
      id: i,
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      size: rand() * 2 + 1,
      duration: `${rand() * 5 + 3}s`,
      delay: `${rand() * 6}s`,
      min: rand() * 0.1 + 0.05,
      max: rand() * 0.55 + 0.35,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#060411]" aria-hidden="true">
      {/* base vertical wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#120a33] via-[#080517] to-[#03020c]" />

      {/* drifting aurora blobs — transform-only animations, GPU composited */}
      <div className="aurora-blob aurora-violet" />
      <div className="aurora-blob aurora-cyan" />
      <div className="aurora-blob aurora-magenta" />
      <div className="aurora-blob aurora-indigo" />

      {/* flowing energy streams */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="stream-a" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="35%" stopColor="#a78bfa" />
            <stop offset="70%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stream-b" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0" />
            <stop offset="40%" stopColor="#e879f9" />
            <stop offset="75%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stream-c" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="50%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {STREAMS.map((stream, i) => (
          <g key={i}>
            {/* faint rail */}
            <path d={stream.d} stroke={stream.gradient} strokeWidth="1.2" opacity="0.14" />
            {/* travelling pulse */}
            <path
              d={stream.d}
              stroke={stream.gradient}
              strokeWidth="2.4"
              strokeLinecap="round"
              className="flow-pulse"
              style={{ "--flow-duration": stream.duration, "--flow-delay": stream.delay }}
            />
            {/* small comet trailing behind on a different rhythm */}
            <path
              d={stream.d}
              stroke={stream.gradient}
              strokeWidth="1.4"
              strokeLinecap="round"
              className="flow-comet"
              style={{ "--flow-duration": stream.duration, "--flow-delay": `calc(${stream.delay} - 3s)` }}
            />
          </g>
        ))}
      </svg>

      {/* twinkling stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            "--twinkle-duration": star.duration,
            "--twinkle-delay": star.delay,
            "--star-min": star.min,
            "--star-max": star.max,
          }}
        />
      ))}

      {/* faint grid for depth */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 90% 60% at 50% 40%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 60% at 50% 40%, black 20%, transparent 75%)",
        }}
      />

      {/* vignette to focus the center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_45%,transparent_50%,rgba(2,2,10,0.85)_100%)]" />
    </div>
  );
}
