/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ChevronDown, Zap } from "lucide-react";
import { demoChains, demoCoins, DEMO_SWAP_FEE } from "../lib/demoData";
import { formatAmount, formatUsd, isValidAmountInput } from "../lib/format";
import { useMode } from "../context/ModeContext";
import { useTx } from "../context/TxContext";
import { usdPrice } from "../hooks/usePrices";
import { GlassCard, ActionButton, Logo, InfoRow } from "./ui";
import TokenSelectModal from "./TokenSelectModal";
import ChainSelect from "./ChainSelect";

function TokenButton({ token, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] py-1.5 pl-2 pr-3 transition-colors hover:bg-white/[0.12]"
    >
      <Logo src={token.img} alt={token.symbol} size={24} />
      <span className="text-sm font-semibold text-white">{token.symbol}</span>
      <ChevronDown size={14} className="text-white/50" />
    </motion.button>
  );
}

export default function DemoSwapPanel({ prices }) {
  const { demoBalances, adjustDemoBalances } = useMode();
  const { trackDemo } = useTx();

  const [fromChain, setFromChain] = useState(demoChains[0]);
  const [toChain, setToChain] = useState(demoChains[1]);
  const [fromToken, setFromToken] = useState(demoCoins[0]);
  const [toToken, setToToken] = useState(demoCoins[3]); // USDC
  const [amount, setAmount] = useState("");
  const [tokenModal, setTokenModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [flips, setFlips] = useState(0);

  const amountNum = Number(amount) || 0;
  const fromPrice = usdPrice(prices, fromToken.coingeckoId);
  const toPrice = usdPrice(prices, toToken.coingeckoId);
  const fromBalance = demoBalances[fromToken.symbol] ?? 0;
  const insufficient = amountNum > fromBalance;
  const crossChain = fromChain.key !== toChain.key;
  const action = crossChain ? "Bridge" : "Swap";

  const amountOut = useMemo(() => {
    if (!fromPrice || !toPrice || amountNum <= 0) return 0;
    return (amountNum * fromPrice * (1 - DEMO_SWAP_FEE)) / toPrice;
  }, [fromPrice, toPrice, amountNum]);

  const flip = () => {
    setFromChain(toChain);
    setToChain(fromChain);
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount(amountOut > 0 ? String(Number(amountOut.toPrecision(8))) : amount);
    setFlips((f) => f + 1);
  };

  const selectToken = (side) => (token) => {
    if (side === "from") {
      if (token.symbol === toToken.symbol) setToToken(fromToken);
      setFromToken(token);
    } else {
      if (token.symbol === fromToken.symbol) setFromToken(toToken);
      setToToken(token);
    }
    setTokenModal(null);
  };

  const handleTrade = async () => {
    setBusy(true);
    try {
      const label = `${action} ${formatAmount(amountNum)} ${fromToken.symbol}${crossChain ? ` (${fromChain.name})` : ""} → ${formatAmount(amountOut)} ${toToken.symbol}${crossChain ? ` (${toChain.name})` : ""}`;
      await trackDemo({ label, icon: crossChain ? "bridge" : "swap" });
      adjustDemoBalances({
        [fromToken.symbol]: -amountNum,
        [toToken.symbol]: +amountOut,
      });
      setAmount("");
    } finally {
      setBusy(false);
    }
  };

  const button = (() => {
    if (!prices) return { label: "Loading market prices…", disabled: true, loading: true };
    if (amountNum <= 0) return { label: "Enter an amount", disabled: true };
    if (insufficient) return { label: `Insufficient ${fromToken.symbol}`, disabled: true };
    return { label: action, onClick: handleTrade, loading: busy };
  })();

  return (
    <GlassCard className="w-[min(94vw,27rem)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">{action}</h2>
          <p className="text-xs text-white/40">Live market prices · simulated execution</p>
        </div>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
          Demo
        </span>
      </div>

      {/* chain routing */}
      <div className="mb-3 flex items-end gap-2">
        <ChainSelect chains={demoChains} selected={fromChain} onSelect={setFromChain} label="From network" />
        <ChainSelect chains={demoChains} selected={toChain} onSelect={setToChain} label="To network" />
      </div>

      {/* FROM */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 transition-colors focus-within:border-violet-400/40 hover:border-white/[0.14]">
        <div className="mb-1.5 flex items-center justify-between text-xs text-white/40">
          <span>You pay</span>
          <button
            onClick={() => setAmount(String(fromBalance))}
            className="transition-colors hover:text-violet-300"
          >
            Balance: {formatAmount(fromBalance)}{" "}
            <span className="font-semibold text-violet-400">MAX</span>
          </button>
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
          <TokenButton token={fromToken} onClick={() => setTokenModal("from")} />
        </div>
        <div className="mt-1 h-4 text-xs text-white/35">
          {fromPrice && amountNum > 0 ? formatUsd(amountNum * fromPrice) : ""}
        </div>
      </div>

      {/* flip */}
      <div className="relative z-10 -my-3 flex justify-center">
        <motion.button
          onClick={flip}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: flips * 180 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="rounded-xl border border-white/10 bg-[#181538] p-2 text-violet-300 shadow-lg transition-colors hover:border-violet-400/40 hover:text-white"
          aria-label="Flip tokens"
        >
          <ArrowDown size={18} />
        </motion.button>
      </div>

      {/* TO */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 transition-colors hover:border-white/[0.14]">
        <div className="mb-1.5 flex items-center justify-between text-xs text-white/40">
          <span>You receive</span>
          <span>Balance: {formatAmount(demoBalances[toToken.symbol] ?? 0)}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.p
                key={amountOut > 0 ? amountOut.toFixed(8) : "empty"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className={`truncate font-display text-3xl font-semibold ${amountOut > 0 ? "text-white" : "text-white/25"}`}
              >
                {amountOut > 0 ? formatAmount(amountOut) : "0.0"}
              </motion.p>
            </AnimatePresence>
          </div>
          <TokenButton token={toToken} onClick={() => setTokenModal("to")} />
        </div>
        <div className="mt-1 h-4 text-xs text-white/35">
          {toPrice && amountOut > 0 ? formatUsd(amountOut * toPrice) : ""}
        </div>
      </div>

      {/* quote details */}
      <AnimatePresence>
        {amountOut > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <InfoRow label="Rate">
                1 {fromToken.symbol} ≈ {formatAmount((fromPrice * (1 - DEMO_SWAP_FEE)) / toPrice)}{" "}
                {toToken.symbol}
              </InfoRow>
              <InfoRow label="Route">
                <span className="flex items-center gap-1">
                  <Zap size={11} className="text-cyan-300" />
                  {crossChain ? `Nex Bridge · ${fromChain.name} → ${toChain.name}` : "Nex AMM"}
                </span>
              </InfoRow>
              <InfoRow label="Fee">{DEMO_SWAP_FEE * 100}%</InfoRow>
              {crossChain && <InfoRow label="Estimated arrival">~2 min (simulated)</InfoRow>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4">
        <ActionButton onClick={button.onClick} disabled={button.disabled} loading={button.loading}>
          {button.label}
        </ActionButton>
      </div>

      <TokenSelectModal
        open={tokenModal !== null}
        onClose={() => setTokenModal(null)}
        onSelect={selectToken(tokenModal)}
        selected={tokenModal === "from" ? fromToken : toToken}
        tokens={demoCoins}
        balances={demoBalances}
        subtitle="Demo portfolio · live market prices, simulated trades"
      />
    </GlassCard>
  );
}
