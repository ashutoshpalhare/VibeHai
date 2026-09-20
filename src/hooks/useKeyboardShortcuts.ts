import { useEffect, useRef } from "react";

type Handler = (e: KeyboardEvent) => void;

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable === true
  );
}

/**
 * Global keyboard shortcuts. Ignores keystrokes while typing in form fields.
 * Returns a ref so consumers can attach the handler without re-binding.
 */
export function useKeyboardShortcuts(handler: Handler, deps: unknown[] = []) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      ref.current(e);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["Space"], label: "Play / pause" },
  { keys: ["→", "←"], label: "Seek ±5 seconds" },
  { keys: ["Shift", "→"], label: "Next track" },
  { keys: ["Shift", "←"], label: "Previous track" },
  { keys: ["↑", "↓"], label: "Volume up / down" },
  { keys: ["M"], label: "Mute" },
  { keys: ["S"], label: "Shuffle" },
  { keys: ["R"], label: "Repeat mode" },
  { keys: ["Q"], label: "Toggle queue" },
  { keys: ["F"], label: "Full screen player" },
  { keys: ["L"], label: "Like current song" },
  { keys: ["/"], label: "Focus search" },
  { keys: ["Esc"], label: "Close overlays" },
];
