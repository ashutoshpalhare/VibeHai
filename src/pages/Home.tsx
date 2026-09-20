import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlbumShelf, RecentShelf, SongShelf } from "@/components/media/AsyncShelf";
import { MoodTile } from "@/components/media/MediaCard";
import { Button, EmptyState, ErrorState, ShelfSkeleton } from "@/components/ui";
import { IconPlay, IconShuffle } from "@/components/ui/Icons";
import { Grid } from "@/components/media/Shelf";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { greeting } from "@/lib/format";
import { MOODS } from "@/lib/saavn";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/saavn";

function QuickPicks() {
  const { recentlyPlayed } = useLibrary();
  const player = usePlayer();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsync(() => api.search.songs("bollywood hits 2026", 1, 12), []);
  const songs = useMemo(() => {
    const recent = recentlyPlayed.map((r) => r.song).slice(0, 6);
    if (recent.length >= 4) return recent;
    return (data ?? []).slice(0, 6);
  }, [recentlyPlayed, data]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-[68px] rounded-xl" />
        ))}
      </div>
    );
  }
  if (error) return <ErrorState compact onRetry={refetch} message="Couldn't load your picks." />;
  if (!songs.length)
    return (
      <EmptyState
        title="Let's find your sound"
        body="Search for a song, or tap a mood below to start vibing."
        action={
          <Button variant="brand" onClick={() => navigate("/search")}>
            Explore music
          </Button>
        }
      />
    );

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song, i) => {
        const isCurrent = player.current?.id === song.id;
        return (
          <motion.button
            key={`${song.id}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.035 }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            onClick={() => player.playQueue(songs, i, { id: "quick-picks", title: "Quick picks" })}
            className="group flex items-center gap-3 overflow-hidden rounded-xl bg-white/[0.045] pr-2 text-left transition"
          >
            <img
              src={song.imageSmall || song.image}
              alt=""
              loading="lazy"
              className="h-[68px] w-[68px] shrink-0 object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className={`block truncate text-[13.5px] font-semibold ${isCurrent ? "text-brand-200" : "text-white"}`}>
                {song.title}
              </span>
              <span className="block truncate text-[11.5px] text-white/45">{song.artist}</span>
            </span>
            <span className="grid h-10 w-10 shrink-0 translate-x-1 place-items-center rounded-full brand-gradient text-white opacity-0 shadow-lg transition group-hover:translate-x-0 group-hover:opacity-100">
              <IconPlay className="ml-0.5 h-4 w-4" />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function MoodGrid() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {MOODS.map((mood, i) => (
        <motion.div
          key={mood.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
        >
          <MoodTile
            label={mood.label}
            emoji={mood.emoji}
            from={mood.from}
            to={mood.to}
            onClick={() => navigate(`/mood/${mood.id}`)}
          />
        </motion.div>
      ))}
    </div>
  );
}

function FreshIds() {
  const player = usePlayer();
  const { data, loading, error, refetch } = useAsync(() => api.search.songs("new hindi songs 2026", 1, 10), []);
  const songs = data ?? [];
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">Fresh drops</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" disabled={!songs.length} onClick={() => player.shufflePlay(songs, { id: "fresh", title: "Fresh drops" })}>
            <IconShuffle className="h-3.5 w-3.5" /> Shuffle
          </Button>
          <Button variant="solid" size="sm" disabled={!songs.length} onClick={() => player.playQueue(songs, 0, { id: "fresh", title: "Fresh drops" })}>
            <IconPlay className="h-3 w-3" /> Play
          </Button>
        </div>
      </div>
      {loading ? <ShelfSkeleton /> : error ? <ErrorState compact onRetry={refetch} /> : (
        <Grid>
          {songs.slice(0, 6).map((s) => (
            <button
              key={s.id}
              onClick={() => player.playQueue(songs, songs.indexOf(s), { id: "fresh", title: "Fresh drops" })}
              className="group rounded-2xl p-2 text-left transition hover:bg-white/[0.06]"
            >
              <img src={s.image} alt="" loading="lazy" className="mb-3 aspect-square w-full rounded-xl object-cover shadow-lg shadow-black/40" />
              <p className="truncate text-[13.5px] font-semibold text-white/95">{s.title}</p>
              <p className="truncate text-[11.5px] text-white/45">{s.artist}</p>
            </button>
          ))}
        </Grid>
      )}
    </section>
  );
}

export default function Home() {
  const { recentlyPlayed, playlists } = useLibrary();
  const recentSongs = useMemo(() => recentlyPlayed.map((r) => r.song), [recentlyPlayed]);

  return (
    <div className="space-y-10 pb-6">
      <header className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-brand-700/40 via-ink-850 to-ink-900 p-6 sm:p-8">
        <motion.div
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-punch-500/25 blur-[90px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-200/80">
            {greeting()}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            What are we <span className="brand-text">vibing</span> to today?
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/50">
            {playlists.length > 0
              ? `${playlists.length} playlist${playlists.length === 1 ? "" : "s"} in your library • millions of songs ready to play.`
              : "Millions of Hindi, Punjabi, Tamil and English tracks — no signup, just press play."}
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">
          {recentSongs.length >= 4 ? "Quick picks" : "Trending right now"}
        </h2>
        <QuickPicks />
      </section>

      <RecentShelf songs={recentSongs} />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">Moods & genres</h2>
          <p className="mt-0.5 text-xs text-white/45">Pick a feeling, we'll handle the playlist.</p>
        </div>
        <MoodGrid />
      </section>

      <SongShelf title="Trending in India" subtitle="The songs everyone has on repeat" query="top bollywood hits" />
      <AlbumShelf title="New releases" subtitle="Fresh albums & singles" query="new bollywood album 2026" />
      <SongShelf title="Punjabi heat" query="punjabi top songs" />
      <FreshIds />
      <SongShelf title="Kollywood & Tollywood" query="tamil telugu hit songs" />
      <SongShelf title="Retro rewind" query="old hindi classics kishore" />
      <SongShelf title="Global top 50" query="top english hits" />
      <SongShelf title="Late night lo-fi" query="lofi hindi chill beats" />
    </div>
  );
}
