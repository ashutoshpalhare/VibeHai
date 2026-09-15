import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Edit3,
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
    renamePlaylist,
    deletePlaylist,
  } = usePlaylist()

const { playTrack, playQueue } = usePlayer()

  // Add Songs modal state
  const [showAddSongs, setShowAddSongs] = useState(false)

  // Search state
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Rename state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Find current playlist
  const playlist = playlists.find((item) => item.id === id)

  // Search JioSaavn with debounce
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
          ? results
              .map(normalizeSong)
              .filter((song) => song.id)
          : []

        setSearchResults(normalizedResults)
      } catch (error) {
        console.error(
          'Playlist song search failed:',
          error
        )

        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  // Get IDs of songs already added to playlist
  const playlistSongIds = useMemo(
    () =>
      new Set(
        (playlist?.songs || []).map(
          (song) => song.id
        )
      ),
    [playlist]
  )

  // Add song to current playlist
  const handleAddSong = (song) => {
    if (!playlist) return

    addSongToPlaylist(playlist.id, song)
  }

  // Play first song from playlist
 const handlePlayPlaylist = () => {
  if (!playlist?.songs?.length) return

  playQueue(playlist.songs, 0)
}

  // Start playlist rename
  const handleStartRename = () => {
    setEditedName(playlist.name)
    setIsEditingName(true)
  }

  // Save playlist name
  const handleRename = () => {
    const name = editedName.trim()

    if (!name) return

    renamePlaylist(playlist.id, name)
    setIsEditingName(false)
  }

  // Delete playlist
  const handleDeletePlaylist = () => {
    deletePlaylist(playlist.id)
    setShowDeleteConfirm(false)
    navigate('/library')
  }

  // Playlist does not exist
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
            This playlist may have been deleted or is no
            longer available.
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

        {/* Back to Library */}
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

          {/* Playlist Information */}
          <div className="min-w-0 flex-1">

            <p className="text-sm font-medium uppercase tracking-wider text-[var(--vh-violet)]">
              Playlist
            </p>

            {/* Playlist Name / Rename */}
            {isEditingName ? (
              <div className="mt-3 flex max-w-xl flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(event) =>
                    setEditedName(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleRename()
                    }

                    if (event.key === 'Escape') {
                      setIsEditingName(false)
                    }
                  }}
                  autoFocus
                  maxLength={60}
                  className="min-w-0 flex-1 rounded-xl border border-[var(--vh-border)] bg-[var(--vh-dark-gray)] px-4 py-2 text-2xl font-bold text-white outline-none focus:border-[var(--vh-violet)]"
                />

                <button
                  type="button"
                  onClick={handleRename}
                  disabled={!editedName.trim()}
                  className="vh-button-primary rounded-xl px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsEditingName(false)
                  }
                  className="vh-button-secondary rounded-xl px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-3">
                <h1 className="truncate text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {playlist.name}
                </h1>

                <button
                  type="button"
                  onClick={handleStartRename}
                  className="vh-icon-button shrink-0"
                  aria-label="Rename playlist"
                  title="Rename playlist"
                >
                  <Edit3 size={17} />
                </button>
              </div>
            )}

            <p className="mt-3 text-sm text-[var(--vh-muted)]">
              {playlist.songs.length}{' '}
              {playlist.songs.length === 1
                ? 'song'
                : 'songs'}
            </p>

            {/* Playlist Actions */}
            <div className="mt-5 flex flex-wrap gap-3">

              {/* Play Playlist */}
              <button
                type="button"
                onClick={handlePlayPlaylist}
                disabled={!playlist.songs.length}
                className="vh-button-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play
                  size={18}
                  fill="currentColor"
                />
                Play Playlist
              </button>

              {/* Add Songs */}
              <button
                type="button"
                onClick={() => setShowAddSongs(true)}
                className="vh-button-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
              >
                <Plus size={18} />
                Add Songs
              </button>

              {/* Delete Playlist */}
              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(true)
                }
                className="vh-icon-button"
                aria-label="Delete playlist"
                title="Delete playlist"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Playlist Songs */}
        <div className="mt-10">

          {/* Empty Playlist */}
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
                onClick={() =>
                  setShowAddSongs(true)
                }
                className="vh-button-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
              >
                <Plus size={17} />
                Add Songs
              </button>
            </div>
          ) : (

            /* Song List */
            <div className="space-y-2">
              {playlist.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="group flex items-center gap-3 rounded-2xl border border-transparent bg-[var(--vh-charcoal)] p-3 transition hover:border-[var(--vh-border-hover)] hover:bg-[var(--vh-dark-gray)]"
                >
                  {/* Track Number */}
                  <span className="hidden w-7 text-center text-sm text-[var(--vh-subtle)] sm:block">
                    {index + 1}
                  </span>

                  {/* Song Cover */}
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />

                  {/* Song Information */}
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

                  {/* Remove Song */}
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
                    title="Remove from playlist"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          ADD SONGS MODAL
      ===================================================== */}
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
                  setSearchResults([])
                }}
                className="vh-icon-button"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* Search Box */}
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

            {/* Search Results */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5">

              {/* Initial State */}
              {!query.trim() ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">

                  <Search
                    size={38}
                    className="text-[var(--vh-subtle)]"
                  />

                  <p className="mt-4 text-sm text-[var(--vh-muted)]">
                    Search for songs to add to this
                    playlist.
                  </p>
                </div>

              ) : loading ? (

                /* Loading */
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

                /* No Results */
                <div className="flex min-h-[220px] items-center justify-center text-sm text-[var(--vh-muted)]">
                  Nothing matched that vibe.
                </div>

              ) : (

                /* Results */
                <div className="space-y-2">
                  {searchResults.map((song) => {
                    const alreadyAdded =
                      playlistSongIds.has(song.id)

                    return (
                      <div
                        key={song.id}
                        className="flex items-center gap-3 rounded-2xl border border-transparent bg-[var(--vh-dark-gray)] p-3 transition hover:border-[var(--vh-border-hover)]"
                      >
                        {/* Song Cover */}
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="h-12 w-12 shrink-0 rounded-xl object-cover"
                        />

                        {/* Song Info */}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-medium text-white">
                            {song.title}
                          </h3>

                          <p className="mt-1 truncate text-xs text-[var(--vh-muted)]">
                            {song.artist}
                          </p>
                        </div>

                        {/* Add Button */}
                        <button
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() =>
                            handleAddSong(song)
                          }
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

      {/* =====================================================
          DELETE PLAYLIST CONFIRMATION
      ===================================================== */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDeleteConfirm(false)
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)] p-6 shadow-2xl">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <Trash2
                  size={20}
                  className="text-red-400"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Delete Playlist?
                </h2>

                <p className="text-xs text-[var(--vh-muted)]">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[var(--vh-muted)]">
              Are you sure you want to delete{' '}
              <span className="font-medium text-white">
                "{playlist.name}"
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
                className="vh-button-secondary rounded-xl px-4 py-2.5 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeletePlaylist}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Playlist