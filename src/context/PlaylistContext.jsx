import { createContext, useContext, useState } from 'react'

export const PlaylistContext = createContext(null)

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState([])

  // Create a new playlist
  const createPlaylist = (name) => {
    const trimmedName = name.trim()

    if (!trimmedName) return null

    const playlist = {
      id: crypto.randomUUID(),
      name: trimmedName,
      description: '',
      cover: '',
      songs: [],
      createdAt: Date.now(),
    }

    setPlaylists((prev) => [...prev, playlist])

    return playlist
  }

  // Find a playlist by ID
  const getPlaylistById = (playlistId) => {
    return playlists.find(
      (playlist) => playlist.id === playlistId
    )
  }

  // Delete playlist
  const deletePlaylist = (playlistId) => {
    setPlaylists((prev) =>
      prev.filter(
        (playlist) => playlist.id !== playlistId
      )
    )
  }

  
  // Add a song to playlist
const addSongToPlaylist = (playlistId, song) => {
  if (!song?.id) return

  setPlaylists((prev) =>
    prev.map((playlist) => {
      if (playlist.id !== playlistId) {
        return playlist
      }

      // Prevent duplicate songs
      const alreadyExists = playlist.songs.some(
        (item) => item.id === song.id
      )

      if (alreadyExists) {
        return playlist
      }

      const updatedSongs = [...playlist.songs, song]

      return {
        ...playlist,

        // Automatically use first song artwork as playlist cover
        cover:
          playlist.cover ||
          updatedSongs[0]?.cover ||
          '',

        songs: updatedSongs,
      }
    })
  )
}

        // Prevent duplicate songs
        const alreadyExists = playlist.songs.some(
          (item) => item.id === song.id
        )

        if (alreadyExists) {
          return playlist
        }

        return {
          ...playlist,
          songs: [...playlist.songs, song],
        }
      })
    )
  }

 // Remove a song from playlist
const removeSongFromPlaylist = (
  playlistId,
  songId
) => {
  setPlaylists((prev) =>
    prev.map((playlist) => {
      if (playlist.id !== playlistId) {
        return playlist
      }

      const updatedSongs = playlist.songs.filter(
        (song) => song.id !== songId
      )

      return {
        ...playlist,

        // If current cover came from the removed song,
        // use the next available song artwork.
        cover:
          updatedSongs.length > 0
            ? updatedSongs[0]?.cover || ''
            : '',

        songs: updatedSongs,
      }
    })
  )
}


  // Update playlist information
  // Useful later for rename, description and cover
  const updatePlaylist = (playlistId, updates) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              ...updates,
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
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        updatePlaylist,
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