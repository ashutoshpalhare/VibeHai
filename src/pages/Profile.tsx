import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { IconHeart, IconLibrary, IconNote, IconPlay } from "@/components/ui/Icons";
import { useLibrary } from "@/context/LibraryContext";
import { formatLongTime } from "@/lib/format";

export default function Profile() {
  const library = useLibrary();

  const totalSeconds = library.recentlyPlayed.reduce((a, r) => a + (r.song.duration || 0), 0);
  const stats = [
    { label: "Playlists", value: library.playlists.length, Icon: IconLibrary, to: "/library" },
    { label: "Liked songs", value: library.likedSongs.length, Icon: IconHeart, to: "/liked" },
    { label: "Saved albums", value: library.savedAlbums.length, Icon: IconNote, to: "/library" },
    { label: "Followed artists", value: library.followedArtists.length, Icon: IconPlay, to: "/library" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-6">
      <header className="flex items-center gap-5 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-brand-700/35 via-ink-850 to-ink-900 p-6 sm:p-8">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full brand-gradient text-3xl font-extrabold text-white shadow-xl shadow-brand-600/40 ring-4 ring-white/10">
          V
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
            VibeHai profile
          </p>
          <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight sm:text-3xl">
            Vibing Guest
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Local-only account — everything stays in this browser.
          </p>
          <p className="mt-1 text-xs text-white/40">
            Listened to ~{formatLongTime(totalSeconds)} across{" "}
            {library.recentlyPlayed.length} recent tracks.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:bg-white/[0.05]"
          >
            <Icon className="h-5 w-5 text-brand-300" />
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-white">{value}</p>
            <p className="text-[11.5px] text-white/45">{label}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="brand" onClick={() => (window.location.hash = "#/library")}>
          Open library
        </Button>
        <Button variant="outline" onClick={() => (window.location.hash = "#/settings")}>
          Settings
        </Button>
        <Button variant="outline" onClick={() => (window.location.hash = "#/about")}>
          About & credits
        </Button>
      </div>

      <p className="text-center text-xs text-white/30">
        No accounts, no tracking — VibeHai stores playlists, likes and history in your browser's
        local storage only.
      </p>
    </div>
  );
}
