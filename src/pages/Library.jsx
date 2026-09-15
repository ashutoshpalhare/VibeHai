import { useMemo, useState } from 'react'
import {
  ListMusic,
  Music2,
  Disc3,
  Mic2,
  Clock3,
  ArrowDownUp,
  Play,
  Plus,
  X,
} from 'lucide-react'

import LibraryTabs from '../components/music/LibraryTabs'
import SongCard from '../components/music/SongCard'
import PlaylistCard from '../components/music/PlaylistCard'
import { songs, albums, artists } from '../data'
import { usePlaylist } from '../hooks/usePlaylist'

function Library() {
  const handleDeletePlaylist = (playlistId) => {
  const playlist = playlists.find(
    (item) => item.id === playlistId
  )

  if (!playlist) return

  const confirmed = window.confirm(
    `Delete "${playlist.name}" playlist?`
  )

  if (!confirmed) return

  deletePlaylist(playlistId)
}
  const { playlists, createPlaylist } = usePlaylist()

  const [activeTab, setActiveTab] = useState('Playlists')
  const [sortBy, setSortBy] = useState('Recently Added')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [playlistName, setPlaylistName] = useState('')

  const sortedSongs = useMemo(() => {
    const data = [...songs]

    if (sortBy === 'Alphabetical') {
      return data.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      )
    }

    return data
  }, [sortBy])

  const handleCreatePlaylist = () => {
    const name = playlistName.trim()

    if (!name) return

    createPlaylist(name)

    setPlaylistName('')
    setShowCreateModal(false)
  }

  const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
  }) => (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)]/50 px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--vh-dark-gray)]">
        <Icon
          size={30}
          className="text-[var(--vh-muted)]"
        />
      </div>

      <h3 className="text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--vh-muted)]">
        {description}
      </p>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="vh-button-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'Playlists':
        if (!playlists.length) {
          return (
            <EmptyState
              icon={ListMusic}
              title="No playlists yet"
              description="Create a playlist and make it yours. Your personal collections will appear here."
              action={{
                label: 'Create Playlist',
                icon: <Plus size={17} />,
                onClick: () => setShowCreateModal(true),
              }}
            />
          )
        }

        return (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
           {playlists.map((playlist) => (
  <PlaylistCard
    key={playlist.id}
    playlist={playlist}
    onDelete={() => handleDeletePlaylist(playlist.id)}
  />
))}
          </div>
        )

      case 'Songs':
        if (!sortedSongs.length) {
          return (
            <EmptyState
              icon={Music2}
              title="No saved songs"
              description="Your favorite tracks will appear here once you start adding music to your library."
            />
          )
        }

        return (
          <div className="space-y-2">
            {sortedSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
              />
            ))}
          </div>
        )

      case 'Albums':
        if (!albums.length) {
          return (
            <EmptyState
              icon={Disc3}
              title="No albums yet"
              description="Albums you save or discover will appear here."
            />
          )
        }

        return (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {albums.map((album) => (
              <div
                key={album.id}
                className="vh-card-interactive rounded-2xl p-3"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-[var(--vh-dark-gray)]">
                  {album.cover ? (
                    <img
                      src={album.cover}
                      alt={album.title || 'Album'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Disc3
                        size={42}
                        className="text-[var(--vh-subtle)]"
                      />
                    </div>
                  )}
                </div>

                <h3 className="mt-3 truncate font-semibold text-white">
                  {album.title || 'Unknown Album'}
                </h3>

                <p className="mt-1 truncate text-sm text-[var(--vh-muted)]">
                  {album.artist || 'Unknown Artist'}
                </p>
              </div>
            ))}
          </div>
        )

      case 'Artists':
        if (!artists.length) {
          return (
            <EmptyState
              icon={Mic2}
              title="No artists yet"
              description="Artists from your library will appear here."
            />
          )
        }

        return (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="group text-center"
              >
                <div className="mx-auto aspect-square max-w-[180px] overflow-hidden rounded-full border border-[var(--vh-border)] bg-[var(--vh-dark-gray)] transition-transform duration-300 group-hover:scale-105">
                  {artist.image ? (
                    <img
                      src={artist.image}
                      alt={artist.name || 'Artist'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Mic2
                        size={40}
                        className="text-[var(--vh-subtle)]"
                      />
                    </div>
                  )}
                </div>

                <h3 className="mt-4 truncate font-semibold text-white">
                  {artist.name || 'Unknown Artist'}
                </h3>

                <p className="mt-1 text-sm text-[var(--vh-muted)]">
                  Artist
                </p>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="vh-ambient absolute -right-32 -top-32 h-80 w-80 rounded-full opacity-20" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-wide text-[var(--vh-violet)]">
              YOUR COLLECTION
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your Library
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--vh-muted)] sm:text-base">
              Everything you love, all in one place.
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowDownUp
              size={17}
              className="text-[var(--vh-muted)]"
            />

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)] px-4 py-2.5 text-sm text-white outline-none transition hover:border-[var(--vh-border-hover)] focus:border-[var(--vh-violet)]"
            >
              <option>Recently Added</option>
              <option>Recently Played</option>
              <option>Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-[var(--vh-border)]">
          <LibraryTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Recently Played */}
        {sortBy === 'Recently Played' && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)] px-4 py-3 text-sm text-[var(--vh-muted)]">
            <Clock3 size={17} />
            Showing your recently played music
          </div>
        )}

        {/* Content */}
        <div className="mt-7">
          {renderContent()}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCreateModal(false)
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--vh-violet)]">
                  New Collection
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  Create Playlist
                </h2>

                <p className="mt-1 text-sm text-[var(--vh-muted)]">
                  Give your playlist a name and start building your vibe.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="vh-icon-button"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* Input */}
            <div className="mt-6">
              <label
                htmlFor="playlist-name"
                className="mb-2 block text-sm font-medium text-white"
              >
                Playlist Name
              </label>

              <input
                id="playlist-name"
                autoFocus
                type="text"
                value={playlistName}
                onChange={(event) =>
                  setPlaylistName(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleCreatePlaylist()
                  }

                  if (event.key === 'Escape') {
                    setShowCreateModal(false)
                  }
                }}
                placeholder="My awesome playlist"
                maxLength={60}
                className="w-full rounded-xl border border-[var(--vh-border)] bg-[var(--vh-dark-gray)] px-4 py-3 text-white outline-none placeholder:text-[var(--vh-subtle)] focus:border-[var(--vh-violet)]"
              />

              <div className="mt-2 text-right text-xs text-[var(--vh-subtle)]">
                {playlistName.length}/60
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setPlaylistName('')
                  setShowCreateModal(false)
                }}
                className="vh-button-secondary rounded-xl px-4 py-2.5 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreatePlaylist}
                disabled={!playlistName.trim()}
                className="vh-button-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={17} />
                Create Playlist
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default LibraryTabs