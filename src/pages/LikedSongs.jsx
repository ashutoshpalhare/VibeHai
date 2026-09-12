import { Heart, Music2 } from 'lucide-react'

import SongCard from '../components/music/SongCard'
import { useLibrary } from '../hooks/useLibrary'

function LikedSongs() {
  const { likedSongs } = useLibrary()

  return (
    <section className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Page Header */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-[var(--vh-violet)]">
            YOUR FAVORITES
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Liked Songs
          </h1>

          <p className="mt-2 text-sm text-[var(--vh-muted)]">
            {likedSongs.length} liked{' '}
            {likedSongs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>

        {/* Empty State */}
        {likedSongs.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)]/50 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--vh-dark-gray)]">
              <Heart
                size={30}
                className="text-[var(--vh-subtle)]"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">
              No liked songs yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--vh-muted)]">
              Your favorite tracks will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {likedSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default LikedSongs