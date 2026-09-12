import { createContext, useContext, useState } from 'react'

const LibraryContext = createContext(null)

export function LibraryProvider({ children }) {
  const [likedSongs, setLikedSongs] = useState([])

  // Like / Unlike song
  const toggleLike = (song) => {
    setLikedSongs((prev) => {
      const exists = prev.some((item) => item.id === song.id)

      if (exists) {
        return prev.filter((item) => item.id !== song.id)
      }

      return [...prev, { ...song, liked: true }]
    })
  }

  // Check whether song is liked
  const isLiked = (songId) => {
    return likedSongs.some((song) => song.id === songId)
  }

  return (
    <LibraryContext.Provider
      value={{
        likedSongs,
        toggleLike,
        isLiked,
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibraryContext() {
  const context = useContext(LibraryContext)

  if (!context) {
    throw new Error(
      'useLibraryContext must be used inside LibraryProvider'
    )
  }

  return context
}