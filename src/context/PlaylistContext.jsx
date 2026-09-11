import { createContext, useContext, useState } from 'react'

const PlaylistContext = createContext(null)

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState([])

  const createPlaylist = (name) => {
    const playlist = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: '',
      cover: '',
      songs: [],
      createdAt: Date.now(),
    }

    setPlaylists((prev) => [...prev, playlist])
    return playlist
  }

  const deletePlaylist = (playlistId) => {
    setPlaylists((prev) =>
      prev.filter((playlist) => playlist.id !== playlistId)
    )
  }

  const addSongToPlaylist = (playlistId, song) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id !== playlistId) return playlist

        const exists = playlist.songs.some(
          (item) => item.id === song.id
        )

        if (exists) return playlist

        return {
          ...playlist,
          songs: [...playlist.songs, song],
        }
      })
    )
  }

  const removeSongFromPlaylist = (playlistId, songId) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              songs: playlist.songs.filter(
                (song) => song.id !== songId
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
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylistContext() {
  const context = useContext(PlaylistContext)

  if (!context) {
    throw new Error(
      'usePlaylistContext must be used inside PlaylistProvider'
    )
  }

  return context
}