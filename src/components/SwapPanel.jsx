/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parseUnits, formatUnits } from "ethers";
import { ArrowDown, ChevronDown, Settings2, Zap } from "lucide-react";
import { tokens, tokenBySymbol, isWrapPair } from "../lib/tokens";
import { chains, SEPOLIA_CHAIN_ID } from "../lib/chains";
import { quoteSwap, getAllowance, approveRouter, executeSwap } from "../lib/swap";
import { formatAmount, formatUsd, isValidAmountInput } from "../lib/format";
import { useWallet } from "../context/WalletContext";
import { useTx } from "../context/TxContext";
import { usdPrice } from "../hooks/usePrices";
import { GlassCard, ActionButton, Logo, InfoRow } from "./ui";
import TokenSelectModal from "./TokenSelectModal";

const QUOTE_REFRESH_MS = 20000;
const ETH_GAS_BUFFER = parseUnits("0.005", 18);
const SLIPPAGE_PRESETS = [10, 50, 100]; // bps

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

export default function SwapPanel({ balances, refreshBalances, prices }) {
  const { address, chainId, connect, switchChain, getSigner } = useWallet();
  const { track } = useTx();

  const [fromToken, setFromToken] = useState(tokenBySymbol("ETH"));
  const [toToken, setToToken] = useState(tokenBySymbol("USDC"));
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [slippageBps, setSlippageBps] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  const [tokenModal, setTokenModal] = useState(null); // "from" | "to" | null
  const [needsApproval, setNeedsApproval] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flips, setFlips] = useState(0);
  const quoteSeq = useRef(0);

  const amountIn = useMemo(() => {
    if (!amount || amount === ".") return 0n;
    try {
      return parseUnits(amount, fromToken.decimals);
    } catch {
      return 0n;
    }
  }, [amount, fromToken]);

  const fromBalance = balances[fromToken.symbol];
  const insufficient = fromBalance !== undefined && fromBalance !== null && amountIn > fromBalance;
  const onSepolia = chainId === SEPOLIA_CHAIN_ID;

  // ---- quoting (debounced + periodic refresh) --------------------------
  const fetchQuote = useCallback(async () => {
    if (amountIn === 0n) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    const seq = ++quoteSeq.current;
    setQuoting(true);
    try {
      const result = await quoteSwap(fromToken, toToken, amountIn);
      if (seq !== quoteSeq.current) return;
      setQuote(result);
      setQuoteError(null);
    } catch {
      if (seq !== quoteSeq.current) return;
      setQuote(null);
      setQuoteError("No liquidity for this pair right now.");
    } finally {
      if (seq === quoteSeq.current) setQuoting(false);
    }
  }, [amountIn, fromToken, toToken]);

  useEffect(() => {
    const debounce = setTimeout(fetchQuote, 350);
    const refresh = setInterval(fetchQuote, QUOTE_REFRESH_MS);
    return () => {
      clearTimeout(debounce);
      clearInterval(refresh);
    };
  }, [fetchQuote]);

  // ---- allowance check --------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    if (!address || !fromToken.address || amountIn === 0n || isWrapPair(fromToken, toToken)) {
      setNeedsApproval(false);
      return;
    }
    getAllowance(fromToken, address)
      .then((allowance) => !cancelled && setNeedsApproval(allowance < amountIn))
      .catch(() => !cancelled && setNeedsApproval(false));
    return () => {
      cancelled = true;
    };
  }, [address, fromToken, toToken, amountIn]);

  // ---- actions ----------------------------------------------------------
  const flip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount(quote ? formatUnits(quote.amountOut, toToken.decimals) : amount);
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

  const setMax = () => {
    if (fromBalance === undefined || fromBalance === null) return;
    const max = fromToken.address
      ? fromBalance
      : fromBalance > ETH_GAS_BUFFER
        ? fromBalance - ETH_GAS_BUFFER
        : 0n;
    setAmount(formatUnits(max, fromToken.decimals));
  };

  const handleApprove = async () => {
    setBusy(true);
    try {
      const signer = await getSigner();
      const receipt = await track(() => approveRouter(signer, fromToken, amountIn), {
        label: `Approve ${fromToken.symbol} for swapping`,
        icon: "approve",
      });
      if (receipt?.status === 1) setNeedsApproval(false);
    } finally {
      setBusy(false);
    }
  };

  const handleSwap = async () => {
    setBusy(true);
    try {
      const signer = await getSigner();
      const label = `${quote.route === "Wrap" || quote.route === "Unwrap" ? quote.route : "Swap"} ${formatAmount(amountIn, fromToken.decimals)} ${fromToken.symbol} → ${formatAmount(quote.amountOut, toToken.decimals)} ${toToken.symbol}`;
      const receipt = await track(
        () => executeSwap({ signer, fromToken, toToken, amountIn, quote, slippageBps }),
        { label, icon: "swap" }
      );
      if (receipt?.status === 1) {
        setAmount("");
        setQuote(null);
        refreshBalances();
      }
    } finally {
      setBusy(false);
    }
  };

  // ---- derived display ---------------------------------------------------
  const fromUsd = usdPrice(prices, fromToken.coingeckoId);
  const toUsd = usdPrice(prices, toToken.coingeckoId);
  const amountInNum = Number(amount) || 0;
  const amountOutNum = quote ? Number(formatUnits(quote.amountOut, toToken.decimals)) : 0;
  const isWrap = isWrapPair(fromToken, toToken);
  const rate =
    quote && amountInNum > 0 ? formatAmount(amountOutNum / amountInNum, 0, 6) : null;
  const minReceived = quote
    ? (quote.amountOut * BigInt(10000 - slippageBps)) / 10000n
    : null;

  const button = (() => {
    if (!address) return { label: "Connect Wallet", onClick: connect };
    if (!onSepolia)
      return { label: "Switch to Sepolia", onClick: () => switchChain(chains.sepolia).catch(() => {}) };
    if (amountIn === 0n) return { label: "Enter an amount", disabled: true };
    if (insufficient) return { label: `Insufficient ${fromToken.symbol}`, disabled: true };
    if (quoting && !quote) return { label: "Fetching quote…", disabled: true, loading: true };
    if (quoteError) return { label: "No liquidity", disabled: true };
    if (!quote) return { label: "Enter an amount", disabled: true };
    if (needsApproval)
      return { label: `Approve ${fromToken.symbol}`, onClick: handleApprove, loading: busy };
    return {
      label: quote.route === "Wrap" ? "Wrap ETH" : quote.route === "Unwrap" ? "Unwrap WETH" : "Swap",
      onClick: handleSwap,
      loading: busy,
    };
  })();

  return (
    <GlassCard className="w-[min(94vw,27rem)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Swap</h2>
          <p className="text-xs text-white/40">Real trades on Sepolia via Uniswap V3</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`rounded-xl p-2 transition-colors ${showSettings ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/[0.07] hover:text-white"}`}
            aria-label="Slippage settings"
          >
            <Settings2 size={18} />
          </button>
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className="absolute right-0 top-full z-30 mt-2 w-52 rounded-2xl border border-white/10 bg-[#151233]/95 p-3 shadow-xl backdrop-blur-xl"
              >
                <p className="mb-2 text-xs font-medium text-white/60">Max slippage</p>
                <div className="flex gap-1.5">
                  {SLIPPAGE_PRESETS.map((bps) => (
                    <button
                      key={bps}
                      onClick={() => setSlippageBps(bps)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                        slippageBps === bps
                          ? "bg-violet-500 text-white"
                          : "bg-white/[0.06] text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {bps / 100}%
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FROM */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 transition-colors focus-within:border-violet-400/40 hover:border-white/[0.14]">
        <div className="mb-1.5 flex items-center justify-between text-xs text-white/40">
          <span>You pay</span>
          {address && fromBalance !== undefined && fromBalance !== null && (
            <button onClick={setMax} className="transition-colors hover:text-violet-300">
              Balance: {formatAmount(fromBalance, fromToken.decimals)}{" "}
              <span className="font-semibold text-violet-400">MAX</span>
            </button>
          )}
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
          {fromUsd && amountInNum > 0 ? formatUsd(amountInNum * fromUsd) : ""}
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
          {address && balances[toToken.symbol] !== undefined && balances[toToken.symbol] !== null && (
            <span>Balance: {formatAmount(balances[toToken.symbol], toToken.decimals)}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.p
                key={quote ? quote.amountOut.toString() : "empty"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className={`truncate font-display text-3xl font-semibold ${quote ? "text-white" : "text-white/25"} ${quoting ? "animate-pulse" : ""}`}
              >
                {quote ? formatAmount(quote.amountOut, toToken.decimals) : "0.0"}
              </motion.p>
            </AnimatePresence>
          </div>
          <TokenButton token={toToken} onClick={() => setTokenModal("to")} />
        </div>
        <div className="mt-1 h-4 text-xs text-white/35">
          {toUsd && amountOutNum > 0 ? formatUsd(amountOutNum * toUsd) : ""}
        </div>
      </div>

      {/* quote details */}
      <AnimatePresence>
        {quote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <InfoRow label="Rate">
                1 {fromToken.symbol} ≈ {rate} {toToken.symbol}
              </InfoRow>
              <InfoRow label="Route">
                <span className="flex items-center gap-1">
                  <Zap size={11} className="text-violet-400" />
                  {quote.route}
                  {quote.fee != null && ` · ${quote.fee / 10000}% pool`}
                </span>
              </InfoRow>
              {!isWrap && (
                <>
                  <InfoRow label="Max slippage">{slippageBps / 100}%</InfoRow>
                  <InfoRow label="Minimum received">
                    {formatAmount(minReceived, toToken.decimals)} {toToken.symbol}
                  </InfoRow>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {quoteError && amountIn > 0n && (
        <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] p-3 text-xs text-amber-300/90">
          {quoteError}
        </p>
      )}

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
        tokens={tokens}
        balances={balances}
      />
    </GlassCard>
  );
}
