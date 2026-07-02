/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Check, LogOut, Wallet, ChevronDown, AlertTriangle } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { chains, chainById } from "../lib/chains";
import { shortenAddress } from "../lib/format";
import { Logo } from "./ui";

/** Deterministic gradient avatar derived from the address. */
function AddressAvatar({ address, size = 22 }) {
  const hue = parseInt(address?.slice(2, 8) ?? "0", 16) % 360;
  return (
    <div
      className="rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from 40deg, hsl(${hue},80%,60%), hsl(${(hue + 90) % 360},80%,55%), hsl(${(hue + 200) % 360},80%,60%), hsl(${hue},80%,60%))`,
      }}
    />
  );
}

export default function ConnectButton() {
  const { address, chainId, connecting, hasWallet, connect, disconnect, switchChain } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  const chain = chainById(chainId);
  const unsupported = address && !chain;

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!address) {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={connect}
        disabled={connecting}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] sm:px-5"
      >
        <Wallet size={16} />
        <span className="hidden sm:inline">{connecting ? "Connecting…" : hasWallet ? "Connect Wallet" : "Install MetaMask"}</span>
        <span className="sm:hidden">{connecting ? "…" : "Connect"}</span>
      </motion.button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur-xl transition-colors ${
          unsupported
            ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
            : "border-white/10 bg-white/[0.06] text-white hover:bg-white/10"
        }`}
      >
        {unsupported ? <AlertTriangle size={15} /> : <AddressAvatar address={address} />}
        <span className="hidden sm:inline">{shortenAddress(address)}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-white/10 bg-[#12102a]/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-white/[0.05] p-3">
              <AddressAvatar address={address} size={32} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{shortenAddress(address)}</p>
                <p className="text-xs text-white/50">{chain ? chain.name : "Unsupported network"}</p>
              </div>
            </div>

            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Network
            </p>
            <div className="mb-2 space-y-0.5">
              {Object.values(chains).map((c) => (
                <button
                  key={c.key}
                  onClick={() => switchChain(c).catch(() => {})}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                    chainId === c.chainId
                      ? "bg-violet-500/20 text-white"
                      : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Logo src={c.img} alt={c.name} size={18} />
                  <span className="flex-1">{c.name}</span>
                  {chainId === c.chainId && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 border-t border-white/[0.07] pt-2">
              <button
                onClick={copyAddress}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-rose-300/80 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
              >
                <LogOut size={13} />
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
