import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Trash2, ArrowLeftRight, Landmark, BadgeCheck, CreditCard } from "lucide-react";
import { chains } from "../lib/chains";
import { timeAgo } from "../lib/format";
import { useTx } from "../context/TxContext";

const STATUS_STYLES = {
  pending: "bg-amber-400 animate-pulse",
  confirmed: "bg-emerald-400",
  failed: "bg-rose-400",
};

const ICONS = {
  swap: ArrowLeftRight,
  bridge: Landmark,
  approve: BadgeCheck,
  buy: CreditCard,
};

export default function Activity() {
  const { activity, clearActivity } = useTx();

  if (activity.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="w-[min(94vw,27rem)]"
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Recent activity
        </h3>
        <button
          onClick={clearActivity}
          className="flex items-center gap-1 text-[10px] font-medium text-white/35 transition-colors hover:text-rose-300"
        >
          <Trash2 size={11} /> Clear
        </button>
      </div>
      <div className="scrollbar-thin max-h-56 space-y-1.5 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {activity.map((item) => {
            const Icon = ICONS[item.icon] ?? ArrowLeftRight;
            const explorer = chains[item.chainKey]?.explorer;
            const Wrapper = item.demo ? motion.div : motion.a;
            const linkProps = item.demo
              ? {}
              : { href: `${explorer}/tx/${item.hash}`, target: "_blank", rel: "noopener noreferrer" };
            return (
              <Wrapper
                key={item.hash}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                {...linkProps}
                className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 backdrop-blur-xl transition-colors hover:border-white/15 hover:bg-white/[0.06]"
              >
                <div className="rounded-xl bg-white/[0.06] p-2 text-violet-300">
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white/85">{item.label}</p>
                  <p className="text-[10px] text-white/40">{timeAgo(item.timestamp)}</p>
                </div>
                <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_STYLES[item.status] ?? "bg-white/30"}`} />
                {item.demo ? (
                  <span className="shrink-0 rounded-full bg-cyan-400/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-cyan-300/80">
                    Demo
                  </span>
                ) : (
                  <ExternalLink size={12} className="shrink-0 text-white/25 transition-colors group-hover:text-white/60" />
                )}
              </Wrapper>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
