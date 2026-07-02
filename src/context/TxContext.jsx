/* eslint-disable react/prop-types */
import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { chains } from "../lib/chains";
import { useToast } from "./ToastContext";

const TxContext = createContext(null);
const STORAGE_KEY = "nex-activity-v1";
const STATS_KEY = "nex-stats-v1";
const MAX_ITEMS = 20;
const EMPTY_STATS = { swaps: 0, bridges: 0, buys: 0, testnetTxs: 0 };

const loadActivity = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

const loadStats = () => {
  try {
    return { ...EMPTY_STATS, ...JSON.parse(localStorage.getItem(STATS_KEY)) };
  } catch {
    return { ...EMPTY_STATS };
  }
};

// which lifetime stat a confirmed tx bumps, by its activity icon
const STAT_FOR_ICON = { swap: "swaps", bridge: "bridges", buy: "buys" };

const isUserRejection = (error) =>
  error?.code === 4001 ||
  error?.code === "ACTION_REJECTED" ||
  error?.info?.error?.code === 4001;

export function TxProvider({ children }) {
  const [activity, setActivity] = useState(loadActivity);
  const [stats, setStats] = useState(loadStats);
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activity.slice(0, MAX_ITEMS)));
  }, [activity]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  const bumpStats = useCallback((icon, { testnet = false } = {}) => {
    setStats((prev) => {
      const next = { ...prev };
      const key = STAT_FOR_ICON[icon];
      if (key) next[key] += 1;
      if (testnet) next.testnetTxs += 1;
      return next;
    });
  }, []);

  const updateItem = useCallback((hash, patch) => {
    setActivity((prev) => prev.map((item) => (item.hash === hash ? { ...item, ...patch } : item)));
  }, []);

  /**
   * Wraps a tx send: wallet-confirm toast -> submitted toast with explorer
   * link -> confirmed/failed. Returns the receipt, or null on user rejection.
   */
  const track = useCallback(
    async (sendTx, { label, chainKey = "sepolia", icon, onSubmitted }) => {
      const explorer = chains[chainKey].explorer;
      const toastId = toast.push({
        type: "pending",
        title: "Confirm in wallet",
        message: label,
      });

      let tx;
      try {
        tx = await sendTx();
      } catch (error) {
        if (isUserRejection(error)) {
          toast.update(toastId, {
            type: "info",
            title: "Transaction cancelled",
            message: "You rejected the request in your wallet.",
          });
          return null;
        }
        toast.update(toastId, {
          type: "error",
          title: "Transaction failed",
          message: error?.shortMessage || error?.reason || error?.message || "Unknown error",
        });
        throw error;
      }

      onSubmitted?.(tx);
      const link = { href: `${explorer}/tx/${tx.hash}`, label: "View on explorer" };
      toast.update(toastId, {
        type: "pending",
        title: "Transaction submitted",
        message: label,
        link,
      });
      setActivity((prev) =>
        [
          { hash: tx.hash, label, chainKey, icon, status: "pending", timestamp: Date.now() },
          ...prev,
        ].slice(0, MAX_ITEMS)
      );

      try {
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          updateItem(tx.hash, { status: "confirmed" });
          bumpStats(icon, { testnet: true });
          toast.update(toastId, { type: "success", title: "Transaction confirmed", message: label, link });
        } else {
          updateItem(tx.hash, { status: "failed" });
          toast.update(toastId, { type: "error", title: "Transaction reverted", message: label, link });
        }
        return receipt;
      } catch (error) {
        updateItem(tx.hash, { status: "failed" });
        toast.update(toastId, {
          type: "error",
          title: "Transaction failed",
          message: error?.shortMessage || error?.message || "Unknown error",
          link,
        });
        throw error;
      }
    },
    [toast, updateItem, bumpStats]
  );

  /** Simulated transaction for demo mode: fake latency, always succeeds. */
  const trackDemo = useCallback(
    async ({ label, icon, durationMs }) => {
      const toastId = toast.push({
        type: "pending",
        title: "Processing demo transaction",
        message: label,
      });
      await new Promise((resolve) => setTimeout(resolve, durationMs ?? 1500 + Math.random() * 1000));
      const hash = `demo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      setActivity((prev) =>
        [
          { hash, label, icon, demo: true, status: "confirmed", timestamp: Date.now() },
          ...prev,
        ].slice(0, MAX_ITEMS)
      );
      bumpStats(icon);
      toast.update(toastId, { type: "success", title: "Demo transaction complete", message: label });
      return true;
    },
    [toast, bumpStats]
  );

  const clearActivity = useCallback(() => setActivity([]), []);

  const value = useMemo(
    () => ({ activity, stats, track, trackDemo, clearActivity }),
    [activity, stats, track, trackDemo, clearActivity]
  );

  return <TxContext.Provider value={value}>{children}</TxContext.Provider>;
}

export const useTx = () => useContext(TxContext);
