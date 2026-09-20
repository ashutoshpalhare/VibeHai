import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { moveItem } from "@/lib/format";
import { load, remove, save, STORAGE_KEYS } from "@/lib/storage";
import type { Album, Artist, Collection, Song, UserPlaylist } from "@/lib/types";

/* ---------------------------------------------------------------- */

export interface SavedAlbum extends Album {
  savedAt: number;
}
export interface FollowedArtist extends Artist {
  savedAt: number;
}
export interface SavedCollection extends Collection {
  savedAt: number;
}

export interface RecentlyPlayedItem {
  song: Song;
  playedAt: number;
}

interface LibraryApi {
  /* playlists */
  playlists: UserPlaylist[];
  createPlaylist: (name: string, description?: string, songs?: Song[]) => UserPlaylist;
  updatePlaylist: (id: string, patch: Partial<Pick<UserPlaylist, "name" | "description">>) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (id: string, songs: Song[]) => number;
  removeFromPlaylist: (id: string, songId: string) => void;
  reorderPlaylist: (id: string, from: number, to: number) => void;
  getPlaylist: (id: string) => UserPlaylist | undefined;
  isPlaylistNameTaken: (name: string, exceptId?: string) => boolean;

  /* liked songs */
  likedSongs: Song[];
  isLiked: (songId: string) => boolean;
  toggleLike: (song: Song) => boolean;

  /* collections */
  savedAlbums: SavedAlbum[];
  savedPlaylists: SavedCollection[];
  followedArtists: FollowedArtist[];
  toggleAlbum: (album: Album) => boolean;
  isAlbumSaved: (id: string) => boolean;
  toggleCollection: (collection: Collection) => boolean;
  isCollectionSaved: (id: string) => boolean;
  toggleArtist: (artist: Artist) => boolean;
  isArtistFollowed: (id: string) => boolean;

  /* history */
  recentlyPlayed: RecentlyPlayedItem[];
  pushRecentlyPlayed: (song: Song) => void;
  clearRecentlyPlayed: () => void;

  /* misc */
  recentSearches: string[];
  pushRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;

  clearLiked: () => void;
  clearPlaylists: () => void;
  clearSavedMedia: () => void;
  resetAll: () => void;
}

const LibraryContext = createContext<LibraryApi | null>(null);

const uid = () => `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function bySavedAt<T extends { savedAt: number }>(a: T, b: T) {
  return b.savedAt - a.savedAt;
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<UserPlaylist[]>(() =>
    load<UserPlaylist[]>(STORAGE_KEYS.playlists, []),
  );
  const [likedSongs, setLikedSongs] = useState<Song[]>(() =>
    load<Song[]>(STORAGE_KEYS.liked, []),
  );
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>(() =>
    load<RecentlyPlayedItem[]>(STORAGE_KEYS.recent, []),
  );
  const [savedAlbums, setSavedAlbums] = useState<SavedAlbum[]>(() =>
    load<SavedAlbum[]>(STORAGE_KEYS.savedAlbums, []),
  );
  const [savedPlaylists, setSavedPlaylists] = useState<SavedCollection[]>(() =>
    load<SavedCollection[]>(STORAGE_KEYS.savedPlaylists, []),
  );
  const [followedArtists, setFollowedArtists] = useState<FollowedArtist[]>(() =>
    load<FollowedArtist[]>(STORAGE_KEYS.followedArtists, []),
  );
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    load<string[]>(STORAGE_KEYS.recentSearches, []),
  );

  /* ---------------- persistence ---------------- */
  useEffect(() => save(STORAGE_KEYS.playlists, playlists), [playlists]);
  useEffect(() => save(STORAGE_KEYS.liked, likedSongs), [likedSongs]);
  useEffect(() => save(STORAGE_KEYS.recent, recentlyPlayed.slice(0, 60)), [recentlyPlayed]);
  useEffect(() => save(STORAGE_KEYS.savedAlbums, savedAlbums), [savedAlbums]);
  useEffect(() => save(STORAGE_KEYS.savedPlaylists, savedPlaylists), [savedPlaylists]);
  useEffect(() => save(STORAGE_KEYS.followedArtists, followedArtists), [followedArtists]);
  useEffect(() => save(STORAGE_KEYS.recentSearches, recentSearches), [recentSearches]);

  /* ---------------- playlists ---------------- */
  const createPlaylist = useCallback<LibraryApi["createPlaylist"]>((name, description, songs) => {
    const now = Date.now();
    const playlist: UserPlaylist = {
      id: uid(),
      name: name.trim() || "New playlist",
      description: description?.trim() ?? "",
      songs: songs ? [...songs] : [],
      createdAt: now,
      updatedAt: now,
    };
    setPlaylists((prev) => [playlist, ...prev]);
    return playlist;
  }, []);

  const updatePlaylist = useCallback<LibraryApi["updatePlaylist"]>((id, patch) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
    );
  }, []);

  const deletePlaylist = useCallback<LibraryApi["deletePlaylist"]>((id) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addToPlaylist = useCallback<LibraryApi["addToPlaylist"]>((id, songs) => {
    let added = 0;
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const existing = new Set(p.songs.map((s) => s.id));
        const fresh = songs.filter((s) => !existing.has(s.id));
        added = fresh.length;
        if (!added) return p;
        return { ...p, songs: [...p.songs, ...fresh], updatedAt: Date.now() };
      }),
    );
    return added;
  }, []);

  const removeFromPlaylist = useCallback<LibraryApi["removeFromPlaylist"]>((id, songId) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, songs: p.songs.filter((s) => s.id !== songId), updatedAt: Date.now() }
          : p,
      ),
    );
  }, []);

  const reorderPlaylist = useCallback<LibraryApi["reorderPlaylist"]>((id, from, to) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, songs: moveItem(p.songs, from, to) } : p)),
    );
  }, []);

  const getPlaylist = useCallback(
    (id: string) => playlists.find((p) => p.id === id),
    [playlists],
  );

  const isPlaylistNameTaken = useCallback(
    (name: string, exceptId?: string) =>
      playlists.some(
        (p) => p.id !== exceptId && p.name.trim().toLowerCase() === name.trim().toLowerCase(),
      ),
    [playlists],
  );

  /* ---------------- liked ---------------- */
  const isLiked = useCallback(
    (songId: string) => likedSongs.some((s) => s.id === songId),
    [likedSongs],
  );

  const toggleLike = useCallback<LibraryApi["toggleLike"]>(
    (song) => {
      const already = likedSongs.some((s) => s.id === song.id);
      setLikedSongs((prev) =>
        already ? prev.filter((s) => s.id !== song.id) : [song, ...prev],
      );
      return !already;
    },
    [likedSongs],
  );

  /* ---------------- collections ---------------- */
  const toggleAlbum = useCallback<LibraryApi["toggleAlbum"]>(
    (album) => {
      const exists = savedAlbums.some((a) => a.id === album.id);
      setSavedAlbums((prev) =>
        exists ? prev.filter((a) => a.id !== album.id) : [{ ...album, savedAt: Date.now() }, ...prev],
      );
      return !exists;
    },
    [savedAlbums],
  );
  const isAlbumSaved = useCallback(
    (id: string) => savedAlbums.some((a) => a.id === id),
    [savedAlbums],
  );

  const toggleCollection = useCallback<LibraryApi["toggleCollection"]>(
    (collection) => {
      const exists = savedPlaylists.some((p) => p.id === collection.id);
      setSavedPlaylists((prev) =>
        exists
          ? prev.filter((p) => p.id !== collection.id)
          : [{ ...collection, savedAt: Date.now() }, ...prev],
      );
      return !exists;
    },
    [savedPlaylists],
  );
  const isCollectionSaved = useCallback(
    (id: string) => savedPlaylists.some((p) => p.id === id),
    [savedPlaylists],
  );

  const toggleArtist = useCallback<LibraryApi["toggleArtist"]>(
    (artist) => {
      const exists = followedArtists.some((a) => a.id === artist.id);
      setFollowedArtists((prev) =>
        exists
          ? prev.filter((a) => a.id !== artist.id)
          : [{ ...artist, savedAt: Date.now() }, ...prev],
      );
      return !exists;
    },
    [followedArtists],
  );
  const isArtistFollowed = useCallback(
    (id: string) => followedArtists.some((a) => a.id === id),
    [followedArtists],
  );

  /* ---------------- history ---------------- */
  const pushRecentlyPlayed = useCallback<LibraryApi["pushRecentlyPlayed"]>((song) => {
    setRecentlyPlayed((prev) => {
      const rest = prev.filter((r) => r.song.id !== song.id);
      return [{ song, playedAt: Date.now() }, ...rest].slice(0, 60);
    });
  }, []);

  const clearRecentlyPlayed = useCallback(() => {
    setRecentlyPlayed([]);
    remove(STORAGE_KEYS.recent);
  }, []);

  const pushRecentSearch = useCallback((q: string) => {
    const term = q.trim();
    if (term.length < 2) return;
    setRecentSearches((prev) => [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 12));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    remove(STORAGE_KEYS.recentSearches);
  }, []);

  const clearLiked = useCallback(() => {
    setLikedSongs([]);
    remove(STORAGE_KEYS.liked);
  }, []);

  const clearPlaylists = useCallback(() => {
    setPlaylists([]);
    remove(STORAGE_KEYS.playlists);
  }, []);

  const clearSavedMedia = useCallback(() => {
    setSavedAlbums([]);
    setSavedPlaylists([]);
    setFollowedArtists([]);
    remove(STORAGE_KEYS.savedAlbums);
    remove(STORAGE_KEYS.savedPlaylists);
    remove(STORAGE_KEYS.followedArtists);
  }, []);

  const resetAll = useCallback(() => {
    setPlaylists([]);
    setLikedSongs([]);
    setRecentlyPlayed([]);
    setSavedAlbums([]);
    setSavedPlaylists([]);
    setFollowedArtists([]);
    setRecentSearches([]);
    Object.values(STORAGE_KEYS).forEach((k) => remove(k));
  }, []);

  const value = useMemo<LibraryApi>(
    () => ({
      playlists: playlists.slice().sort((a, b) => b.updatedAt - a.updatedAt),
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      reorderPlaylist,
      getPlaylist,
      isPlaylistNameTaken,
      likedSongs,
      isLiked,
      toggleLike,
      savedAlbums: savedAlbums.slice().sort(bySavedAt),
      savedPlaylists: savedPlaylists.slice().sort(bySavedAt),
      followedArtists: followedArtists.slice().sort(bySavedAt),
      toggleAlbum,
      isAlbumSaved,
      toggleCollection,
      isCollectionSaved,
      toggleArtist,
      isArtistFollowed,
      recentlyPlayed,
      pushRecentlyPlayed,
      clearRecentlyPlayed,
      recentSearches,
      pushRecentSearch,
      clearLiked,
      clearPlaylists,
      clearSavedMedia,
      clearRecentSearches,
      resetAll,
    }),
    [
      playlists,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      reorderPlaylist,
      getPlaylist,
      isPlaylistNameTaken,
      likedSongs,
      isLiked,
      toggleLike,
      savedAlbums,
      savedPlaylists,
      followedArtists,
      toggleAlbum,
      isAlbumSaved,
      toggleCollection,
      isCollectionSaved,
      toggleArtist,
      isArtistFollowed,
      recentlyPlayed,
      pushRecentlyPlayed,
      clearRecentlyPlayed,
      recentSearches,
      pushRecentSearch,
      clearLiked,
      clearPlaylists,
      clearSavedMedia,
      clearRecentSearches,
      resetAll,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
