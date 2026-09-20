import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlbumShelf, SongShelf } from "@/components/media/AsyncShelf";
import { ArtistCard } from "@/components/media/MediaCard";
import { Grid, Section } from "@/components/media/Shelf";
import { ErrorState } from "@/components/ui";
import { GenericCardSkeleton } from "@/components/media/MediaCard";
import { useAsync } from "@/hooks/useAsync";
import { api, GENRES, POPULAR_ARTIST_QUERIES } from "@/lib/saavn";
import type { Artist } from "@/lib/types";

function PopularArtists() {
  const { data, loading, error, refetch } = useAsync(async () => {
    const results = await Promise.allSettled(
      POPULAR_ARTIST_QUERIES.map((q) => api.search.artists(q, 1, 1)),
    );
    const artists: Artist[] = [];
    const seen = new Set<string>();
    for (const r of results) {
      if (r.status === "fulfilled" && r.value[0] && !seen.has(r.value[0].id)) {
        seen.add(r.value[0].id);
        artists.push(r.value[0]);
      }
    }
    return artists;
  }, []);

  return (
    <Section
      title="Popular artists"
      subtitle="Tap an artist to browse their hits and albums"
    >
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <GenericCardSkeleton key={i} round />
          ))}
        </div>
      ) : error ? (
        <ErrorState compact onRetry={refetch} message="Couldn't load popular artists." />
      ) : (
        <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {data!.map((a) => (
            <div key={a.id} className="w-[110px] shrink-0">
              <ArtistCard artist={a} />
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function GenreGrid() {
  const navigate = useNavigate();
  return (
    <Section title="Browse by genre & mood" subtitle="Every tag streams a live mix from JioSaavn">
      <Grid className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {GENRES.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.025, 0.3) }}
            whileHover={{ y: -3, scale: 1.02 }}
            onClick={() => navigate(`/genre/${g.id}`)}
            className="relative flex h-[84px] items-end overflow-hidden rounded-2xl p-3.5 text-left shadow-lg shadow-black/25"
            style={{ backgroundImage: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
          >
            <span className="absolute -right-2 -top-3 text-[52px] opacity-30 select-none">
              {g.emoji}
            </span>
            <span className="relative text-[14.5px] font-bold text-white drop-shadow">
              {g.label}
            </span>
          </motion.button>
        ))}
      </Grid>
    </Section>
  );
}

export default function Discover() {
  return (
    <div className="space-y-10 pb-6">
      <header className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-brand-700/40 via-ink-850 to-ink-900 p-6 sm:p-8">
        <motion.div
          className="pointer-events-none absolute -left-16 -bottom-24 h-64 w-64 rounded-full bg-brand-500/30 blur-[90px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 11, repeat: Infinity }}
        />
        <p className="relative text-[11px] font-bold uppercase tracking-[0.22em] text-brand-200/80">
          Discover
        </p>
        <h1 className="relative mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Find your next <span className="brand-text">favourite</span>
        </h1>
        <p className="relative mt-2 max-w-lg text-sm text-white/50">
          Trending tracks, fresh releases and every genre under the sun — streamed straight from
          the JioSaavn catalogue.
        </p>
      </header>

      <PopularArtists />
      <GenreGrid />
      <SongShelf title="Trending songs" subtitle="What India is playing right now" query="trending bollywood punjabi hits" />
      <AlbumShelf title="New releases" subtitle="The latest albums & singles" query="new bollywood punjabi album 2026" />
      <SongShelf title="Global top 50" query="top english world hits" />
      <SongShelf title="Indie & lo-fi picks" query="indie lofi new age hindi" />
    </div>
  );
}
