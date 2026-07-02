/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search } from "lucide-react";
import { formatAmount } from "../lib/format";
import { Logo } from "./ui";

export default function TokenSelectModal({
  open,
  onClose,
  onSelect,
  selected,
  tokens,
  balances,
  subtitle = "Sepolia testnet tokens · verified contracts",
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(
      (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    );
  }, [tokens, query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[80vh] w-full max-w-sm flex-col rounded-t-3xl border border-white/10 bg-[#12102a]/95 p-5 shadow-2xl backdrop-blur-2xl sm:rounded-3xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-white">Select a token</h3>
              <button
                onClick={onClose}
                className="rounded-xl p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {tokens.length > 6 && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 focus-within:border-violet-400/40">
                <Search size={15} className="shrink-0 text-white/40" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search name or symbol"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-white/30"
                />
              </div>
            )}

            <div className="scrollbar-thin -mr-2 flex-1 space-y-1 overflow-y-auto pr-2">
              {filtered.map((token, i) => {
                const isSelected = selected?.symbol === token.symbol;
                const balance = balances?.[token.symbol];
                return (
                  <motion.button
                    key={token.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 10) * 0.03 }}
                    onClick={() => onSelect(token)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
                      isSelected
                        ? "border border-violet-400/30 bg-violet-500/15"
                        : "border border-transparent hover:bg-white/[0.06]"
                    }`}
                  >
                    <Logo src={token.img} alt={token.symbol} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{token.symbol}</p>
                      <p className="truncate text-xs text-white/45">{token.name}</p>
                    </div>
                    {balance !== null && balance !== undefined && (
                      <p className="text-sm font-medium text-white/70">
                        {formatAmount(balance, token.decimals)}
                      </p>
                    )}
                  </motion.button>
                );
              })}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-white/35">No tokens found</p>
              )}
            </div>

            <p className="mt-3 text-center text-[10px] text-white/30">{subtitle}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
