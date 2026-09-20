import { motion } from "framer-motion";
import { AlbumCard, ArtistCard, CollectionCard, SongCard } from "@/components/media/MediaCard";
import { Grid, Scroller, ScrollerItem, Section } from "@/components/media/Shelf";
import { Button, EmptyState, ErrorState, ShelfSkeleton } from "@/components/ui";
import { IconPlay, IconShuffle } from "@/components/ui/Icons";
import { usePlayer } from "@/context/PlayerContext";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/saavn";
import type { Album, Artist, Collection, Song } from "@/lib/types";

export function AsyncGrid<T>({
  title,
  subtitle,
  href,
  load,
  render,
  keyOf,
  empty,
  limit,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  load: () => Promise<T[]>;
  render: (item: T, index: number) => React.ReactNode;
  keyOf: (item: T, index: number) => string;
  empty?: React.ReactNode;
  limit?: number;
}) {
  const { data, loading, error, refetch } = useAsync(load, [title]);
  const items = data ?? [];
  const shown = limit ? items.slice(0, limit) : items;

  return (
    <Section title={title} subtitle={subtitle} href={items.length > 6 ? href : undefined}>
      {loading ? (
        <ShelfSkeleton />
      ) : error ? (
        <ErrorState compact onRetry={refetch} message={`Couldn't load “${title}”.`} />
      ) : shown.length === 0 ? (
        (empty ?? <EmptyState title="Nothing found" className="py-8" />)
      ) : (
        <Grid>{shown.map((item, i) => (
          <motion.div key={keyOf(item, i)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.2) }}>
            {render(item, i)}
          </motion.div>
        ))}</Grid>
      )}
    </Section>
  );
}

export function SongShelf({
  title,
  subtitle,
  query,
  contextLabel,
}: {
  title: string;
  subtitle?: string;
  query: string;
  contextLabel?: string;
}) {
  const player = usePlayer();
  const { data, loading, error, refetch } = useAsync(() => api.search.songs(query, 1, 24), [query]);

  const songs = data ?? [];
  return (
    <Section
      title={title}
      subtitle={subtitle}
      action={
        songs.length > 1 ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => player.shufflePlay(songs, { id: title, title })}>
              <IconShuffle className="h-3.5 w-3.5" /> Shuffle
            </Button>
            <Button variant="solid" size="sm" onClick={() => player.playQueue(songs, 0, { id: title, title })}>
              <IconPlay className="h-3 w-3" /> Play all
            </Button>
          </div>
        ) : undefined
      }
    >
      {loading ? (
        <ShelfSkeleton />
      ) : error ? (
        <ErrorState compact onRetry={refetch} message={`Couldn't load “${title}”.`} />
      ) : songs.length === 0 ? (
        <EmptyState title="No songs found" className="py-8" emoji="🔍" />
      ) : (
        <Scroller>
          {songs.map((song, i) => (
            <ScrollerItem key={`${song.id}-${i}`}>
              <SongCard
                song={song}
                isCurrent={player.current?.id === song.id}
                isPlaying={player.isPlaying}
                onPlay={() => player.playQueue(songs, i, { id: title, title: contextLabel ?? title })}
              />
            </ScrollerItem>
          ))}
        </Scroller>
      )}
    </Section>
  );
}

export function AlbumShelf({
  title,
  subtitle,
  query,
}: {
  title: string;
  subtitle?: string;
  query: string;
}) {
  const { data, loading, error, refetch } = useAsync(() => api.search.albums(query, 1, 24), [query]);
  const albums = data ?? [];
  return (
    <Section title={title} subtitle={subtitle}>
      {loading ? (
        <ShelfSkeleton />
      ) : error ? (
        <ErrorState compact onRetry={refetch} message={`Couldn't load “${title}”.`} />
      ) : albums.length === 0 ? (
        <EmptyState title="No albums found" className="py-8" emoji="💿" />
      ) : (
        <Scroller>
          {albums.map((album: Album, i: number) => (
            <ScrollerItem key={`${album.id}-${i}`}>
              <AlbumCard album={album} />
            </ScrollerItem>
          ))}
        </Scroller>
      )}
    </Section>
  );
}

export function ArtistShelf({ title, artists }: { title: string; artists: Artist[] }) {
  return (
    <Section title={title}>
      <Scroller>
        {artists.map((a: Artist) => (
          <ScrollerItem key={a.id}>
            <ArtistCard artist={a} />
          </ScrollerItem>
        ))}
      </Scroller>
    </Section>
  );
}

export function CollectionShelf({
  title,
  collections,
}: {
  title: string;
  collections: Collection[];
}) {
  return (
    <Section title={title}>
      <Grid>
        {collections.map((c) => (
          <CollectionCard key={c.id} collection={c} />
        ))}
      </Grid>
    </Section>
  );
}

export function RecentShelf({ songs, title = "Jump back in" }: { songs: Song[]; title?: string }) {
  const player = usePlayer();
  if (!songs.length) return null;
  return (
    <Section
      title={title}
      action={
        <Button variant="ghost" size="sm" onClick={() => player.shufflePlay(songs, { id: "recent", title })}>
          <IconShuffle className="h-3.5 w-3.5" /> Shuffle
        </Button>
      }
    >
      <Scroller>
        {songs.slice(0, 14).map((song, i) => (
          <ScrollerItem key={`${song.id}-${i}`}>
            <SongCard
              song={song}
              isCurrent={player.current?.id === song.id}
              isPlaying={player.isPlaying}
              onPlay={() => player.playQueue(songs, i, { id: "recent", title })}
            />
          </ScrollerItem>
        ))}
      </Scroller>
    </Section>
  );
}
