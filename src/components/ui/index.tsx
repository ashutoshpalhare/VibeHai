import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { IconPlay } from "./Icons";

/* ------------------------------ Buttons ------------------------------ */

type Variant = "brand" | "solid" | "ghost" | "outline" | "danger";

const variants: Record<Variant, string> = {
  brand: "brand-gradient text-white shadow-lg shadow-brand-600/25 hover:brightness-110",
  solid: "bg-white text-ink-950 hover:bg-white/90",
  ghost: "text-white/70 hover:text-white hover:bg-white/10",
  outline: "border border-white/20 text-white/90 hover:bg-white/10 hover:border-white/35",
  danger: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25",
};

export function Button({
  variant = "ghost",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        size === "sm" && "px-3.5 py-1.5 text-xs",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({
  className,
  label,
  active,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      {...rest}
      title={label}
      aria-label={label}
      className={cn(
        "relative grid place-items-center rounded-full transition-all active:scale-90",
        "h-9 w-9 shrink-0",
        active ? "text-brand-300" : "text-white/65 hover:text-white",
        "hover:bg-white/10",
        className,
      )}
    >
      {children}
      {active && (
        <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-300" />
      )}
    </button>
  );
}

export function PlayButton({
  size = 56,
  playing = false,
  className,
  onClick,
  label = "Play",
}: {
  size?: number;
  playing?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  label?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={playing ? "Pause" : label}
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      style={{ width: size, height: size }}
      className={cn(
        "grid place-items-center rounded-full brand-gradient text-white shadow-xl shadow-black/40",
        className,
      )}
    >
      {playing ? (
        <span className="flex items-end gap-[3px]" style={{ height: size * 0.34 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[3px] origin-bottom rounded-full bg-white"
              style={{
                height: "100%",
                animation: "eq 0.9s ease-in-out infinite",
                animationDelay: `${i * 0.14}s`,
              }}
            />
          ))}
        </span>
      ) : (
        <IconPlay style={{ width: size * 0.4, height: size * 0.4, marginLeft: size * 0.04 }} />
      )}
    </motion.button>
  );
}

/* ------------------------------ Skeletons ---------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function SongRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/5" />
      </div>
      <Skeleton className="hidden h-3 w-10 sm:block" />
    </div>
  );
}

export function SongListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-0.5">
      {Array.from({ length: rows }).map((_, i) => (
        <SongRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="w-full space-y-3">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  );
}

export function ShelfSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
      <Skeleton className="h-44 w-44 rounded-2xl" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
    </div>
  );
}

/* ------------------------------ States ------------------------------- */

export function EmptyState({
  emoji = "🎧",
  title,
  body,
  action,
  className,
}: {
  emoji?: string;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.04] text-3xl">
        {emoji}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/50">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong while loading this section.",
  onRetry,
  compact = false,
}: {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] text-center",
        compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-12",
      )}
    >
      <span className={compact ? "text-xl" : "text-2xl"}>⚠️</span>
      <p className={cn("max-w-md text-white/70", compact ? "text-xs" : "text-sm")}>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function InlineSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white",
        className,
      )}
    />
  );
}

/* ------------------------------ Modal -------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-t-3xl border border-white/10 bg-ink-850 shadow-2xl sm:rounded-3xl",
          width,
        )}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </motion.div>
    </div>
  );
}
