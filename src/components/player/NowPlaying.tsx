import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SleepChip, SleepTimerButton } from "@/components/player/SleepTimerMenu";
import { SeekBar, VolumeBar } from "@/components/player/SeekBar";
import { IconButton, InlineSpinner } from "@/components/ui";
import {
  IconChevronDown,
  IconDisc,
  IconHeart,
  IconList,
  IconMic,
  IconMute,
  IconNext,
  IconPause,
  IconPrev,
  IconRepeat,
  IconRepeatOne,
  IconShuffle,
  IconVolume,
} from "@/components/ui/Icons";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { FALLBACK_ART, formatCount } from "@/lib/format";
import { cn } from "@/utils/cn";

export default function NowPlaying() {
  const player = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const [tab, setTab] = useState<"art" | "queue">("art");
  const song = player.current;
  const liked = song ? isLiked(song.id) : false;

  const close = () => player.setNowPlayingOpen(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="fixed inset-0 z-[70] overflow-hidden bg-ink-950"
    >
      {/* ambient background */}
      <div className="absolute inset-0">
        {song?.image && (
          <img
            src={song.image}
            alt=""
            className="h-full w-full scale-125 object-cover opacity-40 blur-3xl"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/85 to-ink-950" />
        <motion.div
          className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand-600/25 blur-[100px]"
          animate={{ y: [0, -30, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-punch-500/20 blur-[110px]"
          animate={{ y: [0, 26, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 14, repeat: Infinity }}
        />
      </div>

      <div className="relative flex h-full flex-col px-5 pb-8 pt-5 sm:px-10">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconButton label="Close" onClick={close} className="bg-white/5">
              <IconChevronDown className="h-5 w-5" />
            </IconButton>
            <div className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 sm:block">
              {player.queueSource?.title ?? "Now playing"}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <SleepTimerButton />
            <SleepChip />
            <IconButton
              label="Queue"
              active={tab === "queue"}
              onClick={() => setTab((t) => (t === "queue" ? "art" : "queue"))}
              className="bg-white/5"
            >
              <IconList className="h-[18px] w-[18px]" />
            </IconButton>
          </div>
        </div>

        <div className="mt-4 grid min-h-0 flex-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* left: art + controls */}
          <div className="flex min-h-0 flex-col items-center justify-center gap-7">
            {/* ========== ROTATING ALBUM ART ========== */}
            <motion.div
              layout
              key={song?.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className={cn(
                "relative aspect-square w-[min(72vw,min(52vh,380px))] sm:w-[min(68vw,min(54vh,400px))] lg:w-[min(58vh,420px)]",
                "overflow-hidden rounded-full shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10",
                !song && "bg-white/5",
              )}
            >
              {/* Vinyl-style outer ring */}
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
              <div className="pointer-events-none absolute inset-[6%] rounded-full border border-white/[0.06]" />

              {song ? (
                <motion.img
                  src={song.image || FALLBACK_ART}
                  alt={song.title || "Album art"}
                  className="h-full w-full object-cover"
                  animate={{ rotate: player.isPlaying ? 360 : 0 }}
                  transition={
                    player.isPlaying
                      ? {
                          rotate: {
                            duration: 18,
                            ease: "linear",
                            repeat: Infinity,
                          },
                        }
                      : {
                          rotate: {
                            duration: 0.6,
                            ease: "easeOut",
                          },
                        }
                  }
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-5xl">🎧</span>
              )}

              {/* Center spindle (vinyl look) */}
              {song && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-[14%] w-[14%] rounded-full bg-ink-950/90 ring-2 ring-white/15 shadow-inner" />
                </div>
              )}

              {player.isBuffering && (
                <span className="absolute inset-0 grid place-items-center bg-black/40">
                  <InlineSpinner className="h-8 w-8 border-2" />
                </span>
              )}
            </motion.div>
            {/* ========== END ROTATING ART ========== */}

            <div className="w-full max-w-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    {song?.title ?? "Nothing playing"}
                  </h1>
                  <p className="mt-1.5 truncate text-sm text-white/55">
                    {song?.artistList[0]?.id ? (
                      <Link
                        to={`/artist/${song.artistList[0].id}`}
                        onClick={close}
                        className="hover:text-white hover:underline"
                      >
                        {song.artist}
                      </Link>
                    ) : (
                      song?.artist
                    )}
                    {song?.album && song.albumId && (
                      <>
                        <span className="px-1.5 text-white/25">•</span>
                        <Link
                          to={`/album/${song.albumId}`}
                          onClick={close}
                          className="hover:text-white hover:underline"
                        >
                          {song.album}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                {song && (
                  <IconButton
                    label={liked ? "Remove from Liked" : "Save to Liked"}
                    onClick={() => toggleLike(song)}
                    className={cn("h-11 w-11 shrink-0 bg-white/5", liked && "text-brand-300")}
                  >
                    <IconHeart filled={liked} className="h-5 w-5" />
                  </IconButton>
                )}
              </div>

              <SeekBar
                value={player.currentTime}
                max={player.duration || song?.duration || 0}
                buffered={player.buffered}
                onSeek={player.seek}
              />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  <IconButton
                    label="Shuffle"
                    active={player.shuffle}
                    onClick={player.toggleShuffle}
                  >
                    <IconShuffle className="h-5 w-5" />
                  </IconButton>
                </div>
                <div className="flex items-center gap-3">
                  <IconButton label="Previous" onClick={player.prev} className="h-11 w-11">
                    <IconPrev className="h-7 w-7" />
                  </IconButton>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={player.toggle}
                    aria-label={player.isPlaying ? "Pause" : "Play"}
                    className="grid h-16 w-16 place-items-center rounded-full bg-white text-ink-950 shadow-2xl"
                  >
                    {player.isPlaying ? (
                      <IconPause className="h-6 w-6" />
                    ) : player.isBuffering ? (
                      <InlineSpinner className="border-ink-950/25 border-t-ink-950" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="ml-0.5 h-7 w-7" fill="currentColor">
                        <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.14-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
                      </svg>
                    )}
                  </motion.button>
                  <IconButton label="Next" onClick={player.next} className="h-11 w-11">
                    <IconNext className="h-7 w-7" />
                  </IconButton>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton
                    label="Repeat"
                    active={player.repeat !== "off"}
                    onClick={player.cycleRepeat}
                  >
                    {player.repeat === "one" ? (
                      <IconRepeatOne className="h-5 w-5" />
                    ) : (
                      <IconRepeat className="h-5 w-5" />
                    )}
                  </IconButton>
                  <IconButton label="Mute" onClick={player.toggleMute} className="hidden sm:grid">
                    {player.muted ? <IconMute className="h-5 w-5" /> : <IconVolume className="h-5 w-5" />}
                  </IconButton>
                </div>
              </div>

              <div className="hidden justify-center sm:flex">
                <VolumeBar
                  value={player.muted ? 0 : player.volume}
                  onChange={player.setVolume}
                  className="w-40"
                />
              </div>
            </div>
          </div>

          {/* right: up next / details */}
          <div className="hidden min-h-0 flex-col rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4 lg:flex">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Up next</h3>
              <button
                onClick={() => {
                  close();
                  player.setQueueOpen(true);
                }}
                className="text-[11px] font-bold uppercase tracking-wider text-white/40 transition hover:text-white"
              >
                Open queue
              </button>
            </div>
            <div className="scroll-area min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {player.queue.slice(player.index + 1, player.index + 30).map((s, i) => (
                <button
                  key={`${s.id}-${i}`}
                  onClick={() => player.jumpTo(player.index + 1 + i)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/[0.07]"
                >
                  <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    <img src={s.imageSmall || s.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-white/90">{s.title}</span>
                    <span className="block truncate text-[11px] text-white/40">{s.artist}</span>
                  </span>
                </button>
              ))}
              {player.queue.slice(player.index + 1).length === 0 && (
                <p className="py-10 text-center text-sm text-white/40">
                  Queue is empty — add some songs.
                </p>
              )}
            </div>

            {song && (
              <div className="mt-3 space-y-2 border-t border-white/[0.07] pt-3 text-[11.5px] text-white/45">
                {song.albumId && (
                  <Link
                    to={`/album/${song.albumId}`}
                    onClick={close}
                    className="flex items-center gap-2 rounded-lg px-1 py-1.5 transition hover:bg-white/5 hover:text-white"
                  >
                    <IconDisc className="h-4 w-4" /> Go to album
                  </Link>
                )}
                {song.artistList[0]?.id && (
                  <Link
                    to={`/artist/${song.artistList[0].id}`}
                    onClick={close}
                    className="flex items-center gap-2 rounded-lg px-1 py-1.5 transition hover:bg-white/5 hover:text-white"
                  >
                    <IconMic className="h-4 w-4" /> Go to artist
                  </Link>
                )}
                {song.playCount > 0 && (
                  <p className="px-1 pt-1">{formatCount(song.playCount)} plays on JioSaavn</p>
                )}
                <p className="px-1 pt-2 text-[10.5px] text-white/30">
                  Built with <span className="text-rose-400">❤️</span> by{" "}
                  <Link to="/about" onClick={close} className="font-semibold text-white/50 hover:text-brand-200">
                    Ashutosh Palhare
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* mobile queue sheet */}
          <AnimatePresence>
            {tab === "queue" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="scroll-area min-h-0 flex-1 overflow-y-auto rounded-3xl border border-white/[0.07] bg-white/[0.03] p-3 lg:hidden"
              >
                <h3 className="mb-2 px-1 text-sm font-bold text-white">Up next</h3>
                {player.queue.slice(player.index + 1).map((s, i) => (
                  <button
                    key={`${s.id}-${i}`}
                    onClick={() => player.jumpTo(player.index + 1 + i)}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/[0.07]"
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5">
                      <img src={s.imageSmall || s.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-white/90">{s.title}</span>
                      <span className="block truncate text-[11px] text-white/40">{s.artist}</span>
                    </span>
                  </button>
                ))}
                {player.queue.slice(player.index + 1).length === 0 && (
                  <p className="py-10 text-center text-sm text-white/40">End of queue</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function NowPlayingHost() {
  const player = usePlayer();
  if (!player.nowPlayingOpen) return null;
  return <NowPlaying />;
}
