import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlbumCard,
  ArtistCard,
  CollectionCard,
  UserPlaylistCard,
} from "@/components/media/MediaCard";
import CreatePlaylistModal from "@/components/media/CreatePlaylistModal";
import { Grid, Section } from "@/components/media/Shelf";
import SongRow from "@/components/media/SongRow";
import { Button, EmptyState } from "@/components/ui";
import { IconPlus, IconTrash } from "@/components/ui/Icons";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";
import { totalDuration } from "@/lib/format";
import { cn } from "@/utils/cn";

const TABS = ["Playlists", "Songs", "Albums", "Artists"] as const;
type Tab = (typeof TABS)[number];

export default function Library() {
  const library = useLibrary();
  const player = usePlayer();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(() => {
    const hash = window.location.hash;
    const match = hash.match(/tab=([a-z]+)/i);
    const initial = match?.[1];
    return (TABS.find((t) => t.toLowerCase() === initial?.toLowerCase()) ?? "Playlists") as Tab;
  });
  const [creating, setCreating] = useState(false);

  const stats = useMemo(
    () => ({
      playlists: library.playlists.length,
      songs: library.likedSongs.length,
      albums: library.savedAlbums.length,
      artists: library.followedArtists.length,
    }),
    [library.playlists.length, library.likedSongs.length, library.savedAlbums.length, library.followedArtists.length],
  );

  const savedRemote = useMemo(
    () => [
      ...library.savedPlaylists,
    ],
    [library.savedPlaylists],
  );

  const isEmpty =
    stats.playlists === 0 && stats.songs === 0 && stats.albums === 0 && stats.artists === 0;

  return (
    <div className="space-y-8 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Your library</h1>
          <p className="mt-1.5 text-sm text-white/50">
            {stats.playlists} playlist{stats.playlists === 1 ? "" : "s"} • {stats.songs} liked song
            {stats.songs === 1 ? "" : "s"} • {stats.albums} album{stats.albums === 1 ? "" : "s"} •{" "}
            {stats.artists} artist{stats.artists === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="brand" onClick={() => setCreating(true)}>
            <IconPlus className="h-4 w-4" /> New playlist
          </Button>
          {library.playlists.length + library.likedSongs.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                const all = [
                  ...library.playlists.flatMap((p) => p.songs),
                  ...library.likedSongs,
                ];
                if (!all.length) return;
                player.shufflePlay(all.slice(0, 200), { id: "library", title: "Your library" });
                toast("Shuffling your library", { tone: "success" });
              }}
            >
              Shuffle library
            </Button>
          )}
        </div>
      </header>

      {isEmpty && (
        <EmptyState
          emoji="📚"
          title="Your library is empty"
          body="Like a song, save an album, or create a playlist — everything you save is stored on this device and stays after a refresh."
          action={
            <div className="flex gap-2">
              <Button variant="brand" onClick={() => setCreating(true)}>
                Create a playlist
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Explore home
              </Button>
            </div>
          }
        />
      )}

      {!isEmpty && (
        <>
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition",
                  tab === t ? "text-ink-950" : "text-white/55 hover:text-white",
                )}
              >
                {tab === t && (
                  <motion.span
                    layoutId="library-tab"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">
                  {t}
                  {t === "Playlists" && stats.playlists > 0 && ` (${stats.playlists})`}
                  {t === "Songs" && stats.songs > 0 && ` (${stats.songs})`}
                  {t === "Albums" && stats.albums > 0 && ` (${stats.albums})`}
                  {t === "Artists" && stats.artists > 0 && ` (${stats.artists})`}
                </span>
              </button>
            ))}
          </div>

          {tab === "Playlists" && (
            <div className="space-y-10">
              {library.playlists.length === 0 && library.savedPlaylists.length === 0 ? (
                <EmptyState
                  emoji="🎶"
                  title="No playlists yet"
                  body="Create a playlist to organise your favourite tracks."
                  action={
                    <Button variant="brand" onClick={() => setCreating(true)}>
                      <IconPlus className="h-4 w-4" /> New playlist
                    </Button>
                  }
                />
              ) : (
                <>
                  {library.playlists.length > 0 && (
                    <Section title="Made by you">
                      <Grid>
                        {library.playlists.map((p) => (
                          <UserPlaylistCard
                            key={p.id}
                            playlist={p}
                            isPlaying={
                              player.queueSource?.id === p.id && player.isPlaying
                            }
                            onPlay={() =>
                              p.songs.length
                                ? player.playQueue(p.songs, 0, { id: p.id, title: p.name })
                                : navigate(`/playlist/${p.id}`)
                            }
                          />
                        ))}
                      </Grid>
                    </Section>
                  )}
                  {savedRemote.length > 0 && (
                    <Section title="Saved from JioSaavn">
                      <Grid>
                        {savedRemote.map((c) => (
                          <CollectionCard key={c.id} collection={c} />
                        ))}
                      </Grid>
                    </Section>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "Songs" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-white/50">
                  {library.likedSongs.length} song{library.likedSongs.length === 1 ? "" : "s"} •{" "}
                  {totalDuration(library.likedSongs)}
                </p>
                {library.likedSongs.length > 0 && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => player.shufflePlay(library.likedSongs, { id: "liked", title: "Liked Songs" })}>
                      Shuffle
                    </Button>
                    <Button variant="solid" size="sm" onClick={() => player.playQueue(library.likedSongs, 0, { id: "liked", title: "Liked Songs" })}>
                      Play all
                    </Button>
                  </div>
                )}
              </div>
              {library.likedSongs.length === 0 ? (
                <EmptyState
                  emoji="💜"
                  title="No liked songs yet"
                  body="Tap the heart on any song to save it here."
                  action={
                    <Button variant="brand" onClick={() => navigate("/search")}>
                      Find something to like
                    </Button>
                  }
                />
              ) : (
                <div className="-mx-1">
                  {library.likedSongs.map((song, i) => (
                    <SongRow
                      key={`${song.id}-${i}`}
                      song={song}
                      index={i}
                      showAlbum
                      showPlays
                      isCurrent={player.current?.id === song.id}
                      isPlaying={player.isPlaying}
                      onPlay={() => player.playQueue(library.likedSongs, i, { id: "liked", title: "Liked Songs" })}
                      onRemove={() => {
                        library.toggleLike(song);
                        toast("Removed from Liked Songs");
                      }}
                      removeLabel="Remove from Liked Songs"
                      sourceLabel="Liked Songs"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Albums" &&
            (library.savedAlbums.length === 0 ? (
              <EmptyState emoji="💿" title="No saved albums" body="Save an album from its page to find it here." />
            ) : (
              <Grid>
                {library.savedAlbums.map((a) => (
                  <AlbumCard key={a.id} album={a} />
                ))}
              </Grid>
            ))}

          {tab === "Artists" &&
            (library.followedArtists.length === 0 ? (
              <EmptyState emoji="🎤" title="Not following anyone" body="Follow artists to keep their latest releases close." />
            ) : (
              <Grid>
                {library.followedArtists.map((a) => (
                  <ArtistCard key={a.id} artist={a} />
                ))}
              </Grid>
            ))}
        </>
      )}

      {(library.playlists.length > 0 || library.likedSongs.length > 0) && (
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h3 className="text-sm font-bold text-white">Storage</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-white/45">
            Your library lives in this browser's local storage — playlists, liked songs, followed
            artists and listening history. Nothing is uploaded anywhere.
          </p>
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            onClick={() => {
              if (!confirm("Clear your entire VibeHai library? This cannot be undone.")) return;
              library.resetAll();
              toast("Library cleared", { tone: "success" });
            }}
          >
            <IconTrash className="h-3.5 w-3.5" /> Reset library
          </Button>
        </section>
      )}

      <CreatePlaylistModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
