import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CollectionActions, DetailHero, Dot, MetaText } from "@/components/media/DetailHero";
import SongRow from "@/components/media/SongRow";
import { Button, EmptyState } from "@/components/ui";
import { IconPlay, IconTrash } from "@/components/ui/Icons";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";
import { relativeDate, totalDuration } from "@/lib/format";

export function LikedSongsPage() {
  const library = useLibrary();
  const player = usePlayer();
  const navigate = useNavigate();
  const songs = library.likedSongs;
  const source = { id: "liked", title: "Liked Songs" };
  const [limit, setLimit] = useState(50);
  const visible = songs.slice(0, limit);

  return (
    <div className="pb-6">
      <DetailHero
            eyebrow="Playlist"
            title="Liked Songs"
            image={songs[0]?.image}
            meta={
              <>
                <span className="font-semibold text-white/80">Your favourites</span>
                <Dot />
                <MetaText>
                  {songs.length} song{songs.length === 1 ? "" : "s"}
                </MetaText>
                {songs.length > 0 && (
                  <>
                    <Dot />
                    <MetaText>{totalDuration(songs)}</MetaText>
                  </>
                )}
              </>
            }
          >
            <CollectionActions songs={songs} source={source} />
      </DetailHero>

      {songs.length === 0 ? (
        <EmptyState
          emoji="💜"
          title="Songs you like will appear here"
          body="Tap the heart icon on any song — in a list, in the player, or on the full screen view."
          action={
            <Button variant="brand" onClick={() => navigate("/search")}>
              Start exploring
            </Button>
          }
        />
      ) : (
        <>
          <div className="-mx-1">
            {visible.map((song, i) => (
              <SongRow
                key={`${song.id}-${i}`}
                song={song}
                index={i}
                showAlbum
                showPlays
                isCurrent={player.current?.id === song.id}
                isPlaying={player.isPlaying}
                onPlay={() => player.playQueue(songs, i, source)}
                onRemove={() => {
                  library.toggleLike(song);
                  library.pushRecentlyPlayed(song);
                }}
                removeLabel="Remove from Liked Songs"
                sourceLabel={source.title}
              />
            ))}
          </div>
          {limit < songs.length && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={() => setLimit((l) => l + 50)}>
                Show more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function RecentlyPlayedPage() {
  const library = useLibrary();
  const player = usePlayer();
  const { toast } = useToast();
  const items = library.recentlyPlayed;
  const songs = useMemo(() => items.map((i) => i.song), [items]);
  const source = { id: "recent", title: "Recently played" };

  return (
    <div className="pb-6">
      <DetailHero
        eyebrow="History"
        title="Recently played"
        meta={
          <>
            <MetaText>
              {items.length} track{items.length === 1 ? "" : "s"}
            </MetaText>
            {items[0] && (
              <>
                <Dot />
                <MetaText>last played {relativeDate(items[0].playedAt)}</MetaText>
              </>
            )}
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            disabled={!songs.length}
            onClick={() => player.playQueue(songs, 0, source)}
          >
            <IconPlay className="h-3.5 w-3.5" /> Play all
          </Button>
          <Button
            variant="ghost"
            disabled={!songs.length}
            onClick={() => {
              const first = songs.find((s) => s.albumId);
              if (!first) return;
              window.location.hash = `#/album/${first.albumId}`;
            }}
          >
            Go to last album
          </Button>
          {items.length > 0 && (
            <Button
              variant="danger"
              onClick={() => {
                library.clearRecentlyPlayed();
                toast("History cleared", { tone: "success" });
              }}
            >
              <IconTrash className="h-4 w-4" /> Clear history
            </Button>
          )}
        </div>
      </DetailHero>

      {items.length === 0 ? (
        <EmptyState
          emoji="🕘"
          title="No listening history yet"
          body="Play something and your last 60 tracks will show up here."
          action={
            <Button variant="brand" onClick={() => (window.location.hash = "#/")}>
              Go home
            </Button>
          }
        />
      ) : (
        <div className="-mx-1">
          {items.map((item, i) => (
            <div key={`${item.song.id}-${i}`} className="relative">
              <SongRow
                song={item.song}
                showAlbum
                isCurrent={player.current?.id === item.song.id}
                isPlaying={player.isPlaying}
                onPlay={() => player.playQueue(songs, i, source)}
              />
              <span className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 text-[10.5px] text-white/25 lg:block">
                {relativeDate(item.playedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
