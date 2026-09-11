import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Trash2, Music2 } from 'lucide-react'

import { usePlaylist } from '../hooks/usePlaylist'
import { usePlayer } from '../hooks/usePlayer'

function Playlist() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { playlists, removeSongFromPlaylist } = usePlaylist()
  const { playTrack } = usePlayer()

  const playlist = playlists.find((item) => item.id === id)

  if (!playlist) {
    return (
      <section className="px-4 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-white">
            Playlist not found
          </h1>

          <button
            type="button"
            onClick={() => navigate('/library')}
            className="vh-button-primary mt-5 rounded-xl px-5 py-3"
          >
            Back to Library
          </button>
        </div>
      </section>
    )
  }

  const handlePlayPlaylist = () => {
    if (!playlist.songs.length) return

    playTrack(playlist.songs[0])
  }

  return (
    <section className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

       <div className="mb-8">
  <button
    type="button"
    onClick={() => navigate('/library')}
    className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--vh-muted)] transition hover:text-white"
  >
    <ArrowLeft size={17} />
    Back to Library
  </button>

  <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
    <div className="flex h-48 w-48 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-[var(--vh-dark-gray)]">
      {playlist.cover ? (
        <img
          src={playlist.cover}
          alt={playlist.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <Music2
          size={56}
          className="text-[var(--vh-subtle)]"
        />
      )}
    </div>

    <div>
      <p className="text-sm font-medium uppercase tracking-wider text-[var(--vh-violet)]">
        Playlist
      </p>

      <h1 className="mt-2 text-4xl font-bold text-white">
        {playlist.name}
      </h1>

      <p className="mt-3 text-sm text-[var(--vh-muted)]">
        {playlist.songs.length} songs
      </p>

      <button
        type="button"
        onClick={handlePlayPlaylist}
        disabled={!playlist.songs.length}
        className="vh-button-primary mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Play size={18} fill="currentColor" />
        Play Playlist
      </button>
    </div>
  </div>
</div>

       {playlist.songs.length === 0 ? (
  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)]/50 text-center">
    <Music2
      size={40}
      className="text-[var(--vh-subtle)]"
    />

    <h2 className="mt-4 text-xl font-semibold text-white">
      This playlist is empty
    </h2>

    <p className="mt-2 text-sm text-[var(--vh-muted)]">
      Add songs to start building your vibe.
    </p>
  </div>
) : (
  <div className="space-y-2">
    {playlist.songs.map((song, index) => (
      <div
        key={song.id}
        className="group flex items-center gap-4 rounded-2xl border border-transparent bg-[var(--vh-charcoal)] p-3 transition hover:border-[var(--vh-border-hover)]"
      >
        <span className="w-6 text-center text-sm text-[var(--vh-subtle)]">
          {index + 1}
        </span>

        <img
          src={song.cover}
          alt={song.title}
          className="h-12 w-12 rounded-xl object-cover"
        />

        <button
          type="button"
          onClick={() => playTrack(song)}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="truncate font-medium text-white">
            {song.title}
          </h3>

          <p className="mt-1 truncate text-sm text-[var(--vh-muted)]">
            {song.artist}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            removeSongFromPlaylist(playlist.id, song.id)
          }
          className="vh-icon-button opacity-0 transition group-hover:opacity-100"
          aria-label={`Remove ${song.title}`}
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

export default Playlist