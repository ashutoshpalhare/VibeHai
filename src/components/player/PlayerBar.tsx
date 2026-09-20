import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  IconAlert,
  IconCollapse,
  IconExpand,
  IconHeart,
  IconMute,
  IconNext,
  IconPause,
  IconPrev,
  IconQueue,
  IconRepeat,
  IconRepeatOne,
  IconShuffle,
  IconVolume,
  IconVolumeLow,
} from "@/components/ui/Icons";
import { IconButton, InlineSpinner } from "@/components/ui";
import NowPlaying from "@/components/player/NowPlaying";
import { SleepChip, SleepTimerButton } from "@/components/player/SleepTimerMenu";
import { SeekBar, VolumeBar } from "@/components/player/SeekBar";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { FALLBACK_ART } from "@/lib/format";
import { cn } from "@/utils/cn";

export default function PlayerBar() {
  const player = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const song = player.current;
  const liked = song ? isLiked(song.id) : false;

  if (!song) return null;

  return (
    <div className="glass relative z-40 border-t border-white/[0.07] px-3 pb-[env(safe-area-inset-bottom)] pt-2 sm:px-4 sm:pt-2.5">
      {player.error && (
        <div className="pointer-events-none absolute inset-x-0 -top-9 flex justify-center">
          <span className="flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-[11px] font-medium text-rose-200 backdrop-blur">
            <IconAlert className="h-3.5 w-3.5" /> {player.error}
          </span>
        </div>
      )}

      {/* ---------------- mobile ---------------- */}
      <div className="sm:hidden">
        <div
          className="flex items-center gap-3 rounded-xl px-1"
          onClick={() => player.setNowPlayingOpen(true)}
          role="button"
        >
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/5">
            <img src={song.image || FALLBACK_ART} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{song.title}</p>
            <p className="truncate text-[11px] text-white/45">{song.artist}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              player.toggle();
            }}
            aria-label={player.isPlaying ? "Pause" : "Play"}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink-950 active:scale-95"
          >
            {player.isPlaying ? (
              <IconPause className="h-4 w-4" />
            ) : player.isBuffering ? (
              <InlineSpinner className="border-ink-950/30 border-t-ink-950" />
            ) : (
              <IconPlaySmall />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              player.next();
            }}
            aria-label="Next"
            className="grid h-10 w-10 place-items-center rounded-full text-white/70 active:scale-95"
          >
            <IconNext className="h-5 w-5" />
          </button>
        </div>
        <div
          className="mt-1 flex items-center gap-2 px-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1">
            <SeekBar
              compact
              value={player.currentTime}
              max={player.duration || song.duration}
              onSeek={player.seek}
            />
          </div>
          <SleepChip />
          <SleepTimerButton label="Sleep timer" />
        </div>
      </div>

      {/* ---------------- desktop ---------------- */}
      <div className="hidden items-center gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
        {/* now playing */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => player.setNowPlayingOpen(true)}
            className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5"
            aria-label="Open full screen player"
          >
            <img src={song.image || FALLBACK_ART} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-black/55 opacity-0 transition group-hover:opacity-100">
              <IconExpand className="h-4 w-4" />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{song.title}</p>
            <p className="truncate text-[11.5px] text-white/45">
              {song.artistList[0]?.id ? (
                <Link to={`/artist/${song.artistList[0].id}`} className="hover:text-white hover:underline">
                  {song.artist}
                </Link>
              ) : (
                song.artist
              )}
            </p>
          </div>
          <IconButton
            label={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
            onClick={() => toggleLike(song)}
            className={cn(liked && "text-brand-300")}
          >
            <IconHeart filled={liked} className="h-[18px] w-[18px]" />
          </IconButton>
        </div>

        {/* controls */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <IconButton
              label="Shuffle"
              active={player.shuffle}
              onClick={player.toggleShuffle}
              className={player.shuffle ? "text-brand-300" : ""}
            >
              <IconShuffle className="h-[18px] w-[18px]" />
            </IconButton>
            <IconButton label="Previous" onClick={player.prev}>
              <IconPrev className="h-5 w-5" />
            </IconButton>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={player.toggle}
              aria-label={player.isPlaying ? "Pause" : "Play"}
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-950 shadow-lg transition hover:scale-[1.04]"
            >
              {player.isBuffering && !player.isPlaying ? (
                <InlineSpinner className="border-ink-950/25 border-t-ink-950" />
              ) : player.isPlaying ? (
                <IconPause className="h-[18px] w-[18px]" />
              ) : (
                <IconPlaySmall />
              )}
            </motion.button>
            <IconButton label="Next" onClick={player.next}>
              <IconNext className="h-5 w-5" />
            </IconButton>
            <IconButton
              label={
                player.repeat === "one"
                  ? "Repeat one"
                  : player.repeat === "all"
                    ? "Repeat all"
                    : "Repeat off"
              }
              active={player.repeat !== "off"}
              onClick={player.cycleRepeat}
            >
              {player.repeat === "one" ? (
                <IconRepeatOne className="h-[18px] w-[18px]" />
              ) : (
                <IconRepeat className="h-[18px] w-[18px]" />
              )}
            </IconButton>
          </div>
          <SeekBar
            value={player.currentTime}
            max={player.duration || song.duration}
            buffered={player.buffered}
            onSeek={player.seek}
            className="max-w-xl"
          />
        </div>

        {/* right */}
        <div className="flex items-center justify-end gap-1">
          <SleepTimerButton />
          <SleepChip />
          <IconButton
            label="Queue"
            active={player.queueOpen}
            onClick={() => player.setQueueOpen(!player.queueOpen)}
          >
            <IconQueue className="h-[18px] w-[18px]" />
          </IconButton>
          <div className="flex items-center gap-1.5 pl-1">
            <IconButton label={player.muted ? "Unmute" : "Mute"} onClick={player.toggleMute}>
              {player.muted || player.volume === 0 ? (
                <IconMute className="h-[18px] w-[18px]" />
              ) : player.volume < 0.5 ? (
                <IconVolumeLow className="h-[18px] w-[18px]" />
              ) : (
                <IconVolume className="h-[18px] w-[18px]" />
              )}
            </IconButton>
            <VolumeBar value={player.muted ? 0 : player.volume} onChange={player.setVolume} />
          </div>
          <IconButton
            label={player.nowPlayingOpen ? "Close full screen" : "Full screen"}
            onClick={() => player.setNowPlayingOpen(!player.nowPlayingOpen)}
          >
            {player.nowPlayingOpen ? (
              <IconCollapse className="h-[18px] w-[18px]" />
            ) : (
              <IconExpand className="h-[18px] w-[18px]" />
            )}
          </IconButton>
        </div>
      </div>

      <AnimatePresence>{player.nowPlayingOpen && <NowPlaying />}</AnimatePresence>
    </div>
  );
}

function IconPlaySmall() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.14-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}


