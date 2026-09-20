import { Link } from "react-router-dom";
import { DEVELOPER } from "@/pages/About";
import { cn } from "@/utils/cn";

/**
 * Small "Built with ❤️" credit. Rendered at the bottom of every page (via AppShell)
 * and inside the sidebar footer.
 */
export default function FooterCredit({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-white/35",
        className,
      )}
    >
      <span>
        Built with <span className="text-rose-400">❤️</span> by{" "}
        <Link to="/about" className="font-semibold text-white/60 transition hover:text-brand-200">
          {DEVELOPER.name}
        </Link>
      </span>
      {!compact && (
        <>
          <span className="text-white/15">•</span>
          <a
            href={DEVELOPER.links.github}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            GitHub
          </a>
          <span className="text-white/15">•</span>
          <a
            href={DEVELOPER.links.portfolio}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Portfolio
          </a>
          <span className="text-white/15">•</span>
          <Link to="/about" className="transition hover:text-white">
            About
          </Link>
        </>
      )}
    </div>
  );
}
