/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Gift, Trophy, Sparkles, ArrowLeftRight, Landmark, Coins } from "lucide-react";
import { quests } from "../lib/quests";
import { useWallet } from "../context/WalletContext";
import { useMode } from "../context/ModeContext";
import { useTx } from "../context/TxContext";
import { useToast } from "../context/ToastContext";

const CLAIMED_KEY = "nex-quests-claimed-v1";

const loadClaimed = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAIMED_KEY)) ?? []);
  } catch {
    return new Set();
  }
};

/** Eased number count-up for stat tiles. */
function CountUp({ value, decimals = 0, prefix = "" }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    const start = performance.now();
    const duration = 900;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <>
      {prefix}
      {display.toFixed(decimals)}
    </>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

function StatTile({ icon: Icon, label, children, accent }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#1e1650]/70 to-[#130d33]/70 p-4 backdrop-blur-xl"
    >
      <div className={`mb-2 inline-flex rounded-xl p-2 ${accent}`}>
        <Icon size={16} />
      </div>
      <p className="font-display text-2xl font-bold tabular-nums text-white">{children}</p>
      <p className="mt-0.5 text-xs text-white/40">{label}</p>
    </motion.div>
  );
}

export default function QuestsPanel() {
  const { address } = useWallet();
  const { stats } = useTx();
  const { adjustDemoBalances } = useMode();
  const toast = useToast();
  const [claimed, setClaimed] = useState(loadClaimed);

  useEffect(() => {
    localStorage.setItem(CLAIMED_KEY, JSON.stringify([...claimed]));
  }, [claimed]);

  const progressFor = (quest) => {
    if (quest.statKey === "connect") return address || claimed.has("connect") ? 1 : 0;
    if (quest.statKey === "claimedOthers")
      return quests.filter((q) => q.id !== "all" && claimed.has(q.id)).length;
    return stats[quest.statKey] ?? 0;
  };

  const claim = (quest) => {
    if (claimed.has(quest.id)) return;
    setClaimed((prev) => new Set([...prev, quest.id]));
    adjustDemoBalances({ [quest.reward.symbol]: quest.reward.amount });
    toast.push({
      type: "success",
      title: `Reward claimed — +${quest.reward.amount} ${quest.reward.symbol}`,
      message: `“${quest.title}” complete. Credited to your demo portfolio.`,
    });
  };

  const totalEarned = useMemo(
    () => quests.filter((q) => claimed.has(q.id)).reduce((sum, q) => sum + q.reward.amount, 0),
    [claimed]
  );
  const completedCount = quests.filter((q) => claimed.has(q.id)).length;
  const overallPct = Math.round((completedCount / quests.length) * 100);

  const featured = quests.find((q) => q.id === "all");
  const regular = quests.filter((q) => q.id !== "all");

  const renderClaimState = (quest, isClaimed, isClaimable) => {
    if (isClaimed)
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400/80">
          <Check size={13} /> Claimed
        </span>
      );
    if (isClaimable)
      return (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          animate={{
            boxShadow: [
              "0 0 12px rgba(52,211,153,0.25)",
              "0 0 28px rgba(52,211,153,0.55)",
              "0 0 12px rgba(52,211,153,0.25)",
            ],
          }}
          transition={{ boxShadow: { repeat: Infinity, duration: 1.8 } }}
          onClick={() => claim(quest)}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-xs font-bold text-white"
        >
          <Gift size={13} /> Claim
        </motion.button>
      );
    return (
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">
        In progress
      </span>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-[min(94vw,62rem)]"
    >
      {/* ---- hero ---------------------------------------------------- */}
      <motion.section variants={itemVariants} className="mb-8 text-center">
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, -6, 6, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="mx-auto mb-4 inline-flex rounded-3xl border border-amber-300/20 bg-gradient-to-b from-amber-400/15 to-amber-400/5 p-4 shadow-[0_0_50px_rgba(251,191,36,0.15)]"
        >
          <Trophy size={36} className="text-amber-300" />
        </motion.div>

        <div className="mb-3 flex justify-center">
          <span className="flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-violet-300">
            <Sparkles size={11} /> Rewards program
          </span>
        </div>

        <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Trade. Explore.{" "}
          <span className="bg-gradient-to-r from-amber-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            Get rewarded.
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/45">
          Every swap, bridge and purchase counts. Complete missions across the app and claim
          stablecoin rewards straight into your portfolio.
        </p>
      </motion.section>

      {/* ---- stats ---------------------------------------------------- */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={Coins} label="Total earned" accent="bg-emerald-400/15 text-emerald-300">
          <CountUp value={totalEarned} decimals={2} prefix="$" />
        </StatTile>
        <StatTile icon={Trophy} label={`Missions complete · ${overallPct}%`} accent="bg-amber-400/15 text-amber-300">
          <CountUp value={completedCount} />
          <span className="text-base font-semibold text-white/35"> / {quests.length}</span>
        </StatTile>
        <StatTile icon={ArrowLeftRight} label="Lifetime swaps" accent="bg-violet-400/15 text-violet-300">
          <CountUp value={stats.swaps} />
        </StatTile>
        <StatTile icon={Landmark} label="Lifetime bridges" accent="bg-cyan-400/15 text-cyan-300">
          <CountUp value={stats.bridges} />
        </StatTile>
      </div>

      {/* ---- featured mission: Nex legend ------------------------------ */}
      {featured &&
        (() => {
          const progress = progressFor(featured);
          const isClaimed = claimed.has(featured.id);
          const isClaimable = !isClaimed && progress >= featured.target;
          const pct = Math.min(100, Math.round((progress / featured.target) * 100));
          const FeaturedIcon = featured.icon;
          return (
            <motion.div
              variants={itemVariants}
              className="relative mb-6 overflow-hidden rounded-3xl p-[1.5px]"
            >
              {/* rotating conic border */}
              <motion.div
                aria-hidden
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, #f59e0b 12%, #d946ef 25%, transparent 40%, transparent 60%, #22d3ee 72%, transparent 88%)",
                }}
              />
              <div className="relative rounded-3xl bg-gradient-to-r from-[#1f1650] via-[#191142] to-[#141036] p-5 sm:p-6">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <motion.div
                    animate={isClaimable ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="rounded-2xl bg-amber-400/15 p-3.5 text-amber-300"
                  >
                    <FeaturedIcon size={26} />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-white">{featured.title}</h3>
                      <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-200">
                        +{featured.reward.amount} {featured.reward.symbol}
                      </span>
                      <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/50">
                        Grand prize
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/45">{featured.description}</p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="h-1.5 max-w-xs flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                        <motion.div
                          animate={{ width: `${pct}%` }}
                          transition={{ type: "spring", stiffness: 120, damping: 25 }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-400 to-cyan-300"
                        />
                      </div>
                      <span className="text-xs tabular-nums text-white/50">
                        {Math.min(progress, featured.target)}/{featured.target}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">{renderClaimState(featured, isClaimed, isClaimable)}</div>
                </div>
              </div>
            </motion.div>
          );
        })()}

      {/* ---- mission grid ---------------------------------------------- */}
      <div className="grid gap-3 sm:grid-cols-2">
        {regular.map((quest) => {
          const progress = progressFor(quest);
          const isClaimed = claimed.has(quest.id);
          const isClaimable = !isClaimed && progress >= quest.target;
          const pct = Math.min(100, Math.round((progress / quest.target) * 100));
          const Icon = quest.icon;

          return (
            <motion.div
              key={quest.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-colors ${
                isClaimable
                  ? "shimmer border-emerald-400/30 bg-emerald-400/[0.05] shadow-[0_0_30px_rgba(52,211,153,0.08)]"
                  : isClaimed
                    ? "border-white/[0.05] bg-white/[0.02]"
                    : "border-white/[0.08] bg-gradient-to-b from-[#1c1448]/60 to-[#120d31]/60 hover:border-violet-400/25"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 rounded-xl p-2.5 ${
                    isClaimed
                      ? "bg-white/[0.05] text-white/35"
                      : isClaimable
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-violet-500/15 text-violet-300"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isClaimed ? "text-white/45" : "text-white"}`}>
                      {quest.title}
                    </p>
                    <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-bold text-amber-200/90">
                      +{quest.reward.amount} {quest.reward.symbol}
                    </span>
                  </div>
                  <p className={`mt-0.5 text-xs ${isClaimed ? "text-white/25" : "text-white/45"}`}>
                    {quest.description}
                  </p>

                  {quest.target > 1 && !isClaimed && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                        <motion.div
                          animate={{ width: `${pct}%` }}
                          transition={{ type: "spring", stiffness: 120, damping: 25 }}
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300"
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-white/40">
                        {Math.min(progress, quest.target)}/{quest.target}
                      </span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 self-center">
                  {renderClaimState(quest, isClaimed, isClaimable)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p variants={itemVariants} className="mt-6 text-center text-[10px] text-white/30">
        Rewards are simulated and credited to your demo portfolio · progress counts both demo and
        testnet actions
      </motion.p>
    </motion.div>
  );
}
