import { Link } from "react-router-dom";
import { Button, EmptyState } from "@/components/ui";
import { SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { usePlayer } from "@/context/PlayerContext";
import { IconKeyboard } from "@/components/ui/Icons";

export function ShortcutsPage() {
  const player = usePlayer();

  return (
    <div className="space-y-8 pb-6">
      <header className="flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl brand-gradient shadow-lg shadow-brand-600/30">
          <IconKeyboard className="h-7 w-7 text-white" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Keyboard <span className="brand-text">shortcuts</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/50">
            VibeHai is fully keyboard driven — no mouse required.
          </p>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/[0.07]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-5 py-3 font-semibold">Keys</th>
              <th className="px-5 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {SHORTCUTS.map((s, i) => (
              <tr key={s.label} className={i % 2 ? "bg-white/[0.015]" : ""}>
                <td className="whitespace-nowrap px-5 py-3">
                  <span className="flex flex-wrap items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 font-sans text-[11.5px] font-semibold text-white/80"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/70">{s.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h3 className="text-sm font-bold text-white">How it works</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-white/55">
            VibeHai streams from JioSaavn's public catalogue through an open unofficial API. Your
            playlists, liked songs, followed artists and history are stored locally in your browser —
            nothing is uploaded, no account needed.
          </p>
          <Link
            to="/about"
            className="mt-3 inline-block text-[11px] font-bold uppercase tracking-wider text-brand-300 hover:text-brand-200"
          >
            Meet the developer →
          </Link>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h3 className="text-sm font-bold text-white">Install the app</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-white/55">
            Use your browser's <strong className="text-white/80">Install app</strong> /{" "}
            <strong className="text-white/80">Add to Home Screen</strong> option to run VibeHai like a
            native player with media-key support.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => player.setQueueOpen(!player.queueOpen)}>
              {player.queueOpen ? "Hide queue" : "Open queue"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => player.setNowPlayingOpen(true)}>
              Full screen player
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <h3 className="text-sm font-bold text-white">Playback tips</h3>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-white/55">
          <li>• Shuffle keeps the current song first and rebuilds the queue order — toggle it off to restore.</li>
          <li>• Repeat All loops the whole queue; Repeat One loops the current track.</li>
          <li>• Drag songs inside the queue panel to reorder what plays next.</li>
          <li>• If a stream fails, VibeHai automatically falls back to a lower bitrate and skips after 3 failures.</li>
        </ul>
      </section>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <EmptyState
      emoji="🛸"
      title="Page not found"
      body="That link doesn't exist. Let's get you back to the music."
      action={
        <Button variant="brand" onClick={() => (window.location.hash = "#/")}>
          Back to home
        </Button>
      }
    />
  );
}
