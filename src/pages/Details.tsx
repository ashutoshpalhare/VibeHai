import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CollectionActions, DetailHero, Dot, MetaText } from "@/components/media/DetailHero";
import SongRow from "@/components/media/SongRow";
import CreatePlaylistModal from "@/components/media/CreatePlaylistModal";
import {
  Button,
  EmptyState,
  ErrorState,
  HeroSkeleton,
  SongListSkeleton,
} from "@/components/ui";
import { IconEdit, IconTrash } from "@/components/ui/Icons";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";
import { useAsync } from "@/hooks/useAsync";
import { totalDuration } from "@/lib/format";
import { api } from "@/lib/saavn";
import type { Song } from "@/lib/types";

interface Source {
  id: string;
  title: string;
}

function SongRows({
  songs,
  source,
  showAlbum,
  onRemove,
  removeLabel,
}: {
  songs: Song[];
  source: Source;
  showAlbum?: boolean;
  onRemove?: (song: Song) => void;
  removeLabel?: string;
}) {
  const player = usePlayer();
  return (
    <div className="-mx-1">
      {songs.map((song, i) => (
        <SongRow
          key={`${song.id}-${i}`}
          song={song}
          index={i}
          showAlbum={showAlbum}
          showPlays
          isCurrent={player.current?.id === song.id}
          isPlaying={player.isPlaying}
          onPlay={() => player.playQueue(songs, i, source)}
          onRemove={onRemove ? () => onRemove(song) : undefined}
          removeLabel={removeLabel}
          sourceLabel={source.title}
        />
      ))}
    </div>
  );
}

function ShowMore({ onClick, hidden }: { onClick: () => void; hidden: boolean }) {
  if (hidden) return null;
  return (
    <div className="mt-6 flex justify-center">
      <Button variant="outline" onClick={onClick}>
        Show more songs
      </Button>
    </div>
  );
}

/* ================================================================== *
 *  User playlist — /playlist/u_xxx
 * ================================================================== */
export function UserPlaylistPage({ id }: { id: string }) {
  const library = useLibrary();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const playlist = library.getPlaylist(id);
  const navigate = useHashNav();

  if (!playlist)
    return (
      <EmptyState
        emoji="🗂️"
        title="Playlist not found"
        body="It may have been deleted. Browse your library to find your other playlists."
        action={
          <Button variant="brand" onClick={() => navigate("/library")}>
            Go to library
          </Button>
        }
      />
    );

  const source = { id: playlist.id, title: playlist.name };

  return (
    <div className="pb-6">
      <DetailHero
        eyebrow="Playlist"
        title={playlist.name}
        image={playlist.songs[0]?.image || playlist.cover}
        meta={
          <>
            <MetaText>
              {playlist.songs.length} song{playlist.songs.length === 1 ? "" : "s"}
            </MetaText>
            {playlist.songs.length > 0 && (
              <>
                <Dot />
                <MetaText>{totalDuration(playlist.songs)}</MetaText>
              </>
            )}
            {playlist.description && (
              <>
                <Dot />
                <span className="line-clamp-1 text-white/45">{playlist.description}</span>
              </>
            )}
          </>
        }
      >
        <CollectionActions songs={playlist.songs} source={source} />
        <div className="mt-2 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <IconEdit className="h-3.5 w-3.5" /> Edit details
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              library.deletePlaylist(playlist.id);
              toast(`Deleted “${playlist.name}”`, { tone: "success" });
              navigate("/library");
            }}
          >
            <IconTrash className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </DetailHero>

      {playlist.songs.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="This playlist is empty"
          body="Search for a song and use the ⋯ menu to add it here — or add a whole album in one tap."
          action={
            <Button variant="brand" onClick={() => navigate("/search")}>
              Find songs
            </Button>
          }
        />
      ) : (
        <SongRows
          songs={playlist.songs}
          source={source}
          onRemove={(song) => {
            library.removeFromPlaylist(playlist.id, song.id);
            toast("Removed from playlist");
          }}
          removeLabel="Remove from playlist"
        />
      )}

      <CreatePlaylistModal open={editing} onClose={() => setEditing(false)} editId={playlist.id} />
    </div>
  );
}

/* ================================================================== *
 *  JioSaavn playlist — /playlist/12345
 * ================================================================== */
export function RemotePlaylistPage({ id }: { id: string }) {
  const library = useLibrary();
  const { data, loading, error, refetch } = useAsync(() => api.playlist(id), [id]);
  const songs = data?.songs ?? [];
  const saved = library.isCollectionSaved(id);

  if (loading)
    return (
      <div className="space-y-8">
        <HeroSkeleton />
        <SongListSkeleton rows={8} />
      </div>
    );

  if (error || !data)
    return (
      <ErrorState
        message={(error as Error)?.message ?? "This playlist couldn't be loaded."}
        onRetry={refetch}
      />
    );

  const source = { id: data.id, title: data.title };

  return (
    <div className="pb-6">
      <DetailHero
        eyebrow="Playlist"
        title={data.title}
        image={data.image}
        description={data.description}
        meta={
          <>
            <MetaText>{data.songCount} songs</MetaText>
            {data.language && (
              <>
                <Dot />
                <span className="capitalize">{data.language}</span>
              </>
            )}
            {songs.length > 0 && (
              <>
                <Dot />
                <MetaText>{totalDuration(songs)}</MetaText>
              </>
            )}
          </>
        }
      >
        <CollectionActions
          songs={songs}
          source={source}
          saved={saved}
          saveLabel="Save playlist"
          savedLabel="Saved ✓"
          onSave={() =>
            library.toggleCollection({
              id: data.id,
              title: data.title,
              subtitle: data.subtitle,
              image: data.image,
              songCount: data.songCount,
              language: data.language,
              description: data.description,
            })
          }
        />
      </DetailHero>

      {songs.length === 0 ? (
        <EmptyState emoji="🎧" title="No streamable songs here" body="This playlist looks empty." />
      ) : (
        <PlaylistRowsWithMore songs={songs} source={source} />
      )}
    </div>
  );
}

function PlaylistRowsWithMore({ songs, source }: { songs: Song[]; source: Source }) {
  const [limit, setLimit] = useState(30);
  return (
    <>
      <SongRows songs={songs.slice(0, limit)} source={source} />
      <ShowMore onClick={() => setLimit((l) => l + 30)} hidden={limit >= songs.length} />
    </>
  );
}

/* ================================================================== *
 *  Album — /album/:id
 * ================================================================== */
export function AlbumPage() {
  const { id = "" } = useParams();
  const library = useLibrary();
  const { data, loading, error, refetch } = useAsync(() => api.album(id), [id]);
  const songs = data?.songs ?? [];
  const saved = library.isAlbumSaved(id);
  const source = { id, title: data?.title ?? "Album" };

  if (loading)
    return (
      <div className="space-y-8">
        <HeroSkeleton />
        <SongListSkeleton rows={8} />
      </div>
    );

  if (error || !data)
    return (
      <ErrorState
        message={(error as Error)?.message ?? "This album couldn't be loaded."}
        onRetry={refetch}
      />
    );

  return (
    <div className="pb-6">
      <DetailHero
        eyebrow="Album"
        title={data.title}
        image={data.image}
        meta={
          <>
            {data.artist && (
              <>
                <span className="font-semibold text-white/80">{data.artist}</span>
                <Dot />
              </>
            )}
            {data.year && (
              <>
                <MetaText>{data.year}</MetaText>
                <Dot />
              </>
            )}
            <MetaText>
              {data.songCount} song{data.songCount === 1 ? "" : "s"}
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
        <CollectionActions
          songs={songs}
          source={source}
          saved={saved}
          saveLabel="Save album"
          savedLabel="Saved ✓"
          onSave={() =>
            library.toggleAlbum({
              id: data.id,
              title: data.title,
              subtitle: data.subtitle,
              image: data.image,
              year: data.year,
              songCount: data.songCount,
              artist: data.artist,
              language: data.language,
            })
          }
        />
      </DetailHero>

      {songs.length === 0 ? (
        <EmptyState emoji="💿" title="No playable tracks" body="This album has no streamable songs." />
      ) : (
        <>
          <SongRows songs={songs} source={source} />
          {data.copyright && (
            <p className="mt-8 text-[11px] leading-relaxed text-white/25">{data.copyright}</p>
          )}
        </>
      )}
    </div>
  );
}

/* ================================================================== *
 *  Mood / genre — /mood/:id
 * ================================================================== */
export function MoodPage({ query, label, emoji }: { query: string; label: string; emoji: string }) {
  const { data, loading, error, refetch } = useAsync(() => api.search.songs(query, 1, 40), [query]);
  const songs = data ?? [];
  const source = { id: `mood-${label}`, title: `${label} mood` };
  const [limit, setLimit] = useState(20);

  return (
    <div className="pb-6">
      <DetailHero
        eyebrow={`${emoji} Mood & genre`}
        title={label}
        meta={
          <>
            <MetaText>Curated from JioSaavn</MetaText>
            <Dot />
            <MetaText>{loading ? "loading…" : `${songs.length} songs`}</MetaText>
          </>
        }
      >
        <CollectionActions songs={songs} source={source} />
      </DetailHero>

      {loading ? (
        <SongListSkeleton rows={10} />
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      ) : songs.length === 0 ? (
        <EmptyState emoji="🎧" title="Nothing here right now" body="Try another mood from the home page." />
      ) : (
        <>
          <SongRows songs={songs.slice(0, limit)} source={source} showAlbum />
          <ShowMore onClick={() => setLimit((l) => l + 20)} hidden={limit >= songs.length} />
        </>
      )}
    </div>
  );
}

/* ================================================================== *
 *  Artist — /artist/:id
 * ================================================================== */
export function ArtistPage() {
  const { id = "" } = useParams();
  const library = useLibrary();
  const player = usePlayer();

  const profile = useAsync(
    async () => {
      const base = await api.artist(id);
      const [songsRes, albums] = await Promise.all([
        api.artistSongs(id, 1, 40).catch(() => ({ songs: [], total: 0 })),
        api.artistAlbums(id, 1, 24).catch(() => []),
      ]);
      return { base, songs: songsRes.songs, total: songsRes.total, albums };
    },
    [id],
  );

  if (profile.loading)
    return (
      <div className="space-y-8">
        <HeroSkeleton />
        <SongListSkeleton rows={6} />
      </div>
    );

  if (profile.error || !profile.data)
    return (
      <ErrorState
        message={(profile.error as Error)?.message ?? "This artist couldn't be loaded."}
        onRetry={profile.refetch}
      />
    );

  const { base, songs, total, albums } = profile.data;
  const followed = library.isArtistFollowed(base.id);
  const source = { id: `artist-${base.id}`, title: base.name };

  return (
    <div className="pb-6 space-y-10">
      <DetailHero
        eyebrow="Artist"
        title={base.name}
        image={base.image}
        round
        meta={
          <>
            <span className="capitalize text-white/70">{base.role}</span>
            {base.followers ? (
              <>
                <Dot />
                <MetaText>{base.followers.toLocaleString()} followers</MetaText>
              </>
            ) : null}
            {(total || base.songCount) && (
              <>
                <Dot />
                <MetaText>{total || base.songCount} songs</MetaText>
              </>
            )}
            {albums.length > 0 && (
              <>
                <Dot />
                <MetaText>{albums.length} albums</MetaText>
              </>
            )}
          </>
        }
        description={base.bio?.split("\n\n")[0]}
      >
        <CollectionActions
          songs={songs}
          source={source}
          saved={followed}
          saveLabel="Follow"
          savedLabel="Following ✓"
          onSave={() => library.toggleArtist(base)}
        />
      </DetailHero>

      {songs.length === 0 ? (
        <EmptyState emoji="🎤" title="No songs found" body="We couldn't find streamable songs for this artist." />
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight">Popular songs</h2>
          <ArtistTopSongs songs={songs} source={source} />
        </section>
      )}

      {albums.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Albums</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {albums.map((album, i) => (
              <Link
                key={`${album.id}-${i}`}
                to={`/album/${album.id}`}
                className="group rounded-2xl p-2 transition hover:bg-white/[0.06]"
              >
                <img
                  src={album.image}
                  alt=""
                  loading="lazy"
                  className="mb-3 aspect-square w-full rounded-xl object-cover shadow-lg shadow-black/40"
                />
                <p className="truncate text-[13.5px] font-semibold text-white/95">{album.title}</p>
                <p className="truncate text-[11.5px] text-white/45">{album.year || album.artist}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {songs.length > 10 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight">More from {base.name}</h2>
          <button
            onClick={() => player.shufflePlay(songs, source)}
            className="text-[11px] font-bold uppercase tracking-wider text-brand-300 hover:text-brand-200"
          >
            Shuffle all {songs.length} songs
          </button>
        </section>
      )}
    </div>
  );
}

function ArtistTopSongs({ songs, source }: { songs: Song[]; source: Source }) {
  const [limit, setLimit] = useState(15);
  return (
    <>
      <SongRows songs={songs.slice(0, limit)} source={source} showAlbum />
      <ShowMore onClick={() => setLimit((l) => l + 15)} hidden={limit >= songs.length} />
    </>
  );
}

/* tiny navigation helper that doesn't need extra imports in each page */
import { useNavigate } from "react-router-dom";
function useHashNav() {
  return useNavigate();
}
