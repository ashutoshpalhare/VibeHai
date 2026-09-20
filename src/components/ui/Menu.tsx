import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  dividerAfter?: boolean;
  disabled?: boolean;
  hint?: string;
}

export interface MenuState {
  x: number;
  y: number;
  items: MenuItem[];
  title?: string;
}

export function useMenu() {
  const [state, setState] = useState<MenuState | null>(null);

  const show = useCallback((next: MenuState | ((prev: MenuState | null) => MenuState | null)) => {
    setState((prev) => (typeof next === "function" ? (next as any)(prev) : next));
  }, []);

  const close = useCallback(() => setState(null), []);

  const openFromEvent = useCallback(
    (e: { clientX: number; clientY: number; preventDefault: () => void; stopPropagation: () => void }, items: MenuItem[], title?: string) => {
      e.preventDefault();
      e.stopPropagation();
      show({ x: e.clientX, y: e.clientY, items, title });
    },
    [show],
  );

  return { state, show, close, openFromEvent };
}

export function Menu({ state, onClose }: { state: MenuState | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: state?.x ?? 0, top: state?.y ?? 0 });

  useLayoutEffect(() => {
    if (!state || !ref.current) return;
    const el = ref.current;
    const { offsetWidth: w, offsetHeight: h } = el;
    const pad = 10;
    const left = Math.min(Math.max(pad, state.x), window.innerWidth - w - pad);
    const top =
      state.y + h > window.innerHeight - pad
        ? Math.max(pad, state.y - h - 6)
        : Math.max(pad, state.y);
    setPos({ left, top });
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", onClose);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", onClose);
    };
  }, [state, onClose]);

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.13 }}
          style={{ left: pos.left, top: pos.top }}
          className="fixed z-[95] min-w-[218px] overflow-hidden rounded-2xl border border-white/10 bg-ink-800/98 p-1.5 shadow-2xl shadow-black/70 backdrop-blur-xl"
        >
          {state.title && (
            <div className="truncate px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
              {state.title}
            </div>
          )}
          {state.items.map((item, i) =>
            item.disabled ? null : (
              <div key={item.label + i}>
                <button
                  onClick={() => {
                    item.onSelect?.();
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition",
                    item.danger
                      ? "text-rose-300 hover:bg-rose-500/15"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {item.icon && (
                    <span className="grid h-4 w-4 shrink-0 place-items-center opacity-80">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <span className="shrink-0 text-[10px] uppercase tracking-wide text-white/30">
                      {item.hint}
                    </span>
                  )}
                </button>
                {item.dividerAfter && <div className="my-1 h-px bg-white/[0.07]" />}
              </div>
            ),
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
