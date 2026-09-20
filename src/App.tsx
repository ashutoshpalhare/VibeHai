import { HashRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { LibraryProvider } from "@/context/LibraryContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AlbumPage, ArtistPage, MoodPage, RemotePlaylistPage, UserPlaylistPage } from "@/pages/Details";
import Home from "@/pages/Home";
import Library from "@/pages/Library";
import Search from "@/pages/Search";
import { LikedSongsPage, RecentlyPlayedPage } from "@/pages/Collections";
import { NotFoundPage, ShortcutsPage } from "@/pages/Misc";
import Discover from "@/pages/Discover";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import About from "@/pages/About";
import { GENRES, MOODS } from "@/lib/saavn";

function PlaylistEntry() {
  const { id = "" } = useParams();
  // user-created playlists are namespaced with a "u_" prefix
  return id.startsWith("u_") ? <UserPlaylistPage id={id} /> : <RemotePlaylistPage id={id} />;
}

function MoodRoute() {
  const { moodId = "" } = useParams();
  const mood = MOODS.find((m) => m.id === moodId);
  if (!mood) return <NotFoundPage />;
  return <MoodPage query={mood.query} label={mood.label} emoji={mood.emoji} />;
}

function GenreRoute() {
  const { genreId = "" } = useParams();
  const genre = GENRES.find((g) => g.id === genreId);
  if (!genre) return <NotFoundPage />;
  return <MoodPage query={genre.query} label={genre.label} emoji={genre.emoji} />;
}

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
      <ToastProvider>
        <LibraryProvider>
          <PlayerProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Home />} />
                <Route path="home" element={<Navigate to="/" replace />} />
                <Route path="discover" element={<Discover />} />
                <Route path="genre/:genreId" element={<GenreRoute />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="search" element={<Search />} />
                <Route path="library" element={<Library />} />
                <Route path="liked" element={<LikedSongsPage />} />
                <Route path="recent" element={<RecentlyPlayedPage />} />
                <Route path="shortcuts" element={<ShortcutsPage />} />
                <Route path="about" element={<About />} />
                <Route path="album/:id" element={<AlbumPage />} />
                <Route path="artist/:id" element={<ArtistPage />} />
                <Route path="mood/:moodId" element={<MoodRoute />} />
                <Route path="playlist/:id" element={<PlaylistEntry />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </PlayerProvider>
        </LibraryProvider>
      </ToastProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
