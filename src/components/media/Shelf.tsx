import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/Icons";
import { cn } from "@/utils/cn";

export function Section({
  title,
  subtitle,
  href,
  hrefLabel = "Show all",
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 truncate text-xs text-white/45">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {href && (
            <Link
              to={href}
              className="text-[11px] font-bold uppercase tracking-wider text-white/40 transition hover:text-white"
            >
              {hrefLabel}
            </Link>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Grid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Scroller({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(320, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="group/scroller relative -mx-1">
      <div
        ref={ref}
        className={cn(
          "no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto px-1 pb-1",
          className,
        )}
      >
        {children}
      </div>
      <button
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="absolute -left-3 top-[38%] hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-850/95 text-white shadow-xl opacity-0 transition group-hover/scroller:opacity-100 hover:bg-ink-750 xl:grid"
      >
        <IconChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="absolute -right-3 top-[38%] hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-850/95 text-white shadow-xl opacity-0 transition group-hover/scroller:opacity-100 hover:bg-ink-750 xl:grid"
      >
        <IconChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ScrollerItem({ children }: { children: ReactNode }) {
  return <div className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[18.4%]">{children}</div>;
}
