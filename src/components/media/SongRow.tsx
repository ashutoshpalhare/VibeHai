import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddToPlaylistModal from "@/components/media/AddToPlaylistModal";
import { Menu, useMenu, type MenuItem } from "@/components/ui/Menu";
import {
  IconHeart,
  IconList,
  IconMore,
  IconNote,
  IconPlay,
  IconPlus,
  IconQueue,
  IconTrash,
} from "@/components/ui/Icons";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";
import { FALLBACK_ART, formatCount, formatTime } from "@/lib/format";
import type { Song } from "@/lib/types";
import { cn } from "@/utils/cn";

export function EqualizerBars({ className }: { className?: string }) {
  return (
    <span className={cn("flex h-4 items-end gap-[2px]", className)}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[2.5px] origin-bottom rounded-full bg-brand-300"
          style={{ height: "100%", animation: "eq 0.85s ease-in-out infinite", animationDelay: `${i * 0.13}s` }}
        />
      ))}
    </span>
  );
}

export interface SongRowProps {
  song: Song;
  index?: number;
  onPlay?: () => void;
  isCurrent?: boolean;
  isPlaying?: boolean;
  showAlbum?: boolean;
  showArt?: boolean;
  showPlays?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
  lead?: ReactNode;
  sourceLabel?: string;
  compact?: boolean;
}

export default function SongRow({
  song,
  index,
  onPlay,
  isCurrent,
  isPlaying,
  showAlbum = false,
  showArt = true,
  showPlays = false,
  onRemove,
  removeLabel = "Remove",
  lead,
  sourceLabel,
  compact = false,
}: SongRowProps) {
  const { isLiked, toggleLike } = useLibrary();
  const { addToQueue, playNext } = usePlayer();
  const { toast } = useToast();
  const navigate = useNavigate();
  const menu = useMenu();
  const [addToPlaylist, setAddToPlaylist] = useState(false);
  const liked = isLiked(song.id);

  const items: MenuItem[] = [
    {
      label: "Play next",
      icon: <IconList className="h-4 w-4" />,
      onSelect: () => {
        playNext(song, sourceLabel);
        toast("Playing next", { tone: "success" });
      },
    },
    {
      label: "Add to queue",
      icon: <IconQueue className="h-4 w-4" />,
      onSelect: () => {
        addToQueue(song, sourceLabel);
        toast("Added to queue", { tone: "success" });
      },
    },
    {
      label: liked ? "Remove from Liked Songs" : "Save to Liked Songs",
      icon: <IconHeart filled={liked} className="h-4 w-4" />,
      onSelect: () => {
        const now = toggleLike(song);
        toast(now ? "Added to Liked Songs" : "Removed from Liked Songs", { tone: "success" });
      },
      dividerAfter: true,
    },
    {
      label: "Add to playlist",
      icon: <IconPlus className="h-4 w-4" />,
      onSelect: () => setAddToPlaylist(true),
    },
    {
      label: song.albumId ? "Go to album" : "View album",
      icon: <IconNote className="h-4 w-4" />,
      disabled: !song.albumId,
      onSelect: () => navigate(`/album/${song.albumId}`),
    },
  ];

  song.artistList.forEach((a) => {
    if (a.id) {
      items.push({
        label: `Go to ${a.name}`,
        icon: <IconNote className="h-4 w-4" />,
        onSelect: () => navigate(`/artist/${a.id}`),
      });
    }
  });

  if (onRemove) {
    items.push({
      label: removeLabel,
      icon: <IconTrash className="h-4 w-4" />,
      danger: true,
      onSelect: onRemove,
    });
  }

  const primaryArtistId = song.artistList[0]?.id;
  const artistContent = primaryArtistId ? (
    <Link
      to={`/artist/${primaryArtistId}`}
      onClick={(e) => e.stopPropagation()}
      className="truncate transition hover:text-white hover:underline"
    >
      {song.artist}
    </Link>
  ) : (
    <span className="truncate">{song.artist}</span>
  );

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onDoubleClick={onPlay}
        onClick={onPlay}
        onKeyDown={(e) => {
          if (e.key === "Enter") onPlay?.();
        }}
        onContextMenu={(e) => menu.openFromEvent(e, items, song.title)}
        className={cn(
          "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 transition-colors sm:px-3",
          compact ? "py-1.5" : "py-2",
          isCurrent ? "bg-white/[0.07]" : "hover:bg-white/[0.055]",
        )}
      >
        {lead}
        {index !== undefined && !lead && (
          <div className="relative grid w-6 shrink-0 place-items-center">
            {isCurrent && isPlaying ? (
              <EqualizerBars />
            ) : (
              <>
                <span
                  className={cn(
                    "text-xs tabular-nums text-white/35 transition-opacity group-hover:opacity-0",
                    isCurrent && "text-brand-300",
                  )}
                >
                  {index + 1}
                </span>
                <IconPlay className="absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </>
            )}
          </div>
        )}

        {showArt && (
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/[0.05]">
            <img
              src={song.imageSmall || song.image || FALLBACK_ART}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_ART;
              }}
            />
            {isCurrent && isPlaying && (
              <span className="absolute inset-0 grid place-items-center bg-black/55">
                <EqualizerBars />
              </span>
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                "truncate text-[13.5px] font-medium sm:text-sm",
                isCurrent ? "text-brand-200" : "text-white/92",
              )}
            >
              {song.title}
            </p>
            {song.explicit && (
              <span className="shrink-0 rounded bg-white/15 px-1 text-[9px] font-bold leading-4 text-white/70">
                E
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11.5px] text-white/45 sm:text-xs">
            {artistContent}
            {showAlbum && song.album && (
              <>
                <span className="text-white/20">•</span>
                <Link
                  to={`/album/${song.albumId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="truncate hover:text-white hover:underline"
                >
                  {song.album}
                </Link>
              </>
            )}
          </p>
        </div>

        {showPlays && song.playCount > 0 && (
          <span className="hidden shrink-0 text-[11px] tabular-nums text-white/30 lg:block">
            {formatCount(song.playCount)}
          </span>
        )}

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const now = toggleLike(song);
              toast(now ? "Added to Liked Songs" : "Removed from Liked Songs", { tone: "success" });
            }}
            aria-label={liked ? "Remove from liked" : "Add to liked"}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full transition",
              liked
                ? "text-brand-300 opacity-100"
                : "text-white/45 opacity-0 hover:text-white group-hover:opacity-100 focus-visible:opacity-100",
              compact && "hidden sm:grid",
            )}
          >
            <IconHeart filled={liked} className="h-4 w-4" />
          </button>

          <span className="hidden w-10 text-right text-xs tabular-nums text-white/40 sm:block">
            {formatTime(song.duration)}
          </span>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => menu.openFromEvent(e, items, song.title)}
            aria-label="More options"
            className="grid h-8 w-8 place-items-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            <IconMore className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <Menu state={menu.state} onClose={menu.close} />
      <AddToPlaylistModal
        open={addToPlaylist}
        onClose={() => setAddToPlaylist(false)}
        songs={[song]}
      />
    </>
  );
}
