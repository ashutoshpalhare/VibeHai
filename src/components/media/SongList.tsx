import type { ReactNode } from "react";
import SongRow from "@/components/media/SongRow";
import { EmptyState, ErrorState, SongListSkeleton } from "@/components/ui";
import { usePlayer } from "@/context/PlayerContext";
import type { Song } from "@/lib/types";

export default function SongList({
  songs,
  loading,
  error,
  onRetry,
  showAlbum = false,
  showPlays = false,
  showArt = true,
  contextLabel,
  onRemove,
  startIndexOffset = 0,
  numbered = true,
  emptyState,
  header,
  limit,
}: {
  songs: Song[];
  loading?: boolean;
  error?: Error;
  onRetry?: () => void;
  showAlbum?: boolean;
  showPlays?: boolean;
  showArt?: boolean;
  contextLabel?: string;
  onRemove?: (song: Song, index: number) => void;
  startIndexOffset?: number;
  numbered?: boolean;
  emptyState?: ReactNode;
  header?: ReactNode;
  limit?: number;
}) {
  const { current, isPlaying, playQueue } = usePlayer();
  const visible = limit ? songs.slice(0, limit) : songs;

  if (loading) return <SongListSkeleton rows={Math.min(limit ?? 8, 10)} />;
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  if (!songs.length)
    return <>{emptyState ?? <EmptyState title="Nothing here yet" emoji="🎵" />}</>;

  return (
    <div>
      {header}
      <div className="-mx-1">
        {visible.map((song, i) => (
          <SongRow
            key={`${song.id}-${i}`}
            song={song}
            index={numbered ? i + startIndexOffset : undefined}
            isCurrent={current?.id === song.id}
            isPlaying={isPlaying}
            showAlbum={showAlbum}
            showArt={showArt}
            showPlays={showPlays}
            sourceLabel={contextLabel}
            onRemove={onRemove ? () => onRemove(song, i) : undefined}
            onPlay={() =>
              playQueue(songs, i, contextLabel ? { id: contextLabel, title: contextLabel } : undefined)
            }
          />
        ))}
      </div>
    </div>
  );
}
