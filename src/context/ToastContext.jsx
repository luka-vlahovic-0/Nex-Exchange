/* eslint-disable react/prop-types */
import { createContext, useContext, useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, Loader2, ExternalLink, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={20} className="text-rose-400 shrink-0" />,
  info: <Info size={20} className="text-sky-400 shrink-0" />,
  pending: <Loader2 size={20} className="text-violet-400 shrink-0 animate-spin" />,
};

function Toast({ toast, onDismiss }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="pointer-events-auto w-[min(92vw,22rem)] rounded-2xl border border-white/10 bg-[#12102a]/90 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        {ICONS[toast.type] ?? ICONS.info}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-xs leading-relaxed text-white/60">{toast.message}</p>
          )}
          {toast.link && (
            <a
              href={toast.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-violet-300 transition-colors hover:text-violet-200"
            >
              {toast.link.label} <ExternalLink size={12} />
            </a>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const scheduleDismiss = useCallback(
    (id, type) => {
      clearTimeout(timers.current.get(id));
      if (type === "pending") return; // pending toasts stay until updated
      timers.current.set(id, setTimeout(() => dismiss(id), 6000));
    },
    [dismiss]
  );

  const push = useCallback(
    ({ type = "info", title, message, link }) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, message, link }]);
      scheduleDismiss(id, type);
      return id;
    },
    [scheduleDismiss]
  );

  const update = useCallback(
    (id, patch) => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      scheduleDismiss(id, patch.type);
    },
    [scheduleDismiss]
  );

  const value = useMemo(() => ({ push, update, dismiss }), [push, update, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
