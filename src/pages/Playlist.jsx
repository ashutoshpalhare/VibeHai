import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Music2,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import { usePlaylist } from '../hooks/usePlaylist'
import { usePlayer } from '../hooks/usePlayer'
import { searchSongs } from '../services/jiosaavn'
import { normalizeSong } from '../utils/normalizeSong'

function Playlist() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    playlists,
    addSongToPlaylist,
    removeSongFromPlaylist,
  } = usePlaylist()

  const { playTrack } = usePlayer()

  const [showAddSongs, setShowAddSongs] = useState(false)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Find current playlist from PlaylistContext
  const playlist = playlists.find((item) => item.id === id)

  // Search JioSaavn when user types
  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setSearchResults([])
      setLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)

        const results = await searchSongs(trimmedQuery)

        const normalizedResults = Array.isArray(results)
          ? results.map(normalizeSong).filter((song) => song.id)
          : []

        setSearchResults(normalizedResults)
      } catch (error) {
        console.error('Playlist song search failed:', error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  // IDs of songs already inside playlist
  const playlistSongIds = useMemo(
    () => new Set((playlist?.songs || []).map((song) => song.id)),
    [playlist]
  )

  const handleAddSong = (song) => {
    if (!playlist) return

    addSongToPlaylist(playlist.id, song)
  }

  const handlePlayPlaylist = () => {
    if (!playlist?.songs?.length) return

    playTrack(playlist.songs[0])
  }

  if (!playlist) {
    return (
      <section className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[400px] max-w-5xl flex-col items-center justify-center text-center">
          <Music2
            size={48}
            className="text-[var(--vh-subtle)]"
          />

          <h1 className="mt-5 text-2xl font-bold text-white">
            Playlist not found
          </h1>

          <p className="mt-2 text-sm text-[var(--vh-muted)]">
            This playlist may have been deleted or is no longer available.
          </p>

          <button
            type="button"
            onClick={() => navigate('/library')}
            className="vh-button-primary mt-6 rounded-xl px-5 py-3 text-sm font-medium"
          >
            Back to Library
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="vh-ambient absolute -right-40 -top-40 h-96 w-96 rounded-full opacity-20" />
      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/library')}
          className="mb-7 inline-flex items-center gap-2 text-sm text-[var(--vh-muted)] transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Library
        </button>

        {/* Playlist Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          {/* Playlist Cover */}
          <div className="flex h-48 w-48 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[var(--vh-border)] bg-[var(--vh-dark-gray)] shadow-[var(--vh-shadow-md)]">
            {playlist.cover ? (
              <img
                src={playlist.cover}
                alt={playlist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Music2
                size={60}
                className="text-[var(--vh-subtle)]"
              />
            )}
          </div>

          {/* Playlist Info */}
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-wider text-[var(--vh-violet)]">
              Playlist
            </p>

            <h1 className="mt-2 truncate text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {playlist.name}
            </h1>

            <p className="mt-3 text-sm text-[var(--vh-muted)]">
              {playlist.songs.length}{' '}
              {playlist.songs.length === 1 ? 'song' : 'songs'}
            </p>

            {/* Playlist Actions */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePlayPlaylist}
                disabled={!playlist.songs.length}
                className="vh-button-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play size={18} fill="currentColor" />
                Play Playlist
              </button>

              <button
                type="button"
                onClick={() => setShowAddSongs(true)}
                className="vh-button-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
              >
                <Plus size={18} />
                Add Songs
              </button>
            </div>
          </div>
        </div>

        {/* Songs */}
        <div className="mt-10">
          {playlist.songs.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)]/50 px-6 text-center">
              <Music2
                size={42}
                className="text-[var(--vh-subtle)]"
              />

              <h2 className="mt-4 text-xl font-semibold text-white">
                This playlist is empty
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--vh-muted)]">
                Add songs to start building your vibe.
              </p>

              <button
                type="button"
                onClick={() => setShowAddSongs(true)}
                className="vh-button-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
              >
                <Plus size={17} />
                Add Songs
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {playlist.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="group flex items-center gap-3 rounded-2xl border border-transparent bg-[var(--vh-charcoal)] p-3 transition hover:border-[var(--vh-border-hover)] hover:bg-[var(--vh-dark-gray)]"
                >
                  {/* Track number */}
                  <span className="hidden w-7 text-center text-sm text-[var(--vh-subtle)] sm:block">
                    {index + 1}
                  </span>

                  {/* Cover */}
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />

                  {/* Song info */}
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

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() =>
                      removeSongFromPlaylist(
                        playlist.id,
                        song.id
                      )
                    }
                    className="vh-icon-button opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Remove ${song.title}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Songs Modal */}
      {showAddSongs && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddSongs(false)
            }
          }}
        >
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)] shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--vh-border)] p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--vh-violet)]">
                  {playlist.name}
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Add Songs
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddSongs(false)
                  setQuery('')
                }}
                className="vh-icon-button"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-[var(--vh-border)] p-5">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--vh-subtle)]"
                />

                <input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search songs on JioSaavn..."
                  autoFocus
                  className="w-full rounded-xl border border-[var(--vh-border)] bg-[var(--vh-dark-gray)] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-[var(--vh-subtle)] focus:border-[var(--vh-violet)]"
                />
              </div>
            </div>

            {/* Results */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {!query.trim() ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <Search
                    size={38}
                    className="text-[var(--vh-subtle)]"
                  />

                  <p className="mt-4 text-sm text-[var(--vh-muted)]">
                    Search for songs to add to this playlist.
                  </p>
                </div>
              ) : loading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="flex items-center gap-3 text-sm text-[var(--vh-muted)]">
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    Searching JioSaavn...
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center text-sm text-[var(--vh-muted)]">
                  Nothing matched that vibe.
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((song) => {
                    const alreadyAdded = playlistSongIds.has(
                      song.id
                    )

                    return (
                      <div
                        key={song.id}
                        className="flex items-center gap-3 rounded-2xl border border-transparent bg-[var(--vh-dark-gray)] p-3 transition hover:border-[var(--vh-border-hover)]"
                      >
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="h-12 w-12 shrink-0 rounded-xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-medium text-white">
                            {song.title}
                          </h3>

                          <p className="mt-1 truncate text-xs text-[var(--vh-muted)]">
                            {song.artist}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => handleAddSong(song)}
                          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--vh-border)] px-3 py-2 text-xs font-medium text-white transition hover:border-[var(--vh-violet)] disabled:cursor-default disabled:opacity-40"
                        >
                          {alreadyAdded ? (
                            'Added'
                          ) : (
                            <>
                              <Plus size={15} />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Playlist