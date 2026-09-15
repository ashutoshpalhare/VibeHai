// LocalStorage keys used by VibeHai
const STORAGE_KEYS = {
  LIKED_SONGS: 'vibeHai_likedSongs',
  PLAYLISTS: 'vibeHai_playlists',
}

// ---------------------------------------------------------
// Read data from LocalStorage
// ---------------------------------------------------------
export function getStorageItem(key, fallback = []) {
  try {
    const storedValue = localStorage.getItem(key)

    if (!storedValue) {
      return fallback
    }

    return JSON.parse(storedValue)
  } catch (error) {
    console.error(
      `Failed to read LocalStorage key "${key}":`,
      error
    )

    return fallback
  }
}

// ---------------------------------------------------------
// Save data to LocalStorage
// ---------------------------------------------------------
export function setStorageItem(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    )
  } catch (error) {
    console.error(
      `Failed to save LocalStorage key "${key}":`,
      error
    )
  }
}

// ---------------------------------------------------------
// Remove data from LocalStorage
// ---------------------------------------------------------
export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(
      `Failed to remove LocalStorage key "${key}":`,
      error
    )
  }
}

// Export storage keys
export { STORAGE_KEYS }