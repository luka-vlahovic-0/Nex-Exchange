/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, X, ExternalLink, AlertTriangle, PartyPopper } from "lucide-react";
import { Logo } from "./ui";

// phase order used to derive each step's visual state
const PHASES = ["wallet", "origin-pending", "in-transit", "arrived"];

function StepIcon({ state, failed }) {
  if (failed) return <AlertTriangle size={13} className="text-rose-400" />;
  if (state === "done") return <Check size={13} className="text-emerald-400" />;
  if (state === "active") return <Loader2 size={13} className="animate-spin text-violet-300" />;
  return <span className="block h-1.5 w-1.5 rounded-full bg-white/20" />;
}

function useElapsed(startedAt, running) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

/**
 * Live multi-step progress card for a bridge transfer.
 * tracker: { fromChain, toChain, amountLabel, phase, txHash, explorer,
 *            startedAt, receivedLabel?, error?, demo? }
 */
export default function BridgeTracker({ tracker, onDismiss }) {
  const { fromChain, toChain, amountLabel, phase, txHash, explorer, startedAt, receivedLabel, error, demo } = tracker;
  const phaseIndex = PHASES.indexOf(phase);
  const finished = phase === "arrived" || !!error;
  const elapsed = useElapsed(startedAt, !finished);

  const steps = [
    { id: "wallet", label: "Confirm in wallet" },
    { id: "origin-pending", label: `Transaction confirming on ${fromChain.name}`, link: txHash && explorer ? `${explorer}/tx/${txHash}` : null },
    { id: "in-transit", label: `In transit to ${toChain.name}` },
    { id: "arrived", label: receivedLabel ? `Arrived — ${receivedLabel}` : `Arrived on ${toChain.name}` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="overflow-hidden"
    >
      <div className="mt-3 rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] p-4">
        {/* header: route + elapsed + dismiss */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Logo src={fromChain.img} alt={fromChain.name} size={18} />
            <motion.span
              animate={finished ? {} : { x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-white/40"
            >
              →
            </motion.span>
            <Logo src={toChain.img} alt={toChain.name} size={18} />
            <span className="ml-1.5 text-xs font-semibold text-white">{amountLabel}</span>
            {demo && (
              <span className="ml-1 rounded-full bg-cyan-400/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-cyan-300/80">
                Demo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tabular-nums text-white/40">{elapsed}</span>
            {(finished || error) && (
              <button
                onClick={onDismiss}
                className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* steps */}
        <div className="space-y-2.5">
          {steps.map((step, i) => {
            const state = i < phaseIndex ? "done" : i === phaseIndex ? "active" : "pending";
            const failedHere = error && i === phaseIndex;
            return (
              <div key={step.id} className="flex items-center gap-2.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    failedHere
                      ? "border-rose-400/40 bg-rose-400/10"
                      : state === "done"
                        ? "border-emerald-400/40 bg-emerald-400/10"
                        : state === "active"
                          ? "border-violet-400/40 bg-violet-400/10"
                          : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <StepIcon state={state} failed={failedHere} />
                </div>
                <span
                  className={`flex-1 text-xs ${
                    state === "pending" ? "text-white/30" : failedHere ? "text-rose-300" : "text-white/80"
                  }`}
                >
                  {step.label}
                </span>
                {step.link && state !== "pending" && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/30 transition-colors hover:text-violet-300"
                    aria-label="View transaction on explorer"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="mt-3 text-xs leading-relaxed text-rose-300/90">{error}</p>}

        {phase === "arrived" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-300"
          >
            <PartyPopper size={13} /> Transfer complete in {elapsed}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
