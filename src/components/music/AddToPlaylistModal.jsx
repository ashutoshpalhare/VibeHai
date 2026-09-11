import { useState } from 'react'
import { ListMusic, Plus, X } from 'lucide-react'

import { usePlaylist } from '../../hooks/usePlaylist'

function AddToPlaylistModal({ song, onClose }) {
  const { playlists, addSongToPlaylist, createPlaylist } = usePlaylist()

  const [newPlaylistName, setNewPlaylistName] = useState('')

  const handleAdd = (playlistId) => {
    addSongToPlaylist(playlistId, song)
    onClose()
  }

  const handleCreateAndAdd = () => {
    const name = newPlaylistName.trim()

    if (!name) return

    const playlist = createPlaylist(name)

    addSongToPlaylist(playlist.id, song)

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      {
      /* Modal content */
      <div className="w-full max-w-md rounded-3xl border border-[var(--vh-border)] bg-[var(--vh-charcoal)] p-6 shadow-2xl">

  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs uppercase tracking-wider text-[var(--vh-violet)]">
        Save Track
      </p>

      <h2 className="mt-1 text-xl font-bold text-white">
        Add to Playlist
      </h2>
    </div>

    <button
      type="button"
      onClick={onClose}
      className="vh-icon-button"
      aria-label="Close"
    >
      <X size={19} />
    </button>
  </div>

  <div className="mt-5 max-h-64 space-y-2 overflow-y-auto">
    {playlists.length === 0 ? (
      <p className="py-6 text-center text-sm text-[var(--vh-muted)]">
        No playlists yet.
      </p>
    ) : (
      playlists.map((playlist) => (
        <button
          key={playlist.id}
          type="button"
          onClick={() => handleAdd(playlist.id)}
          className="flex w-full items-center gap-3 rounded-xl border border-[var(--vh-border)] bg-[var(--vh-dark-gray)] p-3 text-left transition hover:border-[var(--vh-border-hover)] hover:bg-[var(--vh-gray)]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--vh-charcoal)]">
            <ListMusic
              size={20}
              className="text-[var(--vh-violet)]"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-white">
              {playlist.name}
            </p>

            <p className="text-xs text-[var(--vh-muted)]">
              {playlist.songs.length} songs
            </p>
          </div>
        </button>
      ))
    )}
  </div>

  <div className="mt-5 border-t border-[var(--vh-border)] pt-5">
    <p className="mb-2 text-sm font-medium text-white">
      Create New Playlist
    </p>

    <div className="flex gap-2">
      <input
        type="text"
        value={newPlaylistName}
        onChange={(event) => setNewPlaylistName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleCreateAndAdd()
          }
        }}
        placeholder="Playlist name"
        className="min-w-0 flex-1 rounded-xl border border-[var(--vh-border)] bg-[var(--vh-dark-gray)] px-4 py-2.5 text-sm text-white outline-none placeholder:text-[var(--vh-subtle)] focus:border-[var(--vh-violet)]"
      />

      <button
        type="button"
        onClick={handleCreateAndAdd}
        disabled={!newPlaylistName.trim()}
        className="vh-button-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm disabled:opacity-40"
      >
        <Plus size={17} />
        Create
      </button>
    </div>
  </div>

</div>

}
    </div>
  )
}

export default AddToPlaylistModal