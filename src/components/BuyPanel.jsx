/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Smartphone, Landmark, ChevronDown, CheckCircle2, Sparkles } from "lucide-react";
import { formatAmount } from "../lib/format";
import { useTx } from "../context/TxContext";
import { GlassCard, ActionButton, Logo, InfoRow } from "./ui";

const FIATS = [
  { code: "usd", symbol: "$", label: "USD" },
  { code: "eur", symbol: "€", label: "EUR" },
  { code: "gbp", symbol: "£", label: "GBP" },
];

const ASSETS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    coingeckoId: "ethereum",
    img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    coingeckoId: "bitcoin",
    img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png",
  },
  {
    symbol: "SOL",
    name: "Solana",
    coingeckoId: "solana",
    img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    coingeckoId: "usd-coin",
    img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "applepay", label: "Apple Pay", icon: Smartphone },
  { id: "bank", label: "Bank", icon: Landmark },
];

const FEE_RATE = 0.015;

export default function BuyPanel({ prices }) {
  const { trackDemo } = useTx();
  const [fiat, setFiat] = useState(FIATS[0]);
  const [asset, setAsset] = useState(ASSETS[0]);
  const [amount, setAmount] = useState("100");
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [assetMenuOpen, setAssetMenuOpen] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | processing | success

  const price = prices?.[asset.coingeckoId]?.[fiat.code] ?? null;
  const amountNum = Number(amount) || 0;
  const receiveAmount = useMemo(
    () => (price && amountNum > 0 ? (amountNum * (1 - FEE_RATE)) / price : 0),
    [price, amountNum]
  );

  const handleBuy = () => {
    setPhase("processing");
    trackDemo({
      label: `Buy ${formatAmount(receiveAmount)} ${asset.symbol} for ${fiat.symbol}${amountNum.toLocaleString()}`,
      icon: "buy",
      durationMs: 2200,
    });
    setTimeout(() => setPhase("success"), 2200);
    setTimeout(() => setPhase("idle"), 5200);
  };

  return (
    <GlassCard className="w-[min(94vw,27rem)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Buy</h2>
          <p className="text-xs text-white/40">Live market prices · simulated checkout</p>
        </div>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
          Demo
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex h-[22rem] flex-col items-center justify-center gap-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
              className="rounded-full bg-emerald-400/15 p-5"
            >
              <CheckCircle2 size={52} className="text-emerald-400" />
            </motion.div>
            <div>
              <p className="font-display text-lg font-bold text-white">Purchase complete</p>
              <p className="mt-1 text-sm text-white/50">
                {formatAmount(receiveAmount)} {asset.symbol} added to your demo portfolio
              </p>
            </div>
            <p className="flex items-center gap-1 text-[10px] text-white/30">
              <Sparkles size={11} /> This was a simulation — no real payment was made
            </p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* fiat amount */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 transition-colors focus-within:border-violet-400/40">
              <p className="mb-1.5 text-xs text-white/40">You spend</p>
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-semibold text-white/50">{fiat.symbol}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => /^\d*$/.test(e.target.value) && setAmount(e.target.value)}
                  className="w-full min-w-0 flex-1 bg-transparent font-display text-3xl font-semibold text-white placeholder-white/25"
                />
                <div className="flex shrink-0 gap-1 rounded-full border border-white/10 bg-white/[0.07] p-1">
                  {FIATS.map((f) => (
                    <button
                      key={f.code}
                      onClick={() => setFiat(f)}
                      className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                        fiat.code === f.code ? "bg-violet-500 text-white" : "text-white/50 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex gap-1.5">
                {[50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(String(preset))}
                    className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {fiat.symbol}
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* asset */}
            <div className="relative mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
              <p className="mb-1.5 text-xs text-white/40">You receive</p>
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 flex-1 truncate font-display text-3xl font-semibold text-white">
                  {receiveAmount > 0 ? formatAmount(receiveAmount) : "0.0"}
                </p>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setAssetMenuOpen(!assetMenuOpen)}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] py-1.5 pl-2 pr-3 transition-colors hover:bg-white/[0.12]"
                >
                  <Logo src={asset.img} alt={asset.symbol} size={24} />
                  <span className="text-sm font-semibold text-white">{asset.symbol}</span>
                  <ChevronDown size={14} className={`text-white/50 transition-transform ${assetMenuOpen ? "rotate-180" : ""}`} />
                </motion.button>
              </div>
              <AnimatePresence>
                {assetMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    className="absolute right-3 top-full z-30 mt-1 w-56 rounded-2xl border border-white/10 bg-[#151233]/95 p-1.5 shadow-xl backdrop-blur-xl"
                  >
                    {ASSETS.map((a) => (
                      <button
                        key={a.symbol}
                        onClick={() => {
                          setAsset(a);
                          setAssetMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors ${
                          asset.symbol === a.symbol ? "bg-violet-500/20" : "hover:bg-white/[0.06]"
                        }`}
                      >
                        <Logo src={a.img} alt={a.symbol} size={26} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{a.symbol}</p>
                          <p className="text-[10px] text-white/45">{a.name}</p>
                        </div>
                        {prices?.[a.coingeckoId]?.[fiat.code] && (
                          <p className="text-xs text-white/55">
                            {fiat.symbol}
                            {prices[a.coingeckoId][fiat.code].toLocaleString()}
                          </p>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* payment method */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => {
                const active = method.id === id;
                return (
                  <motion.button
                    key={id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setMethod(PAYMENT_METHODS.find((m) => m.id === id))}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-colors ${
                      active
                        ? "border-violet-400/50 bg-violet-500/[0.12] text-white"
                        : "border-white/[0.07] bg-white/[0.03] text-white/55 hover:border-white/20"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-semibold">{label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* summary */}
            <div className="mt-3 space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <InfoRow label={`${asset.symbol} price`}>
                {price ? `${fiat.symbol}${price.toLocaleString()}` : "Loading…"}
              </InfoRow>
              <InfoRow label="Processing fee (1.5%)">
                {fiat.symbol}
                {(amountNum * FEE_RATE).toFixed(2)}
              </InfoRow>
            </div>

            <div className="mt-4">
              <ActionButton
                onClick={handleBuy}
                disabled={!price || amountNum <= 0}
                loading={phase === "processing"}
              >
                {phase === "processing" ? (
                  "Processing payment…"
                ) : (
                  <>
                    Buy {asset.symbol}
                    {amountNum > 0 && ` for ${fiat.symbol}${amountNum.toLocaleString()}`}
                  </>
                )}
              </ActionButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
