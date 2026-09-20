import type { Album, Artist, Song } from "./types";

/* ------------------------------------------------------------------ *
 *  Hosts — tried in order, first healthy host is remembered.
 * ------------------------------------------------------------------ */
const HOSTS = [
  "https://saavn.sumit.co/api",
  "https://saavn.dev/api",
  "https://jiosaavn-api-privatecvc2.vercel.app",
];

let activeHost = 0;

export const API_TIMEOUT = 14000;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

async function request<T = any>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) search.set(k, String(v));
  });
  const qs = search.toString();
  let lastError: unknown;

  for (let attempt = 0; attempt < HOSTS.length; attempt++) {
    const hostIndex = (activeHost + attempt) % HOSTS.length;
    const url = `${HOSTS[hostIndex]}${path}${qs ? `?${qs}` : ""}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "application/json" },
      });
      clearTimeout(timer);
      if (!res.ok) throw new ApiError(`Request failed (${res.status})`, res.status);
      const json = await res.json();
      if (json && json.success === false) {
        throw new ApiError(json?.message || "The request could not be completed", 502);
      }
      activeHost = hostIndex;
      return (json?.data ?? json) as T;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      // 4xx from a healthy host: no point retrying other hosts for the same path
      if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.status !== 429) {
        activeHost = hostIndex;
        throw err;
      }
    }
  }
  if (lastError instanceof ApiError) throw lastError;
  throw new ApiError(
    "Couldn't reach the music service. Check your connection and try again.",
    0,
  );
}

/* ------------------------------------------------------------------ *
 *  Normalisation helpers
 * ------------------------------------------------------------------ */
let decodeEl: HTMLTextAreaElement | null = null;
export function decode(input?: string | null): string {
  if (!input) return "";
  const str = String(input);
  if (!/&(quot|amp|lt|gt|apos|nbsp|#\d+);/.test(str)) return str;
  if (!decodeEl) decodeEl = document.createElement("textarea");
  decodeEl.innerHTML = str;
  return decodeEl.value;
}

export type ImgSize = "50x50" | "150x150" | "500x500";

export function img(raw: unknown, size: ImgSize = "500x500"): string {
  if (!raw) return "";
  if (Array.isArray(raw)) {
    const pick = raw.find((i: any) => i?.quality === size) ?? raw[raw.length - 1];
    return String(pick?.url ?? "");
  }
  if (typeof raw === "string") return raw.replace(/\d+x\d+/, size);
  return "";
}

function sources(raw: unknown): string[] {
  const out: string[] = [];
  const push = (u: unknown) => {
    if (typeof u === "string" && u && !out.includes(u)) out.push(u);
  };
  if (Array.isArray(raw)) {
    const order = ["320kbps", "160kbps", "128kbps", "96kbps", "48kbps", "12kbps"];
    for (const q of order) {
      const found = raw.find((d: any) => d?.quality === q && d?.url);
      if (found) push(found.url);
    }
    raw.forEach((d: any) => push(d?.url));
  } else if (typeof raw === "string") push(raw);
  return out;
}

const UNKNOWN = "Unknown artist";

function artistList(raw: any): { id: string; name: string }[] {
  const all = raw?.artists?.primary ?? raw?.primaryArtists;
  if (Array.isArray(all) && all.length) {
    return all
      .filter(Boolean)
      .map((a: any) => ({ id: String(a?.id ?? ""), name: decode(a?.name ?? a) }))
      .filter((a) => a.name);
  }
  if (typeof all === "string" && all.trim()) {
    return all
      .split(/,\s*/)
      .map((n) => ({ id: "", name: n.trim() }))
      .filter((a) => a.name);
  }
  const singers = raw?.singers ?? raw?.music;
  if (typeof singers === "string" && singers.trim()) {
    return singers
      .split(/,\s*/)
      .map((n) => ({ id: "", name: n.trim() }))
      .filter((a) => a.name);
  }
  return [];
}

export function normalizeSong(raw: any): Song {
  return {
    id: String(raw?.id ?? raw?.songid ?? `${raw?.name ?? raw?.title ?? "song"}-${raw?.album?.name ?? raw?.album ?? ""}`),
    title: decode(raw?.name ?? raw?.title ?? raw?.song ?? "Untitled"),
    artist: (() => {
      const list = artistList(raw);
      return list.length ? list.map((a) => a.name).join(", ") : UNKNOWN;
    })(),
    artistList: artistList(raw),
    album: decode(raw?.album?.name ?? raw?.album ?? "") || "Single",
    albumId: String(raw?.album?.id ?? raw?.album_id ?? ""),
    image: img(raw?.image, "500x500") || img(raw?.image, "150x150"),
    imageSmall: img(raw?.image, "150x150") || img(raw?.image, "50x50"),
    duration: Number(raw?.duration) || 0,
    year: String(raw?.year ?? ""),
    language: String(raw?.language ?? ""),
    playCount: Number(raw?.playCount ?? raw?.play_count) || 0,
    explicit: Boolean(raw?.explicitContent),
    hasLyrics: Boolean(raw?.hasLyrics),
    sources: sources(raw?.downloadUrl ?? raw?.media_url ?? raw?.url),
  };
}

export function normalizeAlbum(raw: any): Album {
  const primary = raw?.artists?.primary?.[0];
  return {
    id: String(raw?.id ?? ""),
    title: decode(raw?.name ?? raw?.title ?? "Album"),
    subtitle:
      decode(raw?.description ?? "") ||
      [decode(primary?.name ?? raw?.artist ?? ""), raw?.year].filter(Boolean).join(" • ") ||
      "Album",
    image: img(raw?.image, "500x500"),
    year: String(raw?.year ?? ""),
    songCount: Number(raw?.songCount ?? raw?.song_count ?? (raw?.songs?.length || 0)) || 0,
    artist: decode(primary?.name ?? raw?.artist ?? "") || UNKNOWN,
    language: String(raw?.language ?? ""),
    description: decode(raw?.description ?? ""),
  };
}

export function normalizeArtist(raw: any): Artist {
  return {
    id: String(raw?.id ?? ""),
    name: decode(raw?.name ?? raw?.title ?? "Artist"),
    image:
      img(raw?.image, "500x500") ||
      "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#24242f"/><circle cx="150" cy="118" r="52" fill="#4a4a59"/><path d="M60 260c0-50 40-80 90-80s90 30 90 80z" fill="#4a4a59"/></svg>`,
        ),
    role: decode(raw?.role ?? raw?.dominantType ?? "Artist"),
    followers: Number(raw?.followerCount ?? 0) || undefined,
    isVerified: Boolean(raw?.isVerified),
    dominantLanguage: raw?.dominantLanguage,
  };
}

export function normalizeCollection(raw: any) {
  return {
    id: String(raw?.id ?? ""),
    title: decode(raw?.name ?? raw?.title ?? "Playlist"),
    subtitle:
      decode(raw?.description ?? "").slice(0, 140) ||
      `${raw?.songCount ?? raw?.songs?.length ?? 0} songs • ${raw?.language ?? "music"}`,
    image: img(raw?.image, "500x500"),
    songCount: Number(raw?.songCount ?? raw?.songs?.length ?? 0) || 0,
    language: String(raw?.language ?? ""),
    description: decode(raw?.description ?? ""),
  };
}

function dedupe(songs: Song[]): Song[] {
  const seen = new Set<string>();
  return songs.filter((s) => {
    const key = s.id || s.title + s.artist;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeSongs(raw: any): Song[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : raw?.results ?? raw?.songs ?? raw?.data?.results ?? [];
  return dedupe((Array.isArray(list) ? list : []).map(normalizeSong).filter((s) => s.sources.length));
}

/* ------------------------------------------------------------------ *
 *  Endpoints
 * ------------------------------------------------------------------ */
export const api = {
  search: {
    songs: (query: string, page = 1, limit = 30) =>
      request("/search/songs", { query, page, limit }).then((d) => normalizeSongs(d)),
    albums: (query: string, page = 1, limit = 30) =>
      request("/search/albums", { query, page, limit }).then((d: any) =>
        ((d?.results ?? []) as any[]).map((r) => normalizeAlbum(r)),
      ),
    artists: (query: string, page = 1, limit = 30) =>
      request("/search/artists", { query, page, limit }).then((d: any) =>
        ((d?.results ?? []) as any[]).map((r) => normalizeArtist(r)),
      ),
    playlists: (query: string, page = 1, limit = 30) =>
      request("/search/playlists", { query, page, limit }).then((d: any) =>
        ((d?.results ?? []) as any[]).map((r) => normalizeCollection(r)),
      ),
    all: async (query: string) => {
      const [songs, albums, artists, playlists] = await Promise.allSettled([
        api.search.songs(query, 1, 20),
        api.search.albums(query, 1, 10),
        api.search.artists(query, 1, 10),
        api.search.playlists(query, 1, 10),
      ]);
      return {
        songs: songs.status === "fulfilled" ? songs.value : [],
        albums: albums.status === "fulfilled" ? albums.value : [],
        artists: artists.status === "fulfilled" ? artists.value : [],
        playlists: playlists.status === "fulfilled" ? playlists.value : [],
      };
    },
  },

  album: async (id: string) => {
    const d = await request("/albums", { id });
    const primary = d?.artists?.primary?.[0];
    return {
      ...normalizeAlbum(d),
      songs: normalizeSongs(d?.songs),
      label: decode(d?.label),
      copyright: decode(d?.copyright),
      artist: decode(primary?.name ?? "") || UNKNOWN,
    };
  },

  playlist: async (id: string) => {
    const d = await request("/playlists", { id });
    return { ...normalizeCollection(d), songs: normalizeSongs(d?.songs) };
  },

  artist: async (id: string) => {
    const d = await request("/artists", { id });
    const base = normalizeArtist(d);
    const bio = Array.isArray(d?.bio) ? d.bio.map((b: any) => decode(b?.text)).join("\n\n") : "";
    return { ...base, bio, songCount: Number(d?.songCount ?? 0) || 0 };
  },

  artistSongs: (id: string, page = 1, limit = 40) =>
    request(`/artists/${id}/songs`, { page, limit, sortBy: "popularity" }).then((d: any) => ({
      songs: normalizeSongs(d?.songs),
      total: Number(d?.total ?? 0) || 0,
    })),

  artistAlbums: async (id: string, page = 1, limit = 30) => {
    try {
      const d = await request(`/artists/${id}/albums`, { page, limit, sortBy: "popularity" });
      return ((d?.albums ?? d?.results ?? []) as any[]).map(normalizeAlbum);
    } catch {
      return [] as Album[];
    }
  },

  /** Used to restore liked / queued songs that were only stored as ids */
  songsByIds: async (ids: string[]) => {
    if (!ids.length) return [] as Song[];
    const d = await request("/songs", { ids: ids.join(",") });
    return normalizeSongs(Array.isArray(d) ? d : d?.results);
  },
};

/* ------------------------------------------------------------------ *
 *  Curated discovery queries (used for Home shelves / moods)
 * ------------------------------------------------------------------ */
export interface Shelf {
  id: string;
  title: string;
  subtitle?: string;
  query: string;
  kind?: "song" | "album";
  accent?: string;
}

export const TRENDING_SHELVES: Shelf[] = [
  { id: "trending-hindi", title: "Trending in India", query: "top hits 2026 hindi", kind: "song" },
  { id: "new-releases", title: "New releases", query: "new bollywood 2026", kind: "album" },
  { id: "punjabi", title: "Punjabi heat", query: "punjabi top hits", kind: "song" },
  { id: "tamil", title: "Kollywood picks", query: "tamil hit songs", kind: "song" },
  { id: "telugu", title: "Tollywood chartbusters", query: "telugu hits", kind: "song" },
  { id: "retro", title: "Retro classics", query: "kishore kumar old hindi", kind: "song" },
  { id: "lofi", title: "Lo-fi & chill", query: "lofi hindi chill", kind: "song" },
  { id: "hollywood", title: "Global top 50", query: "top english hits", kind: "song" },
  { id: "sufi", title: "Sufi & soul", query: "sufi songs", kind: "song" },
  { id: "instrumental", title: "Instrumental focus", query: "instrumental flute", kind: "song" },
];

export interface Mood {
  id: string;
  label: string;
  emoji: string;
  query: string;
  from: string;
  to: string;
}

export const MOODS: Mood[] = [
  { id: "romance", label: "Romance", emoji: "💜", query: "romantic hindi love songs", from: "#f472b6", to: "#8b5cf6" },
  { id: "party", label: "Party", emoji: "🔥", query: "party dance hits hindi", from: "#fb923c", to: "#ef4444" },
  { id: "sad", label: "Heartbreak", emoji: "🌧️", query: "sad songs hindi", from: "#38bdf8", to: "#4f46e5" },
  { id: "chill", label: "Chill", emoji: "🌊", query: "lofi chill acoustic", from: "#34d399", to: "#0ea5e9" },
  { id: "workout", label: "Workout", emoji: "⚡", query: "workout motivation hits", from: "#facc15", to: "#f97316" },
  { id: "focus", label: "Focus", emoji: "🎯", query: "instrumental study focus", from: "#a78bfa", to: "#2563eb" },
  { id: "roadtrip", label: "Road trip", emoji: "🛣️", query: "road trip travel songs", from: "#22d3ee", to: "#3b82f6" },
  { id: "devotional", label: "Devotional", emoji: "🕉️", query: "bhajan aarti devotional", from: "#fbbf24", to: "#d97706" },
  { id: "wedding", label: "Wedding", emoji: "💍", query: "shaadi wedding songs", from: "#fb7185", to: "#e11d48" },
  { id: "monsoon", label: "Monsoon", emoji: "☕", query: "barish rain songs", from: "#60a5fa", to: "#6366f1" },
];

export const GENRES: Mood[] = [
  { id: "bollywood", label: "Bollywood", emoji: "🎬", query: "bollywood hit songs", from: "#8b5cf6", to: "#ec4899" },
  { id: "punjabi", label: "Punjabi", emoji: "🔥", query: "punjabi hit songs", from: "#fb923c", to: "#ef4444" },
  { id: "romantic", label: "Romantic", emoji: "💜", query: "romantic love songs hindi", from: "#f472b6", to: "#8b5cf6" },
  { id: "party", label: "Party", emoji: "🪩", query: "party dance songs hindi", from: "#facc15", to: "#f97316" },
  { id: "lofi", label: "Lo-fi", emoji: "🌙", query: "lofi beats hindi", from: "#6366f1", to: "#312e81" },
  { id: "workout", label: "Workout", emoji: "⚡", query: "workout gym motivation songs", from: "#22d3ee", to: "#0ea5e9" },
  { id: "sad", label: "Sad", emoji: "🌧️", query: "sad emotional songs hindi", from: "#38bdf8", to: "#4f46e5" },
  { id: "sufi", label: "Sufi", emoji: "🕌", query: "sufi soul songs", from: "#a78bfa", to: "#6d28d9" },
  { id: "devotional", label: "Devotional", emoji: "🕉️", query: "bhajan aarti devotional songs", from: "#fbbf24", to: "#d97706" },
  { id: "retro", label: "Retro", emoji: "📻", query: "old hindi classic songs", from: "#fda4af", to: "#be123c" },
  { id: "tamil", label: "Tamil", emoji: "🎭", query: "tamil hit songs", from: "#34d399", to: "#059669" },
  { id: "telugu", label: "Telugu", emoji: "🎶", query: "telugu hit songs", from: "#4ade80", to: "#16a34a" },
  { id: "bengali", label: "Bengali", emoji: "🌾", query: "bengali hit songs", from: "#2dd4bf", to: "#0d9488" },
  { id: "rock", label: "Rock", emoji: "🎸", query: "rock band english hindi", from: "#f87171", to: "#7f1d1d" },
  { id: "acoustic", label: "Acoustic", emoji: "🎸", query: "acoustic guitar songs", from: "#d6d3d1", to: "#78716c" },
  { id: "hiphop", label: "Hip-hop", emoji: "🎤", query: "hip hop rap songs hindi", from: "#e879f9", to: "#a21caf" },
  { id: "indie", label: "Indie", emoji: "🌿", query: "indie singer song hindi english", from: "#818cf8", to: "#4338ca" },
  { id: "dance", label: "Dance", emoji: "💃", query: "dance club songs", from: "#f0abfc", to: "#db2777" },
];

export const POPULAR_ARTIST_QUERIES = [
  "Arijit Singh",
  "Shreya Ghoshal",
  "Talvin Singh",
  "Anuv Jain",
  "Karan Aujla",
  "Pritam",
  "Diljit Dosanjh",
  "A.R. Rahman",
  "Shankar Mahadevan",
  "Nucleya",
  "Bhansali",
  "Badshah",
];

export const QUICK_SEARCHES = [
  "Arijit Singh",
  "Pritam",
  "Shreya Ghoshal",
  "Diljit Dosanjh",
  "Weeknd",
  "Lo-fi Hindi",
  "A.R. Rahman",
  "Nucleya",
  "Anuv Jain",
  "Karan Aujla",
];
