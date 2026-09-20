import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";
import { FALLBACK_ART, formatTime } from "@/lib/format";
import {
  IconChevronRight,
  IconClose,
  IconGrip,
  IconList,
  IconPlay,
  IconQueue,
  IconTrash,
} from "@/components/ui/Icons";
import { Button, EmptyState, IconButton, InlineSpinner } from "@/components/ui";
import { cn } from "@/utils/cn";

export default function QueuePanel() {
  const player = usePlayer();
  const { toast } = useToast();
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  if (!player.queueOpen) return null;

  const upcoming = player.queue.length - player.index - 1;

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="fixed inset-y-0 right-0 z-[60] flex w-full flex-col border-l border-white/[0.07] bg-ink-900/95 backdrop-blur-xl sm:w-[360px] lg:static lg:z-auto lg:bg-ink-900/70"
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <IconQueue className="h-[18px] w-[18px] text-white/60" />
          <h2 className="text-sm font-bold text-white">Queue</h2>
          <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-semibold text-white/50">
            {player.queue.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {player.queue.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                player.clearQueue();
                toast("Queue cleared", { tone: "success" });
              }}
            >
              <IconTrash className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
          <IconButton
            label="Close queue"
            onClick={() => player.setQueueOpen(false)}
            className="lg:hidden"
          >
            <IconClose className="h-4 w-4" />
          </IconButton>
        </div>
      </header>

      {player.queueSource && (
        <div className="border-b border-white/[0.05] px-4 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
            Playing from
          </p>
          <p className="mt-0.5 truncate text-[13px] font-semibold text-white/85">
            {player.queueSource.title}
          </p>
        </div>
      )}

      <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {player.queue.length === 0 ? (
          <EmptyState
            emoji="🎼"
            title="Your queue is empty"
            body="Play an album, playlist or search for a song to get started."
            className="mx-2 mt-4"
          />
        ) : (
          <>
            {/* now playing */}
            {player.current && (
              <>
                <p className="px-2 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-white/35">
                  Now playing
                </p>
                <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.07] p-2">
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    <img
                      src={player.current.imageSmall || player.current.image || FALLBACK_ART}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {player.isPlaying && (
                      <span className="absolute inset-0 grid place-items-center bg-black/50">
                        <span className="flex h-3.5 items-end gap-[2px]">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="w-[2.5px] origin-bottom rounded-full bg-brand-300"
                              style={{
                                height: "100%",
                                animation: "eq 0.85s ease-in-out infinite",
                                animationDelay: `${i * 0.13}s`,
                              }}
                            />
                          ))}
                        </span>
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-brand-200">
                      {player.current.title}
                    </span>
                    <span className="block truncate text-[11px] text-white/45">
                      {player.current.artist}
                    </span>
                  </span>
                  <span className="text-[11px] tabular-nums text-white/40">
                    {formatTime(player.duration || player.current.duration)}
                  </span>
                </div>
              </>
            )}

            <p className="px-2 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-white/35">
              Next up {upcoming > 0 && <span className="text-white/25">({upcoming})</span>}
            </p>

            {player.queue.map((song, i) => {
              if (i <= player.index) return null;
              return (
                <div
                  key={`${song.id}-${i}`}
                  draggable
                  onDragStart={() => setDragFrom(i)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(i);
                  }}
                  onDragEnd={() => {
                    if (dragFrom !== null && dragOver !== null && dragFrom !== dragOver) {
                      player.moveInQueue(dragFrom, dragOver);
                    }
                    setDragFrom(null);
                    setDragOver(null);
                  }}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-xl p-2 transition",
                    dragOver === i && dragFrom !== null && "bg-brand-500/15 ring-1 ring-brand-400/40",
                    dragFrom === i && "opacity-40",
                  )}
                >
                  <span className="flex shrink-0 flex-col sm:hidden">
                    <button
                      aria-label="Move up"
                      disabled={i === player.index + 1}
                      onClick={() => player.moveInQueue(i, i - 1)}
                      className="grid h-4 w-6 place-items-center rounded text-white/30 transition hover:text-white disabled:opacity-20"
                    >
                      <IconChevronRight className="h-3 w-3 -rotate-90" />
                    </button>
                    <button
                      aria-label="Move down"
                      disabled={i === player.queue.length - 1}
                      onClick={() => player.moveInQueue(i, i + 1)}
                      className="grid h-4 w-6 place-items-center rounded text-white/30 transition hover:text-white disabled:opacity-20"
                    >
                      <IconChevronRight className="h-3 w-3 rotate-90" />
                    </button>
                  </span>
                  <IconGrip className="hidden h-4 w-4 shrink-0 cursor-grab text-white/20 group-hover:text-white/40 sm:block" />
                  <button
                    onClick={() => player.jumpTo(i)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5">
                      <img
                        src={song.imageSmall || song.image || FALLBACK_ART}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-white/90">
                        {song.title}
                      </span>
                      <span className="block truncate text-[11px] text-white/45">{song.artist}</span>
                    </span>
                  </button>
                  <span className="hidden text-[11px] tabular-nums text-white/35 sm:block">
                    {formatTime(song.duration)}
                  </span>
                  <IconButton
                    label="Remove from queue"
                    onClick={() => player.removeFromQueue(i)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-rose-300"
                  >
                    <IconClose className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              );
            })}

            {upcoming === 0 && (
              <p className="flex items-center justify-center gap-2 py-10 text-sm text-white/40">
                <IconList className="h-4 w-4" /> Nothing queued after this track
              </p>
            )}
          </>
        )}
      </div>

      <footer className="border-t border-white/[0.07] px-4 py-3 text-[11px] text-white/35">
        <span className="inline-flex items-center gap-1.5">
          {player.shuffle ? "Shuffle on" : "Shuffle off"} • Repeat{" "}
          {player.repeat === "off" ? "off" : player.repeat}
          {player.isBuffering && <InlineSpinner className="ml-1 h-3 w-3" />}
        </span>
      </footer>
    </motion.aside>
  );
}

export function QueueToggleFab() {
  const player = usePlayer();
  return (
    <AnimatePresence>
      {player.queueOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => player.setQueueOpen(false)}
          className="fixed inset-0 z-[59] bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </AnimatePresence>
  );
}

export function QueueEmptyHint({ onPlay }: { onPlay: () => void }) {
  return (
    <EmptyState
      emoji="🎵"
      title="Nothing playing"
      body="Hit play on any song and we'll build the queue for you."
      action={
        <Button variant="brand" onClick={onPlay}>
          <IconPlay className="h-3.5 w-3.5" /> Browse trending
        </Button>
      }
    />
  );
}
