/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Logo } from "./ui";

/** Compact chain dropdown used by the demo panels. */
export default function ChainSelect({ chains, selected, onSelect, label, disabledKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative min-w-0 flex-1" ref={ref}>
      {label && <p className="mb-1.5 text-xs text-white/40">{label}</p>}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-2.5 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
      >
        <Logo src={selected.img} alt={selected.name} size={26} />
        <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-white">
          {selected.name}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="scrollbar-thin absolute left-0 top-full z-40 mt-1.5 max-h-64 w-56 overflow-y-auto rounded-2xl border border-white/10 bg-[#151233]/95 p-1.5 shadow-xl backdrop-blur-xl"
          >
            {chains.map((chain) => {
              const disabled = chain.key === disabledKey;
              return (
                <button
                  key={chain.key}
                  disabled={disabled}
                  onClick={() => {
                    onSelect(chain);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors ${
                    disabled
                      ? "cursor-not-allowed opacity-30"
                      : selected.key === chain.key
                        ? "bg-violet-500/20"
                        : "hover:bg-white/[0.06]"
                  }`}
                >
                  <Logo src={chain.img} alt={chain.name} size={22} />
                  <span className="text-sm font-medium text-white">{chain.name}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
