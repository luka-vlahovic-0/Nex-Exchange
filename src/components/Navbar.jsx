/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { ArrowLeftRight, Landmark, CreditCard, FlaskConical, Sparkles, Trophy } from "lucide-react";
import nexraImg from "../assets/nexra.png";
import ConnectButton from "./ConnectButton";
import { useMode } from "../context/ModeContext";
import { useWallet } from "../context/WalletContext";
import { chains, chainById } from "../lib/chains";

const TABS = [
  { id: "swap", label: "Swap", icon: ArrowLeftRight },
  { id: "bridge", label: "Bridge", icon: Landmark },
  { id: "buy", label: "Buy", icon: CreditCard },
  { id: "quests", label: "Missions", icon: Trophy },
];

function TabButtons({ activeTab, setActiveTab, layoutId, framed = false }) {
  return (
    <div
      className={`flex items-center gap-1 ${
        framed ? "rounded-full border border-white/10 bg-[#120d2e]/80 p-1 backdrop-blur-xl" : ""
      }`}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              active ? "text-white" : "text-white/55 hover:text-white/85"
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600/80 to-fuchsia-500/80 shadow-glow"
              />
            )}
            <Icon size={15} className="relative z-10" />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ModeToggle() {
  const { mode, setMode } = useMode();
  const { address, chainId, switchChain } = useWallet();
  const options = [
    { id: "demo", label: "Demo", icon: Sparkles },
    { id: "testnet", label: "Testnet", icon: FlaskConical },
  ];

  const handleSelect = (id) => {
    setMode(id);
    // entering testnet mode on an unsupported network (e.g. mainnet):
    // prompt the wallet to hop onto Sepolia right away
    if (id === "testnet" && address && !chainById(chainId)) {
      switchChain(chains.sepolia).catch(() => {});
    }
  };

  return (
    <div className="flex items-center rounded-full bg-white/[0.06] p-1">
      {options.map(({ id, label, icon: Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            title={id === "demo" ? "Simulated trades with live prices" : "Real on-chain testnet transactions"}
            className={`relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              active ? "text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className={`absolute inset-0 rounded-full ${
                  id === "demo" ? "bg-cyan-500/30" : "bg-emerald-500/30"
                }`}
              />
            )}
            <Icon size={13} className="relative z-10" />
            <span className="relative z-10 hidden lg:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <>
      {/* one floating pill, centered — brand · tabs · mode · wallet */}
      <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-full border border-white/10 bg-[#120d2e]/75 py-2 pl-5 pr-2 shadow-xl shadow-black/30 backdrop-blur-xl sm:gap-5"
        >
          {/* brand */}
          <div className="flex items-center gap-1.5">
            <img src={nexraImg} alt="Nex Exchange logo" className="h-8 w-auto object-contain" />
            <p className="hidden font-display text-base font-bold leading-none tracking-tight text-white xl:block">
              Nex
              <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                Exchange
              </span>
            </p>
          </div>

          <span className="hidden h-6 w-px bg-white/10 md:block" />

          {/* tabs (desktop) */}
          <div className="hidden md:block">
            <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} layoutId="tab-pill-desktop" />
          </div>

          <span className="hidden h-6 w-px bg-white/10 md:block" />

          <ModeToggle />
          <ConnectButton />
        </motion.div>
      </header>

      {/* mobile bottom tab bar — app-like navigation on small screens */}
      <motion.nav
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 left-1/2 z-40 md:hidden"
        style={{ x: "-50%" }}
      >
        <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} layoutId="tab-pill-mobile" framed />
      </motion.nav>
    </>
  );
}
