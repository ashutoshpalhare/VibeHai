import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import AddToPlaylistModal from "@/components/media/AddToPlaylistModal";
import { Button, PlayButton } from "@/components/ui";
import { IconPlus, IconQueue, IconShuffle } from "@/components/ui/Icons";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";
import { FALLBACK_ART } from "@/lib/format";
import type { Song } from "@/lib/types";
import { cn } from "@/utils/cn";

export function DetailHero({
  eyebrow,
  title,
  image,
  meta,
  description,
  round,
  children,
}: {
  eyebrow: string;
  title: string;
  image?: string;
  meta: ReactNode;
  description?: string;
  round?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className="relative -mx-4 mb-8 overflow-hidden px-4 pb-2 pt-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -top-24">
        {image && (
          <img src={image} alt="" className="h-full w-full scale-110 object-cover opacity-25 blur-3xl" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-950/60 to-ink-950" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-end"
      >
        <div
          className={cn(
            "h-[168px] w-[168px] shrink-0 overflow-hidden bg-white/[0.06] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)] ring-1 ring-white/10 sm:h-[200px] sm:w-[200px]",
            round ? "rounded-full" : "rounded-2xl",
          )}
        >
          <img
            src={image || FALLBACK_ART}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_ART;
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/45">
            {eyebrow}
          </p>
          <h1 className="mt-1.5 break-words text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 line-clamp-3 max-w-2xl text-[13px] leading-relaxed text-white/55">
              {description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-white/50">
            {meta}
          </div>
          {children && <div className="mt-5">{children}</div>}
        </div>
      </motion.div>
    </header>
  );
}

export function CollectionActions({
  songs,
  source,
  saved,
  onSave,
  saveLabel = "Save",
  savedLabel = "Saved",
  extra,
}: {
  songs: Song[];
  source: { id: string; title: string };
  saved?: boolean;
  onSave?: () => void;
  saveLabel?: string;
  savedLabel?: string;
  extra?: ReactNode;
}) {
  const player = usePlayer();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const playable = songs.filter((s) => s.sources?.length);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PlayButton
        size={52}
        playing={player.isPlaying && playable.some((s) => s.id === player.current?.id)}
        label={`Play ${source.title}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!playable.length) {
            toast("No playable songs here", { tone: "error" });
            return;
          }
          if (player.queueSource?.id === source.id && player.isPlaying) player.pause();
          else if (player.queueSource?.id === source.id) player.play();
          else player.playQueue(playable, 0, source);
        }}
      />
      <Button variant="ghost" onClick={() => player.shufflePlay(playable, source)} disabled={playable.length < 2}>
        <IconShuffle className="h-4 w-4" /> Shuffle
      </Button>
      <Button
        variant="ghost"
        disabled={!playable.length}
        onClick={() => {
          player.addToQueue(playable, source.title);
          toast(`Added ${playable.length} song${playable.length === 1 ? "" : "s"} to queue`, { tone: "success" });
        }}
      >
        <IconQueue className="h-4 w-4" /> Add to queue
      </Button>
      <Button variant="ghost" disabled={!playable.length} onClick={() => setAdding(true)}>
        <IconPlus className="h-4 w-4" /> To playlist
      </Button>
      {onSave && (
        <Button variant={saved ? "brand" : "outline"} onClick={onSave}>
          {saved ? savedLabel : saveLabel}
        </Button>
      )}
      {extra}
      <AddToPlaylistModal open={adding} onClose={() => setAdding(false)} songs={playable} />
    </div>
  );
}

export function MetaText({ children }: { children: ReactNode }) {
  return <span className="text-white/50">{children}</span>;
}

export function Dot() {
  return <span className="text-white/20">•</span>;
}
