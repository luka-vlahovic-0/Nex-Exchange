/* eslint-disable react/prop-types */
import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { starterBalances } from "../lib/demoData";

const ModeContext = createContext(null);
const MODE_KEY = "nex-mode-v1";
const DEMO_BALANCES_KEY = "nex-demo-balances-v1";

const loadDemoBalances = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_BALANCES_KEY));
    return { ...starterBalances, ...saved };
  } catch {
    return { ...starterBalances };
  }
};

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) ?? "demo");
  const [demoBalances, setDemoBalances] = useState(loadDemoBalances);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(DEMO_BALANCES_KEY, JSON.stringify(demoBalances));
  }, [demoBalances]);

  /** Apply balance deltas after a simulated trade: { ETH: -1, USDC: +2400 } */
  const adjustDemoBalances = useCallback((deltas) => {
    setDemoBalances((prev) => {
      const next = { ...prev };
      for (const [symbol, delta] of Object.entries(deltas)) {
        next[symbol] = Math.max(0, (next[symbol] ?? 0) + delta);
      }
      return next;
    });
  }, []);

  const resetDemoBalances = useCallback(() => setDemoBalances({ ...starterBalances }), []);

  const value = useMemo(
    () => ({ mode, setMode, demoBalances, adjustDemoBalances, resetDemoBalances }),
    [mode, demoBalances, adjustDemoBalances, resetDemoBalances]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export const useMode = () => useContext(ModeContext);
