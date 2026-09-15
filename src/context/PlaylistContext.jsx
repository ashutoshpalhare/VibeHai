import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from '../utils/storage'

const PlaylistContext = createContext(null)

export function PlaylistProvider({ children }) {
  // ---------------------------------------------------------
  // Load playlists from LocalStorage on first render
  // ---------------------------------------------------------
  const [playlists, setPlaylists] = useState(() =>
    getStorageItem(STORAGE_KEYS.PLAYLISTS, [])
  )

  // ---------------------------------------------------------
  // Save playlists whenever they change
  // ---------------------------------------------------------
  useEffect(() => {
    setStorageItem(
      STORAGE_KEYS.PLAYLISTS,
      playlists
    )
  }, [playlists])

  // ---------------------------------------------------------
  // Create a new playlist
  // ---------------------------------------------------------
  const createPlaylist = (name) => {
    const cleanName = name.trim()

    if (!cleanName) return null

    const playlist = {
      id: crypto.randomUUID(),
      name: cleanName,
      description: '',
      cover: '',
      songs: [],
      createdAt: Date.now(),
    }

    setPlaylists((prev) => [
      ...prev,
      playlist,
    ])

    return playlist
  }

  // ---------------------------------------------------------
  // Get playlist by ID
  // ---------------------------------------------------------
  const getPlaylistById = (playlistId) => {
    return playlists.find(
      (playlist) => playlist.id === playlistId
    )
  }

  // ---------------------------------------------------------
  // Rename playlist
  // ---------------------------------------------------------
  const renamePlaylist = (
    playlistId,
    newName
  ) => {
    const cleanName = newName.trim()

    if (!cleanName) return

    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              name: cleanName,
            }
          : playlist
      )
    )
  }

  // ---------------------------------------------------------
  // Delete playlist
  // ---------------------------------------------------------
  const deletePlaylist = (playlistId) => {
    setPlaylists((prev) =>
      prev.filter(
        (playlist) =>
          playlist.id !== playlistId
      )
    )
  }

  // ---------------------------------------------------------
  // Add song to playlist
  // ---------------------------------------------------------
  const addSongToPlaylist = (
    playlistId,
    song
  ) => {
    if (!song?.id) return

    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id !== playlistId) {
          return playlist
        }

        // Prevent duplicate songs
        const exists = playlist.songs.some(
          (item) => item.id === song.id
        )

        if (exists) {
          return playlist
        }

        return {
          ...playlist,

          songs: [
            ...playlist.songs,
            {
              ...song,
              liked: Boolean(song.liked),
            },
          ],
        }
      })
    )
  }

  // ---------------------------------------------------------
  // Remove song from playlist
  // ---------------------------------------------------------
  const removeSongFromPlaylist = (
    playlistId,
    songId
  ) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,

              songs: playlist.songs.filter(
                (song) =>
                  song.id !== songId
              ),
            }
          : playlist
      )
    )
  }

  return (
    <PlaylistContext.Provider
      value={{
        playlists,

        createPlaylist,
        getPlaylistById,

        renamePlaylist,
        deletePlaylist,

        addSongToPlaylist,
        removeSongFromPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

// ---------------------------------------------------------
// Custom hook
// ---------------------------------------------------------
export function usePlaylistContext() {
  const context = useContext(
    PlaylistContext
  )

  if (!context) {
    throw new Error(
      'usePlaylistContext must be used inside PlaylistProvider'
    )
  }

  return context
}