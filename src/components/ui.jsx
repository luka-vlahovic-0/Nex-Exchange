/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/** Glassmorphism card used by every panel. */
export function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#221856]/85 via-[#1a1244]/85 to-[#130d33]/85 shadow-2xl shadow-black/50 backdrop-blur-2xl ${className}`}
    >
      {/* top edge highlight */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      {children}
    </div>
  );
}

/** Primary gradient action button with loading + disabled states. */
export function ActionButton({ children, onClick, disabled, loading, className = "" }) {
  const inactive = disabled || loading;
  return (
    <motion.button
      whileHover={inactive ? undefined : { scale: 1.015 }}
      whileTap={inactive ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      onClick={onClick}
      disabled={inactive}
      className={`relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-base font-semibold transition-all duration-300 ${
        inactive
          ? "cursor-not-allowed bg-white/[0.06] text-white/40"
          : "bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 text-white shadow-glow hover:shadow-[0_0_60px_rgba(139,92,246,0.5)]"
      } ${className}`}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </motion.button>
  );
}

/** Token / chain logo with a graceful fallback circle. */
export function Logo({ src, alt, size = 32, className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={`rounded-full bg-white/10 object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}

/** Small key/value row for quote details etc. */
export function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/45">{label}</span>
      <span className="font-medium text-white/85">{children}</span>
    </div>
  );
}

/** Section label above inputs. */
export function FieldLabel({ children, right }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wider text-white/40">{children}</span>
      {right}
    </div>
  );
}
