import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlbumCard, ArtistCard, CollectionCard } from "@/components/media/MediaCard";
import { Grid, Section, Scroller, ScrollerItem } from "@/components/media/Shelf";
import { ArtistPillSkeleton } from "@/components/media/MediaCard";
import { Button, EmptyState, ErrorState, ShelfSkeleton, SongListSkeleton } from "@/components/ui";
import { IconClose, IconPlay, IconSearch, IconSparkle } from "@/components/ui/Icons";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";
import { useAsync, useDebounced } from "@/hooks/useAsync";
import { MOODS, QUICK_SEARCHES, api } from "@/lib/saavn";
import type { Song } from "@/lib/types";
import { cn } from "@/utils/cn";

const TABS = ["Top", "Songs", "Albums", "Artists", "Playlists"] as const;
type Tab = (typeof TABS)[number];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const player = usePlayer();
  const { toast } = useToast();
  const library = useLibrary();

  const raw = params.get("q") ?? "";
  const tabParam = (params.get("tab") as Tab) ?? "Top";
  const tab: Tab = TABS.includes(tabParam) ? tabParam : "Top";
  const query = useDebounced(raw, 420);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState<Song[]>([]);
  const [moreLoading, setMoreLoading] = useState(false);
  const [moreError, setMoreError] = useState(false);

  useEffect(() => {
    setPage(1);
    setMore([]);
    setMoreError(false);
  }, [query, tab]);

  useEffect(() => {
    if (query.trim().length > 1) library.pushRecentSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const enabled = query.trim().length > 1;

  const results = useAsync(
    () => api.search.all(query.trim()),
    [query],
    { enabled },
  );

  const songs = useMemo(
    () => [...(results.data?.songs ?? []), ...more.filter((s) => !results.data?.songs.some((x) => x.id === s.id))],
    [results.data, more],
  );

  const loadMore = async () => {
    const next = page + 1;
    setMoreLoading(true);
    setMoreError(false);
    try {
      const batch = await api.search.songs(query.trim(), next, 30);
      setMore((prev) => [...prev, ...batch]);
      setPage(next);
      if (!batch.length) toast("That's everything we found");
    } catch {
      setMoreError(true);
    } finally {
      setMoreLoading(false);
    }
  };

  const setTab = (t: Tab) => {
    const next = new URLSearchParams(params);
    if (t === "Top") next.delete("tab");
    else next.set("tab", t);
    setParams(next, { replace: true });
  };

  /* -------------------------- idle state -------------------------- */
  if (!enabled) {
    return (
      <div className="space-y-10 pb-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Search <span className="brand-text">VibeHai</span>
          </h1>
          <p className="text-sm text-white/50">
            Find songs, albums, artists and playlists across millions of tracks.
          </p>
        </header>

        {library.recentSearches.length > 0 && (
          <Section
            title="Recent searches"
            action={
              <Button variant="ghost" size="sm" onClick={library.clearRecentSearches}>
                Clear all
              </Button>
            }
          >
            <div className="flex flex-wrap gap-2">
              {library.recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setParams({ q: term })}
                  className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[13px] font-medium text-white/75 transition hover:border-white/25 hover:bg-white/[0.09] hover:text-white"
                >
                  <IconSearch className="h-3.5 w-3.5 opacity-60" />
                  {term}
                </button>
              ))}
            </div>
          </Section>
        )}

        <Section title="Trending searches">
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => setParams({ q: term })}
                className="rounded-full brand-gradient/0 border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-3.5 py-2 text-[13px] font-medium text-white/75 transition hover:border-brand-400/40 hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Browse moods" subtitle="One tap to a full vibe">
          <Grid>
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => navigate(`/mood/${m.id}`)}
                className="flex items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-white/[0.06]"
                style={{ backgroundImage: `linear-gradient(120deg, ${m.from}22, ${m.to}12)` }}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-sm font-semibold text-white">{m.label}</span>
              </button>
            ))}
          </Grid>
        </Section>
      </div>
    );
  }

  const d = results.data;
  const totalTop =
    (d?.songs.length ?? 0) + (d?.albums.length ?? 0) + (d?.artists.length ?? 0) + (d?.playlists.length ?? 0);

  return (
    <div className="space-y-8 pb-6">
      {/* search header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            <span className="text-white/45">Results for </span>
            <span className="brand-text">“{raw.trim()}”</span>
          </h1>
          <button
            onClick={() => setParams({})}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white/55 transition hover:text-white"
          >
            <IconClose className="h-3.5 w-3.5" /> Clear
          </button>
        </div>

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
                  layoutId="search-tab"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </div>

      {results.loading && (
        <div className="space-y-6">
          <SongListSkeleton rows={5} />
          <ShelfSkeleton />
        </div>
      )}

      {results.error && (
        <ErrorState
          message="We couldn't reach the music service. Check your connection and try again."
          onRetry={results.refetch}
        />
      )}

      {!results.loading && !results.error && totalTop === 0 && (
        <EmptyState
          emoji="🕵️"
          title={`No results for “${raw.trim()}”`}
          body="Try a different spelling, search for the artist instead, or check out a mood below."
          action={
            <Button variant="outline" onClick={() => setParams({ q: "trending hindi" })}>
              Try trending searches
            </Button>
          }
        />
      )}

      {!results.loading && d && (
        <div className="space-y-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="space-y-10"
            >
              {(tab === "Top" || tab === "Songs") && songs.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight">Songs</h2>
                    {tab === "Top" && songs.length > 1 && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => player.shufflePlay(songs, { id: "search", title: `Search: ${raw}` })}>
                          <IconSparkle className="h-3.5 w-3.5" /> Shuffle all
                        </Button>
                        <Button variant="solid" size="sm" onClick={() => player.playQueue(songs, 0, { id: "search", title: `Search: ${raw}` })}>
                          <IconPlay className="h-3 w-3" /> Play all
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="-mx-1">
                    {songs.slice(0, tab === "Top" ? 8 : 30).map((song, i) => (
                      <SongListRow key={`${song.id}-${i}`} song={song} index={i} songs={songs} contextLabel={`Search: ${raw}`} />
                    ))}
                  </div>
                  {tab === "Songs" && songs.length >= 20 && (
                    <div className="flex justify-center pt-2">
                      <Button variant="outline" onClick={loadMore} disabled={moreLoading}>
                        {moreLoading ? "Loading…" : moreError ? "Retry" : "Load more songs"}
                      </Button>
                    </div>
                  )}
                </section>
              )}

              {(tab === "Top" || tab === "Artists") && (d.artists.length ?? 0) > 0 && (
                <Section title="Artists">
                  <Scroller>
                    {d.artists.map((a: import("@/lib/types").Artist, i: number) => (
                      <ScrollerItem key={`${a.id}-${i}`}>
                        <ArtistCard artist={a} />
                      </ScrollerItem>
                    ))}
                  </Scroller>
                </Section>
              )}

              {(tab === "Top" || tab === "Albums") && (d.albums.length ?? 0) > 0 && (
                <Section title="Albums">
                  <Grid>
                    {d.albums.map((a: import("@/lib/types").Album, i: number) => (
                      <AlbumCard key={`${a.id}-${i}`} album={a} />
                    ))}
                  </Grid>
                </Section>
              )}

              {(tab === "Top" || tab === "Playlists") && (d.playlists.length ?? 0) > 0 && (
                <Section title="Playlists">
                  <Grid>
                    {d.playlists.map((p: import("@/lib/types").Collection, i: number) => (
                      <CollectionCard key={`${p.id}-${i}`} collection={p} />
                    ))}
                  </Grid>
                </Section>
              )}

                    </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* Local row wrapper so the search page can pass a queue */
import SongRow from "@/components/media/SongRow";
function SongListRow({
  song,
  index,
  songs,
  contextLabel,
}: {
  song: Song;
  index: number;
  songs: Song[];
  contextLabel: string;
}) {
  const player = usePlayer();
  return (
    <SongRow
      song={song}
      index={index}
      showAlbum
      showPlays
      isCurrent={player.current?.id === song.id}
      isPlaying={player.isPlaying}
      onPlay={() => player.playQueue(songs, index, { id: "search", title: contextLabel })}
      sourceLabel={contextLabel}
    />
  );
}

export function SearchSkeletons() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <ArtistPillSkeleton key={i} />
        ))}
      </div>
      <SongListSkeleton rows={8} />
    </div>
  );
}
