import { useState } from "react";
import { Link } from "react-router-dom";
import { SleepTimerButton } from "@/components/player/SleepTimerMenu";
import { Button, Modal } from "@/components/ui";
import { VolumeBar } from "@/components/player/SeekBar";
import {
  IconAlert,
  IconClock,
  IconHeart,
  IconLibrary,
  IconNote,
  IconRepeat,
  IconShuffle,
  IconTrash,
} from "@/components/ui/Icons";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { formatTime, pluralize } from "@/lib/format";

function Row({
  icon,
  title,
  body,
  children,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string;
  children?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl " +
            (danger ? "bg-rose-500/15 text-rose-300" : "bg-white/[0.06] text-white/70")
          }
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          {body && <p className="mt-0.5 text-xs leading-relaxed text-white/45">{body}</p>}
        </div>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

function Card({ title, children, id }: { title?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-2">
      {title && (
        <h2 className="px-0.5 pb-1 pt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
          {title}
        </h2>
      )}
      <div className="divide-y divide-white/[0.06]">{children}</div>
    </section>
  );
}

export default function Settings() {
  const library = useLibrary();
  const player = usePlayer();
  const theme = useTheme();
  const { toast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = {
    playlists: library.playlists.length,
    liked: library.likedSongs.length,
    recent: library.recentlyPlayed.length,
    albums: library.savedAlbums.length,
    artists: library.followedArtists.length,
    saved: library.savedPlaylists.length,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-6">
      <header className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl brand-gradient text-white shadow-lg shadow-brand-600/30">
          <IconNote className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Settings</h1>
          <p className="mt-1 text-sm text-white/50">Playback, appearance and your local data.</p>
        </div>
      </header>

      <Card title="Playback">
        <Row
          icon={<IconNote className="h-5 w-5" />}
          title="Default volume"
          body="Applied on every launch. You can still change it at any time from the player."
        >
          <div className="flex w-56 items-center gap-3">
            <VolumeBar value={player.muted ? 0 : player.volume} onChange={player.setVolume} />
            <span className="w-9 text-right text-xs tabular-nums text-white/50">
              {Math.round((player.muted ? 0 : player.volume) * 100)}%
            </span>
          </div>
        </Row>
        <Row
          icon={<IconRepeat className="h-5 w-5" />}
          title="Repeat mode"
          body={`Currently: ${player.repeat === "off" ? "off" : player.repeat === "all" ? "queue" : "one track"}`}
        >
          <Button variant="outline" size="sm" onClick={player.cycleRepeat}>
            Change
          </Button>
        </Row>
        <Row
          icon={<IconShuffle className="h-5 w-5" />}
          title="Shuffle"
          body={`Currently: ${player.shuffle ? "on" : "off"}`}
        >
          <Button variant="outline" size="sm" onClick={player.toggleShuffle}>
            Toggle
          </Button>
        </Row>
        <Row
          icon={<IconClock className="h-5 w-5" />}
          title="Sleep timer"
          body={
            player.sleepRemaining !== null
              ? `Stops in ${formatTime(player.sleepRemaining)}`
              : player.sleepTrackEnd
                ? "Will stop after the current track"
                : "Auto-pause after a set time — perfect for drifting off."
          }
        >
          <SleepTimerButton label="Set timer" />
        </Row>
      </Card>

      <Card title="Appearance">
        <Row
          icon={<IconNote className="h-5 w-5" />}
          title="Theme"
          body="VibeHai ships with a dark stage and a lavender light mode. Your choice is saved on this device."
        >
          <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => theme.setTheme(t)}
                className={
                  "rounded-full px-4 py-1.5 text-xs font-bold capitalize transition " +
                  (theme.theme === t ? "brand-gradient text-white shadow" : "text-white/55 hover:text-white")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </Row>
      </Card>

      <Card title="Data management" id="data">
        <Row
          icon={<IconHeart className="h-5 w-5" />}
          title="Clear liked songs"
          body={stats.liked ? `${pluralize(stats.liked, "song")} removed` : "Nothing to clear"}
          danger
        >
          <Button
            variant="danger"
            size="sm"
            disabled={stats.liked === 0}
            onClick={() => {
              library.clearLiked();
              toast("Liked songs cleared", { tone: "success" });
            }}
          >
            <IconTrash className="h-3.5 w-3.5" /> Clear
          </Button>
        </Row>
        <Row
          icon={<IconLibrary className="h-5 w-5" />}
          title="Clear playlists"
          body={
            stats.playlists
              ? `${pluralize(stats.playlists, "playlist")} created by you will be deleted`
              : "Nothing to clear"
          }
          danger
        >
          <Button
            variant="danger"
            size="sm"
            disabled={stats.playlists === 0}
            onClick={() => {
              library.clearPlaylists();
              toast("Playlists cleared", { tone: "success" });
            }}
          >
            <IconTrash className="h-3.5 w-3.5" /> Clear
          </Button>
        </Row>
        <Row
          icon={<IconClock className="h-5 w-5" />}
          title="Clear recently played"
          body={
            stats.recent
              ? `${pluralize(stats.recent, "track")} of listening history`
              : "Nothing to clear"
          }
          danger
        >
          <Button
            variant="danger"
            size="sm"
            disabled={stats.recent === 0}
            onClick={() => {
              library.clearRecentlyPlayed();
              toast("History cleared", { tone: "success" });
            }}
          >
            <IconTrash className="h-3.5 w-3.5" /> Clear
          </Button>
        </Row>
        <Row
          icon={<IconAlert className="h-5 w-5" />}
          title="Reset all data"
          body="Wipes every playlist, liked song, saved album, followed artist and search history. The current queue is cleared too."
          danger
        >
          <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
            <IconTrash className="h-3.5 w-3.5" /> Reset everything
          </Button>
        </Row>
      </Card>

      <Card title="About">
        <Row
          icon={<IconNote className="h-5 w-5" />}
          title="VibeHai"
          body="A fan-built music player streaming from the JioSaavn catalogue. Built with React 19, Vite, Tailwind 4, Framer Motion and a tiny service worker for offline shell caching. Your data never leaves this browser."
        >
          <Link
            to="/about"
            className="text-[11px] font-bold uppercase tracking-wider text-brand-300 hover:text-brand-200"
          >
            About & credits →
          </Link>
        </Row>
      </Card>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset all VibeHai data?">
        <p className="text-sm leading-relaxed text-white/60">
          This permanently deletes your playlists, liked songs, saved albums & artists, listening
          history and search history from this browser. There is no undo.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            Keep my data
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              player.pause();
              player.clearQueue();
              library.resetAll();
              setConfirmReset(false);
              toast("All VibeHai data reset", { tone: "success" });
            }}
          >
            Yes, reset everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}
