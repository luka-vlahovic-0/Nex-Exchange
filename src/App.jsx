import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SwapPanel from "./components/SwapPanel";
import BridgePanel from "./components/BridgePanel";
import DemoSwapPanel from "./components/DemoSwapPanel";
import DemoBridgePanel from "./components/DemoBridgePanel";
import BuyPanel from "./components/BuyPanel";
import QuestsPanel from "./components/QuestsPanel";
import Activity from "./components/Activity";
import { useWallet } from "./context/WalletContext";
import { useMode } from "./context/ModeContext";
import { useTokenBalances, useNativeBalances } from "./hooks/useBalances";
import { usePrices } from "./hooks/usePrices";

export default function App() {
  const [activeTab, setActiveTab] = useState("swap");
  const { address } = useWallet();
  const { mode } = useMode();
  const isTestnet = mode === "testnet";
  const { balances, refresh: refreshTokenBalances } = useTokenBalances(isTestnet ? address : null);
  const { balances: nativeBalances, refresh: refreshNativeBalances } = useNativeBalances(
    isTestnet ? address : null
  );
  const prices = usePrices();

  const panels = isTestnet
    ? {
        swap: <SwapPanel balances={balances} refreshBalances={refreshTokenBalances} prices={prices} />,
        bridge: (
          <BridgePanel
            nativeBalances={nativeBalances}
            refreshBalances={refreshNativeBalances}
            prices={prices}
          />
        ),
        buy: <BuyPanel prices={prices} />,
        quests: <QuestsPanel />,
      }
    : {
        swap: <DemoSwapPanel prices={prices} />,
        bridge: <DemoBridgePanel prices={prices} />,
        buy: <BuyPanel prices={prices} />,
        quests: <QuestsPanel />,
      };

  return (
    <div className="relative flex min-h-screen flex-col">
      <Background />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 pb-6 pt-24 md:pt-28">
          {/* hero line (Missions brings its own hero) */}
          {activeTab !== "quests" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trade across{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                chains
              </span>
              {isTestnet ? ", for real." : ", risk-free."}
            </h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mx-auto mt-2 max-w-md text-sm text-white/45"
              >
                {isTestnet
                  ? "Real on-chain swaps on Sepolia and real bridging between Sepolia, Base, Optimism and Arbitrum — no real funds required."
                  : "Explore the full experience with 25 tokens across 12 networks — live market prices, simulated execution."}
              </motion.p>
            </AnimatePresence>
          </motion.div>
          )}

          {/* instant panel switch with a fast blur-in — no exit animation to wait on */}
          <motion.div
            key={`${mode}-${activeTab}`}
            initial={{ opacity: 0, y: 6, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {panels[activeTab]}
          </motion.div>

          <Activity />
        </main>

        <Footer />
      </div>
    </div>
  );
}
