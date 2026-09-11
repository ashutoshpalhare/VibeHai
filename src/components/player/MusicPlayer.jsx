import {
  Heart,
  MoreHorizontal,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat2,
} from 'lucide-react'
import { usePlayer } from '../../hooks/usePlayer'

function MusicPlayer() {
const {
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  togglePlay,
  seek,
  volume,
  changeVolume,
  isMuted,
  toggleMute,
} = usePlayer()

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-[rgba(10,10,11,0.96)] px-3 py-2 backdrop-blur-2xl lg:px-5">
      <div className="mx-auto flex h-[64px] max-w-[1800px] items-center gap-3">
        {/* Track Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:w-[30%] lg:flex-none">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-violet-600 via-cyan-500 to-pink-500">
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="font-display text-sm font-bold">
                VH
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              Nothing Playing
            </p>

            <p className="truncate text-xs text-zinc-500">
              Choose a song to start listening
            </p>
          </div>

          <button
            type="button"
            className="vh-icon-button hidden shrink-0 sm:inline-flex"
            aria-label="Like current song"
          >
            <Heart size={17} />
          </button>

          <button
            type="button"
            className="vh-icon-button hidden shrink-0 md:inline-flex"
            aria-label="More options"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Main Controls */}
        <div className="hidden flex-1 flex-col items-center justify-center gap-1.5 md:flex">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="vh-icon-button"
              aria-label="Shuffle"
            >
              <Shuffle size={16} />
            </button>

            <button
              type="button"
              className="vh-icon-button"
              aria-label="Previous track"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform duration-150 hover:scale-105 active:scale-95"
              aria-label="Play"
            >
              <Play
                size={18}
                fill="currentColor"
                className="ml-0.5"
              />
            </button>

            <button
              type="button"
              className="vh-icon-button"
              aria-label="Next track"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>

            <button
              type="button"
              className="vh-icon-button"
              aria-label="Repeat"
            >
              <Repeat2 size={16} />
            </button>
          </div>

          {/* Progress */}
          <div className="flex w-full max-w-[520px] items-center gap-2">
            <span className="w-8 text-right text-[10px] text-zinc-600">
              0:00
            </span>

            <div className="group relative h-1 flex-1 cursor-pointer rounded-full bg-white/[0.1]">
              <div className="h-full w-0 rounded-full vh-gradient" />

              <div className="absolute left-0 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-lg group-hover:block" />
            </div>

            <span className="w-8 text-[10px] text-zinc-600">
              0:00
            </span>
          </div>
        </div>

        {/* Volume / Desktop */}
        <div className="hidden items-center justify-end gap-1 lg:flex lg:w-[30%] lg:flex-none">
          <button
            type="button"
            className="vh-icon-button"
            aria-label="Volume"
          >
            <Volume2 size={18} />
          </button>

          <div className="w-24">
            <div className="h-1 rounded-full bg-white/[0.1]">
              <div className="h-full w-[70%] rounded-full bg-zinc-400" />
            </div>
          </div>
        </div>

        {/* Mobile Play */}
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black md:hidden"
          aria-label="Play"
        >
          <Play
            size={17}
            fill="currentColor"
            className="ml-0.5"
          />
        </button>
      </div>
    </footer>
  )
}

export default MusicPlayer