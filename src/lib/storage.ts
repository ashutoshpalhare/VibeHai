const PREFIX = "vibehai:";

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  playlists: "playlists",
  liked: "liked-songs",
  recent: "recently-played",
  recentSearches: "recent-searches",
  savedAlbums: "saved-albums",
  savedPlaylists: "saved-playlists",
  followedArtists: "followed-artists",
  player: "player-state",
  settings: "settings",
  theme: "theme",
} as const;
