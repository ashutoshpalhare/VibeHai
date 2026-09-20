import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "default" | "success" | "error";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  toast: (message: string, opts?: { tone?: ToastTone; action?: Toast["action"] }) => void;
}

const ToastContext = createContext<ToastApi>({ toast: () => {} });

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastApi["toast"]>(
    (message, opts) => {
      const id = ++counter;
      setToasts((prev) => [
        ...prev.slice(-2),
        { id, message, tone: opts?.tone ?? "default", action: opts?.action },
      ]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-24 sm:left-0 sm:items-end sm:px-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-ink-800/95 px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-xl"
            >
              <span
                className={
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm " +
                  (t.tone === "success"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : t.tone === "error"
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-brand-500/20 text-brand-200")
                }
              >
                {t.tone === "success" ? "✓" : t.tone === "error" ? "!" : "♪"}
              </span>
              <p className="text-sm text-white/90">{t.message}</p>
              {t.action && (
                <button
                  onClick={() => {
                    t.action?.onClick();
                    dismiss(t.id);
                  }}
                  className="ml-1 shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-brand-300 hover:bg-white/10"
                >
                  {t.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
