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

const LibraryContext = createContext(null)

export function LibraryProvider({ children }) {
  // ---------------------------------------------------------
  // Load liked songs from LocalStorage on first render
  // ---------------------------------------------------------
  const [likedSongs, setLikedSongs] = useState(() =>
    getStorageItem(STORAGE_KEYS.LIKED_SONGS, [])
  )

  // ---------------------------------------------------------
  // Save liked songs whenever they change
  // ---------------------------------------------------------
  useEffect(() => {
    setStorageItem(
      STORAGE_KEYS.LIKED_SONGS,
      likedSongs
    )
  }, [likedSongs])

  // ---------------------------------------------------------
  // Like / Unlike song
  // ---------------------------------------------------------
  const toggleLike = (song) => {
    if (!song?.id) return

    setLikedSongs((prev) => {
      const exists = prev.some(
        (item) => item.id === song.id
      )

      // If already liked → Unlike
      if (exists) {
        return prev.filter(
          (item) => item.id !== song.id
        )
      }

      // Otherwise → Like
      return [
        ...prev,
        {
          ...song,
          liked: true,
        },
      ]
    })
  }

  // ---------------------------------------------------------
  // Check whether a song is liked
  // ---------------------------------------------------------
  const isLiked = (songId) => {
    return likedSongs.some(
      (song) => song.id === songId
    )
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

// ---------------------------------------------------------
// Custom hook
// ---------------------------------------------------------
export function useLibraryContext() {
  const context = useContext(LibraryContext)

  if (!context) {
    throw new Error(
      'useLibraryContext must be used inside LibraryProvider'
    )
  }

  return context
}