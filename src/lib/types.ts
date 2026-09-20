export interface Song {
  id: string;
  title: string;
  /** Comma separated display string */
  artist: string;
  artistList: { id: string; name: string }[];
  album: string;
  albumId: string;
  image: string;
  imageSmall: string;
  duration: number;
  year: string;
  language: string;
  playCount: number;
  explicit: boolean;
  hasLyrics: boolean;
  /** Descending quality stream urls — used for playback fallback */
  sources: string[];
}

export interface Album {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  year: string;
  songCount: number;
  artist: string;
  language: string;
  description?: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  role: string;
  followers?: number;
  isVerified?: boolean;
  dominantLanguage?: string;
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  songCount: number;
  language: string;
  description?: string;
}

export interface ArtistDetail extends Artist {
  bio: string;
  songCount: number;
  albumCount: number;
  topSongs: Song[];
  albums: Album[];
}

export interface AlbumDetail extends Album {
  songs: Song[];
  label?: string;
  copyright?: string;
}

export interface CollectionDetail extends Collection {
  songs: Song[];
}

export type RepeatMode = "off" | "all" | "one";

export interface UserPlaylist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  createdAt: number;
  updatedAt: number;
  cover?: string;
}
