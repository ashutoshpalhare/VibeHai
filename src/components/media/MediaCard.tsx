import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { EqualizerBars } from "@/components/media/SongRow";
import { PlayButton } from "@/components/ui";
import { IconMic } from "@/components/ui/Icons";
import { FALLBACK_ART, formatCount } from "@/lib/format";
import type { Album, Artist, Collection, Song } from "@/lib/types";
import { cn } from "@/utils/cn";

interface BaseProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

function CardShell({
  to,
  children,
  className,
  onPlay,
  isCurrent,
  isPlaying,
}: BaseProps & {
  to: string;
  children: React.ReactNode;
  onPlay?: () => void;
  isCurrent?: boolean;
  isPlaying?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group relative w-full rounded-2xl p-3 transition-colors hover:bg-white/[0.055]",
        isCurrent && "bg-white/[0.055]",
        className,
      )}
    >
      <Link to={to} className="block">
        {children}
      </Link>
      {onPlay && (
        <div className="absolute right-4 top-[46%] translate-y-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-within:opacity-100">
          <PlayButton size={42} playing={isPlaying && isCurrent} onClick={onPlay} />
        </div>
      )}
    </motion.div>
  );
}

function Art({ src, round, isCurrent, isPlaying }: { src?: string; round?: boolean; isCurrent?: boolean; isPlaying?: boolean }) {
  return (
    <div
      className={cn(
        "relative mb-3 aspect-square w-full overflow-hidden bg-white/[0.05] shadow-lg shadow-black/40",
        round ? "rounded-full" : "rounded-xl",
      )}
    >
      <img
        src={src || FALLBACK_ART}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = FALLBACK_ART;
        }}
      />
      {isCurrent && isPlaying && (
        <span
          className={cn(
            "absolute inset-0 grid place-items-center bg-black/60",
            round && "rounded-full",
          )}
        >
          <EqualizerBars />
        </span>
      )}
    </div>
  );
}

function Meta({ title, subtitle }: BaseProps) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[13.5px] font-semibold text-white/95">{title}</p>
      <p className="mt-0.5 truncate text-[11.5px] text-white/45">{subtitle}</p>
    </div>
  );
}

export function SongCard({
  song,
  onPlay,
  isCurrent,
  isPlaying,
  className,
}: {
  song: Song;
  onPlay?: () => void;
  isCurrent?: boolean;
  isPlaying?: boolean;
  className?: string;
}) {
  return (
    <CardShell
      to={song.albumId ? `/album/${song.albumId}` : "#"}
      className={className}
      onPlay={onPlay}
      isCurrent={isCurrent}
      isPlaying={isPlaying}
    >
      <Art src={song.image} isCurrent={isCurrent} isPlaying={isPlaying} />
      <Meta title={song.title} subtitle={song.artist} />
    </CardShell>
  );
}

export function AlbumCard({ album, className }: { album: Album; className?: string }) {
  return (
    <CardShell to={`/album/${album.id}`} className={className}>
      <Art src={album.image} />
      <Meta
        title={album.title}
        subtitle={album.subtitle || `${album.songCount} songs${album.year ? ` • ${album.year}` : ""}`}
      />
    </CardShell>
  );
}

export function CollectionCard({
  collection,
  className,
}: {
  collection: Collection;
  className?: string;
}) {
  return (
    <CardShell to={`/playlist/${collection.id}`} className={className}>
      <Art src={collection.image} />
      <Meta title={collection.title} subtitle={collection.subtitle || `${collection.songCount} songs`} />
    </CardShell>
  );
}

export function ArtistCard({ artist, className }: { artist: Artist; className?: string }) {
  return (
    <CardShell to={`/artist/${artist.id}`} className={className}>
      <Art src={artist.image} round />
      <Meta
        title={artist.name}
        subtitle={`${artist.role || "Artist"}${artist.followers ? ` • ${formatCount(artist.followers)} fans` : ""}`}
      />
    </CardShell>
  );
}

export function UserPlaylistCard({
  playlist,
  className,
  onPlay,
  isPlaying,
}: {
  playlist: { id: string; name: string; songs: Song[]; description?: string; cover?: string };
  className?: string;
  onPlay?: () => void;
  isPlaying?: boolean;
}) {
  return (
    <CardShell
      to={`/playlist/${playlist.id}`}
      className={className}
      onPlay={onPlay}
      isCurrent={playlist.songs.length > 0}
      isPlaying={isPlaying}
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand-600/50 to-punch-500/40 shadow-lg shadow-black/40">
        {playlist.cover || playlist.songs[0]?.image ? (
          <img src={playlist.cover || playlist.songs[0].image} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="grid h-full w-full place-items-center text-3xl opacity-70">🎶</span>
        )}
        {isPlaying && (
          <span className="absolute inset-0 grid place-items-center bg-black/60">
            <EqualizerBars />
          </span>
        )}
      </div>
      <Meta
        title={playlist.name}
        subtitle={playlist.description || `${playlist.songs.length} song${playlist.songs.length === 1 ? "" : "s"}`}
      />
    </CardShell>
  );
}

export function MoodTile({
  label,
  emoji,
  from,
  to,
  onClick,
}: {
  label: string;
  emoji: string;
  from: string;
  to: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className="relative h-[86px] w-full overflow-hidden rounded-2xl p-4 text-left shadow-lg shadow-black/30"
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <span className="absolute -right-3 -bottom-4 text-[64px] leading-none opacity-30 select-none">
        {emoji}
      </span>
      <span className="relative text-[15px] font-bold text-white drop-shadow">{label}</span>
      <span className="relative mt-0.5 block text-[11px] font-medium text-white/80">
        Play the vibe
      </span>
    </motion.button>
  );
}

export function ArtistPill({ artist }: { artist: Artist }) {
  return (
    <Link
      to={`/artist/${artist.id}`}
      className="group flex w-[104px] shrink-0 flex-col items-center gap-2 rounded-2xl p-2 transition hover:bg-white/[0.05]"
    >
      <span className="h-[84px] w-[84px] overflow-hidden rounded-full bg-white/[0.06] shadow-lg shadow-black/40">
        <img
          src={artist.image}
          alt={artist.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </span>
      <span className="w-full truncate text-center text-xs font-medium text-white/85">
        {artist.name}
      </span>
    </Link>
  );
}

export function ArtistPillSkeleton() {
  return (
    <div className="flex w-[104px] shrink-0 flex-col items-center gap-2 p-2">
      <span className="skeleton h-[84px] w-[84px] rounded-full" />
      <span className="skeleton h-3 w-16" />
    </div>
  );
}

export function GenericCardSkeleton({ round = false }: { round?: boolean }) {
  return (
    <div className="w-full rounded-2xl p-3">
      <div className={cn("mb-3 aspect-square w-full", round ? "rounded-full" : "rounded-xl")} />
      <div className="skeleton mb-2 h-3.5 w-4/5" />
      <div className="skeleton h-3 w-2/5" />
    </div>
  );
}

export function MicAvatar({ name }: { name: string }) {
  return (
    <span className="grid h-full w-full place-items-center text-2xl text-white/40">
      <IconMic className="h-8 w-8" />
      <span className="sr-only">{name}</span>
    </span>
  );
}
