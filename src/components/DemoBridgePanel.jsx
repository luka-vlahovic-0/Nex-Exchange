/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ChevronDown, Clock, Zap } from "lucide-react";
import { demoChains, demoCoins } from "../lib/demoData";
import { formatAmount, formatUsd, isValidAmountInput } from "../lib/format";
import { useMode } from "../context/ModeContext";
import { useTx } from "../context/TxContext";
import { usdPrice } from "../hooks/usePrices";
import { GlassCard, ActionButton, Logo, InfoRow } from "./ui";
import TokenSelectModal from "./TokenSelectModal";
import ChainSelect from "./ChainSelect";
import BridgeTracker from "./BridgeTracker";

const BRIDGE_FEE = 0.0005; // 0.05%
// simulated timeline (ms per phase) so the tracker feels like a real transfer
const SIM_WALLET_MS = 700;
const SIM_CONFIRM_MS = 1900;
const SIM_TRANSIT_MS = 3600;

export default function DemoBridgePanel({ prices }) {
  const { demoBalances, adjustDemoBalances } = useMode();
  const { trackDemo } = useTx();

  const [fromChain, setFromChain] = useState(demoChains[0]);
  const [toChain, setToChain] = useState(demoChains[1]);
  const [token, setToken] = useState(demoCoins[0]);
  const [amount, setAmount] = useState("");
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tracker, setTracker] = useState(null);
  const timeouts = useRef([]);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  const amountNum = Number(amount) || 0;
  const price = usdPrice(prices, token.coingeckoId);
  const balance = demoBalances[token.symbol] ?? 0;
  const insufficient = amountNum > balance;
  const receiveAmount = amountNum * (1 - BRIDGE_FEE);

  const selectFromChain = (chain) => {
    if (chain.key === toChain.key) setToChain(fromChain);
    setFromChain(chain);
  };

  const selectToChain = (chain) => {
    if (chain.key === fromChain.key) setFromChain(toChain);
    setToChain(chain);
  };

  const swapDirection = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const handleBridge = () => {
    setBusy(true);
    const received = receiveAmount;
    const symbol = token.symbol;
    const label = `Bridge ${formatAmount(amountNum)} ${symbol} from ${fromChain.name} to ${toChain.name}`;

    setTracker({
      fromChain,
      toChain,
      amountLabel: `${formatAmount(amountNum)} ${symbol}`,
      phase: "wallet",
      startedAt: Date.now(),
      demo: true,
    });
    // toast + activity entry, timed to land with the tracker's arrival
    trackDemo({ label, icon: "bridge", durationMs: SIM_WALLET_MS + SIM_CONFIRM_MS + SIM_TRANSIT_MS });

    const schedule = (fn, ms) => timeouts.current.push(setTimeout(fn, ms));
    schedule(() => setTracker((t) => t && { ...t, phase: "origin-pending" }), SIM_WALLET_MS);
    schedule(() => setTracker((t) => t && { ...t, phase: "in-transit" }), SIM_WALLET_MS + SIM_CONFIRM_MS);
    schedule(() => {
      setTracker(
        (t) =>
          t && {
            ...t,
            phase: "arrived",
            receivedLabel: `${formatAmount(received)} ${symbol} received`,
          }
      );
      adjustDemoBalances({ [symbol]: -(amountNum * BRIDGE_FEE) });
      setAmount("");
      setBusy(false);
    }, SIM_WALLET_MS + SIM_CONFIRM_MS + SIM_TRANSIT_MS);
  };

  const button = (() => {
    if (!prices) return { label: "Loading market prices…", disabled: true, loading: true };
    if (amountNum <= 0) return { label: "Enter an amount", disabled: true };
    if (insufficient) return { label: `Insufficient ${token.symbol}`, disabled: true };
    return { label: `Bridge to ${toChain.name}`, onClick: handleBridge, loading: busy };
  })();

  return (
    <GlassCard className="w-[min(94vw,27rem)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Bridge</h2>
          <p className="text-xs text-white/40">Move assets between 12 networks · gas refuel</p>
        </div>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
          Demo
        </span>
      </div>

      {/* route */}
      <div className="flex items-end gap-2">
        <ChainSelect chains={demoChains} selected={fromChain} onSelect={selectFromChain} label="From" />
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={swapDirection}
          className="mb-0.5 shrink-0 rounded-xl border border-white/10 bg-[#181538] p-2.5 text-violet-300 transition-colors hover:border-violet-400/40 hover:text-white"
          aria-label="Swap direction"
        >
          <ArrowDown size={16} className="-rotate-90" />
        </motion.button>
        <ChainSelect chains={demoChains} selected={toChain} onSelect={selectToChain} label="To" />
      </div>

      {/* amount */}
      <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 transition-colors focus-within:border-violet-400/40 hover:border-white/[0.14]">
        <div className="mb-1.5 flex items-center justify-between text-xs text-white/40">
          <span>Amount</span>
          <span>Balance: {formatAmount(balance)}</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => isValidAmountInput(e.target.value) && setAmount(e.target.value)}
            className={`w-full min-w-0 flex-1 bg-transparent font-display text-3xl font-semibold placeholder-white/25 ${insufficient ? "text-rose-400" : "text-white"}`}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setTokenModalOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] py-1.5 pl-2 pr-3 transition-colors hover:bg-white/[0.12]"
          >
            <Logo src={token.img} alt={token.symbol} size={24} />
            <span className="text-sm font-semibold text-white">{token.symbol}</span>
            <ChevronDown size={14} className="text-white/50" />
          </motion.button>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex gap-1.5">
            {[25, 50, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount(String(Number(((balance * pct) / 100).toPrecision(8))))}
                className="rounded-lg bg-white/[0.05] px-2 py-1 text-[10px] font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                {pct === 100 ? "MAX" : `${pct}%`}
              </button>
            ))}
          </div>
          <span className="text-xs text-white/35">
            {price && amountNum > 0 ? formatUsd(amountNum * price) : ""}
          </span>
        </div>
      </div>

      {/* details */}
      <div className="mt-3 space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
        <InfoRow label={`You receive on ${toChain.name}`}>
          {amountNum > 0 ? `${formatAmount(receiveAmount)} ${token.symbol}` : "—"}
        </InfoRow>
        <InfoRow label="Bridge fee">{BRIDGE_FEE * 100}%</InfoRow>
        <InfoRow label="Route">
          <span className="flex items-center gap-1">
            <Zap size={11} className="text-cyan-300" />
            Nex Bridge Router
          </span>
        </InfoRow>
        <InfoRow label="Estimated arrival">
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-violet-400" />
            ~6s (simulated)
          </span>
        </InfoRow>
      </div>

      <div className="mt-4">
        <ActionButton onClick={button.onClick} disabled={button.disabled} loading={button.loading}>
          {button.label}
        </ActionButton>
      </div>

      {/* live transfer progress */}
      <AnimatePresence>
        {tracker && <BridgeTracker tracker={tracker} onDismiss={() => setTracker(null)} />}
      </AnimatePresence>

      <TokenSelectModal
        open={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        onSelect={(t) => {
          setToken(t);
          setTokenModalOpen(false);
        }}
        selected={token}
        tokens={demoCoins}
        balances={demoBalances}
        subtitle="Demo portfolio · live market prices, simulated trades"
      />
    </GlassCard>
  );
}
