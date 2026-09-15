import { Heart, Play, Trash2, Music2 } from 'lucide-react'

import { useLibrary } from '../hooks/useLibrary'
import { usePlayer } from '../hooks/usePlayer'

function LikedSongs() {
  const { likedSongs, toggleLike } = useLibrary()

  const {
    playTrack,
    playQueue,
  } = usePlayer()

  // ---------------------------------------------------------
  // Play all liked songs
  // ---------------------------------------------------------
  const handlePlayAll = () => {
    if (!likedSongs.length) return

    playQueue(likedSongs, 0)
  }

  // ---------------------------------------------------------
  // Play one liked song
  // ---------------------------------------------------------
  const handlePlaySong = (song) => {
    playTrack(song)
  }

  // ---------------------------------------------------------
  // Remove song from liked songs
  // ---------------------------------------------------------
  const handleUnlike = (song) => {
    toggleLike(song)
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="vh-ambient absolute -right-40 -top-40 h-96 w-96 rounded-full opacity-20" />
      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* ===================================================
            HEADER
        =================================================== */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">

          {/* Heart Icon */}
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--vh-violet)] via-[var(--vh-magenta)] to-red-500 shadow-[var(--vh-shadow-lg)]">
            <Heart
              size={64}
              fill="currentColor"
              className="text-white"
            />
          </div>

          {/* Page Information */}
          <div className="min-w-0">

            <p className="text-sm font-medium uppercase tracking-wider text-[var(--vh-magenta)]">
              Collection
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Liked Songs
            </h1>

            <p className="mt-3 text-sm text-[var(--vh-muted)]">
              {likedSongs.length}{' '}
              {likedSongs.length === 1
                ? 'song'
                : 'songs'}
            </p>

            {/* Play All */}
            {likedSongs.length > 0 && (
              <button
                type="button"
                onClick={handlePlayAll}
                className="vh-button-primary mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                <Play
                  size={18}
                  fill="currentColor"
                />
                Play All
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            EMPTY STATE
        =================================================== */}
        {likedSongs.length === 0 ? (
          <div className="mt-10 flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)]/60 px-6 text-center">

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

          /* =================================================
             LIKED SONGS LIST
          ================================================= */
          <div className="mt-10 space-y-2">

            {likedSongs.map((song, index) => (
              <div
                key={song.id}
                className="group flex items-center gap-3 rounded-2xl border border-transparent bg-[var(--vh-charcoal)] p-3 transition hover:border-[var(--vh-border-hover)] hover:bg-[var(--vh-dark-gray)]"
              >

                {/* Track Number */}
                <span className="hidden w-8 text-center text-sm text-[var(--vh-subtle)] sm:block">
                  {index + 1}
                </span>

                {/* Song Cover */}
                <button
                  type="button"
                  onClick={() =>
                    handlePlaySong(song)
                  }
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
                  aria-label={`Play ${song.title}`}
                >
                  {song.cover ? (
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--vh-dark-gray)]">
                      <Music2
                        size={22}
                        className="text-[var(--vh-subtle)]"
                      />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play
                      size={18}
                      fill="currentColor"
                      className="text-white"
                    />
                  </div>
                </button>

                {/* Song Information */}
                <button
                  type="button"
                  onClick={() =>
                    handlePlaySong(song)
                  }
                  className="min-w-0 flex-1 text-left"
                >
                  <h3 className="truncate font-medium text-white">
                    {song.title}
                  </h3>

                  <p className="mt-1 truncate text-sm text-[var(--vh-muted)]">
                    {song.artist}
                  </p>
                </button>

                {/* Album */}
                <span className="hidden max-w-[180px] truncate text-sm text-[var(--vh-subtle)] lg:block">
                  {song.album || 'Unknown Album'}
                </span>

                {/* Unlike */}
                <button
                  type="button"
                  onClick={() =>
                    handleUnlike(song)
                  }
                  className="vh-icon-button opacity-70 transition hover:opacity-100"
                  aria-label={`Unlike ${song.title}`}
                  title="Remove from liked songs"
                >
                  <Heart
                    size={18}
                    fill="currentColor"
                    className="text-[var(--vh-magenta)]"
                  />
                </button>

                {/* Remove Icon */}
                <button
                  type="button"
                  onClick={() =>
                    handleUnlike(song)
                  }
                  className="vh-icon-button hidden opacity-0 transition group-hover:opacity-100 sm:inline-flex"
                  aria-label={`Remove ${song.title}`}
                  title="Remove from liked songs"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default LikedSongs