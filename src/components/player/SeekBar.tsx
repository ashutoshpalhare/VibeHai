import { useEffect, useState } from "react";
import { formatTime } from "@/lib/format";
import { cn } from "@/utils/cn";

export function SeekBar({
  value,
  max,
  onChange,
  onSeek,
  buffered,
  className,
  compact,
}: {
  value: number;
  max: number;
  onChange?: (v: number) => void;
  onSeek: (v: number) => void;
  buffered?: number;
  className?: string;
  compact?: boolean;
}) {
  const [drag, setDrag] = useState<number | null>(null);
  const shown = drag ?? value;
  const pct = max > 0 ? Math.min(100, (shown / max) * 100) : 0;

  useEffect(() => {
    if (drag !== null && Math.abs(drag - value) > 0.5) setDrag(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={cn("group flex w-full items-center gap-2", className)}>
      {!compact && (
        <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-white/45">
          {formatTime(shown)}
        </span>
      )}
      <div className="relative flex-1">
        {buffered !== undefined && max > 0 && (
          <div
            className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10"
            style={{ width: `${Math.min(100, (buffered / max) * 100)}%` }}
          />
        )}
        <input
          type="range"
          min={0}
          max={max || 1}
          step={0.5}
          value={shown}
          aria-label="Seek"
          onChange={(e) => {
            const v = Number(e.target.value);
            setDrag(v);
            onChange?.(v);
          }}
          onPointerUp={() => {
            if (drag !== null) onSeek(drag);
            setDrag(null);
          }}
          onKeyUp={() => {
            if (drag !== null) onSeek(drag);
            setDrag(null);
          }}
          style={{ ["--range-progress" as string]: `${pct}%` }}
          className="range relative h-1.5"
        />
      </div>
      {!compact && (
        <span className="w-10 shrink-0 text-[11px] tabular-nums text-white/45">
          {formatTime(max)}
        </span>
      )}
    </div>
  );
}

export function VolumeBar({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={value}
      aria-label="Volume"
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ ["--range-progress" as string]: `${pct}%` }}
      className={cn("range h-1.5 w-24", className)}
    />
  );
}
