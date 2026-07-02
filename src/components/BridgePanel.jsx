/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parseUnits, formatUnits } from "ethers";
import { ArrowDown, Clock, Fuel, ShieldCheck, Zap } from "lucide-react";
import { chains, allTestnetChains } from "../lib/chains";
import { bridgeRoute, bridgeEthNative, bridgeEthAcross, getAcrossQuote } from "../lib/bridge";
import { readProvider } from "../lib/swap";
import { formatAmount, formatUsd, isValidAmountInput } from "../lib/format";
import { useWallet } from "../context/WalletContext";
import { useTx } from "../context/TxContext";
import { usdPrice } from "../hooks/usePrices";
import { GlassCard, ActionButton, InfoRow } from "./ui";
import ChainSelect from "./ChainSelect";
import BridgeTracker from "./BridgeTracker";

const ETH_GAS_BUFFER = parseUnits("0.003", 18);
const REFUEL_PRESETS = ["0.001", "0.002", "0.005", "0.01"];
const ARRIVAL_POLL_MS = 5000;
const ARRIVAL_TIMEOUT_MS = 20 * 60 * 1000;

export default function BridgePanel({ nativeBalances, refreshBalances, prices }) {
  const { address, chainId, connect, switchChain, getSigner } = useWallet();
  const { track } = useTx();

  const [fromChain, setFromChain] = useState(chains.sepolia);
  const [toChain, setToChain] = useState(chains.baseSepolia);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [acrossQuote, setAcrossQuote] = useState(null);
  const [quoteError, setQuoteError] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [tracker, setTracker] = useState(null);
  const pollRef = useRef(null);
  const quoteSeq = useRef(0);

  const route = bridgeRoute(fromChain);
  const isAcross = route === "across";

  const amountIn = useMemo(() => {
    if (!amount || amount === ".") return 0n;
    try {
      return parseUnits(amount, 18);
    } catch {
      return 0n;
    }
  }, [amount]);

  const fromBalance = nativeBalances[fromChain.key];
  const insufficient = fromBalance !== undefined && fromBalance !== null && amountIn > fromBalance;
  const onFromChain = chainId === fromChain.chainId;
  const ethUsd = usdPrice(prices, "ethereum");
  const amountNum = Number(amount) || 0;

  const receiveAmount = isAcross ? acrossQuote?.outputAmount ?? null : amountIn;

  // stop arrival polling on unmount
  useEffect(() => () => clearInterval(pollRef.current), []);

  // ---- Across quoting (debounced) ---------------------------------------
  const fetchQuote = useCallback(async () => {
    if (!isAcross || amountIn === 0n) {
      setAcrossQuote(null);
      setQuoteError(null);
      return;
    }
    const seq = ++quoteSeq.current;
    setQuoting(true);
    try {
      const quote = await getAcrossQuote({ fromChain, toChain, amount: amountIn });
      if (seq !== quoteSeq.current) return;
      setAcrossQuote(quote);
      setQuoteError(null);
    } catch (error) {
      if (seq !== quoteSeq.current) return;
      setAcrossQuote(null);
      setQuoteError(error.message);
    } finally {
      if (seq === quoteSeq.current) setQuoting(false);
    }
  }, [isAcross, amountIn, fromChain, toChain]);

  useEffect(() => {
    const debounce = setTimeout(fetchQuote, 400);
    return () => clearTimeout(debounce);
  }, [fetchQuote]);

  // ---- chain pickers ------------------------------------------------------
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

  const setMax = () => {
    if (fromBalance === undefined || fromBalance === null) return;
    const max = fromBalance > ETH_GAS_BUFFER ? fromBalance - ETH_GAS_BUFFER : 0n;
    setAmount(formatUnits(max, 18));
  };

  // ---- arrival detection ---------------------------------------------------
  const watchArrival = useCallback(
    (destChain, balanceBefore) => {
      clearInterval(pollRef.current);
      const startedWatching = Date.now();
      const destProvider = readProvider(destChain.key);
      pollRef.current = setInterval(async () => {
        try {
          const balance = await destProvider.getBalance(address);
          if (balance > balanceBefore) {
            clearInterval(pollRef.current);
            const received = balance - balanceBefore;
            setTracker((t) =>
              t ? { ...t, phase: "arrived", receivedLabel: `${formatAmount(received, 18)} ETH received` } : t
            );
            refreshBalances();
          } else if (Date.now() - startedWatching > ARRIVAL_TIMEOUT_MS) {
            clearInterval(pollRef.current);
            setTracker((t) =>
              t
                ? {
                    ...t,
                    error:
                      "Taking longer than expected. Your funds are safe — check the transaction on the explorer, or your destination balance in a few minutes.",
                  }
                : t
            );
          }
        } catch {
          /* transient RPC error — keep polling */
        }
      }, ARRIVAL_POLL_MS);
    },
    [address, refreshBalances]
  );

  // ---- execution ------------------------------------------------------------
  const handleBridge = async () => {
    setBusy(true);
    const from = fromChain;
    const to = toChain;
    const sending = amountIn;
    try {
      const balanceBefore = await readProvider(to.key).getBalance(address);
      setTracker({
        fromChain: from,
        toChain: to,
        amountLabel: `${formatAmount(sending, 18)} ETH`,
        phase: "wallet",
        explorer: from.explorer,
        startedAt: Date.now(),
      });

      const signer = await getSigner();
      const sendTx = () =>
        isAcross
          ? bridgeEthAcross({ signer, fromChain: from, toChain: to, amount: sending, quote: acrossQuote, recipient: address })
          : bridgeEthNative({ signer, destination: to, amount: sending });

      const receipt = await track(sendTx, {
        label: `Bridge ${formatAmount(sending, 18)} ETH from ${from.name} to ${to.name}`,
        chainKey: from.key,
        icon: "bridge",
        onSubmitted: (tx) => setTracker((t) => (t ? { ...t, phase: "origin-pending", txHash: tx.hash } : t)),
      });

      if (!receipt) {
        setTracker(null); // user rejected in wallet
        return;
      }
      if (receipt.status !== 1) {
        setTracker((t) => (t ? { ...t, error: "The transaction reverted on the origin chain." } : t));
        return;
      }

      setAmount("");
      refreshBalances();
      setTracker((t) => (t ? { ...t, phase: "in-transit" } : t));
      watchArrival(to, balanceBefore);
    } catch (error) {
      setTracker((t) =>
        t ? { ...t, error: error?.shortMessage || error?.message || "Something went wrong." } : t
      );
    } finally {
      setBusy(false);
    }
  };

  const button = (() => {
    if (!address) return { label: "Connect Wallet", onClick: connect };
    if (!onFromChain)
      return { label: `Switch to ${fromChain.name}`, onClick: () => switchChain(fromChain).catch(() => {}) };
    if (amountIn === 0n) return { label: "Enter an amount", disabled: true };
    if (insufficient) return { label: `Insufficient ETH on ${fromChain.name}`, disabled: true };
    if (isAcross && quoting && !acrossQuote) return { label: "Fetching route…", disabled: true, loading: true };
    if (isAcross && quoteError) return { label: "Route unavailable", disabled: true };
    if (isAcross && !acrossQuote) return { label: "Enter an amount", disabled: true };
    return { label: `Bridge to ${toChain.name}`, onClick: handleBridge, loading: busy };
  })();

  return (
    <GlassCard className="w-[min(94vw,27rem)] p-5">
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold text-white">Bridge</h2>
        <p className="text-xs text-white/40">Real transfers between 4 testnets · doubles as gas refuel</p>
      </div>

      {/* route */}
      <div className="flex items-end gap-2">
        <ChainSelect chains={allTestnetChains} selected={fromChain} onSelect={selectFromChain} label="From" />
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={swapDirection}
          className="mb-0.5 shrink-0 rounded-xl border border-white/10 bg-[#181538] p-2.5 text-violet-300 transition-colors hover:border-violet-400/40 hover:text-white"
          aria-label="Swap direction"
        >
          <ArrowDown size={16} className="-rotate-90" />
        </motion.button>
        <ChainSelect chains={allTestnetChains} selected={toChain} onSelect={selectToChain} label="To" />
      </div>

      {/* amount */}
      <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 transition-colors focus-within:border-violet-400/40 hover:border-white/[0.14]">
        <div className="mb-1.5 flex items-center justify-between text-xs text-white/40">
          <span>Amount (ETH)</span>
          {address && fromBalance !== undefined && fromBalance !== null && (
            <button onClick={setMax} className="transition-colors hover:text-violet-300">
              Balance: {formatAmount(fromBalance, 18)}{" "}
              <span className="font-semibold text-violet-400">MAX</span>
            </button>
          )}
        </div>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(e) => isValidAmountInput(e.target.value) && setAmount(e.target.value)}
          className={`w-full min-w-0 bg-transparent font-display text-3xl font-semibold placeholder-white/25 ${insufficient ? "text-rose-400" : "text-white"}`}
        />
        <div className="mt-1 flex items-center justify-between">
          <div className="flex gap-1.5">
            {REFUEL_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className="flex items-center gap-1 rounded-lg bg-white/[0.05] px-2 py-1 text-[10px] font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Fuel size={9} />
                {preset}
              </button>
            ))}
          </div>
          <span className="text-xs text-white/35">
            {ethUsd && amountNum > 0 ? formatUsd(amountNum * ethUsd) : ""}
          </span>
        </div>
      </div>

      {/* details */}
      <div className="mt-3 space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
        <InfoRow label={`You receive on ${toChain.name}`}>
          {receiveAmount !== null && amountIn > 0n && (!isAcross || acrossQuote) ? (
            <span className={quoting ? "animate-pulse" : ""}>{formatAmount(receiveAmount, 18)} ETH</span>
          ) : (
            "—"
          )}
        </InfoRow>
        <InfoRow label="Route">
          <span className="flex items-center gap-1">
            {isAcross ? (
              <>
                <Zap size={11} className="text-cyan-300" /> Across Protocol
              </>
            ) : (
              <>
                <ShieldCheck size={11} className="text-emerald-400" />
                Official {toChain.bridge?.type === "arbitrum" ? "Arbitrum Inbox" : "OP Standard Bridge"}
              </>
            )}
          </span>
        </InfoRow>
        {isAcross && acrossQuote && (
          <InfoRow label="Relayer fee">{formatAmount(acrossQuote.totalFee, 18)} ETH</InfoRow>
        )}
        <InfoRow label="Estimated arrival">
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-violet-400" />
            {isAcross
              ? acrossQuote
                ? `~${acrossQuote.estimatedFillTimeSec}s`
                : "~1 min"
              : toChain.eta}
          </span>
        </InfoRow>
        {address && nativeBalances[toChain.key] !== undefined && nativeBalances[toChain.key] !== null && (
          <InfoRow label={`Your ${toChain.shortName} balance`}>
            {formatAmount(nativeBalances[toChain.key], 18)} ETH
          </InfoRow>
        )}
      </div>

      {quoteError && amountIn > 0n && (
        <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] p-3 text-xs leading-relaxed text-amber-300/90">
          {quoteError}
        </p>
      )}

      <div className="mt-4">
        <ActionButton onClick={button.onClick} disabled={button.disabled} loading={button.loading}>
          {button.label}
        </ActionButton>
      </div>

      {/* live transfer progress */}
      <AnimatePresence>
        {tracker && <BridgeTracker tracker={tracker} onDismiss={() => setTracker(null)} />}
      </AnimatePresence>

      <p className="mt-3 text-center text-[10px] leading-relaxed text-white/30">
        Sepolia → L2 uses the official native bridge. L2 ↔ L2 and L2 → Sepolia are relayed by
        Across Protocol&apos;s testnet — small amounts (&lt;0.005 ETH) fill in seconds.
      </p>
    </GlassCard>
  );
}
